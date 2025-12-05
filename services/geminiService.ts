import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, GroundingMetadata, LANGUAGE_CONFIG } from "../types";

// Initialize the client. The API Key is guaranteed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates code execution by asking Gemini to act as an interpreter/compiler.
 */
export const executeCode = async (code: string, language: Language): Promise<string> => {
  // HTML is handled by the frontend Preview component.
  if (language === Language.HTML) {
    return "HTML content is rendered in the Preview tab.";
  }

  // Use the human-readable name (e.g., "C++" instead of "cpp") for better prompt context
  const langConfig = LANGUAGE_CONFIG[language];
  const langName = langConfig ? langConfig.name : language;

  try {
    const prompt = `
You are a strict code execution engine for ${langName}.
Your task is to simulate the execution of the following ${langName} code and return *only* the standard output (stdout).

Input Code:
${code}

Instructions:
1. Analyze the code syntax and logic for ${langName}.
2. If valid, simulate execution and provide the raw stdout.
3. If there are errors (syntax or runtime), provide the compiler/interpreter error message.
4. CRITICAL: Do NOT wrap the output in markdown code blocks (no \`\`\`).
5. CRITICAL: Do NOT provide explanations or conversational filler. Return ONLY the output string.
6. If the code requires input, simulate empty or default inputs.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text?.trim() ?? "";

    // Aggressively strip markdown code blocks if the model ignores instructions
    // This removes ```language ... ``` or just ``` ... ```
    text = text.replace(/^```[\w-]*\n?/g, '').replace(/```$/g, '').trim();

    return text;
  } catch (error: any) {
    console.error("Execution error:", error);
    return `Error executing code: ${error.message || "Unknown error"}`;
  }
};

/**
 * Chat with Gemini using Google Search Grounding.
 */
export const chatWithSearch = async (
  message: string, 
  history: { role: 'user' | 'model'; text: string }[]
): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  
  try {
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        systemInstruction: "You are a helpful expert developer assistant integrated into a code editor. You can search the web for documentation, libraries, and solutions. Always provide sources when you use search results. Keep answers concise and relevant to coding."
      },
      history: chatHistory
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    
    const text = result.text ?? "I couldn't generate a response.";
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { text, groundingMetadata };
  } catch (error: any) {
    console.error("Chat error:", error);
    return { text: `Error: ${error.message || "Something went wrong."}` };
  }
};