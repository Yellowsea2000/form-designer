import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';
import { ALL_COMPONENT_TYPES } from './shared';

const defaultProps: ComponentProps = {
  label: 'My Form',
  style: {
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    width: '100%',
    minHeight: '150px',
  },
  columns: 1,
  gap: 16,
};

export const formDSL: ComponentDSLDefinition = {
  type: ComponentType.FORM,
  displayName: 'Form',
  version: '1.0.0',
  category: 'layout',
  description: 'A form container with its own grid configuration and header label.',
  defaultProps,
  props: [
    {
      name: 'label',
      label: 'Form Title',
      type: 'string',
      description: 'Title displayed at the top of the form.',
      defaultValue: defaultProps.label,
    },
    {
      name: 'columns',
      label: 'Grid Columns',
      type: 'number',
      description: 'How many grid columns to render inside the form.',
      defaultValue: defaultProps.columns,
    },
    {
      name: 'gap',
      label: 'Grid Gap',
      type: 'number',
      description: 'Spacing between grid items in pixels.',
      defaultValue: defaultProps.gap,
    },
    {
      name: 'style',
      label: 'Style',
      type: 'style',
      description: 'Inline style overrides for the form wrapper.',
      defaultValue: defaultProps.style,
    },
  ],
  children: {
    allow: ALL_COMPONENT_TYPES,
    description: 'Forms can host any component; typically inputs and layout items.',
  },
};
