import React from 'react';
import { Terminal, XCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { ExecutionResult } from '../types';

interface OutputConsoleProps {
  result: ExecutionResult;
  onClear: () => void;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ result, onClear }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar inside console area */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800/50">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            result.status === 'running' ? 'bg-yellow-500 animate-pulse' :
            result.status === 'success' ? 'bg-green-500' :
            result.status === 'error' ? 'bg-red-500' :
            'bg-slate-700'
          }`} />
          <span className="text-xs text-slate-500">
            {result.status === 'idle' ? 'Ready' : 
             result.status === 'running' ? 'Executing...' : 
             result.status === 'success' ? 'Finished' : 'Failed'}
          </span>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center space-x-1 text-[10px] uppercase font-bold text-slate-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
          <span>Clear Output</span>
        </button>
      </div>

      <div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
        {result.status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2 opacity-50">
            <Terminal size={32} />
            <p>Run code to see output</p>
          </div>
        )}
        
        {result.status === 'running' && (
          <div className="flex items-center space-x-3 text-indigo-400">
            <Loader2 size={18} className="animate-spin" />
            <span>Compiling and executing code...</span>
          </div>
        )}

        {(result.status === 'success' || result.status === 'error') && (
          <div className="animate-in fade-in duration-300">
             {result.output ? (
               <pre className={`whitespace-pre-wrap break-words leading-relaxed ${result.status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                 {result.output}
               </pre>
             ) : (
               <div className="text-slate-500 italic">No output returned.</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;