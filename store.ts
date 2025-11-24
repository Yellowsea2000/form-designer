import { create } from 'zustand';
import {
  ComponentNode,
  ComponentProps,
  ComponentType,
  DragData,
  DragState,
  DropTarget,
  FormSchema,
} from './types';
import { DEFAULT_PROPS } from './dsl/components';

export interface FormDesignerStore {
  formSchema: FormSchema;
  selectedComponentId: string | null;
  propertyPanelOpen: boolean;
  dragState: DragState;
  actions: {
    addComponent: (type: ComponentType, targetId?: string | null, index?: number) => void;
    removeComponent: (id: string) => void;
    updateComponent: (
      id: string,
      updates: Partial<ComponentNode> | Partial<ComponentProps>
    ) => void;
    moveComponent: (
      componentId: string,
      targetId: string | null,
      dropMode?: 'inside' | 'after',
      index?: number
    ) => void;
    selectComponent: (componentId: string | null) => void;
    openPropertyPanel: () => void;
    closePropertyPanel: () => void;
    startDrag: (dragData: DragData) => void;
    endDrag: () => void;
    setDropTarget: (target: DropTarget | null) => void;
    hydrate: (schema: FormSchema) => void;
    reset: () => void;
  };
}

// Simple ID generator
const generateId = () => `node_${Math.random().toString(36).slice(2, 11)}`;

const isContainerType = (type: ComponentType) =>
  type === ComponentType.CONTAINER ||
  type === ComponentType.FORM ||
  type === ComponentType.TABS ||
  type === ComponentType.TAB_ITEM;

const createEmptySchema = (): FormSchema => ({
  id: `form_${Date.now()}`,
  name: 'Untitled Form',
  components: [],
  layout: { columns: 1, gap: 16 },
});

const findNodeById = (nodes: ComponentNode[], id: string): ComponentNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findParentAndIndex = (
  nodes: ComponentNode[],
  childId: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === childId) {
      return { parentId, index: i };
    }
    if (node.children?.length) {
      const found = findParentAndIndex(node.children, childId, node.id);
      if (found) return found;
    }
  }
  return null;
};

const isDescendant = (nodes: ComponentNode[], parentId: string, childId: string): boolean => {
  const parent = findNodeById(nodes, parentId);
  if (!parent) return false;
  if (!parent.children?.length) return false;
  return parent.children.some(
    (child) => child.id === childId || isDescendant(child.children || [], child.id, childId)
  );
};

const createComponentNode = (
  type: ComponentType,
  parentId: string | null,
  siblingsCount: number
): ComponentNode => {
  const base: ComponentNode = {
    id: generateId(),
    type,
    props: { ...DEFAULT_PROPS[type] },
    children: [],
    parent: parentId,
  };

  if (type === ComponentType.TABS) {
    base.children = Array.from({ length: 3 }).map((_, idx) => ({
      id: generateId(),
      type: ComponentType.TAB_ITEM,
      parent: base.id,
      props: {
        ...DEFAULT_PROPS[ComponentType.TAB_ITEM],
        label: `Tab ${idx + 1}`,
      },
      children: [],
    }));
  }

  if (type === ComponentType.TAB_ITEM) {
    base.props.label = base.props.label || `Tab ${siblingsCount + 1}`;
  }

  return base;
};

const addNodeRecursively = (
  nodes: ComponentNode[],
  parentId: string | null,
  newNode: ComponentNode,
  index?: number
): ComponentNode[] => {
  if (parentId === null) {
    const next = [...nodes];
    if (index !== undefined && index >= 0) {
      next.splice(index, 0, newNode);
    } else {
      next.push(newNode);
    }
    return next;
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = [...(node.children || [])];
      if (index !== undefined && index >= 0) {
        children.splice(index, 0, newNode);
      } else {
        children.push(newNode);
      }
      return { ...node, children };
    }
    if (node.children?.length) {
      return { ...node, children: addNodeRecursively(node.children, parentId, newNode, index) };
    }
    return node;
  });
};

const removeNodeRecursively = (nodes: ComponentNode[], id: string): ComponentNode[] =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: removeNodeRecursively(node.children || [], id) }));

const updateNodeRecursively = (
  nodes: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode> | Partial<ComponentProps>
): ComponentNode[] =>
  nodes.map((node) => {
    if (node.id === id) {
      if ('props' in updates || 'children' in updates || 'type' in updates) {
        return { ...node, ...updates };
      }
      return { ...node, props: { ...node.props, ...updates } };
    }
    if (node.children?.length) {
      return { ...node, children: updateNodeRecursively(node.children, id, updates) };
    }
    return node;
  });

