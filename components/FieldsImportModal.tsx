import React, { useEffect, useMemo, useState } from "react";
import { CloseOutlined, EyeOutlined, LinkOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, Modal, Switch } from "antd";
import { ComponentType } from "../types";

export interface ImportedField {
  id: string;
  name: string;
  componentType: ComponentType;
}

interface FieldsImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport?: (fields: ImportedField[]) => void;
  initialSelectedIds?: string[];
}

const baseFieldNames = ["Transaction Type", "Deposit", "Withdrawal", "Transfer", "Payment"];

const fieldLibrary: ImportedField[] = [
  ...baseFieldNames.map((name, index) => ({
    id: `field-${index + 1}`,
    name,
    componentType: ComponentType.INPUT,
  })),
  ...Array.from({ length: 156 }, (_, index) => ({
    id: `field-${index + 6}`,
    name: `Field ${index + 6}`,
    componentType: ComponentType.INPUT,
  })),
];

export const FieldsImportModal: React.FC<FieldsImportModalProps> = ({
  open,
  onClose,
  onImport,
  initialSelectedIds,
}) => {
  const [modalKeyword, setModalKeyword] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedFieldIds(initialSelectedIds ?? []);
  }, [open, initialSelectedIds]);

  const modalFilteredFields = useMemo(() => {
    const searchKey = modalKeyword.trim().toLowerCase();
    if (!searchKey) {
      return fieldLibrary;
    }

    return fieldLibrary.filter((item) => item.name.toLowerCase().includes(searchKey));
  }, [modalKeyword]);

  const allVisibleSelected =
    modalFilteredFields.length > 0 &&
    modalFilteredFields.every((item) => selectedFieldIds.includes(item.id));

  const selectedNames = fieldLibrary
    .filter((item) => selectedFieldIds.includes(item.id))
    .map((item) => item.name)
    .join(", ");

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      const merged = new Set([...selectedFieldIds, ...modalFilteredFields.map((item) => item.id)]);
      setSelectedFieldIds(Array.from(merged));
      return;
    }

    const visibleIds = new Set(modalFilteredFields.map((item) => item.id));
    setSelectedFieldIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  const handleToggleField = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFieldIds((prev) => [...prev, fieldId]);
      return;
    }

    setSelectedFieldIds((prev) => prev.filter((id) => id !== fieldId));
  };

  const handleImport = () => {
    const selectedFields = fieldLibrary.filter((field) => selectedFieldIds.includes(field.id));
    onImport?.(selectedFields);
    onClose();
  };

  return (
    <Modal
      title={<span className="text-[30px] leading-8 font-semibold">Fields Import</span>}
      open={open}
      onCancel={onClose}
      width={980}
      footer={null}
      closeIcon={<CloseOutlined style={{ fontSize: 22 }} />}
    >
      <div className="mt-3">
        <div className="flex items-center justify-between text-[14px] leading-5 text-[#595959]">
          <div>
            Selected Fields - <span className="text-[#1677ff]">{selectedFieldIds.length}</span>
          </div>
          <button type="button" className="text-[#003a8c]" onClick={() => setSelectedFieldIds([])}>
            Clear All
          </button>
        </div>

        <div className="mt-3 min-h-[42px] rounded-[10px] border border-dashed border-[#d9d9d9] bg-[#fafafa] px-4 py-2 text-[14px] leading-5 text-[#8c8c8c] flex items-center justify-center">
          {selectedFieldIds.length > 0 ? selectedNames : "Nothing is selected"}
        </div>

        <div className="mt-5 text-[14px] leading-5 text-[#595959]">Search</div>
        <Input
          className="mt-2 !h-12 !rounded-full"
          placeholder="Please enter a field name to search"
          value={modalKeyword}
          onChange={(event) => setModalKeyword(event.target.value)}
          suffix={<SearchOutlined style={{ color: "#1677ff", fontSize: 20 }} />}
        />

        <div className="mt-5 border-t border-[#d9d9d9] pt-4">
          <div className="flex items-center justify-between">
            <div className="text-[15px] leading-6 font-medium text-[#434343]">
              Total {fieldLibrary.length} available fields in the field library
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[#434343]">Select all</span>
              <Switch checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
            </div>
          </div>

          <div className="mt-4 max-h-[320px] overflow-y-auto space-y-3 pr-1">
            {modalFilteredFields.map((fieldItem) => {
              const checked = selectedFieldIds.includes(fieldItem.id);

              return (
                <div
                  key={fieldItem.id}
                  className="rounded-lg bg-[#fafafa] px-4 h-[52px] flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-[14px] leading-5 text-[#434343] cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onChange={(event) => handleToggleField(fieldItem.id, event.target.checked)}
                    />
                    <span>{fieldItem.name}</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="h-7 px-3 rounded-full bg-[#d8e1a8] text-[#6f7b2f] text-[13px] leading-7 inline-flex items-center gap-1">
                      <LinkOutlined style={{ fontSize: 14 }} /> Boolean
                    </span>
                    <span className="h-7 px-3 rounded-full bg-[#b5ecf5] text-[#0a7b93] text-[13px] leading-7 inline-flex items-center gap-1">
                      <EyeOutlined style={{ fontSize: 14 }} /> Radio
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 border-t border-[#d9d9d9] pt-4 flex items-center justify-between">
          <span className="text-[14px] leading-5 text-[#8c8c8c]">
            {selectedFieldIds.length} fields selected
          </span>
          <div className="flex items-center gap-3">
            <Button
              size="large"
              shape="round"
              className="!h-9 !px-7 !text-[14px] !leading-5 !font-semibold !text-[#434343]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              shape="round"
              className="!h-9 !px-8 !text-[14px] !leading-5 !font-semibold"
              onClick={handleImport}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
