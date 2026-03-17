import React from "react";
import { ComponentType } from "../types";
import { ButtonElement } from "./elements/ButtonElement";
import { CheckboxElement } from "./elements/CheckboxElement";
import { ContainerElement } from "./elements/ContainerElement";
import { DatePickerElement } from "./elements/DatePickerElement";
import { HeaderElement } from "./elements/HeaderElement";
import { ImageElement } from "./elements/ImageElement";
import { InputElement } from "./elements/InputElement";
import { RadioElement } from "./elements/RadioElement";
import { SelectElement } from "./elements/SelectElement";
import { SwitchElement } from "./elements/SwitchElement";
import { TabItemElement } from "./elements/TabItemElement";
import { TabsElement } from "./elements/TabsElement";
import { TextElement } from "./elements/TextElement";
import { TextareaElement } from "./elements/TextareaElement";
import { TimePickerElement } from "./elements/TimePickerElement";
import { ElementRendererProps } from "./elements/types";

interface ElementRendererInput extends ElementRendererProps {
  type: ComponentType;
}

const renderers: Record<ComponentType, React.FC<ElementRendererProps>> = {
  [ComponentType.TITLE]: HeaderElement,
  [ComponentType.TEXT]: TextElement,
  [ComponentType.INPUT]: InputElement,
  [ComponentType.DATE_PICKER]: DatePickerElement,
  [ComponentType.TIME_PICKER]: TimePickerElement,
  [ComponentType.TEXTAREA]: TextareaElement,
  [ComponentType.SELECT]: SelectElement,
  [ComponentType.CHECKBOX]: CheckboxElement,
  [ComponentType.RADIO]: RadioElement,
  [ComponentType.SWITCH]: SwitchElement,
  [ComponentType.BUTTON]: ButtonElement,
  [ComponentType.ICON]: ImageElement,
  [ComponentType.CONTAINER]: ContainerElement,
  [ComponentType.TABS]: TabsElement,
  [ComponentType.TAB_ITEM]: TabItemElement,
};

export const FormElementRenderer: React.FC<ElementRendererInput> = ({
  type,
  props,
  children,
  node,
  activeTabId,
  onTabChange,
}) => {
  const Renderer = renderers[type];

  if (!Renderer) {
    return <div className="text-red-500">Unknown Component: {type}</div>;
  }

  return (
    <Renderer
      props={props}
      children={children}
      node={node}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
    />
  );
};
