import React from "react";
import { ElementRendererProps } from "./types";
import { mergeCn } from "./common";

export const TextElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, style, className } = props;
  return (
    <p className={mergeCn("text-slate-600 pointer-events-none", className)} style={style}>
      {content}
    </p>
  );
};
