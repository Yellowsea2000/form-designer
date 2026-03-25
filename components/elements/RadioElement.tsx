import { Radio } from "antd";
import React from "react";

import { baseLabelClass, mergeCn } from "./common";
import { ElementRendererProps } from "./types";

const createDefaultOptions = (count = 2) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Option ${index + 1}`,
    value: `${index + 1}`,
  }));

export const RadioElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, style, className } = props;
  const choiceOptions =
    options && options.length > 0 ? options : createDefaultOptions(2);

  return (
    <div style={style} className={mergeCn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Radio.Group className="flex flex-col gap-2">
        {choiceOptions.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};
