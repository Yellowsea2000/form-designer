import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const HeaderElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, style, className } = props;
  return (
    <h2
      className={cn('text-2xl font-bold text-slate-900 pointer-events-none', className)}
      style={style}
    >
      {content}
    </h2>
  );
};
