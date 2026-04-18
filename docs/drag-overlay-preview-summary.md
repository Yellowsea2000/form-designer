# 画布拖拽交互改造总结

## 背景问题

在这次迭代中，拖拽相关体验主要有 4 类痛点：

1. 画布组件拖拽时，跟手的是“移动中...”提示盒子，而不是组件本体。
2. 组件任意位置都可拖拽，容易误拖（尤其在点选/编辑时）。
3. 起拖不够灵敏，通常需要较大偏移才进入拖拽状态。
4. 组件操作按钮与锚点位置在视觉上需要更贴近组件边缘布局。

## 改造目标

1. 拖拽浮层显示真实组件预览。
2. 限制为“仅通过左上角锚点拖拽”。
3. 提升起拖灵敏度，减少“拖不动/偏移大”的感知。
4. 操作按钮完全位于组件上方区域，保持视觉一致性。

## 变更范围

1. `index.tsx`
2. `components/Canvas.tsx`
3. `docs/drag-overlay-preview-summary.md`（本文档）

## 主要实现方案

### 1) DragOverlay 改为真实组件预览

在 `index.tsx` 中增加节点解析与递归渲染：

1. 新增 `findNodeById`：递归在节点树中定位当前被拖拽节点。
2. 新增 `DragNodePreview`：复用 `FormElementRenderer` 渲染真实结构。
3. 新增 `activeCanvasNode`：根据 `activeDragData.id` 获取当前活动节点。
4. 替换 `canvas-item` 分支的 Overlay 内容，渲染 `<DragNodePreview />`。

核心收益：拖拽对象可视化一致，复杂组件（容器、页签）移动时更容易判断。

### 2) 限制拖拽入口为左上角锚点

在 `components/Canvas.tsx` 中对 `SortableNode` 做了入口收敛：

1. 继续使用 `useSortable`，但只把 `attributes/listeners` 绑定到锚点按钮。
2. 根节点不再绑定整块拖拽监听，避免任意区域误拖。
3. 使用 `setActivatorNodeRef` 指定锚点按钮为拖拽激活器。

锚点设计与显示规则：

1. 位置固定为左上角外侧：`absolute -top-3 -left-1`。
2. 样式复用底部操作按钮风格（蓝底白字、同类圆角与阴影）。
3. 文案显示当前组件类型：`componentTypeLabel = node.type.replace(/_/g, " ")`。
4. 显示条件：`hoveredNodeId === node.id || isSelected`（hover 或选中都显示）。

### 3) 拖拽灵敏度与跟手修正

在 `index.tsx` 中优化传感器和浮层偏移：

1. `MouseSensor.activationConstraint.distance` 从 4 调整到 2。
2. `cursorModifier` 按拖拽类型分支：
   - `canvas-item`：不做额外偏移，Overlay 与光标更对齐。
   - `sidebar-item`：保留原先小偏移，避免遮挡鼠标。

同时在 `components/Canvas.tsx` 中减少 hover 状态抖动：

1. 用 `onMouseEnter` 设置 hover，代替高频 `onMouseMove`。
2. 拖拽进行中（`activeDragData` 存在）暂停 hover 变更，减少重渲染干扰。

### 4) 操作按钮位置调整到组件上方

底部操作条（Duplicate/Delete）改为组件内部偏上定位：

1. 从 `-bottom-3` 调整为 `bottom-4`。
2. 保持 `left-2` 与现有视觉网格一致。
3. 按钮继续阻断冒泡，避免点击操作按钮触发拖拽/选中冲突。

## 关键代码片段

### 片段 A：锚点激活拖拽（Canvas）

文件：`components/Canvas.tsx`

```tsx
const {
  attributes,
  listeners,
  setActivatorNodeRef,
  setNodeRef,
  transform,
  transition
} = useSortable({
  id: node.id,
  data: { type: "canvas-item", id: node.id, nodeType: node.type }
});

<button ref={setActivatorNodeRef} {...attributes} {...listeners}>
  <span>{componentTypeLabel}</span>
</button>;
```

### 片段 B：锚点定位与显示条件（Canvas）

文件：`components/Canvas.tsx`

```tsx
const showNodeTools = hoveredNodeId === node.id || isSelected;

<div
  className={cn(
    "absolute -top-3 -left-1 z-20 transition-opacity",
    showNodeTools
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
  )}
>
  ...
</div>;
```

### 片段 C：拖拽预览真实渲染（Index）

文件：`index.tsx`

```tsx
const activeCanvasNode = useMemo(() => {
  if (activeDragData?.type !== "canvas-item" || !activeDragData.id) {
    return null;
  }
  return findNodeById(nodes, activeDragData.id);
}, [activeDragData, nodes]);

{
  activeDragData?.type === "canvas-item" && activeCanvasNode ? (
    <div className="pointer-events-none w-[min(560px,80vw)] rounded-xl border-2 border-blue-500 bg-white p-4 shadow-2xl opacity-95">
      <DragNodePreview node={activeCanvasNode} />
    </div>
  ) : null;
}
```

### 片段 D：起拖灵敏度与偏移控制（Index）

文件：`index.tsx`

```tsx
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: { distance: 2 }
  })
);

const cursorModifier: Modifier = ({ transform, active }) => {
  const dragType = active?.data?.current?.type;
  if (dragType === "canvas-item") {
    return transform;
  }
  return { ...transform, x: transform.x - 10, y: transform.y + 10 };
};
```

## 关键踩坑与修复

1. 锚点按钮若自行覆盖 `onMouseDown/onTouchStart`，会抢占 dnd-kit 注入的监听器，导致“完全无法拖拽”。
2. 最终方案是让锚点按钮直接使用 `...listeners`，不要再覆盖同名起始事件。
3. hover 状态更新改用 `onMouseEnter`，可明显降低高频渲染带来的起拖不稳定感。

## 验证记录

1. `npx eslint components/Canvas.tsx` 通过。
2. `npx eslint index.tsx` 通过。
3. `npm run build` 通过（存在既有 bundle 体积告警，与本次改造无直接关联）。

## 最终效果

1. 画布拖拽显示真实组件整体预览。
2. 拖拽入口统一为左上角锚点，误拖显著减少。
3. 起拖更灵敏，拖拽跟手更自然。
4. 底部操作条完全位于组件上方区域，视觉更规整。

## 后续可选优化

1. 为锚点增加图标与短标签（例如拖拽手柄图标），提高可发现性。
2. 为超大组件预览增加最大高度与裁剪滚动，减少遮挡。
3. 给拖拽锚点增加 keyboard 可访问方案（可选）。
