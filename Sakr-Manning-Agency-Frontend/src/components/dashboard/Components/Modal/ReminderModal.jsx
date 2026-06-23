import React, { useMemo } from "react";
import BaseModal from "./BaseModal";
import Button from "../Common/Button";
import { BaseInput } from "../inputs/BaseInput";
import { Select } from "../inputs/Select";
import { DateInput } from "../inputs/DateInput";
import { TextArea } from "../../../form/inputs/TextArea";
import { useFormModal } from "../../hooks/useFormModal";
import { useDashboardData } from "../../context/DashboardDataContext";

const ReminderModal = ({ isOpen, onClose, onSave, scale = 1 }) => {
  const { referenceOptions } = useDashboardData();

  const fieldConfig = useMemo(() => [
    {
      name: "assignee",
      label: "Crew Member Name",
      component: "Select",
      options: referenceOptions?.users || [],
      required: true,
      placeholder: "Select crew member"
    },
    {
      name: "text",
      label: "Reminder",
      component: "TextArea",
      required: true,
      placeholder: "Enter reminder details",
      props: { rows: 3 }
    },
    {
      name: "date",
      label: "Date",
      component: "DateInput",
      required: true
    },
    {
      name: "time",
      label: "Time",
      component: "BaseInput",
      type: "time",
      required: true
    }
  ], [referenceOptions]);

  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSave,
    handleClose,
  } = useFormModal({
    fieldConfig,
    record: null,
    onSave: async (data) => {
        const assigneeName = referenceOptions?.users?.find(u => String(u.value) === String(data.assignee))?.label || "Unknown";
        await onSave({ ...data, assigneeName });
    },
    onClose,
    successMessage: () => "Reminder added successfully",
  });

  if (!isOpen) return null;

  const renderField = (field) => {
    const commonProps = {
      key: field.name,
      name: field.name,
      label: field.label,
      required: field.required,
      value: formData[field.name] || "",
      onChange: (val) => handleChange(field.name, val),
      error: errors[field.name],
      placeholder: field.placeholder,
      variant: "dashboard",
      ...field.props,
    };

    switch (field.component) {
      case "BaseInput": return <BaseInput {...commonProps} type={field.type} />;
      case "Select": return <Select {...commonProps} options={field.options} />;
      case "DateInput": return <DateInput {...commonProps} />;
      case "TextArea": return <TextArea {...commonProps} scale={scale} />;
      default: return null;
    }
  };

  const footer = (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div style={{ display: "flex", gap: `${Math.round(12 * scale)}px`, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={handleClose} scale={scale} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} scale={scale} disabled={loading} loading={loading}>
          {loading ? "Saving..." : "Add Reminder"}
        </Button>
      </div>
      <div style={{ fontSize: "11px", color: "#8C8C8C", textAlign: "center" }}>
        Press <kbd style={{ padding: "2px 4px", backgroundColor: "#F3F4F6", borderRadius: "3px", fontFamily: "monospace" }}>Esc</kbd> to close •{" "}
        <kbd style={{ padding: "2px 4px", backgroundColor: "#F3F4F6", borderRadius: "3px", fontFamily: "monospace" }}>Ctrl+Enter</kbd> to save
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={true}
      onClose={handleClose}
      title="Add Reminder"
      size="md"
      footer={footer}
      scale={scale}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: `${Math.round(16 * scale)}px`, padding: "2px" }}>
        {fieldConfig.map(renderField)}
      </div>
    </BaseModal>
  );
};

export default ReminderModal;
