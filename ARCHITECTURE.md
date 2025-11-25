# formDesigner  技术架构

本文概述项目的核心技术栈、分层、关键数据结构、交互流程以及扩展点，帮助快速理解并演进拖拽式表单/页面搭建器。

## 1. 技术栈与运行时
- **框架**：React + TypeScript，入口 `index.tsx`，Vite 构建。
- **状态管理**：Zustand（`store.ts`）维护 `formSchema`、选择态与拖拽态。
- **拖拽**：`@dnd-kit` 传感器、可排序列表、自定义碰撞检测与拖拽浮层。
- **样式**：TailwindCSS（`tailwind.config.cjs` + `index.css`），类名合并使用 `clsx`/`tailwind-merge`。
- **图标**：`lucide-react`。
- **DSL**：`dsl/` 定义组件 DSL 与表单文档规范，可导出/校验当前画布。

## 2. 模块分层
- **应用壳与拖拽上下文**（`App.tsx`）
  - 初始化 `DndContext`、鼠标/触摸传感器、自定义碰撞检测与拖拽浮层。
  - 顶栏提供 Preview/Save；Preview 仅隐藏侧栏与属性面板。
  - `DragContext` 向 Canvas 共享拖拽数据与当前放置目标。
- **状态层**（`store.ts`）
  - `formSchema: FormSchema` 持有组件树与布局元数据；`selectedComponentId`/`propertyPanelOpen` 控制 UI。
  - `dragState` 记录 `DragData`、放置目标与预览节点。
  - `actions.addComponent/removeComponent/updateComponent/moveComponent` 负责增删改排；Tabs 自动生成 3 个 TabItem，并阻止节点拖入自身后代。
- **组件层**
  - **Sidebar**（`components/Sidebar.tsx`）：读取 `componentDSLs` 生成可拖拽的组件目录。
  - **Canvas**（`components/Canvas.tsx`）：`SortableContext` + `useDroppable/useSortable` 渲染树，支持占位提示、容器内部/同级投放、网格布局（基于节点 `columns/gap`），Tabs 仅渲染当前激活 Tab。
  - **元素渲染器**（`components/FormElements.tsx` + `components/elements/*`）：按 `ComponentType` 映射 Input/Button/Tabs/...，仅消费节点 props，与拖拽逻辑解耦。
  - **属性面板**（`components/PropertiesPanel.tsx`）：绑定选中节点，调用 `updateComponent/addComponent/removeComponent` 修改 DSL；Tabs 支持 TabItem 管理。
- **DSL 层**（`dsl/`）
  - 组件 DSL：`dsl/components/*.ts` 描述显示名、版本、默认属性、可配置项与子节点约束，聚合于 `dsl/components/index.ts` 并产出 `DEFAULT_PROPS`。
  - 表单 DSL：`dsl/form.ts` 定义 `FormDSLDocument` 版本、`createFormDocument` 导出当前画布、`validateFormDocument` 按组件约束校验子树。
  - 类型：`dsl/types.ts` 描述 DSL 结构与属性原语。
- **静态资源与样式**
  - `index.html` 容器，`index.css` 全局/滚动条样式，`tailwind.config.cjs` 声明扫描路径与主题色（含 `canvas` 背景）。

## 3. 核心数据模型
- `FormSchema`：`{ id, name, components: ComponentNode[], layout }`，完整表单文档。
- `ComponentNode`：`{ id, type, props, children[] }`，与 DSL `ComponentType` 对齐。
- `DragState`：`{ isDragging, draggedItem, dropTarget, previewComponent }`，驱动拖拽浮层与占位。
- `ComponentProps`：通用属性（label/content/options/style/...），各组件 DSL 指定默认值与可编辑字段。
- `ComponentDSLDefinition`：描述组件元数据、默认属性、可配置项与子节点约束，供渲染/属性面板/校验共用。

## 4. 主交互与数据流
1. **拖拽新增**：Sidebar 拖出 `DragData(type=component, componentType)`；Canvas `onDragEnd` 解析落点（根/容器内部/同级），调用 `addComponent` 注入 DSL 默认属性。
2. **拖拽重排/嵌套**：Canvas 节点暴露 `useSortable`/`useDroppable` 数据；`moveComponent` 根据落点决定插入位置，并阻止拖入自身后代。
3. **选择与属性编辑**：Canvas 点击触发 `selectComponent`；属性面板读取选中节点，调用 `updateComponent` 合并 props 或样式。
4. **Tabs 行为**：Tabs 仅在 SortableContext 渲染激活的 TabItem；新增 Tabs 自动创建 3 个 TabItem，新建 TabItem 自动编号。
5. **导出与持久化**：Save 调用 `createFormDocument(formSchema, metadata)`，经 `validateFormDocument` 校验后写入 localStorage，并打印 DSL。
6. **预览模式**：仅切换布局（隐藏 Sidebar/PropertiesPanel），Canvas 仍基于同一组件树渲染。

## 5. 目录结构速览
- 应用与状态：`App.tsx`, `store.ts`
- UI 组件：`components/Canvas.tsx`, `components/Sidebar.tsx`, `components/PropertiesPanel.tsx`, `components/FormElements.tsx`, `components/elements/*`
- DSL：`dsl/components/*`, `dsl/form.ts`, `dsl/types.ts`
- 构建与样式：`index.html`, `index.tsx`, `index.css`, `tailwind.config.cjs`, `vite.config.ts`

## 6. 扩展指南
- **新增组件类型**：在 `dsl/components` 添加 DSL 并注册到 `dsl/components/index.ts`；实现渲染器于 `components/elements` 并在 `FormElements` 映射；Sidebar 添加入口；如需属性面板支持，扩展 `PropertiesPanel`。
- **自定义校验/发布**：在保存流程中调用/扩展 `validateFormDocument`，覆盖业务约束。
- **布局策略**：Canvas 支持纵向/网格（由节点 `columns/gap` 控制）；如需更复杂布局，可扩展 props/DSL 并在 Canvas 渲染中应用。

## 7. 运行与构建
- 开发：`npm install && npm run dev`
- 生产构建：`npm run build`（输出 `dist/`），`npm run preview` 本地预览。
