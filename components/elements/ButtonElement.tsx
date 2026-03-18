import React from "react";
import { Button } from "antd";
import { ElementRendererProps } from "./types";
import { mergeCn } from "./common";

export const ButtonElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, buttonType, style, className } = props;

  return (
    <Button htmlType={buttonType} type="primary" className={mergeCn(className)} style={style}>
      {content}
    </Button>
  );
};
