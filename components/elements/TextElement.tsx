import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const TextElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, style, className } = props;
  return (
    <p className={cn('text-slate-600 pointer-events-none', className)} style={style}>
      {content}
    </p>
  );
};
