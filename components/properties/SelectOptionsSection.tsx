import React from "react";
import { AlignLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Space } from "antd";
import { ComponentType } from "../../types";
import { SectionProps } from "./types";
import { SectionCard } from "./SectionCard";

export const SelectOptionsSection: React.FC<SectionProps> = ({ selectedNode, onPropChange }) => {
  if (selectedNode.type !== ComponentType.SELECT) {
    return null;
  }

  const options = selectedNode.props.options || [];

  const handleLabelChange = (index: number, label: string) => {
    const nextOptions = [...options];
    nextOptions[index] = { ...nextOptions[index], label };
    onPropChange("options", nextOptions);
  };

  const handleValueChange = (index: number, value: string) => {
    const nextOptions = [...options];
    nextOptions[index] = { ...nextOptions[index], value };
    onPropChange("options", nextOptions);
  };

  return (
    <SectionCard title="Options" icon={<AlignLeftOutlined style={{ fontSize: 16 }} />}>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        {options.map((option, index) => (
          <Flex key={`${option.value}-${index}`} gap={8}>
            <Input
              value={option.label}
              size="small"
              onChange={(event) => handleLabelChange(index, event.target.value)}
            />
            <Input
              value={option.value}
              size="small"
              style={{ width: 92 }}
              onChange={(event) => handleValueChange(index, event.target.value)}
            />
          </Flex>
        ))}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={() =>
            onPropChange("options", [
              ...options,
              {
                label: `Option ${options.length + 1}`,
                value: `${options.length + 1}`,
              },
            ])
          }
        >
          Add Option
        </Button>
      </Space>
    </SectionCard>
  );
};
