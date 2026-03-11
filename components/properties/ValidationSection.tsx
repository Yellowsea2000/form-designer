import React from "react";
import { Flex, Switch, Typography } from "antd";
import { Layout } from "lucide-react";
import { SectionProps } from "./types";
import { SectionCard } from "./SectionCard";

export const ValidationSection: React.FC<SectionProps> = ({ selectedNode, onPropChange }) => {
  if (selectedNode.props.required === undefined) {
    return null;
  }

  return (
    <SectionCard title="Validation" icon={<Layout className="w-4 h-4" />}>
      <Flex justify="space-between" align="center">
        <Typography.Text>Required Field</Typography.Text>
        <Switch
          checked={Boolean(selectedNode.props.required)}
          onChange={(checked) => onPropChange("required", checked)}
        />
      </Flex>
    </SectionCard>
  );
};
