import React from 'react';
import { Globe } from 'lucide-react';

interface WebPreviewProps {
  code: string;
}

const WebPreview: React.FC<WebPreviewProps> = ({ code }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-br z-10 font-medium flex items-center">
        <Globe size={10} className="mr-1" />
        Live Preview
      </div>
      <iframe 
        srcDoc={code}
        title="Preview"
        className="w-full h-full border-none bg-white"
        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
      />
    </div>
  );
};

export default WebPreview;