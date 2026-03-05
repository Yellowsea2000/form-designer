import React from 'react';
import { Select } from 'antd';
import { ElementRendererProps } from './types';
import { baseLabelClass, cn } from './common';

export const SelectElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, style, className } = props;

  return (
    <div style={style} className={cn('pointer-events-none', className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        disabled
        placeholder="Select an option"
        options={options?.map((opt) => ({ label: opt.label, value: opt.value }))}
      />
    </div>
  );
};
