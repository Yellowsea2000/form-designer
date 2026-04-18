import "antd/dist/reset.css";
import "./index.css";

import { CopyOutlined } from "@ant-design/icons";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  Modifier,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { Button, Input, message, Modal, Space } from "antd";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useState } from "react";

import { Canvas } from "./components/Canvas";
import { FormElementRenderer } from "./components/FormElements";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Sidebar } from "./components/Sidebar";
import { DragContext } from "./dragContext";
import { createFormDocument, validateFormDocument } from "./dsl/form";
import { FormDSLDocument } from "./dsl/types";
import { useDesignerStore } from "./store";
import { ComponentType, DragData, FormNode } from "./types";

// Context for sharing drag state with Canvas

// Drop animation config for smoother UX
// Disable duration to remove rebound effect
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5"
      }
    }
  }),
  duration: 0
};

// Keep canvas-item overlay aligned with cursor; sidebar item keeps small offset.
const cursorModifier: Modifier = ({ transform, active }) => {
  const dragType = active?.data?.current?.type;

  if (dragType === "canvas-item") {
    return transform;
  }

  return {
    ...transform,
    x: transform.x - 10, // Small offset from cursor
    y: transform.y + 10 // Slightly below cursor
  };
};

const FORM_STORAGE_KEY = "formcraft-pro-document";

const findNodeById = (nodes: FormNode[], nodeId: string): FormNode | null => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const childMatch = findNodeById(node.children, nodeId);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
};

