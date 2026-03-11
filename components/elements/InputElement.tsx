import React from "react";
import { Input } from "antd";
import { ElementRendererProps } from "./types";
import { baseLabelClass, cn } from "./common";

export const InputElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, placeholder, style, className } = props;

  return (
    <div style={style} className={cn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input placeholder={placeholder} />
    </div>
  );
};
