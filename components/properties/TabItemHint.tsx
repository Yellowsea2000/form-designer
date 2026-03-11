import React from "react";
import { ClusterOutlined } from "@ant-design/icons";
import { Alert, Typography } from "antd";

export const TabItemHint: React.FC = () => {
  return (
    <Alert
      type="info"
      showIcon
      icon={<ClusterOutlined style={{ fontSize: 16 }} />}
      message="This is a Tab Item"
      description={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Select the parent Tabs component to manage tab properties.
        </Typography.Text>
      }
    />
  );
};
