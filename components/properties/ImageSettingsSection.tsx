import React from "react";
import { PictureOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { ComponentType } from "../../types";
import { SectionProps } from "./types";
import { SectionCard } from "./SectionCard";

export const ImageSettingsSection: React.FC<SectionProps> = ({ selectedNode, onPropChange }) => {
  if (selectedNode.type !== ComponentType.IMAGE) {
    return null;
  }

  return (
    <SectionCard title="Image Source" icon={<PictureOutlined style={{ fontSize: 16 }} />}>
      <Form layout="vertical" size="small">
        <Form.Item label="Image URL" style={{ marginBottom: 12 }}>
          <Input
            value={selectedNode.props.src ?? ""}
            onChange={(event) => onPropChange("src", event.target.value)}
          />
        </Form.Item>
        <Form.Item label="Alt Text" style={{ marginBottom: 0 }}>
          <Input
            value={selectedNode.props.alt ?? ""}
            onChange={(event) => onPropChange("alt", event.target.value)}
          />
        </Form.Item>
      </Form>
    </SectionCard>
  );
};
