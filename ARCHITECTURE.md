# FormCraft Pro 技术架构

本文概述项目的核心技术栈、分层、关键数据结构、交互流程以及扩展点，帮助快速理解与演进拖拽式表单/页面搭建器。

## 1. 技术栈与运行时
- **框架**：React + TypeScript，入口 `index.tsx`，Vite 构建。
- **状态管理**：Zustand (`store.ts`) 维护组件树与选中状态。
- **拖拽**：`@dnd-kit` 提供传感器、可排序列表、碰撞检测与拖拽浮层。
- **样式**：TailwindCSS（`tailwind.config.cjs` + `index.css`），少量类名合并使用 `clsx`/`tailwind-merge`。
- **图标**：`lucide-react`。
- **DSL**：`dsl/` 定义组件 DSL 与表单文档规范，可导出/校验当前画布。

## 2. 模块分层
- **应用壳与拖拽上下文**（`App.tsx`）
  - 初始化 `DndContext`、鼠标/触摸传感器、自定义碰撞检测与拖拽浮层。
  - 顶栏提供 Preview/Save；Preview 仅隐藏侧栏与属性面板。
  - 通过 `DragContext` 将当前拖拽数据、悬停节点传递给 Canvas。
- **状态层**（`store.ts`）
  - `nodes: FormNode[]` 表示组件树；`selectedNodeId` 表示当前选中节点。
  - `addNode/removeNode/updateNode/selectNode/moveNode` 负责增删改查与拖拽重排；`DEFAULT_PROPS` 由 DSL 提供。
  - 移动逻辑支持：根级/容器内部投放、同级插入、Tabs/TabItem 互斥选择等。
- **组件层**
  - **Sidebar**（`components/Sidebar.tsx`）：读取 `dsl/components/index.ts` 的 `componentDSLs`，生成可拖拽的组件目录。
  - **Canvas**（`components/Canvas.tsx`）：`SortableContext` + `useDroppable/useSortable` 渲染组件树，支持占位提示、容器内部/同级投放、网格布局（基于节点 `columns/gap`），Tabs 仅渲染当前活动 Tab。
  - **元素渲染器**（`components/FormElements.tsx` + `components/elements/*`）：按 `ComponentType` 映射到具体呈现组件（Input/Button/Tabs/...），内部只消费节点 `props`，保持与拖拽逻辑解耦。
  - **属性面板**（`components/PropertiesPanel.tsx`）：通过选中节点回填表单，调用 `updateNode/addNode/removeNode` 实时修改 DSL 属性；Tabs 特殊处理 TabItem 管理。
- **DSL 层**（`dsl/`）
  - 组件 DSL：`dsl/components/*.ts` 描述显示名、版本、默认属性、可配置属性与子节点约束，聚合于 `dsl/components/index.ts` 并产出 `DEFAULT_PROPS`。
  - 表单 DSL：`dsl/form.ts` 定义 `FormDSLDocument` 版本、`createFormDocument` 导出当前画布、`validateFormDocument` 按组件约束校验子树。
  - 类型：`dsl/types.ts` 描述 DSL 形状与属性原语。
- **静态资源与样式**
  - `index.html` 容器，`index.css` 追加滚动条/全局样式，`tailwind.config.cjs` 声明扫描路径与主题色（含自定义 `canvas` 背景）。

## 3. 核心数据模型
- `FormNode`：`{ id, type, props, children[] }`，与 DSL `ComponentType` 一一对应。
- `ComponentProps`：通用属性（label/content/options/style/...），各组件 DSL 指定默认值与可编辑字段。
- `ComponentDSLDefinition`：描述组件元数据、默认属性、可配置项与子节点约束，是渲染、属性面板与验证的共同基准。

## 4. 主交互与数据流
1. **拖拽新增**：Sidebar 拖出时携带 `DragData(type=sidebar-item, componentType)`；Canvas 在 `onDragEnd` 检测落点（根/容器内部/同级），调用 `addNode`（应用 DSL 默认属性）。
2. **拖拽重排/嵌套**：Canvas 节点通过 `useSortable` 与 `useDroppable` 暴露拖拽数据；`moveNode` 根据落点 ID 与是否为内部区域决定插入位置，防止将节点拖入其子树（ID 前缀检查）。
3. **选择与属性编辑**：Canvas 点击节点触发 `selectNode`；属性面板读取选中节点，更新时调用 `updateNode` 合并 props 或样式。
4. **Tabs 逻辑**：Tabs 组件维护当前活动 Tab，只在 SortableContext 中渲染活跃子项；新增 Tabs 自动创建 3 个 TabItem，新增 TabItem 自动编号。
5. **导出 DSL**：点击 Save 调用 `createFormDocument(nodes, metadata)`，目前打印到控制台，可在持久化前接入 `validateFormDocument`。
6. **预览模式**：仅切换布局（隐藏 Sidebar/PropertiesPanel），Canvas 仍基于同一组件树渲染。

## 5. 目录结构速览
- 应用与状态：`App.tsx`, `store.ts`
- UI 组件：`components/Canvas.tsx`, `components/Sidebar.tsx`, `components/PropertiesPanel.tsx`, `components/FormElements.tsx`, `components/elements/*`
- DSL：`dsl/components/*`, `dsl/form.ts`, `dsl/types.ts`
- 构建与样式：`index.html`, `index.tsx`, `index.css`, `tailwind.config.cjs`, `vite.config.ts`

## 6. 扩展指南
- **新增组件类型**：在 `dsl/components` 添加 DSL 定义并注册到 `dsl/components/index.ts`；实现对应渲染器于 `components/elements` 并在 `FormElements` 中映射；Sidebar 添加入口；如需属性面板支持，在 `PropertiesPanel` 增加控件。
- **自定义验证/发布**：在保存流程中调用 `validateFormDocument`，或扩展校验规则以覆盖业务约束。
- **布局策略**：Canvas 目前支持纵向/网格切换（由节点 `columns/gap` 控制）；如需更复杂布局，可在节点 props/DSL 中扩展布局字段，再在 Canvas 渲染时应用。

## 7. 运行与构建
- 开发：`npm install && npm run dev`
- 生产构建：`npm run build`（输出 `dist/`），`npm run preview` 本地预览。
