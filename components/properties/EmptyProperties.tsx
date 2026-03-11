import React from "react";
import { Empty } from "antd";
import { Settings2 } from "lucide-react";

export const EmptyProperties: React.FC = () => {
  return (
    <div className="w-80 bg-white border-l border-slate-200 p-6 flex items-center justify-center h-full">
      <Empty
        image={<Settings2 className="w-12 h-12 text-slate-300" />}
        description="Select a component on the canvas to configure its properties."
      />
    </div>
  );
};
