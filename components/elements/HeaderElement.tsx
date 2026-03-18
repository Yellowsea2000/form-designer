import React from "react";
import { ElementRendererProps } from "./types";
import { mergeCn } from "./common";

export const HeaderElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, style, className } = props;
  return (
    <h2
      className={mergeCn("text-2xl font-bold text-slate-900 pointer-events-none", className)}
      style={style}
    >
      {content}
    </h2>
  );
};
