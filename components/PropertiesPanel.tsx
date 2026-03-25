import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Tag } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";

import panelBg from "../images/panelBg.png";
import { useDesignerStore } from "../store";
import { ComponentType } from "../types";
import { BindFieldSection } from "./properties/BindFieldSection";
import { ContainerPropertiesSection } from "./properties/ContainerPropertiesSection";
import { ContentSection } from "./properties/ContentSection";
import { DropdownPropertiesSection } from "./properties/DropdownPropertiesSection";
import { EmptyProperties } from "./properties/EmptyProperties";
import { SelectOptionsSection } from "./properties/SelectOptionsSection";
import { SwitchPropertiesSection } from "./properties/SwitchPropertiesSection";
import { TabItemHint } from "./properties/TabItemHint";
import { TabsManagementSection } from "./properties/TabsManagementSection";
import { PropChangeFn, StyleChangeFn } from "./properties/types";
import { findNodeById } from "./properties/utils";
import { ValidationSection } from "./properties/ValidationSection";

export const PropertiesPanel: React.FC = observer(() => {
  const { nodes, selectedNodeId, updateNode, selectNode, addNode, removeNode } =
    useDesignerStore();
  const selectedNode = selectedNodeId
    ? findNodeById(nodes, selectedNodeId)
    : undefined;

  if (!selectedNode) {
    return <EmptyProperties />;
  }

  const handlePropChange: PropChangeFn = (key, value) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  const handleStyleChange: StyleChangeFn = (key, value) => {
    updateNode(selectedNode.id, {
      style: {
        ...selectedNode.props.style,
        [key]: value,
      },
    });
  };

  const isContainer = [
    ComponentType.CONTAINER,
    ComponentType.TAB_ITEM,
    ComponentType.TABS,
  ].includes(selectedNode.type);

  const isTabItem = selectedNode.type === ComponentType.TAB_ITEM;
  const isSwitch = selectedNode.type === ComponentType.SWITCH;
  const isDropdown = selectedNode.type === ComponentType.SELECT;
  const isContainerComponent = selectedNode.type === ComponentType.CONTAINER;
  const isTabs = selectedNode.type === ComponentType.TABS;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-30">
      <div
        className="h-10 px-3 border-b border-slate-200 bg-no-repeat bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${panelBg})` }}
      >
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <Tag style={{ margin: 0, textTransform: "uppercase" }}>
            {selectedNode.type}
          </Tag>
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: 20 }} />}
            onClick={() => selectNode(null)}
          />
        </Flex>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {isTabItem ? (
            <TabItemHint />
          ) : isSwitch ? (
            <SwitchPropertiesSection
              selectedNode={selectedNode}
              onPropChange={handlePropChange}
            />
          ) : isDropdown ? (
            <DropdownPropertiesSection
              selectedNode={selectedNode}
              onPropChange={handlePropChange}
            />
          ) : isContainerComponent ? (
            <ContainerPropertiesSection
              selectedNode={selectedNode}
              onPropChange={handlePropChange}
            />
          ) : isTabs ? (
            <TabsManagementSection
              selectedNode={selectedNode}
              updateNode={updateNode}
              addNode={addNode}
              removeNode={removeNode}
            />
          ) : (
            <>
              {!isContainer &&
                ![ComponentType.TEXT, ComponentType.TITLE].includes(
                  selectedNode.type,
                ) && (
                  <BindFieldSection
                    selectedNode={selectedNode}
                    onPropChange={handlePropChange}
                  />
                )}

              <ContentSection
                selectedNode={selectedNode}
                onPropChange={handlePropChange}
                onStyleChange={handleStyleChange}
              />

              <SelectOptionsSection
                selectedNode={selectedNode}
                onPropChange={handlePropChange}
                onStyleChange={handleStyleChange}
              />

              <ValidationSection
                selectedNode={selectedNode}
                onPropChange={handlePropChange}
              />
            </>
          )}
        </Space>
      </div>
    </div>
  );
});
