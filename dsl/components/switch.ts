import { ComponentProps, ComponentType } from "../../types";
import { ComponentDSLDefinition } from "../types";

const defaultProps: ComponentProps = {
  label: "Switch",
  required: false,
  content: "Enable notifications",
};

export const switchDSL: ComponentDSLDefinition = {
  type: ComponentType.SWITCH,
  displayName: "Switch",
  version: "1.0.0",
  category: "form-control",
  description: "Switch control with optional helper text.",
  defaultProps,
  props: [
    {
      name: "label",
      label: "Label",
      type: "string",
      description: "Field label displayed above the switch.",
      defaultValue: defaultProps.label,
    },
    {
      name: "content",
      label: "Description",
      type: "string",
      description: "Helper text shown next to the switch.",
      defaultValue: defaultProps.content,
    },
    {
      name: "required",
      label: "Required",
      type: "boolean",
      description: "Whether this switch must be enabled.",
      defaultValue: defaultProps.required,
    },
  ],
};
