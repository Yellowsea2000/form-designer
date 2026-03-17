import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { AppstoreOutlined } from "@ant-design/icons";
import { ComponentType } from "../types";
import { componentDSLs } from "../dsl/components";
import checkboxIcon from "../images/FormComponent/Checkbox.png";
import containerIcon from "../images/FormComponent/Container.png";
import datePickerIcon from "../images/FormComponent/DatePicker.png";
import dropdownIcon from "../images/FormComponent/Dropdown.png";
import iconComponentIcon from "../images/FormComponent/Icon.png";
import inputBoxIcon from "../images/FormComponent/InputBox.png";
import inputNumberIcon from "../images/FormComponent/InputNumber.png";
import radioIcon from "../images/FormComponent/Radio.png";
import switchIcon from "../images/FormComponent/Switch.png";
import tabIcon from "../images/FormComponent/Tab.png";
import textAreaIcon from "../images/FormComponent/TextArea.png";
import textIcon from "../images/FormComponent/Text.png";
import timePickerIcon from "../images/FormComponent/TimePicker.png";
import titleIcon from "../images/FormComponent/Title.png";

interface SidebarItemProps {
  dragId: string;
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

const sectionTitleClassName = "text-base leading-4 font-bold text-[#737373] tracking-normal mb-4";
const itemImageClassName = "w-[36px] h-[36px]";
const itemIconBoxClassName = "flex items-center justify-center text-slate-600";

type SidebarPaletteType =
  | ComponentType.CONTAINER
  | ComponentType.TEXT
  | ComponentType.TITLE
  | ComponentType.ICON
  | ComponentType.TABS
  | ComponentType.INPUT
  | ComponentType.DATE_PICKER
  | ComponentType.TIME_PICKER
  | ComponentType.TEXTAREA
  | ComponentType.SELECT
  | ComponentType.CHECKBOX
  | ComponentType.RADIO
  | ComponentType.SWITCH;

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
    icon: <img src={textIcon} alt="Text" className={itemImageClassName} draggable={false} />,
  },
  {
    id: "layout-title",
    type: ComponentType.TITLE,
    label: componentDSLs[ComponentType.TITLE].displayName,
    icon: <img src={titleIcon} alt="Title" className={itemImageClassName} draggable={false} />,
  },
  {
    id: "layout-icon",
    type: ComponentType.ICON,
    label: componentDSLs[ComponentType.ICON].displayName,
    icon: (
      <img src={iconComponentIcon} alt="Icon" className={itemImageClassName} draggable={false} />
    ),
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
    icon: (
      <img src={inputBoxIcon} alt="Input Box" className={itemImageClassName} draggable={false} />
    ),
  },
  {
    id: "control-number-input",
    type: ComponentType.INPUT,
    label: "Number Input",
    icon: (
      <img
        src={inputNumberIcon}
        alt="Number Input"
        className={itemImageClassName}
        draggable={false}
      />
    ),
  },
  {
    id: "control-dropdown",
    type: ComponentType.SELECT,
    label: "Dropdown",
    icon: (
      <img src={dropdownIcon} alt="Dropdown" className={itemImageClassName} draggable={false} />
    ),
  },
  {
    id: "control-switch",
    type: ComponentType.SWITCH,
    label: "Switch",
    icon: <img src={switchIcon} alt="Switch" className={itemImageClassName} draggable={false} />,
  },
  {
    id: "control-radio",
    type: ComponentType.RADIO,
    label: "Radio",
    icon: <img src={radioIcon} alt="Radio" className={itemImageClassName} draggable={false} />,
  },
  {
    id: "control-checkbox",
    type: ComponentType.CHECKBOX,
    label: "Checkbox",
    icon: (
      <img src={checkboxIcon} alt="Checkbox" className={itemImageClassName} draggable={false} />
    ),
  },
  {
    id: "control-text-area",
    type: ComponentType.TEXTAREA,
    label: "Text Area",
    icon: (
      <img src={textAreaIcon} alt="Text Area" className={itemImageClassName} draggable={false} />
    ),
  },
  {
    id: "control-date-picker",
    type: ComponentType.DATE_PICKER,
    label: "Date Picker",
    icon: (
      <img
        src={datePickerIcon}
        alt="Date Picker"
        className={itemImageClassName}
        draggable={false}
      />
    ),
  },
  {
    id: "control-time-picker",
    type: ComponentType.TIME_PICKER,
    label: "Time Picker",
    icon: (
      <img
        src={timePickerIcon}
        alt="Time Picker"
        className={itemImageClassName}
        draggable={false}
      />
    ),
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

  const cardStyle = isDragging
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
      className="flex flex-col items-center cursor-grab active:cursor-grabbing"
    >
      <div
        style={cardStyle}
        className="w-[60px] h-[60px] p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:border-blue-400 hover:shadow-sm transition-all"
      >
        <div className={itemIconBoxClassName}>{icon}</div>
      </div>
      <span className="mt-2 text-xs font-medium text-slate-700 text-center">{label}</span>
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
