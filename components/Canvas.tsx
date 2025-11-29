import React, { useEffect, useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { Trash2, Plus } from 'lucide-react';
import { useDesignerStore } from '../store';
import { ComponentNode, ComponentType } from '../types';
import { useDragContext } from '../App';
import { FormElementRenderer } from './FormElements';

const DragPlaceholder: React.FC<{ isInterior?: boolean }> = ({ isInterior }) => (
  <div
    className={clsx(
      'my-3 rounded-lg border-2 border-dashed transition-all animate-pulse',
      isInterior
        ? 'border-green-400 bg-green-50/50 min-h-[60px]'
        : 'border-blue-400 bg-blue-50/50 min-h-[80px]'
    )}
  >
    <div className="flex items-center justify-center h-full min-h-[60px] text-slate-400">
      <Plus className={clsx('w-5 h-5 mr-2', isInterior ? 'text-green-400' : 'text-blue-400')} />
      <span className="text-sm font-medium">Drop here</span>
    </div>
  </div>
);

interface SortableNodeProps {
  node: ComponentNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const SortableNode: React.FC<SortableNodeProps> = ({ node, isSelected, onClick }) => {
  const { activeDragData, dropTarget } = useDragContext();
  const overId = dropTarget?.id ?? null;
  const overData = dropTarget?.data;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: node.id,
    data: {
      type: 'reorder',
      componentId: node.id,
      nodeType: node.type,
      isContainer:
        node.type === ComponentType.CONTAINER ||
        node.type === ComponentType.FORM ||
        node.type === ComponentType.TABS ||
        node.type === ComponentType.TAB_ITEM,
    },
  });

  const { setNodeRef: setDroppableRef, isOver: isOverInterior } = useDroppable({
    id: `${node.id}-interior`,
    data: {
      type: 'container-interior',
      parentId: node.id,
      nodeType: node.type,
    },
  });

  const actions = useDesignerStore((state) => state.actions);
  const selectedComponentId = useDesignerStore((state) => state.selectedComponentId);

  const { removeComponent, selectComponent } = actions;
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (node.type === ComponentType.TABS && node.children.length > 0) {
      const childIds = node.children.map((c) => c.id);
      if (!activeTabId || !childIds.includes(activeTabId)) {
        setActiveTabId(node.children[0].id);
      }
    }
  }, [node.type, node.children, activeTabId]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isContainer =
    node.type === ComponentType.CONTAINER ||
    node.type === ComponentType.FORM ||
    node.type === ComponentType.TAB_ITEM;

  const isTabs = node.type === ComponentType.TABS;

  const visibleChildren = useMemo(() => {
    if (isTabs) {
      return node.children.filter((c) => c.id === activeTabId);
    }
    return node.children;
  }, [isTabs, node.children, activeTabId]);

  const columns = node.props.columns || 1;
  const gap = node.props.gap || 16;
  const showGrid = isContainer && columns > 1;

  const containerStyle = useMemo(() => {
    if (showGrid) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      } as React.CSSProperties;
    }
    return undefined;
  }, [showGrid, columns, gap]);

  const sortingStrategy = showGrid ? rectSortingStrategy : verticalListSortingStrategy;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 bg-slate-100 border-2 border-blue-500 rounded-lg h-[80px] w-full my-2"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative my-3 rounded-lg border-2 transition-all bg-white hover:shadow-md cursor-grab active:cursor-grabbing',
        isSelected ? 'border-blue-500 ring-1 ring-blue-500 z-10' : 'border-transparent hover:border-blue-200',
        isOver && !isOverInterior ? 'ring-2 ring-blue-400' : ''
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      {...attributes}
      {...listeners}
      onMouseDown={(e) => {
        e.stopPropagation();
        listeners?.onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        listeners?.onTouchStart?.(e);
      }}
    >
      <div className="p-4 relative">
        {!isContainer && !isTabs && <div className="absolute inset-0 z-[5]" />}

        <FormElementRenderer
          type={node.type}
          props={node.props}
          node={node}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
        >
          {(isContainer || isTabs) && (
            <SortableContext items={visibleChildren.map((c) => c.id)} strategy={sortingStrategy}>
              <div
                className={clsx('w-full transition-colors rounded relative', !isTabs && 'min-h-[50px]')}
                style={containerStyle}
              >
                {visibleChildren.length === 0 ? (
                  <div
                    ref={setDroppableRef}
                    className={clsx(
                      'absolute inset-2 rounded-lg transition-all min-h-[80px]',
                      isOverInterior
                        ? 'ring-2 ring-inset ring-green-400 bg-green-50/50 border-2 border-dashed border-green-400'
                        : activeDragData
                          ? 'border-2 border-dashed border-green-300 bg-green-50/20'
                          : ''
                    )}
                  />
                ) : (
                  <div
                    ref={setDroppableRef}
                    className={clsx(
                      'absolute inset-0 rounded-lg transition-all pointer-events-auto z-0',
                      isOverInterior && 'ring-2 ring-inset ring-green-400 bg-green-50/30'
                    )}
                  />
                )}
                {visibleChildren.map((child) => (
                  <SortableNode
                    key={child.id}
                    node={child}
                    isSelected={selectedComponentId === child.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectComponent(child.id);
                    }}
                  />
                ))}
                {visibleChildren.length > 0 &&
                  activeDragData?.type === 'component' &&
                  isOverInterior && (
                    <div className="col-span-full">
                      <DragPlaceholder isInterior />
                    </div>
                  )}
              </div>
            </SortableContext>
          )}
        </FormElementRenderer>
      </div>

      {isSelected && (
        <div
          className="absolute -right-3 -top-3 bg-white rounded-full shadow border border-slate-200 z-20 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeComponent(node.id);
            }}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeDragData?.type === 'component' &&
        overId === node.id &&
        !(overData as any)?.type?.includes('interior') && <DragPlaceholder />}
    </div>
  );
};

export const Canvas: React.FC = () => {
  const formSchema = useDesignerStore((state) => state.formSchema);
  const selectedComponentId = useDesignerStore((state) => state.selectedComponentId);
  const actions = useDesignerStore((state) => state.actions);
  const { activeDragData, dropTarget } = useDragContext();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
      type: 'canvas',
    },
  });

  const nodes = formSchema.components;
  const showCanvasPlaceholder = activeDragData?.type === 'component' && dropTarget?.id === 'canvas-droppable';

  return (
    <div className="flex-1 h-full bg-canvas overflow-y-auto p-4" onClick={() => actions.selectComponent(null)}>
      <div className="w-full max-w-[1200px] mx-auto px-2">
        <div
          ref={setNodeRef}
          className={clsx(
            'min-h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border transition-colors p-8 pb-32',
            isOver ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200'
          )}
        >
          {nodes.length === 0 && !isOver && !showCanvasPlaceholder && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <Plus className="w-8 h-8 mb-2" />
              <p className="text-lg font-medium">Canvas is empty</p>
              <p className="text-sm">Drag components from the left sidebar</p>
            </div>
          )}

          {nodes.length === 0 && showCanvasPlaceholder && <DragPlaceholder />}

          <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map((node) => (
              <SortableNode
                key={node.id}
                node={node}
                isSelected={selectedComponentId === node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  actions.selectComponent(node.id);
                }}
              />
            ))}
          </SortableContext>

          {nodes.length > 0 && showCanvasPlaceholder && <DragPlaceholder />}
        </div>
      </div>
    </div>
  );
};
