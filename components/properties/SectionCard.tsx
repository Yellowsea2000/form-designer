import { Typography } from "antd";
import React from "react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children
}) => {
  return (
    <div className="space-y-3">
      <Typography.Text strong className="block">
        {title}
      </Typography.Text>
      <div>{children}</div>
    </div>
  );
};
