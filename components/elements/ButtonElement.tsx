import React from 'react';
import { Button } from 'antd';
import { ElementRendererProps } from './types';
import { cn } from './common';

export const ButtonElement: React.FC<ElementRendererProps> = ({ props }) => {
  const { content, buttonType, style, className } = props;

  return (
    <Button
      htmlType={buttonType}
      type="primary"
      className={cn(className)}
      style={style}
    >
      {content}
    </Button>
  );
};
