import React from 'react';
import { Code } from 'lucide-react';

interface JsonModalProps {
  open: boolean;
  json: string;
  onClose: () => void;
  title?: string;
}

export const JsonModal: React.FC<JsonModalProps> = ({ open, json, onClose, title = 'Page JSON' }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Code className="w-4 h-4 text-slate-500" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="p-5">
          <pre className="bg-slate-900 text-green-100 rounded-lg text-xs p-4 overflow-auto max-h-[60vh] whitespace-pre">
            {json}
          </pre>
        </div>
      </div>
    </div>
  );
};
