import React from 'react';
import { Alert, Typography } from 'antd';
import { Layers } from 'lucide-react';

export const TabItemHint: React.FC = () => {
  return (
    <Alert
      type="info"
      showIcon
      icon={<Layers className="w-4 h-4" />}
      message="This is a Tab Item"
      description={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Select the parent Tabs component to manage tab properties.
        </Typography.Text>
      }
    />
  );
};

