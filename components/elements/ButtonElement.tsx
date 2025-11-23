import React from 'react';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const ButtonElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, buttonType, style, className } = props;

  return (
    <button
      type={buttonType}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 pointer-events-none',
        className
      )}
      style={style}
      disabled
    >
      {content}
    </button>
  );
};
