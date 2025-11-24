import React, { createContext, useContext, useRef, useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  Modifier,
} from '@dnd-kit/core';
import { Code, Eye, Save, Settings2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { JsonModal } from './components/JsonModal';
import { useDesignerStore } from './store';
import { ComponentNode, ComponentType, DragData, DropTarget } from './types';
import { createFormDocument, validateFormDocument } from './dsl/form';
import { storageManager } from './persistence';

interface DragContextType {
  activeDragData: DragData | null;
  dropTarget: DropTarget | null;
}

export const DragContext = createContext<DragContextType>({
  activeDragData: null,
  dropTarget: null,
});

export const useDragContext = () => useContext(DragContext);

// Helper to find parent and index of a node in the tree
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
      const result = findParentAndIndex(node.children, childId, node.id);
      if (result) return result;
    }
  }
  return null;
};

const resolveInsertLocation = (
  nodes: ComponentNode[],
  overId: string,
  overData: any
): { parentId: string | null; index?: number } => {
  if (overData?.type === 'container-interior') {
    return { parentId: overData.parentId ?? null, index: undefined };
  }

  if (overId === 'canvas-droppable' || overId === 'root') {
    return { parentId: null, index: nodes.length };
  }

  const target = findParentAndIndex(nodes, overId);
  if (target) {
    return { parentId: target.parentId, index: target.index + 1 };
  }

  return { parentId: null, index: nodes.length };
};

// Drop animation config for smoother UX
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
  duration: 0,
};

// Modifier to position the drag overlay near the cursor
const cursorModifier: Modifier = ({ transform }) => ({
  ...transform,
  x: transform.x - 10,
  y: transform.y + 10,
});

function App() {
  const formSchema = useDesignerStore((state) => state.formSchema);
  const dragState = useDesignerStore((state) => state.dragState);
  const propertyPanelOpen = useDesignerStore((state) => state.propertyPanelOpen);
  const actions = useDesignerStore((state) => state.actions);
  const [showPreview, setShowPreview] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const formJson = useMemo(
    () => JSON.stringify(createFormDocument(formSchema), null, 2),
    [formSchema]
  );

  const toggleProperties = () => {
    if (propertyPanelOpen) {
      actions.closePropertyPanel();
    } else {
      actions.openPropertyPanel();
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current as DragData;
    actions.startDrag(dragData);
  };

  const lastDropTargetRef = useRef<DropTarget | null>(null);

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overData = over.data.current;
      const nextDropTarget: DropTarget = {
        id: over.id as string,
        type: overData?.type === 'container-interior' ? 'container' : 'canvas',
        acceptTypes: Object.values(ComponentType),
        position: overData?.type === 'container-interior' ? 'inside' : 'after',
        data: overData,
      };

      const currentTarget = lastDropTargetRef.current;
      const isSameTarget =
        currentTarget &&
        currentTarget.id === nextDropTarget.id &&
        currentTarget.position === nextDropTarget.position &&
        currentTarget.type === nextDropTarget.type;

      if (!isSameTarget) {
        lastDropTargetRef.current = nextDropTarget;
        actions.setDropTarget(nextDropTarget);
      }
    } else if (lastDropTargetRef.current) {
      lastDropTargetRef.current = null;
      actions.setDropTarget(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    actions.endDrag();
    lastDropTargetRef.current = null;
    if (!over) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current;
    const overId = over.id as string;

    if (activeData.type === 'component' && activeData.componentType) {
      const { parentId, index } = resolveInsertLocation(
        formSchema.components,
        overId,
        overData
      );
      actions.addComponent(activeData.componentType, parentId, index);
      return;
    }

    if (activeData.type === 'reorder') {
      const dropMode = overData?.type === 'container-interior' ? 'inside' : 'after';
      const targetId =
        dropMode === 'inside' ? overData?.parentId || overId : (overId as string);
      actions.moveComponent(active.id as string, targetId, dropMode);
    }
  };

  const saveForm = async () => {
    try {
      const document = createFormDocument(formSchema);
      const errors = validateFormDocument(document);
      if (errors.length) {
        alert(`Validation failed:\n${errors.join('\n')}`);
        return;
      }
      await storageManager.save(formSchema.id, formSchema);
      console.log('Form DSL document:', JSON.stringify(document, null, 2));
      alert('Form saved locally (localStorage).');
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save form. Check console for details.');
    }
  };

  const customCollisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    const interiorCollision = pointerCollisions.find((collision: any) =>
      collision.id.toString().endsWith('-interior')
    );

    if (interiorCollision) {
      return [interiorCollision];
    }

    return rectIntersection(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <DragContext.Provider
        value={{
          activeDragData: dragState.draggedItem,
          dropTarget: dragState.dropTarget,
        }}
      >
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                FC
              </div>
              <h1 className="text-lg font-bold text-slate-800">
                FormCraft <span className="text-slate-400 font-normal">Pro</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleProperties}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  propertyPanelOpen ? 'text-slate-600 hover:bg-slate-100' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                {propertyPanelOpen ? 'Hide Properties' : 'Show Properties'}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showPreview ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={() => setShowJson(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Code className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={saveForm}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar */}
            {!showPreview && (
              <div className="h-full z-10 shadow-lg shadow-slate-200/50">
                <Sidebar />
              </div>
            )}

            {/* Canvas */}
            <main className="flex-1 h-full relative flex flex-col">
              <Canvas />
            </main>

          {/* Properties Panel */}
          {!showPreview && propertyPanelOpen && (
            <div className="h-full z-10">
              <PropertiesPanel />
            </div>
          )}
        </div>

          <JsonModal open={showJson} json={formJson} onClose={() => setShowJson(false)} />

          {/* Drag Overlay - Visual feedback during drag */}
          <DragOverlay dropAnimation={dropAnimation} modifiers={[cursorModifier]} style={{ cursor: 'grabbing' }}>
            {dragState.draggedItem?.type === 'component' && dragState.draggedItem.componentType ? (
              <div className="w-[180px] bg-white p-3 rounded-lg shadow-xl border-2 border-blue-500 opacity-90">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 text-sm">
                    {dragState.draggedItem.componentType}
                  </span>
                </div>
              </div>
            ) : null}
            {dragState.draggedItem?.type === 'reorder' ? (
              <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-blue-500 opacity-90 w-[200px]">
                <span className="text-sm text-slate-700">Moving...</span>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DragContext.Provider>
    </DndContext>
  );
}

export default App;
