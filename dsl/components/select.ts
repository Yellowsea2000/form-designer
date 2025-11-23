import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';

const defaultProps: ComponentProps = {
  label: 'Dropdown',
  required: false,
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ],
};

export const selectDSL: ComponentDSLDefinition = {
  type: ComponentType.SELECT,
  displayName: 'Select',
  version: '1.0.0',
  category: 'form-control',
  description: 'Single select dropdown with label and options.',
  defaultProps,
  props: [
    {
      name: 'label',
      label: 'Label',
      type: 'string',
      description: 'Field label displayed above the select.',
      defaultValue: defaultProps.label,
    },
    {
      name: 'required',
      label: 'Required',
      type: 'boolean',
      description: 'Whether this field must be selected.',
      defaultValue: defaultProps.required,
    },
    {
      name: 'options',
      label: 'Options',
      type: 'options',
      description: 'List of selectable options with label/value.',
      defaultValue: defaultProps.options,
    },
  ],
};
