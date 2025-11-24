import React from 'react';
import { useDesignerStore } from '../store';
import { ComponentNode, ComponentType } from '../types';
import {
  Settings2,
  Type,
  AlignLeft,
  Palette,
  Layout,
  X,
  Grid,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 text-slate-800 font-medium text-sm mb-3 mt-6 border-b border-slate-100 pb-2">
    <span className="text-blue-500">{icon}</span>
    {title}
  </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const findNodeById = (nodes: ComponentNode[], id: string): ComponentNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const PropertiesPanel: React.FC = () => {
  const formSchema = useDesignerStore((state) => state.formSchema);
  const selectedComponentId = useDesignerStore((state) => state.selectedComponentId);
  const actions = useDesignerStore((state) => state.actions);

  const { updateComponent, selectComponent, addComponent, removeComponent, closePropertyPanel } = actions;
  const selectedNode = selectedComponentId ? findNodeById(formSchema.components, selectedComponentId) : undefined;

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 h-full">
        <Settings2 className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-center text-sm">Select a component on the canvas to configure its properties.</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateComponent(selectedNode.id, { [key]: value });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateComponent(selectedNode.id, {
      style: {
        ...selectedNode.props.style,
        [key]: value,
      },
    });
  };

  const isContainer = [ComponentType.CONTAINER, ComponentType.FORM, ComponentType.TAB_ITEM, ComponentType.TABS].includes(
    selectedNode.type
  );
  const isTabItem = selectedNode.type === ComponentType.TAB_ITEM;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-30">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">Properties</h2>
          <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">{selectedNode.type}</span>
        </div>
        <button
          onClick={() => {
            closePropertyPanel();
            selectComponent(null);
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isTabItem && (
          <div className="text-center py-8 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm mb-2">This is a Tab Item</p>
            <p className="text-xs text-slate-400">Select the parent Tabs component to manage tab properties</p>
          </div>
        )}

        {!isTabItem && (
          <>
            {isContainer && (
              <>
                <SectionHeader title="Layout Settings" icon={<Grid className="w-4 h-4" />} />

                <InputGroup label={`Grid Columns: ${selectedNode.props.columns || 1}`}>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    className="w-full accent-blue-500"
                    value={selectedNode.props.columns || 1}
                    onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                  </div>
                </InputGroup>

                <InputGroup label="Grid Gap (px)">
                  <input
                    type="number"
                    min="0"
                    max="64"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedNode.props.gap || 16}
                    onChange={(e) => handlePropChange('gap', parseInt(e.target.value))}
                  />
                </InputGroup>
              </>
            )}

            {selectedNode.type === ComponentType.TABS && (
              <>
                <SectionHeader title="Tab Items" icon={<Layers className="w-4 h-4" />} />
                <div className="space-y-2">
                  {selectedNode.children?.map((child, idx) => (
                    <div key={child.id} className="flex gap-2 items-center p-2 bg-slate-50 rounded-md border border-slate-200">
                      <input
                        type="text"
                        className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={child.props.label || `Tab ${idx + 1}`}
                        onChange={(e) => updateComponent(child.id, { label: e.target.value })}
                        placeholder={`Tab ${idx + 1}`}
                      />
                      <button
                        onClick={() => removeComponent(child.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete tab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-dashed border-blue-300 transition-colors flex items-center justify-center gap-2"
                    onClick={() => addComponent(ComponentType.TAB_ITEM, selectedNode.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Tab
                  </button>
                </div>
              </>
            )}

            {(selectedNode.props.label !== undefined ||
              selectedNode.props.content !== undefined ||
              selectedNode.props.placeholder !== undefined) && (
              <SectionHeader title="Content" icon={<Type className="w-4 h-4" />} />
            )}

            {selectedNode.props.label !== undefined && (
              <InputGroup label="Label">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedNode.props.label}
                  onChange={(e) => handlePropChange('label', e.target.value)}
                />
              </InputGroup>
            )}

            {selectedNode.props.content !== undefined && (
              <InputGroup label={selectedNode.type === ComponentType.BUTTON ? 'Button Text' : 'Text Content'}>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedNode.props.content}
                  onChange={(e) => handlePropChange('content', e.target.value)}
                />
              </InputGroup>
            )}

            {selectedNode.props.placeholder !== undefined && (
              <InputGroup label="Placeholder">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedNode.props.placeholder}
                  onChange={(e) => handlePropChange('placeholder', e.target.value)}
                />
              </InputGroup>
            )}

            {selectedNode.type === ComponentType.IMAGE && (
              <>
                <SectionHeader title="Image Source" icon={<ImageIconWrapper />} />
                <InputGroup label="Image URL">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedNode.props.src || ''}
                    onChange={(e) => handlePropChange('src', e.target.value)}
                  />
                </InputGroup>
                <InputGroup label="Alt Text">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedNode.props.alt || ''}
                    onChange={(e) => handlePropChange('alt', e.target.value)}
                  />
                </InputGroup>
              </>
            )}

            {selectedNode.type === ComponentType.SELECT && (
              <>
                <SectionHeader title="Options" icon={<AlignLeft className="w-4 h-4" />} />
                <div className="space-y-2">
                  {selectedNode.props.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(selectedNode.props.options || [])];
                          newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                          handlePropChange('options', newOptions);
                        }}
                      />
                      <input
                        className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-slate-500"
                        value={opt.value}
                        onChange={(e) => {
                          const newOptions = [...(selectedNode.props.options || [])];
                          newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                          handlePropChange('options', newOptions);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    className="text-xs text-blue-600 hover:underline mt-2"
                    onClick={() => {
                      const newOptions = [...(selectedNode.props.options || [])];
                      newOptions.push({ label: `Option ${newOptions.length + 1}`, value: `${newOptions.length + 1}` });
                      handlePropChange('options', newOptions);
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              </>
            )}

            {selectedNode.props.required !== undefined && (
              <>
                <SectionHeader title="Validation" icon={<Layout className="w-4 h-4" />} />
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-sm text-slate-600">Required Field</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    checked={selectedNode.props.required}
                    onChange={(e) => handlePropChange('required', e.target.checked)}
                  />
                </div>
              </>
            )}

            <SectionHeader title="Appearance" icon={<Palette className="w-4 h-4" />} />

            {(selectedNode.type === ComponentType.HEADER || selectedNode.type === ComponentType.TEXT) && (
              <InputGroup label="Font Size">
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                  value={selectedNode.props.style?.fontSize || ''}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                >
                  <option value="12px">Small</option>
                  <option value="14px">Normal</option>
                  <option value="16px">Medium</option>
                  <option value="20px">Large</option>
                  <option value="24px">Extra Large</option>
                  <option value="32px">Huge</option>
                </select>
              </InputGroup>
            )}

            {(selectedNode.type === ComponentType.BUTTON ||
              selectedNode.type === ComponentType.HEADER ||
              selectedNode.type === ComponentType.TEXT) && (
              <InputGroup label={selectedNode.type === ComponentType.BUTTON ? 'Background Color' : 'Text Color'}>
                <div className="flex gap-2 flex-wrap">
                  {['#1e293b', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm ${
                        selectedNode.props.style?.[selectedNode.type === ComponentType.BUTTON ? 'backgroundColor' : 'color'] === color
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        handleStyleChange(
                          selectedNode.type === ComponentType.BUTTON ? 'backgroundColor' : 'color',
                          color
                        )
                      }
                    />
                  ))}
                </div>
              </InputGroup>
            )}

            <InputGroup label="Padding (Y-Axis)">
              <input
                type="range"
                min="0"
                max="64"
                className="w-full accent-blue-500"
                value={parseInt((selectedNode.props.style?.paddingTop as string) || '0')}
                onChange={(e) => {
                  const val = `${e.target.value}px`;
                  updateComponent(selectedNode.id, {
                    style: { ...selectedNode.props.style, paddingTop: val, paddingBottom: val },
                  });
                }}
              />
              <div className="text-right text-xs text-slate-400 mt-1">{selectedNode.props.style?.paddingTop || '0px'}</div>
            </InputGroup>
          </>
        )}
      </div>
    </div>
  );
};

const ImageIconWrapper = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
