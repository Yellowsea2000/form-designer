import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';

const defaultProps: ComponentProps = {
  src: 'https://picsum.photos/400/200',
  alt: 'Placeholder Image',
  style: { borderRadius: '8px', width: '100%', height: 'auto', objectFit: 'cover' },
};

export const imageDSL: ComponentDSLDefinition = {
  type: ComponentType.IMAGE,
  displayName: 'Image',
  version: '1.0.0',
  category: 'display',
  description: 'Responsive image with optional alt text.',
  defaultProps,
  props: [
    {
      name: 'src',
      label: 'Source URL',
      type: 'string',
      description: 'Image source address.',
      defaultValue: defaultProps.src,
    },
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'string',
      description: 'Accessible description for the image.',
      defaultValue: defaultProps.alt,
    },
    {
      name: 'style',
      label: 'Style',
      type: 'style',
      description: 'Inline style overrides for the image.',
      defaultValue: defaultProps.style,
    },
  ],
};
