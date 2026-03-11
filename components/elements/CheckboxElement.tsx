import React from "react";
import { Checkbox } from "antd";
import { ElementRendererProps } from "./types";
import { cn } from "./common";

export const CheckboxElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, content, style, className } = props;

  return (
    <div style={style} className={cn(className)}>
      <Checkbox>{label}</Checkbox>
      <div className="pl-6 text-sm">
        {content && <p className="text-slate-500 pointer-events-none">{content}</p>}
      </div>
    </div>
  );
};
