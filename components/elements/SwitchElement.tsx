import React from "react";
import { Switch } from "antd";
import { ElementRendererProps } from "./types";
import { baseLabelClass, cn } from "./common";

export const SwitchElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, content, style, className } = props;

  return (
    <div style={style} className={cn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <Switch />
        {content && <p className="text-slate-500 pointer-events-none text-sm">{content}</p>}
      </div>
    </div>
  );
};
