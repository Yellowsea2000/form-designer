import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  AlignLeftOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  FieldNumberOutlined,
  FieldStringOutlined,
  FontSizeOutlined,
  PictureOutlined,
  SelectOutlined,
  SwitcherOutlined,
} from "@ant-design/icons";
import { ComponentType } from "../types";
import { componentDSLs } from "../dsl/components";
import containerIcon from "../images/FormComponent/Container.png";
import tabIcon from "../images/FormComponent/Tab.png";

interface SidebarItemProps {
  dragId: string;
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
  | ComponentType.DATE_PICKER
  | ComponentType.TIME_PICKER
  | ComponentType.TEXTAREA
  | ComponentType.SELECT
  | ComponentType.CHECKBOX;

interface SidebarPaletteItem {
  id: string;
  type: SidebarPaletteType;
  label: string;
  icon: React.ReactNode;
}

const layoutItems: SidebarPaletteItem[] = [
  {
    id: "layout-container",
    type: ComponentType.CONTAINER,
    label: componentDSLs[ComponentType.CONTAINER].displayName,
    icon: (
      <img src={containerIcon} alt="Container" className={itemImageClassName} draggable={false} />
    ),
  },
  {
    id: "layout-text",
    type: ComponentType.TEXT,
    label: componentDSLs[ComponentType.TEXT].displayName,
    icon: <AlignLeftOutlined style={itemIconStyle} />,
  },
  {
    id: "layout-header",
    type: ComponentType.HEADER,
    label: componentDSLs[ComponentType.HEADER].displayName,
    icon: <FontSizeOutlined style={itemIconStyle} />,
  },
  {
    id: "layout-image",
    type: ComponentType.IMAGE,
    label: componentDSLs[ComponentType.IMAGE].displayName,
    icon: <PictureOutlined style={itemIconStyle} />,
  },
  {
    id: "layout-tabs",
    type: ComponentType.TABS,
    label: componentDSLs[ComponentType.TABS].displayName,
    icon: <img src={tabIcon} alt="Tab" className={itemImageClassName} draggable={false} />,
  },
];

const formControlItems: SidebarPaletteItem[] = [
  {
    id: "control-input-box",
    type: ComponentType.INPUT,
    label: "Input Box",
    icon: <FieldStringOutlined style={itemIconStyle} />,
  },
  {
    id: "control-number-input",
    type: ComponentType.INPUT,
    label: "Number Input",
    icon: <FieldNumberOutlined style={itemIconStyle} />,
  },
  {
    id: "control-dropdown",
    type: ComponentType.SELECT,
    label: "Dropdown",
    icon: <SelectOutlined style={itemIconStyle} />,
  },
  {
    id: "control-switch",
    type: ComponentType.CHECKBOX,
    label: "Switch",
    icon: <SwitcherOutlined style={itemIconStyle} />,
  },
  {
    id: "control-radio",
    type: ComponentType.CHECKBOX,
    label: "Radio",
    icon: <CheckCircleOutlined style={itemIconStyle} />,
  },
  {
    id: "control-checkbox",
    type: ComponentType.CHECKBOX,
    label: "Checkbox",
    icon: <CheckSquareOutlined style={itemIconStyle} />,
  },
  {
    id: "control-text-area",
    type: ComponentType.TEXTAREA,
    label: "Text Area",
    icon: <AlignLeftOutlined style={itemIconStyle} />,
  },
  {
    id: "control-date-picker",
    type: ComponentType.DATE_PICKER,
    label: "Date Picker",
    icon: <CalendarOutlined style={itemIconStyle} />,
  },
  {
    id: "control-time-picker",
    type: ComponentType.TIME_PICKER,
    label: "Time Picker",
    icon: <ClockCircleOutlined style={itemIconStyle} />,
  },
];

const sidebarSections: Array<{
  title: string;
  gridClassName: string;
  items: SidebarPaletteItem[];
}> = [
  {
    title: "Layout",
    gridClassName: "grid grid-cols-3 gap-3",
    items: layoutItems,
  },
  {
    title: "Form Control",
    gridClassName: "grid grid-cols-3 gap-3",
    items: formControlItems,
  },
];

const SidebarItem: React.FC<SidebarItemProps> = ({ dragId, type, label, icon }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
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
            <div className={section.gridClassName}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  dragId={`sidebar-${item.id}`}
                  type={item.type}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
