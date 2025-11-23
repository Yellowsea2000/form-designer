import React, { useEffect, useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDesignerStore } from '../store';
import { FormNode, ComponentType } from '../types';
import { FormElementRenderer } from './FormElements';
import { Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useDragContext } from '../App';

// Drag Placeholder Component - shows where the component will be placed
const DragPlaceholder: React.FC<{ isInterior?: boolean }> = ({ isInterior }) => (
  <div
    className={clsx(
      "my-3 rounded-lg border-2 border-dashed transition-all animate-pulse",
      isInterior
        ? "border-green-400 bg-green-50/50 min-h-[60px]"
        : "border-blue-400 bg-blue-50/50 min-h-[80px]"
    )}
  >
    <div className="flex items-center justify-center h-full min-h-[60px] text-slate-400">
      <Plus className={clsx("w-5 h-5 mr-2", isInterior ? "text-green-400" : "text-blue-400")} />
      <span className="text-sm font-medium">放置到这里</span>
    </div>
  </div>
);

interface SortableNodeProps {
  node: FormNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const SortableNode: React.FC<SortableNodeProps> = ({ node, isSelected, onClick }) => {
  const { activeDragData, overId, overData } = useDragContext();
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
          type: 'canvas-item', 
          id: node.id,
          nodeType: node.type,
          // Pass children info to help drag handling determine if this is a container
          isContainer: node.type === ComponentType.CONTAINER || 
                       node.type === ComponentType.FORM || 
                       node.type === ComponentType.TABS ||
                       node.type === ComponentType.TAB_ITEM
      } 
  });

  // Add a separate droppable for container interior
  const { setNodeRef: setDroppableRef, isOver: isOverInterior } = useDroppable({
    id: `${node.id}-interior`,
    data: {
      type: 'container-interior',
      parentId: node.id,
      nodeType: node.type,
    }
  });

  const { removeNode, selectNode, selectedNodeId } = useDesignerStore();

  // Tabs specific state
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Initialize active tab if needed
  useEffect(() => {
    if (node.type === ComponentType.TABS && node.children.length > 0) {
        // If no active tab or active tab is not in children anymore, set to first
        const childIds = node.children.map(c => c.id);
        if (!activeTabId || !childIds.includes(activeTabId)) {
            setActiveTabId(node.children[0].id);
        }
    }
  }, [node.type, node.children, activeTabId]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  
  const isContainer = node.type === ComponentType.CONTAINER || 
                      node.type === ComponentType.FORM || 
                      node.type === ComponentType.TAB_ITEM;
  
  const isTabs = node.type === ComponentType.TABS;

  // For Tabs, we only want to render the ACTIVE child in the SortableContext
  const visibleChildren = useMemo(() => {
      if (isTabs) {
          return node.children.filter(c => c.id === activeTabId);
      }
      return node.children;
  }, [isTabs, node.children, activeTabId]);

  // Calculate Grid Style
  const columns = node.props.columns || 1;
  const gap = node.props.gap || 16;
  
  // Only apply grid to containers (Container, Form, TabItem). Tabs component wrapper doesn't need grid usually.
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

  // Switch strategy based on layout
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
        "group relative my-3 rounded-lg border-2 transition-all bg-white hover:shadow-md cursor-grab active:cursor-grabbing",
        isSelected ? "border-blue-500 ring-1 ring-blue-500 z-10" : "border-transparent hover:border-blue-200",
        isOver && !isOverInterior ? "ring-2 ring-blue-400" : ""
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      {...attributes}
      {...listeners}
      // Critical: Stop propagation to prevent dragging parent when interacting with child
      onMouseDown={(e) => {
          e.stopPropagation();
          listeners?.onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
          e.stopPropagation();
          listeners?.onTouchStart?.(e);
      }}
    >
      {/* Content */}
      <div className="p-4 relative">
        {/* For non-containers, overlay prevents interaction. For containers, we need to interact with children */}
        {!isContainer && !isTabs && <div className="absolute inset-0 z-[5]" />} 
        
        <FormElementRenderer 
            type={node.type} 
            props={node.props} 
            node={node}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
        >
            {(isContainer || isTabs) && (
                <SortableContext items={visibleChildren.map(c => c.id)} strategy={sortingStrategy}>
                    <div
                        className={clsx(
                          "w-full transition-colors rounded relative",
                          !isTabs && "min-h-[50px]"
                        )}
                        style={containerStyle}
                    >
                        {/* Interior droppable zone - show placeholder when dragging */}
                        {visibleChildren.length === 0 ? (
                          <div
                            ref={setDroppableRef}
                            className={clsx(
                              "absolute inset-2 rounded-lg transition-all min-h-[80px]",
                              isOverInterior
                                ? "ring-2 ring-inset ring-green-400 bg-green-50/50 border-2 border-dashed border-green-400"
                                : activeDragData
                                  ? "border-2 border-dashed border-green-300 bg-green-50/20"
                                  : ""
                            )}
                          />
                        ) : (
                          /* When has children, show a full-area drop zone for easier dropping */
                          <div
                            ref={setDroppableRef}
                            className={clsx(
                              "absolute inset-0 rounded-lg transition-all pointer-events-auto z-0",
                              isOverInterior && "ring-2 ring-inset ring-green-400 bg-green-50/30"
                            )}
                          />
                        )}
                        {visibleChildren.map((child) => (
                             <SortableNode
                                key={child.id}
                                node={child}
                                isSelected={selectedNodeId === child.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectNode(child.id);
                                }}
                             />
                        ))}
                        {/* Show placeholder at the end when hovering interior - AFTER all children */}
                        {visibleChildren.length > 0 && activeDragData?.type === 'sidebar-item' && isOverInterior && (
                          <div className="col-span-full">
                            <DragPlaceholder isInterior />
                          </div>
                        )}
                    </div>
                </SortableContext>
            )}
        </FormElementRenderer>
      </div>

      {/* Actions */}
      {isSelected && (
        <div
            className="absolute -right-3 -top-3 bg-white rounded-full shadow border border-slate-200 z-20 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking delete
            onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Show drag placeholder after this node when dragging from sidebar */}
      {activeDragData?.type === 'sidebar-item' && overId === node.id && !overData?.type?.includes('interior') && (
        <DragPlaceholder />
      )}
    </div>
  );
};