const detachNode = (
  nodes: ComponentNode[],
  id: string
): { node: ComponentNode | null; tree: ComponentNode[] } => {
  let removed: ComponentNode | null = null;

  const walker = (list: ComponentNode[]): ComponentNode[] => {
    const next: ComponentNode[] = [];
    list.forEach((item) => {
      if (item.id === id) {
        removed = item;
        return;
      }
      if (item.children?.length) {
        next.push({ ...item, children: walker(item.children) });
      } else {
        next.push(item);
      }
    });
    return next;
  };

  return { node: removed, tree: walker(nodes) };
};

export const useDesignerStore = create<FormDesignerStore>((set, _get) => ({
  formSchema: createEmptySchema(),
  selectedComponentId: null,
  propertyPanelOpen: true,
  dragState: {
    isDragging: false,
    draggedItem: null,
    dropTarget: null,
    previewComponent: null,
  },
  actions: {
    addComponent: (type, targetId = null, index) =>
      set((state) => {
        const parent =
          targetId !== null ? findNodeById(state.formSchema.components, targetId) : null;
        const siblingsCount = parent?.children?.length || state.formSchema.components.length;
        const newNode = createComponentNode(type, targetId, siblingsCount);
        const nextComponents = addNodeRecursively(state.formSchema.components, targetId, newNode, index);

        return {
          formSchema: { ...state.formSchema, components: nextComponents },
          selectedComponentId: newNode.id,
          propertyPanelOpen: true,
        };
      }),

    removeComponent: (id) =>
      set((state) => {
        const next = removeNodeRecursively(state.formSchema.components, id);
        return {
          formSchema: { ...state.formSchema, components: next },
          selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        };
      }),

    updateComponent: (id, updates) =>
      set((state) => ({
        formSchema: {
          ...state.formSchema,
          components: updateNodeRecursively(state.formSchema.components, id, updates),
        },
      })),

    moveComponent: (componentId, targetId, dropMode = 'after', index) =>
      set((state) => {
        if (componentId === targetId) return { formSchema: state.formSchema };
        if (targetId && isDescendant(state.formSchema.components, componentId, targetId)) {
          return { formSchema: state.formSchema };
        }

        const { node: movingNode, tree } = detachNode(state.formSchema.components, componentId);
        if (!movingNode) return { formSchema: state.formSchema };

        let nextTree = tree;

        if (dropMode === 'inside' && targetId) {
          movingNode.parent = targetId;
          nextTree = addNodeRecursively(tree, targetId, movingNode, index);
        } else {
          const parentInfo = targetId
            ? findParentAndIndex(tree, targetId)
            : { parentId: null, index: tree.length };

          if (!parentInfo) {
            nextTree = [...tree, movingNode];
          } else {
            const insertIndex =
              dropMode === 'after' ? parentInfo.index + 1 : Math.max(parentInfo.index, 0);
            movingNode.parent = parentInfo.parentId;
            nextTree = addNodeRecursively(tree, parentInfo.parentId, movingNode, insertIndex);
          }
        }

        return {
          formSchema: { ...state.formSchema, components: nextTree },
          selectedComponentId: movingNode.id,
        };
      }),

    selectComponent: (componentId) =>
      set({
        selectedComponentId: componentId,
        propertyPanelOpen: componentId ? true : false,
      }),

    openPropertyPanel: () => set({ propertyPanelOpen: true }),
    closePropertyPanel: () => set({ propertyPanelOpen: false }),

    startDrag: (dragData) =>
      set((state) => {
        const previewComponent =
          dragData.type === 'component' && dragData.componentType
            ? createComponentNode(dragData.componentType, null, 0)
            : null;
        return {
          dragState: {
            ...state.dragState,
            isDragging: true,
            draggedItem: dragData,
            previewComponent,
          },
        };
      }),

    endDrag: () =>
      set((state) => ({
        dragState: { ...state.dragState, isDragging: false, draggedItem: null, dropTarget: null, previewComponent: null },
      })),

    setDropTarget: (target) =>
      set((state) => ({
        dragState: { ...state.dragState, dropTarget: target },
      })),

    hydrate: (schema) =>
      set({
        formSchema: schema,
        selectedComponentId: null,
      }),

    reset: () =>
      set({
        formSchema: createEmptySchema(),
        selectedComponentId: null,
        propertyPanelOpen: true,
        dragState: {
          isDragging: false,
          draggedItem: null,
          dropTarget: null,
          previewComponent: null,
        },
      }),
  },
}));
