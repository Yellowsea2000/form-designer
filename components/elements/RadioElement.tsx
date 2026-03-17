import React from "react";
import { Radio } from "antd";
import { ElementRendererProps } from "./types";
import { baseLabelClass, cn } from "./common";

const createDefaultOptions = (count = 2) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Option ${index + 1}`,
    value: `${index + 1}`,
  }));

export const RadioElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, style, className } = props;
  const choiceOptions = options && options.length > 0 ? options : createDefaultOptions(2);

  return (
    <div style={style} className={cn(className)}>
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