const DragNodePreview: React.FC<{ node: FormNode }> = ({ node }) => {
  const isContainerLike =
    node.type === ComponentType.CONTAINER ||
    node.type === ComponentType.TAB_ITEM;
  const isTabs = node.type === ComponentType.TABS;

  const childIds = node.children.map((child) => child.id);
  const preferredDefaultTabId = node.props.defaultTabId;
  const activeTabId =
    preferredDefaultTabId && childIds.includes(preferredDefaultTabId)
      ? preferredDefaultTabId
      : (childIds[0] ?? null);

  const visibleChildren = isTabs
    ? node.children.filter((child) => child.id === activeTabId)
    : node.children;

  const columns = node.props.columns || 1;
  const gap = node.type === ComponentType.CONTAINER ? 0 : node.props.gap || 16;
  const showGrid = isContainerLike && columns > 1;

  const contentStyle = showGrid
    ? ({
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`
      } as React.CSSProperties)
    : undefined;

  return (
    <FormElementRenderer
      type={node.type}
      props={node.props}
      node={node}
      activeTabId={activeTabId}
      onTabChange={() => undefined}
    >
      {(isContainerLike || isTabs) && (
        <div
          className={
            isTabs
              ? "w-full"
              : showGrid
                ? "w-full min-h-[50px]"
                : "w-full min-h-[50px] space-y-3"
          }
          style={contentStyle}
        >
          {visibleChildren.map((child) => (
            <DragNodePreview key={child.id} node={child} />
          ))}
        </div>
      )}
    </FormElementRenderer>
  );
};

export const FormCraftPage: React.FC = observer(() => {
  const { addNode, loadFormNodes, moveNode, nodes, selectedNodeId } =
    useDesignerStore();
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overData, setOverData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 2 // Smaller threshold makes drag start feel snappier
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragData(active.data.current as DragData);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Track current drop target for showing placeholder in canvas
    const { over } = event;
    if (over) {
      setOverId(over.id as string);
      setOverData(over.data.current);
    } else {
      setOverId(null);
      setOverData(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setActiveDragData(null);
    setOverId(null);
    setOverData(null);

    if (!over) return;

    const activeData = active.data.current as DragData;
    const overData = over.data.current;

    // Scenario 1: Dropping Sidebar Item
    if (activeData?.type === "sidebar-item" && activeData.componentType) {
      let parentId: string | null = null;
      let index: number | undefined = undefined;

      const isInteriorCapableContainer =
        overData?.nodeType === ComponentType.CONTAINER ||
        overData?.nodeType === ComponentType.TAB_ITEM;

      // Check if dropping into container interior (explicit nesting)
      if (overData?.type === "container-interior") {
        parentId = overData.parentId as string;
        // Append to end of container
      } else if (overData?.isContainer && isInteriorCapableContainer) {
        // Fallback: dropping on container body should still append into it.
        parentId = over.id as string;
      } else if (overData?.isContainer) {
        // Dropping on container border/edge - place as sibling
        const findParentAndIndex = (
          nodes: FormNode[],
          childId: string
        ): { parentId: string | null; index: number } | null => {
          for (const node of nodes) {
            const idx = node.children.findIndex((c) => c.id === childId);
            if (idx !== -1) return { parentId: node.id, index: idx };

            const res = findParentAndIndex(node.children, childId);
            if (res) return res;
          }
          return null;
        };

        // Check root level first
        const rootIdx = nodes.findIndex((n) => n.id === over.id);
        if (rootIdx !== -1) {
          parentId = null;
          index = rootIdx + 1;
        } else {
          // Check nested
          const res = findParentAndIndex(nodes, over.id as string);
          if (res) {
            parentId = res.parentId;
            index = res.index + 1;
          }
        }
      } else if (over.id === "canvas-droppable") {
        parentId = null; // Root
        index = nodes.length;
      } else {
        // Dropping over a regular item - insert next to it
        const findParentAndIndex = (
          nodes: FormNode[],
          childId: string
        ): { parentId: string | null; index: number } | null => {
          for (const node of nodes) {
            const idx = node.children.findIndex((c) => c.id === childId);
            if (idx !== -1) return { parentId: node.id, index: idx };

            const res = findParentAndIndex(node.children, childId);
            if (res) return res;
          }
          return null;
        };

        // Check root level first
        const rootIdx = nodes.findIndex((n) => n.id === over.id);
        if (rootIdx !== -1) {
          parentId = null;
          index = rootIdx + 1;
        } else {
          // Check nested
          const res = findParentAndIndex(nodes, over.id as string);
          if (res) {
            parentId = res.parentId;
            index = res.index + 1;
          }
        }
      }

      addNode(activeData.componentType, parentId, index, false);
      return;
    }

    // Scenario 2: Reordering / Moving Canvas Items
    if (activeData?.type === "canvas-item") {
      if (
        active.id !== over.id &&
        !over.id.toString().startsWith(active.id.toString())
      ) {
        const dragData = activeData as DragData;
        moveNode(
          active.id as string,
          over.id as string,
          overData?.type === "container-interior",
          dragData.nodeType
        );
      }
    }
  };

  const saveForm = () => {
    const document = createFormDocument(nodes, { name: "FormCraft Pro DSL" });
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(document));
    console.log("Form DSL document:", JSON.stringify(document, null, 2));
    message.success("Form saved");
  };

  const getFormdetail = (): FormDSLDocument | null => {
    const savedDocument = window.localStorage.getItem(FORM_STORAGE_KEY);

    if (!savedDocument) {
      return null;
    }

    try {
      return JSON.parse(savedDocument) as FormDSLDocument;
    } catch {
      message.error("Saved form data is invalid");
      return null;
    }
  };

  const publishForm = () => {
    const document = createFormDocument(nodes, { name: "FormCraft Pro DSL" });
    console.log("Published form document:", JSON.stringify(document, null, 2));
    message.success("Form published");
  };

  useEffect(() => {
    const document = getFormdetail();

    if (!document) {
      return;
    }

    const errors = validateFormDocument(document);

    if (errors.length > 0) {
      message.error("Saved form data failed validation");
      return;
    }

    loadFormNodes(document.nodes);
  }, [loadFormNodes]);

  const pageJson = useMemo(() => {
    const payload = createFormDocument(nodes, { name: "FormCraft Pro DSL" });
    return JSON.stringify(payload, null, 2);
  }, [nodes]);

  const activeCanvasNode = useMemo(() => {
    if (activeDragData?.type !== "canvas-item" || !activeDragData.id) {
      return null;
    }

    return findNodeById(nodes, activeDragData.id);
  }, [activeDragData, nodes]);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pageJson);
      message.success("JSON copied");
    } catch {
      message.error("Copy failed");
    }
  };

  // Custom collision detection - prioritize interior zones when pointer is well inside
  const customCollisionDetection = (args: any) => {
    const activeType = args.active?.data?.current?.type;

    // First check pointer-based collision for interior zones
    const pointerCollisions = pointerWithin(args);
    const interiorCollision = pointerCollisions.find((collision: any) =>
      collision.id.toString().endsWith("-interior")
    );

    // If pointer is over an interior zone, use it
    if (interiorCollision) {
      return [interiorCollision];
    }

    // For sidebar drags, prefer pointer collisions directly to avoid jitter from rect overlap changes.
    if (activeType === "sidebar-item" && pointerCollisions.length > 0) {
      return [pointerCollisions[0]];
    }

    // Otherwise use rectangle intersection for better edge detection
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
      <DragContext.Provider value={{ activeDragData, overId, overData }}>
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
            <div className="flex items-center gap-3"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                aria-pressed={showPreview}
                className={`inline-flex h-8 items-center justify-center rounded-full px-2 text-[13px] font-medium transition-colors ${
                  showPreview
                    ? "text-[#0958d9]"
                    : "text-[#1677ff] hover:text-[#0958d9]"
                }`}
              >
                Preview
              </button>
              <button
                onClick={saveForm}
                className="inline-flex h-8 items-center justify-center rounded-full border border-[#d9d9d9] bg-white px-4 text-[13px] font-medium text-[#262626] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:border-[#bfbfbf] hover:bg-[#fafafa]"
              >
                Save
              </button>
              <button
                onClick={publishForm}
                className="inline-flex h-8 items-center justify-center rounded-full bg-[#1677ff] px-4 text-[13px] font-medium text-white shadow-[0_6px_16px_rgba(22,119,255,0.22)] transition-colors hover:bg-[#0958d9]"
              >
                Publish
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
              <Canvas isPreview={showPreview} />
            </main>

            {/* Properties Panel */}
            {!showPreview && selectedNodeId && (
              <div className="fixed top-16 right-0 bottom-0 z-40">
                <PropertiesPanel />
              </div>
            )}
          </div>

          {/* Drag Overlay - Visual feedback during drag */}
          <DragOverlay
            dropAnimation={dropAnimation}
            modifiers={[cursorModifier]}
            style={{ cursor: "grabbing" }}
          >
            {activeDragData?.type === "sidebar-item" &&
            activeDragData.componentType ? (
              <div className="flex flex-col items-center opacity-95">
                <div className="w-[60px] h-[60px] p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xl ring-2 ring-blue-500">
                  {activeDragData.componentPreviewSrc ? (
                    <img
                      src={activeDragData.componentPreviewSrc}
                      alt={
                        activeDragData.componentPreviewAlt ??
                        activeDragData.componentLabel ??
                        activeDragData.componentType
                      }
                      className="w-[36px] h-[36px]"
                      draggable={false}
                    />
                  ) : (
                    <span className="font-medium text-slate-700 text-xs text-center px-1">
                      {activeDragData.componentLabel ??
                        activeDragData.componentType}
                    </span>
                  )}
                </div>
                <span className="mt-2 text-xs font-medium text-slate-700 text-center">
                  {activeDragData.componentLabel ??
                    activeDragData.componentType}
                </span>
              </div>
            ) : null}
            {activeDragData?.type === "canvas-item" && activeCanvasNode ? (
              <div className="pointer-events-none w-[min(560px,80vw)] rounded-xl border-2 border-blue-500 bg-white p-4 shadow-2xl opacity-95">
                <DragNodePreview node={activeCanvasNode} />
              </div>
            ) : null}
          </DragOverlay>

          <Modal
            open={showJsonModal}
            title="Page JSON Structure"
            width={760}
            onCancel={() => setShowJsonModal(false)}
            footer={[
              <Button
                key="copy"
                icon={<CopyOutlined style={{ fontSize: 16 }} />}
                onClick={copyJsonToClipboard}
              >
                Copy JSON
              </Button>,
              <Button
                key="close"
                type="primary"
                onClick={() => setShowJsonModal(false)}
              >
                Close
              </Button>
            ]}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Input.TextArea
                readOnly
                value={pageJson}
                autoSize={{ minRows: 14, maxRows: 20 }}
                styles={{
                  textarea: {
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 12
                  }
                }}
              />
            </Space>
          </Modal>
        </div>
      </DragContext.Provider>
    </DndContext>
  );
});

export default FormCraftPage;
