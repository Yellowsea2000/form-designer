import { ComponentProps, ComponentType } from '../../types';
import { ComponentDSLDefinition } from '../types';
import { buttonDSL } from './button';
import { checkboxDSL } from './checkbox';
import { containerDSL } from './container';
import { formDSL } from './form';
import { headerDSL } from './header';
import { imageDSL } from './image';
import { inputDSL } from './input';
import { selectDSL } from './select';
import { tabItemDSL } from './tabItem';
import { tabsDSL } from './tabs';
import { textDSL } from './text';
import { textareaDSL } from './textarea';

export const componentDSLs: Record<ComponentType, ComponentDSLDefinition> = {
  [ComponentType.CONTAINER]: containerDSL,
  [ComponentType.FORM]: formDSL,
  [ComponentType.TABS]: tabsDSL,
  [ComponentType.TAB_ITEM]: tabItemDSL,
  [ComponentType.INPUT]: inputDSL,
  [ComponentType.TEXTAREA]: textareaDSL,
  [ComponentType.SELECT]: selectDSL,
  [ComponentType.CHECKBOX]: checkboxDSL,
  [ComponentType.BUTTON]: buttonDSL,
  [ComponentType.TEXT]: textDSL,
  [ComponentType.IMAGE]: imageDSL,
  [ComponentType.HEADER]: headerDSL,
};

export const DEFAULT_PROPS: Record<ComponentType, ComponentProps> = Object.values(componentDSLs).reduce(
  (acc, dsl) => {
    acc[dsl.type] = dsl.defaultProps;
    return acc;
  },
  {} as Record<ComponentType, ComponentProps>
);
