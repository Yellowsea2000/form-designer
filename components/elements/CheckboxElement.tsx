import React from 'react';
import { ElementRendererProps } from './types';

export const CheckboxElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, content, style } = props;

  return (
    <div className="flex items-center h-5" style={style}>
      <input
        id="checkbox-preview"
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
        disabled
      />
      <div className="ml-3 text-sm">
        <label htmlFor="checkbox-preview" className="font-medium text-slate-700 pointer-events-none">
          {label}
        </label>
        {content && <p className="text-slate-500 pointer-events-none">{content}</p>}
      </div>
    </div>
  );
};
