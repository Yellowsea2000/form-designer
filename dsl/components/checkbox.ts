import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';

const defaultProps: ComponentProps = {
  label: 'Checkbox',
  required: false,
  content: 'I agree to terms',
};

export const checkboxDSL: ComponentDSLDefinition = {
  type: ComponentType.CHECKBOX,
  displayName: 'Checkbox',
  version: '1.0.0',
  category: 'form-control',
  description: 'Checkbox input with an optional helper description.',
  defaultProps,
  props: [
    {
      name: 'label',
      label: 'Label',
      type: 'string',
      description: 'Field label rendered next to the checkbox.',
      defaultValue: defaultProps.label,
    },
    {
      name: 'content',
      label: 'Description',
      type: 'string',
      description: 'Helper text displayed under the label.',
      defaultValue: defaultProps.content,
    },
    {
      name: 'required',
      label: 'Required',
      type: 'boolean',
      description: 'Whether the checkbox must be checked.',
      defaultValue: defaultProps.required,
    },
  ],
};
