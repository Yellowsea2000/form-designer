import React from "react";
import { Select } from "antd";
import { ElementRendererProps } from "./types";
import { baseLabelClass, mergeCn } from "./common";

export const SelectElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, options, defaultValue, placeholder, style, className } = props;

  return (
    <div style={style} className={mergeCn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        placeholder={placeholder || "Select an option"}
        defaultValue={typeof defaultValue === "string" ? defaultValue : undefined}
        options={options?.map((opt) => ({ label: opt.label, value: opt.value }))}
      />
    </div>
  );
};