export const Canvas: React.FC = () => {
  const { nodes, selectedNodeId, selectNode } = useDesignerStore();
  const { activeDragData, overId } = useDragContext();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
        type: 'canvas'
    }
  });

  // Show placeholder when dragging to empty canvas or at the end
  const showCanvasPlaceholder = activeDragData?.type === 'sidebar-item' && overId === 'canvas-droppable';

  return (
    <div
      className="flex-1 h-full bg-canvas overflow-y-auto p-8"
      onClick={() => selectNode(null)}
    >
      <div className="max-w-[800px] mx-auto">
        <div
          ref={setNodeRef}
          className={clsx(
            "min-h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border transition-colors p-8 pb-32",
            isOver ? "border-blue-400 bg-blue-50/30" : "border-slate-200"
          )}
        >
          {nodes.length === 0 && !isOver && !showCanvasPlaceholder && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              <Plus className="w-8 h-8 mb-2" />
              <p className="text-lg font-medium">Canvas is empty</p>
              <p className="text-sm">Drag components from the left sidebar</p>
            </div>
          )}

          {/* Show placeholder at the start of canvas when empty and dragging */}
          {nodes.length === 0 && showCanvasPlaceholder && (
            <DragPlaceholder />
          )}

          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map((node) => (
              <SortableNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={(e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                }}
              />
            ))}
          </SortableContext>

          {/* Show placeholder at the end of canvas when has nodes and dragging */}
          {nodes.length > 0 && showCanvasPlaceholder && (
            <DragPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
};