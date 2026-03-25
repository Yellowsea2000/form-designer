import { Form, Input, Select, Switch, Typography } from "antd";
import React from "react";

import { SectionProps } from "./types";
import { ValidationSection } from "./ValidationSection";

const EMPTY_BIND_FIELD_OPTIONS: { label: string; value: string }[] = [];

type SwitchPropertiesSectionProps = Pick<
  SectionProps,
  "selectedNode" | "onPropChange"
>;

export const SwitchPropertiesSection: React.FC<
  SwitchPropertiesSectionProps
> = ({ selectedNode, onPropChange }) => {
  return (
    <div className="space-y-4">
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

      <div className="border-t border-slate-200 pt-3">
        <Typography.Text strong className="text-blue-600">
          Content
        </Typography.Text>
        <Form layout="vertical" size="small" style={{ marginTop: 12 }}>
          <Form.Item label="Label" style={{ marginBottom: 12 }}>
            <Input
              placeholder="Enter Value"
              value={selectedNode.props.label ?? ""}
              onChange={(event) => onPropChange("label", event.target.value)}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <div className="flex items-center justify-between">
              <Typography.Text>Default Value</Typography.Text>
              <Switch
                checked={Boolean(selectedNode.props.defaultValue)}
                onChange={(checked) => onPropChange("defaultValue", checked)}
              />
            </div>
          </Form.Item>
        </Form>
      </div>

      <ValidationSection
        selectedNode={selectedNode}
        onPropChange={onPropChange}
      />
    </div>
  );
};
