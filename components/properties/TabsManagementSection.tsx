import React from "react";
import { ClusterOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Space } from "antd";
import { ComponentType, FormNode } from "../../types";
import { AddNodeFn, RemoveNodeFn, UpdateNodeFn } from "./types";
import { SectionCard } from "./SectionCard";

interface TabsManagementSectionProps {
  selectedNode: FormNode;
  updateNode: UpdateNodeFn;
  addNode: AddNodeFn;
  removeNode: RemoveNodeFn;
}

export const TabsManagementSection: React.FC<TabsManagementSectionProps> = ({
  selectedNode,
  updateNode,
  addNode,
  removeNode,
}) => {
  return (
    <SectionCard title="Tab Items" icon={<ClusterOutlined style={{ fontSize: 16 }} />}>
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        {selectedNode.children.map((child, idx) => (
          <Flex key={child.id} gap={8}>
            <Input
              value={child.props.label || `Tab ${idx + 1}`}
              placeholder={`Tab ${idx + 1}`}
              onChange={(event) => updateNode(child.id, { label: event.target.value })}
            />
            <Button
              danger
              type="text"
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => removeNode(child.id)}
            />
          </Flex>
        ))}
        <Button
          block
          type="dashed"
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={() => addNode(ComponentType.TAB_ITEM, selectedNode.id)}
        >
          Add Tab
        </Button>
      </Space>
    </SectionCard>
  );
};
