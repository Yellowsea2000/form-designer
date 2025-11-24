import React from 'react';
import { ComponentNode, ComponentProps } from '../../types';

export interface ElementRendererProps {
  props: ComponentProps;
  children?: React.ReactNode;
  node?: ComponentNode;
  activeTabId?: string | null;
  onTabChange?: (id: string) => void;
}
