import React from 'react';
import { ElementRendererProps } from './types';
import { baseInputClass, baseLabelClass } from './common';

export const SelectElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, style } = props;

  return (
    <div style={style}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select className={baseInputClass} disabled>
        <option value="">Select an option</option>
        {options?.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
