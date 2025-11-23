import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';

const defaultProps: ComponentProps = {
  content: 'Form Header',
  style: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
};

export const headerDSL: ComponentDSLDefinition = {
  type: ComponentType.HEADER,
  displayName: 'Header',
  version: '1.0.0',
  category: 'display',
  description: 'Section heading text.',
  defaultProps,
  props: [
    {
      name: 'content',
      label: 'Heading Text',
      type: 'string',
      description: 'Displayed heading string.',
      defaultValue: defaultProps.content,
    },
    {
      name: 'style',
      label: 'Style',
      type: 'style',
      description: 'Inline style overrides for the heading.',
      defaultValue: defaultProps.style,
    },
  ],
};
