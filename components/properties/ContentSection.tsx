import React from 'react';
import { Form, Input } from 'antd';
import { Type } from 'lucide-react';
import { ComponentType } from '../../types';
import { SectionProps } from './types';
import { SectionCard } from './SectionCard';

export const ContentSection: React.FC<SectionProps> = ({ selectedNode, onPropChange }) => {
  const hasContentFields =
    selectedNode.props.label !== undefined ||
    selectedNode.props.content !== undefined ||
    selectedNode.props.placeholder !== undefined;

  if (!hasContentFields) {
    return null;
  }

  return (
    <SectionCard title="Content" icon={<Type className="w-4 h-4" />}>
      <Form layout="vertical" size="small">
        {selectedNode.props.label !== undefined && (
          <Form.Item label="Label" style={{ marginBottom: 12 }}>
            <Input
              value={selectedNode.props.label ?? ''}
              onChange={(event) => onPropChange('label', event.target.value)}
            />
          </Form.Item>
        )}
        {selectedNode.props.content !== undefined && (
          <Form.Item
            label={selectedNode.type === ComponentType.BUTTON ? 'Button Text' : 'Text Content'}
            style={{ marginBottom: 12 }}
          >
            <Input
              value={selectedNode.props.content ?? ''}
              onChange={(event) => onPropChange('content', event.target.value)}
            />
          </Form.Item>
        )}
        {selectedNode.props.placeholder !== undefined && (
          <Form.Item label="Placeholder" style={{ marginBottom: 0 }}>
            <Input
              value={selectedNode.props.placeholder ?? ''}
              onChange={(event) => onPropChange('placeholder', event.target.value)}
            />
          </Form.Item>
        )}
      </Form>
    </SectionCard>
  );
};

