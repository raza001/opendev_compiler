import React, { useRef, useState, useEffect } from 'react';

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ code, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  // Count lines based on newline characters
  const lines = code.split('\n').length;
  // Generate array of line numbers
  const lineNumbers = Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 2 spaces for tab
      const spaces = "  ";
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      
      onChange(newCode);
      
      // Restore cursor position (need to defer slightly for React render cycle)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
        }
      }, 0);
    }
  };

  return (
    <div className="relative flex h-full w-full font-mono text-sm bg-slate-900 overflow-hidden">
      {/* Line Numbers */}
      <div 
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 bg-slate-900 border-r border-slate-800 text-slate-500 text-right py-4 pr-3 select-none overflow-hidden"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6 h-6">{num}</div>
        ))}
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 w-full h-full bg-slate-950/50 text-slate-200 p-4 pt-4 outline-none resize-none leading-6 border-none"
        style={{ 
          fontFamily: "'JetBrains Mono', monospace",
          tabSize: 2,
        }}
      />
    </div>
  );
};

export default Editor;