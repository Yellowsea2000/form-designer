# formDesigner  Architecture

This document summarizes the stack, layering, core data shapes, interaction flows, and extension hooks for the drag-and-drop form/page builder.

## 1. Stack & runtime
- **Framework**: React + TypeScript with Vite entry at `index.tsx`.
- **State**: Zustand (`store.ts`) tracks the component tree and selection.
- **Drag-and-drop**: `@dnd-kit` sensors, sortable contexts, custom collision detection, and overlays.
- **Styling**: TailwindCSS (`tailwind.config.cjs` + `index.css`), with `clsx`/`tailwind-merge` for class merging.
- **Icons**: `lucide-react`.
- **DSL**: `dsl/` defines component DSL specs and form document contracts for export/validation.

## 2. Layering
- **App shell & drag context** (`App.tsx`)
  - Initializes `DndContext`, mouse/touch sensors, custom collision detection, and drag overlays.
  - Header toggles Preview/Save; Preview hides sidebar and properties panel only.
  - `DragContext` shares active drag data and hover info with the Canvas.
- **State layer** (`store.ts`)
  - `formSchema: FormSchema` contains the component tree plus layout metadata; `selectedComponentId` and `propertyPanelOpen` drive UI chrome.
  - `dragState` stores `DragData`, drop targets, and preview nodes for overlays.
  - `actions.addComponent/removeComponent/updateComponent/moveComponent` manage lifecycle and reordering; `DEFAULT_PROPS` comes from the DSL and Tabs auto-seed three TabItems.
  - Move logic prevents cycles (no dropping into descendants) and supports root/container interior drops and sibling insertion.
- **UI components**
  - **Sidebar** (`components/Sidebar.tsx`): reads `componentDSLs` to render draggable catalog items.
  - **Canvas** (`components/Canvas.tsx`): `SortableContext` + `useDroppable/useSortable` to render the tree, show placeholders, handle interior/sibling drops, grid layout (`columns/gap`), and Tabs rendering of only the active tab.
  - **Element renderers** (`components/FormElements.tsx` + `components/elements/*`): map `ComponentType` to visual elements (Input/Button/Tabs/...) consuming only node props to stay decoupled from drag logic.
  - **Properties panel** (`components/PropertiesPanel.tsx`): binds selected node to form controls, invoking `updateNode/addNode/removeNode`; Tabs get special TabItem management.
- **DSL layer** (`dsl/`)
  - Component DSL: `dsl/components/*.ts` describe display name, version, defaults, editable props, and child constraints; aggregated in `dsl/components/index.ts` and exported as `DEFAULT_PROPS`.
  - Form DSL: `dsl/form.ts` defines `FormDSLDocument` versioning, `createFormDocument` for export, and `validateFormDocument` to enforce component constraints.
  - Types: `dsl/types.ts` captures DSL shapes and prop primitives.
- **Assets & styling**
  - `index.html` host, `index.css` for global/scrollbar styles, `tailwind.config.cjs` for scan paths and theme colors (including `canvas` background).

## 3. Core data shapes
- `FormSchema`: `{ id, name, components: ComponentNode[], layout }`, the full designer document.
- `ComponentNode`: `{ id, type, props, children[] }`, aligned to DSL `ComponentType`.
- `DragState`: `{ isDragging, draggedItem, dropTarget, previewComponent }` for DnD overlays and placeholders.
- `ComponentProps`: shared prop bag (label/content/options/style/...) with defaults per component DSL.
- `ComponentDSLDefinition`: component metadata, defaults, editable fields, and child constraints—used by renderers, the properties panel, and validation.

## 4. Key flows
1. **Add via drag**: Sidebar drag carries `DragData(type=component, componentType)`; Canvas `onDragEnd` inspects drop target (root/interior/sibling) and calls `addComponent` (hydrated with DSL defaults).
2. **Reorder/nest**: Canvas nodes expose `useSortable` + interior `useDroppable`; `moveComponent` decides insert location from drop target and prevents dropping into descendants (ID-based guard).
3. **Select & edit**: Canvas click sets `selectNode`; Properties panel reads the selection and calls `updateNode` to merge props/style.
4. **Tabs behavior**: Tabs track an active TabItem and render only that child in the SortableContext; new Tabs auto-create three TabItems, and new TabItems auto-number.
5. **Export DSL**: Save triggers `createFormDocument(formSchema, metadata)` (logged today) and persists to localStorage; run `validateFormDocument` before persistence for stricter guardrails.
6. **Preview mode**: Layout toggle that hides Sidebar/PropertiesPanel; Canvas renders the same tree.

## 5. Directory map
- App & state: `App.tsx`, `store.ts`
- UI: `components/Canvas.tsx`, `components/Sidebar.tsx`, `components/PropertiesPanel.tsx`, `components/FormElements.tsx`, `components/elements/*`
- DSL: `dsl/components/*`, `dsl/form.ts`, `dsl/types.ts`
- Build/style: `index.html`, `index.tsx`, `index.css`, `tailwind.config.cjs`, `vite.config.ts`

## 6. Extension guidelines
- **Add a component type**: create a DSL file under `dsl/components`, register in `dsl/components/index.ts`, implement a renderer in `components/elements` and map it in `FormElements`, add it to the Sidebar, and (if needed) add controls in `PropertiesPanel`.
- **Validation/publishing**: call `validateFormDocument` during save, or extend rules for domain-specific constraints.
- **Layout strategy**: current layout supports vertical list and grid via `columns/gap`; extend props/DSL if more complex layouts are needed and apply them in Canvas rendering.

## 7. Run & build
- Dev: `npm install && npm run dev`
- Prod build: `npm run build` (outputs `dist/`), `npm run preview` to locally serve the build.
