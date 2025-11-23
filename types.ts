import { CSSProperties } from 'react';

export enum ComponentType {
  // Layout
  CONTAINER = 'container',
  FORM = 'form',
  TABS = 'tabs',
  TAB_ITEM = 'tab_item',
  
  // Form Controls
  INPUT = 'input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  BUTTON = 'button',
  
  // Display
  TEXT = 'text',
  IMAGE = 'image',
  HEADER = 'header'
}

export interface ComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { label: string; value: string }[]; // For select
  src?: string; // For image
  alt?: string; // For image
  content?: string; // For text/header
  className?: string;
  style?: CSSProperties;
  buttonType?: 'submit' | 'button' | 'reset';
  
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
  type: 'sidebar-item' | 'canvas-item' | 'container-interior';
  componentType?: ComponentType;
  id?: string;
  isContainer?: boolean;
  nodeType?: ComponentType;
  parentId?: string;
}
