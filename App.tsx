import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Code2, 
  MessageSquare, 
  PanelBottomOpen, 
  PanelBottomClose,
  Terminal,
  Globe
} from 'lucide-react';
import { Language, LANGUAGE_CONFIG, ExecutionResult, ChatMessage } from './types';
import Editor from './components/Editor';
import LanguageSelector from './components/LanguageSelector';
import OutputConsole from './components/OutputConsole';
import WebPreview from './components/WebPreview';
import ChatInterface from './components/ChatInterface';
import { executeCode, chatWithSearch } from './services/geminiService';

type Tab = 'console' | 'preview';

function App() {
  // State
  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG[Language.PYTHON].defaultCode);
  const [executionResult, setExecutionResult] = useState<ExecutionResult>({ output: '', status: 'idle' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Layout State
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('console');

  // Intelligent language switching
  const handleLanguageChange = (newLang: Language) => {
    if (language === newLang) return;

    // Only ask for confirmation if the code has been modified from the default
    const currentDefault = LANGUAGE_CONFIG[language].defaultCode;
    const isDirty = code.trim() !== currentDefault.trim();

    if (isDirty) {
      const confirmSwitch = window.confirm(
        `Switching to ${LANGUAGE_CONFIG[newLang].name} will discard your current changes. Continue?`
      );
      if (!confirmSwitch) return;
    }

    // Update Language and Code
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].defaultCode);
    setExecutionResult({ output: '', status: 'idle' });
    
    // Auto-switch tab based on language type
    if (newLang === Language.HTML) {
      setActiveTab('preview');
      setShowBottomPanel(true);
    } else {
      setActiveTab('console');
    }
  };

  const handleRunCode = async () => {
    setShowBottomPanel(true);
    
    // Special handling for HTML - just show preview
    if (language === Language.HTML) {
      setActiveTab('preview');
      setExecutionResult({ output: 'Rendering Preview...', status: 'success' });
      return;
    }

    setActiveTab('console');
    setExecutionResult({ output: '', status: 'running' });
    
    const result = await executeCode(code, language);
    
    const isError = result.toLowerCase().includes("error") || result.toLowerCase().includes("exception") || result.toLowerCase().includes("traceback");
    
    setExecutionResult({
      output: result,
      status: isError ? 'error' : 'success'
    });
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsChatLoading(true);

    const contextEnhancedMessage = `[Current Language: ${LANGUAGE_CONFIG[language].name}]\n[Current Code Context]:\n${code}\n\nUser Query: ${text}`;
    
    const response = await chatWithSearch(contextEnhancedMessage, newHistory);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text,
      groundingMetadata: response.groundingMetadata,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsChatLoading(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Top Navigation Bar */}
      <div className="flex-shrink-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Code2 size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OmniCode AI
            </h1>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <LanguageSelector selectedLanguage={language} onSelect={handleLanguageChange} />
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-md transition-colors ${showChat ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            title="Toggle AI Chat"
          >
            <MessageSquare size={18} />
          </button>
          
          <button
            onClick={handleRunCode}
            disabled={executionResult.status === 'running'}
            className="flex items-center space-x-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md shadow-lg shadow-green-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:ring-2 hover:ring-green-500/50 hover:ring-offset-1 hover:ring-offset-slate-900"
          >
            {executionResult.status === 'running' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Pane: Editor & Output */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
          
          {/* Editor Area */}
          <div className="flex-1 relative overflow-hidden">
            <Editor code={code} onChange={setCode} />
          </div>

          {/* Bottom Panel (Console/Preview) */}
          <div 
            className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-slate-950 border-t border-slate-800 flex flex-col ${showBottomPanel ? 'h-[35%]' : 'h-9'}`}
          >
             {/* Panel Header/Tabs */}
             <div className="flex items-center justify-between px-2 bg-slate-900/90 border-b border-slate-800 h-9">
               <div className="flex items-center h-full">
                  {!showBottomPanel ? (
                     <button 
                       onClick={() => setShowBottomPanel(true)} 
                       className="flex items-center space-x-2 px-2 h-full text-slate-500 hover:text-slate-200 transition-colors text-xs font-semibold uppercase tracking-wider"
                     >
                       <PanelBottomOpen size={14} />
                       <span>Open Panel</span>
                     </button>
                  ) : (
                    <div className="flex space-x-1 h-full pt-1">
                      <button
                        onClick={() => setActiveTab('console')}
                        className={`flex items-center space-x-2 px-4 h-full rounded-t-md text-xs font-medium transition-colors ${
                          activeTab === 'console' 
                            ? 'bg-slate-800 text-indigo-400 border-t border-x border-slate-700' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <Terminal size={14} />
                        <span>Console</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center space-x-2 px-4 h-full rounded-t-md text-xs font-medium transition-colors ${
                          activeTab === 'preview' 
                            ? 'bg-slate-800 text-emerald-400 border-t border-x border-slate-700' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <Globe size={14} />
                        <span>Preview</span>
                      </button>
                    </div>
                  )}
               </div>
               
               {showBottomPanel && (
                 <button 
                   onClick={() => setShowBottomPanel(false)}
                   className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                   title="Minimize Panel"
                 >
                   <PanelBottomClose size={14} />
                 </button>
               )}
             </div>

             {/* Panel Content */}
             {showBottomPanel && (
               <div className="flex-1 overflow-hidden bg-slate-950 relative">
                 {activeTab === 'console' ? (
                   <OutputConsole 
                      result={executionResult} 
                      onClear={() => setExecutionResult(prev => ({ ...prev, output: '', status: 'idle' }))} 
                   />
                 ) : (
                   <div className="h-full w-full p-2 bg-slate-900">
                     <WebPreview code={code} />
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Right Pane: AI Chat */}
        <div 
          className={`flex-shrink-0 border-l border-slate-800 bg-slate-900 transition-all duration-300 ease-in-out ${showChat ? 'w-[400px]' : 'w-0 border-l-0 opacity-0'} overflow-hidden flex flex-col z-10`}
        >
          <div className="h-full w-[400px]"> 
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;