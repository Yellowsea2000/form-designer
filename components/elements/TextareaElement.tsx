import React from 'react';
import { Input } from 'antd';
import { ElementRendererProps } from './types';
import { baseLabelClass, cn } from './common';

export const TextareaElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, placeholder, style, className } = props;

  return (
    <div style={style} className={cn('pointer-events-none', className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input.TextArea placeholder={placeholder} rows={3} disabled />
    </div>
  );
};
