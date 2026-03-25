import { LinkOutlined } from "@ant-design/icons";
import { Form, Select } from "antd";
import React from "react";

import { SectionCard } from "./SectionCard";
import { SectionProps } from "./types";

const EMPTY_BIND_FIELD_OPTIONS: { label: string; value: string }[] = [];

type BindFieldSectionProps = Pick<
  SectionProps,
  "selectedNode" | "onPropChange"
>;

export const BindFieldSection: React.FC<BindFieldSectionProps> = ({
  selectedNode,
  onPropChange,
}) => {
  return (
    <SectionCard
      title="Bind Field"
      icon={<LinkOutlined style={{ fontSize: 16 }} />}
    >
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
  );
};
