import React from 'react';
import { ElementRendererProps } from './types';

export const ImageElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { src, alt, style } = props;

  return (
    <div className="w-full pointer-events-none" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || 'Image'}
        className="max-w-full h-auto rounded-lg border border-slate-200"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
        }}
      />
    </div>
  );
};
