import { Switch } from "antd";
import React from "react";

import { baseLabelClass, mergeCn } from "./common";
import { ElementRendererProps } from "./types";

export const SwitchElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { label, required, defaultValue, style, className } = props;

  return (
    <div style={style} className={mergeCn(className)}>
      {label && (
        <label className={baseLabelClass}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Switch defaultChecked={Boolean(defaultValue)} />
    </div>
  );
};
