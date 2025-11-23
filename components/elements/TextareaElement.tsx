import React from 'react';
import { ElementRendererProps } from './types';
import { baseInputClass, baseLabelClass } from './common';

export const TextareaElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, placeholder, style } = props;

  return (
    <div style={style}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={baseInputClass}
        placeholder={placeholder}
        rows={3}
        disabled
        readOnly
      />
    </div>
  );
};
