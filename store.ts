import { create } from 'zustand';
import { FormNode, ComponentType, ComponentProps } from './types';
import { DEFAULT_PROPS } from './dsl/components';

interface DesignerState {
  nodes: FormNode[];
  selectedNodeId: string | null;
  
  // Actions
  addNode: (type: ComponentType, parentId: string | null, index?: number) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<FormNode> | Partial<ComponentProps>) => void;
  selectNode: (id: string | null) => void;
  moveNode: (activeId: string, overId: string, isInteriorDrop?: boolean, activeNodeType?: ComponentType) => void;
}

// Simple ID generator
const generateId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

// Helper to recursively add a node
const addNodeRecursively = (nodes: FormNode[], parentId: string | null, newNode: FormNode, index?: number): FormNode[] => {
  if (parentId === null) {
    const newNodes = [...nodes];
    if (index !== undefined && index >= 0) {
      newNodes.splice(index, 0, newNode);
    } else {
      newNodes.push(newNode);
    }
    return newNodes;
  }

  return nodes.map(node => {
    if (node.id === parentId) {
      const newChildren = [...node.children];
      if (index !== undefined && index >= 0) {
        newChildren.splice(index, 0, newNode);
      } else {
        newChildren.push(newNode);
      }
      return { ...node, children: newChildren };
    }
    if (node.children.length > 0) {
      return { ...node, children: addNodeRecursively(node.children, parentId, newNode, index) };
    }
    return node;
  });
};

// Helper to recursively remove a node
const removeNodeRecursively = (nodes: FormNode[], id: string): FormNode[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: removeNodeRecursively(node.children, id)
    }));
};

// Helper to recursively update a node
const updateNodeRecursively = (nodes: FormNode[], id: string, updates: any): FormNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
       if ('props' in updates) {
         return { ...node, ...updates };
       }
       if ('type' in updates || 'id' in updates) {
          return { ...node, ...updates };
       }
       return { ...node, props: { ...node.props, ...updates } };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeRecursively(node.children, id, updates) };
    }
    return node;
  });
};

// Helper to check if a type is a container
const isContainerType = (type: ComponentType) => {
  return type === ComponentType.CONTAINER ||
         type === ComponentType.FORM ||
         type === ComponentType.TABS ||
         type === ComponentType.TAB_ITEM;
};

// Helper to find parent node of a given node
const findParentNode = (nodes: FormNode[], childId: string, parentId: string | null = null): string | null => {
  for (const node of nodes) {
    if (node.children.some(child => child.id === childId)) {
      return node.id;
    }
    if (node.children.length > 0) {
      const found = findParentNode(node.children, childId, node.id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to get node by id
const getNodeById = (nodes: FormNode[], id: string): FormNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = getNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const useDesignerStore = create<DesignerState>((set) => ({
  nodes: [],
  selectedNodeId: null,

  addNode: (type, parentId, index) => set((state) => {
    const newNode: FormNode = {
      id: generateId(),
      type,
      props: { ...DEFAULT_PROPS[type] },
      children: []
    };

    // Pre-populate tabs with default items
    if (type === ComponentType.TABS) {
        newNode.children = [
            { id: generateId(), type: ComponentType.TAB_ITEM, props: { label: 'Tab 1', style: DEFAULT_PROPS[ComponentType.TAB_ITEM].style }, children: [] },
            { id: generateId(), type: ComponentType.TAB_ITEM, props: { label: 'Tab 2', style: DEFAULT_PROPS[ComponentType.TAB_ITEM].style }, children: [] },
            { id: generateId(), type: ComponentType.TAB_ITEM, props: { label: 'Tab 3', style: DEFAULT_PROPS[ComponentType.TAB_ITEM].style }, children: [] },
        ];
    }

    // Auto-set label for TAB_ITEM based on sibling count
    if (type === ComponentType.TAB_ITEM && parentId) {
      const parent = getNodeById(state.nodes, parentId);
      if (parent?.type === ComponentType.TABS) {
        const tabNumber = parent.children.length + 1;
        newNode.props.label = `Tab ${tabNumber}`;
      }
    }

    return {
      nodes: addNodeRecursively(state.nodes, parentId, newNode, index),
      selectedNodeId: newNode.id
    };
  }),

  removeNode: (id) => set((state) => ({
    nodes: removeNodeRecursively(state.nodes, id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: updateNodeRecursively(state.nodes, id, updates)
  })),

  selectNode: (id) => set((state) => {
    if (!id) return { selectedNodeId: null };

    // If selecting a TAB_ITEM, select its parent TABS instead
    const node = getNodeById(state.nodes, id);
    if (node?.type === ComponentType.TAB_ITEM) {
      const parentId = findParentNode(state.nodes, id);
      return { selectedNodeId: parentId };
    }

    return { selectedNodeId: id };
  }),

  moveNode: (activeId, overId, isInteriorDrop, activeNodeType) => set((state) => {
    const cloneNodes = JSON.parse(JSON.stringify(state.nodes));
    
    // 1. Find and Remove active node
    let activeNode: FormNode | undefined;

    const findAndRemove = (nodes: FormNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === activeId) {
          activeNode = nodes[i];
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && findAndRemove(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    findAndRemove(cloneNodes);

    if (!activeNode) return { nodes: state.nodes };

    // 2. Find overId and Insert
    if (overId === 'root' || overId === 'canvas-droppable') {
        cloneNodes.push(activeNode);
        return { nodes: cloneNodes };
    }

    // Handle interior drop (explicit nesting)
    if (isInteriorDrop) {
        // Extract parent ID from interior droppable ID (format: "nodeId-interior")
        const parentId = overId.replace('-interior', '');
        
        const insertIntoParent = (nodes: FormNode[]): boolean => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === parentId) {
                    nodes[i].children.push(activeNode!);
                    return true;
                }
                if (nodes[i].children && insertIntoParent(nodes[i].children)) {
                    return true;
                }
            }
            return false;
        };

        if (insertIntoParent(cloneNodes)) {
            return { nodes: cloneNodes };
        }
    }

    // Handle regular drop (sibling placement)
    const insert = (nodes: FormNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === overId) {
                const targetNode = nodes[i];
                
                // Check if target is a container
                if (isContainerType(targetNode.type)) {
                    // Place as sibling (after the container)
                    nodes.splice(i + 1, 0, activeNode!);
                } else {
                    // Insert BEFORE sibling
                    nodes.splice(i, 0, activeNode!);
                }
                return true;
            }
            
            if (nodes[i].children) {
                if (insert(nodes[i].children)) return true;
            }
        }
        return false;
    };

    if (!insert(cloneNodes)) {
        // Fallback: add to root if not found
        cloneNodes.push(activeNode);
    }

    return { nodes: cloneNodes };
  }),
}));
