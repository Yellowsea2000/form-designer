import React from 'react';
import { ElementRendererProps } from './types';
import { baseInputClass, baseLabelClass } from './common';

export const InputElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, placeholder, style } = props;

  return (
    <div style={style}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        className={baseInputClass}
        placeholder={placeholder}
        disabled
        readOnly
      />
    </div>
  );
};
