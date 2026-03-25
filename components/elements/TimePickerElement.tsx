import { TimePicker } from "antd";
import React from "react";

import { baseLabelClass, mergeCn } from "./common";
import { ElementRendererProps } from "./types";

export const TimePickerElement: React.FC<ElementRendererProps> = ({
  props
}) => {
  const { label, required, placeholder, style, className } = props;

  return (
    <div style={style} className={mergeCn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <TimePicker
        placeholder={placeholder || "Select time"}
        style={{ width: "100%" }}
      />
    </div>
  );
};
