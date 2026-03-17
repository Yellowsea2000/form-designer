import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  AlignLeftOutlined,
  AppstoreOutlined,
  BorderOutlined,
  CheckSquareOutlined,
  FontSizeOutlined,
  FolderOutlined,
  LayoutOutlined,
  PictureOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { ComponentType } from "../types";
import { componentDSLs } from "../dsl/components";
import containerIcon from "../images/FormComponent/Container.png";
import tabIcon from "../images/FormComponent/Tab.png";

interface SidebarItemProps {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

const sectionTitleClassName = "text-base leading-4 font-bold text-[#737373] tracking-normal mb-4";
const itemIconStyle = { fontSize: 24 };
const itemImageClassName = "w-10 h-10 object-contain";

type SidebarPaletteType =
  | ComponentType.CONTAINER
  | ComponentType.TEXT
  | ComponentType.HEADER
  | ComponentType.IMAGE
  | ComponentType.TABS
  | ComponentType.INPUT
  | ComponentType.TEXTAREA
  | ComponentType.SELECT
  | ComponentType.CHECKBOX
  | ComponentType.BUTTON;

const sidebarItemIcons: Record<SidebarPaletteType, React.ReactNode> = {
  [ComponentType.CONTAINER]: (
    <img src={containerIcon} alt="Container" className={itemImageClassName} draggable={false} />
  ),
  [ComponentType.TEXT]: <AlignLeftOutlined style={itemIconStyle} />,
  [ComponentType.HEADER]: <FontSizeOutlined style={itemIconStyle} />,
  [ComponentType.IMAGE]: <PictureOutlined style={itemIconStyle} />,
  [ComponentType.TABS]: (
    <img src={tabIcon} alt="Tab" className={itemImageClassName} draggable={false} />
  ),
  [ComponentType.INPUT]: <FontSizeOutlined style={itemIconStyle} />,
  [ComponentType.TEXTAREA]: <AlignLeftOutlined style={itemIconStyle} />,
  [ComponentType.SELECT]: <SelectOutlined style={itemIconStyle} />,
  [ComponentType.CHECKBOX]: <CheckSquareOutlined style={itemIconStyle} />,
  [ComponentType.BUTTON]: <BorderOutlined style={itemIconStyle} />,
};

const sidebarSections: Array<{ title: string; types: SidebarPaletteType[] }> = [
  {
    title: "Layout",
    types: [
      ComponentType.CONTAINER,
      ComponentType.TEXT,
      ComponentType.HEADER,
      ComponentType.IMAGE,
      ComponentType.TABS,
    ],
  },
  {
    title: "Form Control",
    types: [
      ComponentType.INPUT,
      ComponentType.TEXTAREA,
      ComponentType.SELECT,
      ComponentType.CHECKBOX,
      ComponentType.BUTTON,
    ],
  },
];

const SidebarItem: React.FC<SidebarItemProps> = ({ type, label, icon }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type: "sidebar-item",
      componentType: type,
    },
  });

  const style = isDragging
    ? {
        opacity: 0.5,
        border: "2px dashed #3b82f6",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-sm transition-all active:cursor-grabbing"
    >
      <div className="text-slate-600 mb-2">{icon}</div>
      <span className="text-xs font-medium text-slate-700 text-center">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <AppstoreOutlined className="text-blue-600" style={{ fontSize: 20 }} />
          Components
        </h2>
        <p className="text-xs text-slate-500 mt-1">Drag items to the canvas</p>
      </div>

      <div className="p-4 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className={sectionTitleClassName}>{section.title}</h3>
            <div className="grid grid-cols-2 gap-3">
              {section.types.map((type) => (
                <SidebarItem
                  key={type}
                  type={type}
                  label={componentDSLs[type].displayName}
                  icon={sidebarItemIcons[type]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
