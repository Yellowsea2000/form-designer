import {
  BorderOutlined,
  FolderFilled,
  HolderOutlined
} from "@ant-design/icons";
import { useDraggable } from "@dnd-kit/core";
import React, { useMemo } from "react";

import { ImportedField } from "./FieldsImportModal";

interface FieldsTabContentProps {
  fields: ImportedField[];
  keyword: string;
}

const sectionTitleClassName =
  "text-base leading-4 font-bold text-[#737373] tracking-normal mb-4";

interface FieldRowItemProps {
  field: ImportedField;
}

const FieldRowItem: React.FC<FieldRowItemProps> = ({ field }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-imported-${field.id}`,
    data: {
      type: "sidebar-item",
      componentType: field.componentType,
      componentLabel: field.name
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-lg px-2.5 h-9 flex items-center gap-2 cursor-grab active:cursor-grabbing ${
        isDragging ? "bg-[#e6e6e6] opacity-50" : "bg-[#efefef]"
      }`}
    >
      <span className="text-[#1677ff] inline-flex items-center justify-center">
        <HolderOutlined style={{ fontSize: 12 }} />
      </span>
      <span className="h-4 w-4 rounded border border-[#d9d9d9] bg-white text-[#8c8c8c] inline-flex items-center justify-center">
        <BorderOutlined style={{ fontSize: 10 }} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[13px] leading-5 font-medium text-[#1f2f6b] truncate block">
          {field.name}
        </span>
      </div>
    </div>
  );
};

export const FieldsTabContent: React.FC<FieldsTabContentProps> = ({
  fields,
  keyword
}) => {
  const filteredFields = useMemo(() => {
    const searchKey = keyword.trim().toLowerCase();
    if (!searchKey) {
      return fields;
    }

    return fields.filter((field) =>
      field.name.toLowerCase().includes(searchKey)
    );
  }, [fields, keyword]);

  if (fields.length === 0) {
    return (
      <div>
        <h3 className={sectionTitleClassName}>Content</h3>
        <div className="border border-dashed border-[#d9d9d9] bg-[#f5f5f5] px-5 py-7 flex items-center justify-center text-center min-h-[212px]">
          <div className="max-w-[170px]">
            <div className="flex justify-center">
              <FolderFilled style={{ fontSize: 40, color: "#69b1ff" }} />
            </div>
            <div className="mt-3 text-[28px] leading-8 font-bold text-[#262626]">
              No Fields added yet
            </div>
            <p className="mt-2 text-[18px] leading-6 text-[#595959]">
              Add your first field to start building your form
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className={sectionTitleClassName}>Content</h3>
      <div className="space-y-2.5">
        {filteredFields.length === 0 ? (
          <div className="text-xs text-[#8c8c8c]">No matching fields.</div>
        ) : (
          filteredFields.map((field) => (
            <FieldRowItem key={field.id} field={field} />
          ))
        )}
      </div>
    </div>
  );
};
