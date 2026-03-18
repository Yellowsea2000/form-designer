import React from "react";
import { DatePicker } from "antd";
import { ElementRendererProps } from "./types";
import { baseLabelClass, mergeCn } from "./common";

export const DatePickerElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, placeholder, style, className } = props;

  return (
    <div style={style} className={mergeCn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <DatePicker placeholder={placeholder || "Select date"} style={{ width: "100%" }} />
    </div>
  );
};
