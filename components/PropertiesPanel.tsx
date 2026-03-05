import React from 'react';
import { Button, Flex, Space, Tag, Typography } from 'antd';
import { X } from 'lucide-react';
import { useDesignerStore } from '../store';
import { ComponentType } from '../types';
import { AppearanceSection } from './properties/AppearanceSection';
import { ContentSection } from './properties/ContentSection';
import { EmptyProperties } from './properties/EmptyProperties';
import { ImageSettingsSection } from './properties/ImageSettingsSection';
import { LayoutSettingsSection } from './properties/LayoutSettingsSection';
import { SelectOptionsSection } from './properties/SelectOptionsSection';
import { TabItemHint } from './properties/TabItemHint';
import { TabsManagementSection } from './properties/TabsManagementSection';
import { StyleChangeFn, PropChangeFn } from './properties/types';
import { ValidationSection } from './properties/ValidationSection';
import { findNodeById } from './properties/utils';

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedNodeId, updateNode, selectNode, addNode, removeNode } = useDesignerStore();
  const selectedNode = selectedNodeId ? findNodeById(nodes, selectedNodeId) : undefined;

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

  const handlePaddingChange = (padding: number) => {
    const value = `${padding}px`;
    updateNode(selectedNode.id, {
      style: {
        ...selectedNode.props.style,
        paddingTop: value,
        paddingBottom: value,
      },
    });
  };

  const isContainer = [
    ComponentType.CONTAINER,
    ComponentType.FORM,
    ComponentType.TAB_ITEM,
    ComponentType.TABS,
  ].includes(selectedNode.type);

  const isTabItem = selectedNode.type === ComponentType.TAB_ITEM;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-30">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <Flex justify="space-between" align="center">
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Properties
            </Typography.Title>
            <Tag style={{ marginTop: 4, textTransform: 'uppercase' }}>{selectedNode.type}</Tag>
          </div>
          <Button
            type="text"
            icon={<X className="w-5 h-5" />}
            onClick={() => selectNode(null)}
          />
        </Flex>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {isTabItem ? (
            <TabItemHint />
          ) : (
            <>
              {isContainer && (
                <LayoutSettingsSection
                  selectedNode={selectedNode}
                  onPropChange={handlePropChange}
                  onStyleChange={handleStyleChange}
                />
              )}

              {selectedNode.type === ComponentType.TABS && (
                <TabsManagementSection
                  selectedNode={selectedNode}
                  updateNode={updateNode}
                  addNode={addNode}
                  removeNode={removeNode}
                />
              )}

              <ContentSection
                selectedNode={selectedNode}
                onPropChange={handlePropChange}
                onStyleChange={handleStyleChange}
              />

              <ImageSettingsSection
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
                onStyleChange={handleStyleChange}
              />

              <AppearanceSection
                selectedNode={selectedNode}
                onPropChange={handlePropChange}
                onStyleChange={handleStyleChange}
                onPaddingChange={handlePaddingChange}
              />
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

