import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const TabItemElement: React.FC<ElementRendererProps> = ({ props, children }) => {
  const { style, className, label } = props;

  return (
    <div style={style} className={cn('h-full', className)}>
      {children}
      {(!children || (Array.isArray(children) && children.length === 0)) && (
        <div className="text-slate-300 text-center py-12 text-sm italic border-2 border-transparent border-slate-100 rounded-lg">
          Drop content for {label} here
        </div>
      )}
    </div>
  );
};
