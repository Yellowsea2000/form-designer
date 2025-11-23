import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const FormElement: React.FC<ElementRendererProps> = ({ props, children }) => {
  const { label, style, className } = props;

  return (
    <div style={style} className={cn('shadow-sm', className)}>
      {label && (
        <div className="mb-4 pb-2 border-b border-slate-100 pointer-events-none">
          <h3 className="font-semibold text-lg text-slate-800">{label}</h3>
        </div>
      )}
      <div className="min-h-[50px]">
        {children}
        {(!children || (Array.isArray(children) && children.length === 0)) && (
          <div className="text-slate-300 text-center py-4 text-sm italic pointer-events-none">
            Drop components here
          </div>
        )}
      </div>
    </div>
  );
};
