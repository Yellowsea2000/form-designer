import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined
} from "@ant-design/icons";
import { Button, Flex, Form, Input, Select, Space, Typography } from "antd";
import React from "react";

import { SectionCard } from "./SectionCard";
import { SectionProps } from "./types";
import { ValidationSection } from "./ValidationSection";

const EMPTY_BIND_FIELD_OPTIONS: { label: string; value: string }[] = [];

type DropdownPropertiesSectionProps = Pick<
  SectionProps,
  "selectedNode" | "onPropChange"
>;

export const DropdownPropertiesSection: React.FC<
  DropdownPropertiesSectionProps
> = ({ selectedNode, onPropChange }) => {
  const options = selectedNode.props.options || [];
  const defaultOptionValue =
    typeof selectedNode.props.defaultValue === "string"
      ? selectedNode.props.defaultValue
      : undefined;

  const handleOptionLabelChange = (index: number, label: string) => {
    const nextOptions = [...options];
    nextOptions[index] = { ...nextOptions[index], label };
    onPropChange("options", nextOptions);
  };

  const handleOptionValueChange = (index: number, value: string) => {
    const previousValue = options[index]?.value;
    const nextOptions = [...options];
    nextOptions[index] = { ...nextOptions[index], value };
    onPropChange("options", nextOptions);

    if (defaultOptionValue && previousValue === defaultOptionValue) {
      onPropChange("defaultValue", value);
    }
  };

  const handleDeleteOption = (index: number) => {
    const removedOption = options[index];
    const nextOptions = options.filter(
      (_, optionIndex) => optionIndex !== index
    );
    onPropChange("options", nextOptions);

    if (removedOption?.value === defaultOptionValue) {
      onPropChange("defaultValue", nextOptions[0]?.value || "");
    }
  };

  const handleAddOption = () => {
    const nextIndex = options.length + 1;
    onPropChange("options", [
      ...options,
      { label: `Option ${nextIndex}`, value: `${nextIndex}` }
    ]);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Bind Field">
        <Form layout="vertical" size="small">
          <Form.Item label="Bind Field" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Select Value"
              value={selectedNode.props.bindField || undefined}
              options={EMPTY_BIND_FIELD_OPTIONS}
              onChange={(value) => onPropChange("bindField", value)}
              allowClear
              notFoundContent={null}
            />
          </Form.Item>
        </Form>
      </SectionCard>

      <SectionCard title="Content">
        <Form layout="vertical" size="small">
          <Form.Item label="Label" style={{ marginBottom: 12 }}>
            <Input
              placeholder="Enter Value"
              value={selectedNode.props.label ?? ""}
              onChange={(event) => onPropChange("label", event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Placeholder" style={{ marginBottom: 0 }}>
            <Input
              placeholder="Enter Value"
              value={selectedNode.props.placeholder ?? ""}
              onChange={(event) =>
                onPropChange("placeholder", event.target.value)
              }
            />
          </Form.Item>
        </Form>
      </SectionCard>

      <SectionCard title="Choice Configuration">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {options.map((option, index) => {
            const isDefault = defaultOptionValue === option.value;

            return (
              <div key={`${option.value}-${index}`}>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 8 }}
                >
                  <Typography.Text>{`Option ${index + 1}`}</Typography.Text>
                  <Space size={2}>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        isDefault ? (
                          <StarFilled
                            style={{ color: "#1677ff", fontSize: 14 }}
                          />
                        ) : (
                          <StarOutlined style={{ fontSize: 14 }} />
                        )
                      }
                      onClick={() => onPropChange("defaultValue", option.value)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                      onClick={() => handleDeleteOption(index)}
                    />
                  </Space>
                </Flex>

                <Form layout="vertical" size="small">
                  <Form.Item
                    label={
                      <span>
                        Label <span className="text-red-500">*</span>{" "}
                        <InfoCircleOutlined style={{ color: "#1677ff" }} />
                      </span>
                    }
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      placeholder="Enter Option"
                      value={option.label}
                      onChange={(event) =>
                        handleOptionLabelChange(index, event.target.value)
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span>
                        Value <span className="text-red-500">*</span>{" "}
                        <InfoCircleOutlined style={{ color: "#1677ff" }} />
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Enter Option"
                      value={option.value}
                      onChange={(event) =>
                        handleOptionValueChange(index, event.target.value)
                      }
                    />
                  </Form.Item>
                </Form>
              </div>
            );
          })}

          <Button
            type="text"
            icon={<PlusOutlined style={{ fontSize: 14 }} />}
            onClick={handleAddOption}
            style={{ paddingInline: 0, width: "fit-content" }}
          >
            Add New Option
          </Button>
        </Space>
      </SectionCard>

      <ValidationSection
        selectedNode={selectedNode}
        onPropChange={onPropChange}
      />
    </div>
  );
};
