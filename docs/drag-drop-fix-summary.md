# 拖拽问题修复总结

## 背景问题

- 左侧组件拖到容器时，必须精准命中容器内部投放区，导致“很难拖进容器”。
- 拖拽过程中落点频繁在多个 droppable 间切换，出现抖动与跳变。

## 解决思路

### 1) 提升左侧拖入容器成功率

- 在拖拽结束逻辑中增加兜底规则：
  - 命中 `container-interior` 时，按原逻辑插入容器内部。
  - 命中容器本体（`isContainer`）且目标是可承载容器（`container` / `tab_item`）时，也按“容器内部追加”处理。
- 将空容器内部 droppable 区域扩大为整块覆盖（`inset-0`），降低命中难度。

### 2) 降低拖拽抖动

- 侧栏拖拽时，碰撞检测优先使用 `pointerWithin` 结果，避免 `rectIntersection` 带来的来回抖动。
- 侧栏拖拽过程中暂停画布节点 hover 状态更新，减少高频重渲染。
- 去掉会触发布局变化的容器内部占位插入（flow 内新增节点），避免视觉跳动。
- 将鼠标拖拽启动阈值从 `10` 调整为 `4`，提升拖拽启动稳定性和响应性。

## 关键代码片段

### 片段 A：拖拽启动阈值（更易拉起）

文件：`index.tsx`

```tsx
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: {
      distance: 4 // Lower threshold makes drag from sidebar feel more responsive
    }
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5
    }
  })
);
```

### 片段 B：容器本体命中兜底内部插入

文件：`index.tsx`

```tsx
const isInteriorCapableContainer =
  overData?.nodeType === ComponentType.CONTAINER ||
  overData?.nodeType === ComponentType.TAB_ITEM;

if (overData?.type === "container-interior") {
  parentId = overData.parentId as string;
  // Append to end of container
} else if (overData?.isContainer && isInteriorCapableContainer) {
  // Fallback: dropping on container body should still append into it.
  parentId = over.id as string;
}
```

### 片段 C：侧栏拖拽优先指针碰撞（抑制抖动）

文件：`index.tsx`

```tsx
const customCollisionDetection = (args: any) => {
  const activeType = args.active?.data?.current?.type;

  const pointerCollisions = pointerWithin(args);
  const interiorCollision = pointerCollisions.find((collision: any) =>
    collision.id.toString().endsWith("-interior")
  );

  if (interiorCollision) {
    return [interiorCollision];
  }

  // For sidebar drags, prefer pointer collisions directly to avoid jitter
  if (activeType === "sidebar-item" && pointerCollisions.length > 0) {
    return [pointerCollisions[0]];
  }

  return rectIntersection(args);
};
```

### 片段 D：容器内部命中区扩大 + 拖拽期减少重渲染

文件：`components/Canvas.tsx`

```tsx
onMouseMove={(e) => {
  if (isPreview || activeDragData?.type === "sidebar-item") {
    return;
  }
  e.stopPropagation();
  setHoveredNodeId(node.id);
}}
onMouseLeave={(e) => {
  if (isPreview || activeDragData?.type === "sidebar-item") {
    return;
  }
  e.stopPropagation();
  setHoveredNodeId((current) => (current === node.id ? null : current));
}}

{!isPreview &&
  (visibleChildren.length === 0 ? (
    <div
      ref={setDroppableRef}
      className={cn(
        "absolute inset-0 rounded-lg transition-all min-h-[80px]",
        isOverInterior
          ? "ring-2 ring-inset ring-green-400 bg-green-50/50 border-2 border-dashed border-green-400"
          : activeDragData
            ? "border-2 border-dashed border-green-300 bg-green-50/20"
            : ""
      )}
    />
  ) : (
    <div
      ref={setDroppableRef}
      className={cn(
        "absolute inset-0 rounded-lg transition-all pointer-events-auto z-0",
        isOverInterior && "ring-2 ring-inset ring-green-400 bg-green-50/30"
      )}
    />
  ))}
```

## 最终效果

- 左侧组件可以更稳定地拖入容器。
- 拖拽时落点切换明显减少，画面更平滑，抖动显著改善。
