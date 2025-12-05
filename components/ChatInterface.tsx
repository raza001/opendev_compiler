import React, { useRef, useEffect } from 'react';
import { Send, Search, Bot, User, ExternalLink, Sparkles, Globe } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800 shadow-sm z-10">
        <Sparkles className="w-5 h-5 text-indigo-400 mr-2" />
        <h2 className="text-sm font-semibold text-slate-100">AI Assistant</h2>
        <span className="ml-2 px-2 py-0.5 text-[10px] bg-indigo-900/50 text-indigo-300 rounded-full border border-indigo-800">
          Search Enabled
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-full">
              <Bot size={32} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-slate-300">How can I help you execute?</p>
              <p className="text-sm mt-1 max-w-[200px] mx-auto">Ask about syntax, debugging, or search the web for docs.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-slate-700 mr-3'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-300" />}
              </div>
              
              <div className="flex flex-col space-y-1">
                 <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* Grounding / Search Sources */}
                {msg.groundingMetadata && msg.groundingMetadata.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                  <div className="mt-2 text-xs bg-slate-950/30 p-2 rounded-lg border border-slate-800/50">
                    <div className="flex items-center text-slate-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">
                      <Globe size={10} className="mr-1" /> Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingMetadata.groundingChunks.map((chunk, idx) => {
                        if (chunk.web?.uri) {
                          return (
                            <a 
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-indigo-400 hover:text-indigo-300 transition-colors border border-slate-700 hover:border-slate-600 truncate max-w-full"
                              title={chunk.web.title}
                            >
                              <span className="truncate max-w-[150px]">{chunk.web.title || "Web Source"}</span>
                              <ExternalLink size={10} />
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 mr-3 flex items-center justify-center">
                <Bot size={14} className="text-indigo-300" />
             </div>
             <div className="px-4 py-3 bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-700">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-0"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about code or docs..."
            className="w-full bg-slate-950 text-slate-200 pl-4 pr-12 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder-slate-600 text-sm shadow-inner transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-900/20"
          >
            {isLoading ? <Search size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;