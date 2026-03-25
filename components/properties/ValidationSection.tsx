import { Form, Select, Typography } from "antd";
import React from "react";

import { SectionProps } from "./types";

const VALIDATION_RULE_OPTIONS = [{ label: "Required", value: "required" }];

type ValidationSectionProps = Pick<
  SectionProps,
  "selectedNode" | "onPropChange"
>;

export const ValidationSection: React.FC<ValidationSectionProps> = ({
  selectedNode,
  onPropChange,
}) => {
  if (selectedNode.props.required === undefined) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 pt-3">
      <Typography.Text strong className="text-blue-600">
        Validation
      </Typography.Text>
      <Form layout="vertical" size="small" style={{ marginTop: 12 }}>
        <Form.Item label="Validation Rule" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Select Rule"
            value={selectedNode.props.required ? "required" : undefined}
            options={VALIDATION_RULE_OPTIONS}
            onChange={(value) => onPropChange("required", value === "required")}
            allowClear
          />
        </Form.Item>
      </Form>
    </div>
  );
};
