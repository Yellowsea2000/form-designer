import { CSSProperties } from "react";

export enum ComponentType {
  // Layout
  CONTAINER = "container",
  TABS = "tabs",
  TAB_ITEM = "tab_item",
  TEXT = "text",
  ICON = "icon",
  TITLE = "title",

  // Form Controls
  INPUT = "input",
  DATE_PICKER = "date_picker",
  TIME_PICKER = "time_picker",
  TEXTAREA = "textarea",
  SELECT = "select",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SWITCH = "switch",
  BUTTON = "button",
}

export interface ComponentProps {
  bindField?: string;
  label?: string;
  placeholder?: string;
  defaultTabId?: string;
  required?: boolean;
  defaultValue?: string | boolean;
  options?: { label: string; value: string }[]; // For select/checkbox/radio
  src?: string; // For icon/image
  alt?: string; // For icon/image
  content?: string; // For text/title
  className?: string;
  style?: CSSProperties;
  buttonType?: "submit" | "button" | "reset";

  // Layout props
  columns?: number;
  gap?: number;
}

export interface FormNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children: FormNode[];
}

export interface DragData {
  type: "sidebar-item" | "canvas-item" | "container-interior";
  componentType?: ComponentType;
  id?: string;
  isContainer?: boolean;
  nodeType?: ComponentType;
  parentId?: string;
}
