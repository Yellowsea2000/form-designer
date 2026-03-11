import React from "react";
import { Card, Flex, Typography } from "antd";

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <Card
      size="small"
      styles={{
        body: { padding: 12 },
      }}
    >
      <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
        <span className="text-blue-500">{icon}</span>
        <Typography.Text strong>{title}</Typography.Text>
      </Flex>
      {children}
    </Card>
  );
};
