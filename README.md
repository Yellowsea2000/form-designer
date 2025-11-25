# formDesigner

A drag-and-drop form/page builder powered by a typed DSL for components and form documents.

## What this project does
- Build nested form layouts with containers, grids, tabs, and form controls.
- Edit component properties in a live properties panel.
- Export the current canvas as a versioned DSL document for storage or server sync.
- Validate trees against component constraints (e.g., only `tab_item` inside `tabs`).

## DSL highlights
- Component specs live in `dsl/components/*.ts`, aggregated in `dsl/components/index.ts`.
- Form-level helpers and validators live in `dsl/form.ts`.
- Types for DSL prop metadata are in `dsl/types.ts`.
- `createFormDocument(nodes, metadata)` produces a serializable form DSL; `validateFormDocument(doc)` reports schema errors.

## Tech stack
- React + TypeScript
- Vite build tooling
- Zustand for editor state
- dnd-kit for drag-and-drop
- tailwind-merge/clsx for class merging
- lucide-react icon set

## Key source map
- App shell and drag context: `App.tsx`
- Canvas rendering and sortable logic: `components/Canvas.tsx`
- Component renderers: `components/FormElements.tsx` and `components/elements/`
- Sidebar catalog: `components/Sidebar.tsx`
- Properties panel: `components/PropertiesPanel.tsx`
- State/store: `store.ts`
- DSL definitions: `dsl/`

## Getting started
```bash
npm install
npm run dev
```

## Exporting a DSL document
- Use the Save button in the UI; it logs the DSL document via `createFormDocument`.
- Extend with `validateFormDocument` before persisting if you need stricter guardrails.***
