import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const ContainerElement: React.FC<ElementRendererProps> = ({ props, children }) => {
  const { style, className } = props;

  return (
    <div style={style} className={cn('min-h-[50px]', className)}>
      {children}
      {(!children || (Array.isArray(children) && children.length === 0)) && (
        <div className="text-slate-300 text-center py-4 text-sm italic pointer-events-none">
          Container
        </div>
      )}
    </div>
  );
};
