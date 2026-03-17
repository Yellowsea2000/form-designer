import React from "react";
import { Checkbox, Radio, Switch } from "antd";
import { ComponentProps } from "../../types";
import { ElementRendererProps } from "./types";
import { baseLabelClass, cn } from "./common";

const createDefaultOptions = (count = 2) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Option ${index + 1}`,
    value: `${index + 1}`,
  }));

const resolveVariant = (props: ComponentProps): "checkbox" | "radio" | "switch" => {
  if (props.controlVariant) {
    return props.controlVariant;
  }

  const label = (props.label || "").toLowerCase();
  if (label.includes("switch")) {
    return "switch";
  }
  if (label.includes("radio")) {
    return "radio";
  }

  return "checkbox";
};

export const CheckboxElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, content, style, className } = props;
  const variant = resolveVariant(props);
  const choiceOptions = options && options.length > 0 ? options : createDefaultOptions(2);

  return (
    <div style={style} className={cn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {variant === "switch" ? (
        <div className="flex items-center gap-2">
          <Switch />
          {content && <p className="text-slate-500 pointer-events-none text-sm">{content}</p>}
        </div>
      ) : null}

      {variant === "radio" ? (
        <Radio.Group className="flex flex-col gap-2">
          {choiceOptions.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      ) : null}

      {variant === "checkbox" ? (
        <Checkbox.Group className="flex flex-col gap-2">
          {choiceOptions.map((option) => (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      ) : null}
    </div>
  );
};
