import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, GroundingMetadata } from "../types";

// Initialize the client. The API Key is guaranteed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const PISTON_RUNTIMES_URL = "https://emkc.org/api/v2/piston/runtimes";

// Cache for language versions to prevent fetching on every run
let cachedRuntimes: any[] | null = null;

// Helper to determine the correct Piston language configuration
const getPistonConfig = async (language: Language): Promise<{ language: string, version: string, filename?: string }> => {
  const langMap: Record<Language, string> = {
    [Language.PYTHON]: 'python',
    [Language.JAVASCRIPT]: 'javascript',
    [Language.TYPESCRIPT]: 'typescript',
    [Language.JAVA]: 'java',
    [Language.CPP]: 'c++',
    [Language.GO]: 'go',
    [Language.RUST]: 'rust',
    [Language.SQL]: 'sqlite3',
    [Language.HTML]: 'html' // Not executed via Piston
  };

  const targetLang = langMap[language];

  // Map languages to specific filenames if required by the compiler (e.g., Java requires Main.java for public class Main)
  const filenameMap: Partial<Record<Language, string>> = {
    [Language.JAVA]: 'Main.java',
    [Language.GO]: 'main.go',
    [Language.RUST]: 'main.rs',
    [Language.CPP]: 'main.cpp',
    [Language.TYPESCRIPT]: 'index.ts',
    [Language.JAVASCRIPT]: 'index.js',
    [Language.PYTHON]: 'main.py',
    [Language.SQL]: 'query.sql'
  };

  // Fetch supported runtimes if not already cached
  if (!cachedRuntimes) {
    try {
      const response = await fetch(PISTON_RUNTIMES_URL);
      if (response.ok) {
        cachedRuntimes = await response.json();
      }
    } catch (e) {
      console.warn("Failed to fetch Piston runtimes, utilizing fallbacks.");
    }
  }

  // Find the runtime version from cache
  const runtime = cachedRuntimes?.find((r: any) => r.language === targetLang || r.aliases.includes(targetLang));
  
  // Fallback versions if API fetch fails
  const fallbackVersions: Record<string, string> = {
    'python': '3.10.0',
    'javascript': '18.15.0',
    'typescript': '5.0.3',
    'java': '15.0.2',
    'c++': '10.2.0',
    'go': '1.16.2',
    'rust': '1.68.2',
    'sqlite3': '3.36.0'
  };

  return {
    language: targetLang,
    version: runtime ? runtime.version : (fallbackVersions[targetLang] || '*'),
    filename: filenameMap[language]
  };
};

/**
 * Executes code using the Piston API (Free Code Execution Engine).
 */
export const executeCode = async (code: string, language: Language): Promise<string> => {
  // HTML is handled by the frontend Preview component.
  if (language === Language.HTML) {
    return "HTML content is rendered in the Preview tab.";
  }

  try {
    const { language: pistonLang, version, filename } = await getPistonConfig(language);

    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: version,
        files: [{ 
          name: filename,
          content: code 
        }],
        stdin: "", // No standard input provided
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
      })
    });

    const data = await response.json();

    if (data.message) {
      return `API Error: ${data.message}`;
    }

    // Piston returns separate stdout and stderr, we treat both as output
    if (data.run) {
      // If there's a compilation error, it usually appears in output or stderr
      const output = data.run.output;
      return output || "No output returned.";
    }

    return "Unknown execution error.";
  } catch (error: any) {
    console.error("Execution error:", error);
    return `Error connecting to execution engine: ${error.message || "Unknown error"}`;
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