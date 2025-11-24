import { CSSProperties } from 'react';

// Component taxonomy
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

// Props shared across components; individual defaults come from DSL
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

export interface Position {
  x?: number;
  y?: number;
  order?: number;
}

export interface LayoutConfig {
  columns?: number;
  gap?: number;
}

// Core node in the form schema tree
export interface ComponentNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children: ComponentNode[];
  parent?: string | null;
  position?: Position;
  style?: CSSProperties;
}

// Backwards-compatible alias used across the codebase
export type FormNode = ComponentNode;

export interface FormSchema {
  id: string;
  name: string;
  components: ComponentNode[];
  layout?: LayoutConfig;
}

export interface DragData {
  type: 'component' | 'reorder';
  componentType?: ComponentType;
  componentId?: string;
  sourceIndex?: number;
  nodeType?: ComponentType;
}

export type DropPosition = 'inside' | 'after';

export interface DropTarget {
  id: string;
  type: 'canvas' | 'container';
  acceptTypes: ComponentType[];
  position: DropPosition;
  data?: unknown;
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DragData | null;
  dropTarget: DropTarget | null;
  previewComponent: ComponentNode | null;
}

export interface FormDataSerializer {
  serialize: (formSchema: FormSchema) => string;
  deserialize: (data: string) => FormSchema;
  validate: (data: unknown) => boolean;
}

export interface StorageManager {
  save: (key: string, formSchema: FormSchema) => Promise<void>;
  load: (key: string) => Promise<FormSchema | null>;
  list: () => Promise<string[]>;
  delete: (key: string) => Promise<void>;
}
