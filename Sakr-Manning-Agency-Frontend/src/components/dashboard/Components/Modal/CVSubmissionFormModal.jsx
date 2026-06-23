// components/dashboard/Modal/CVSubmissionFormModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import Button from "../Common/Button";
import { getModalStyles } from "../../Styles/componentStyles";
import { getModalTitleStyles } from "../../Styles/cssClasses";

// Import form components
import { BaseInput } from "../inputs/BaseInput";
import { Select } from "../inputs/Select";
import { DateInput } from "../inputs/DateInput";
import { TextArea } from "../../../form/inputs/TextArea";
import { Briefcase, X, Network } from "lucide-react";

// Import refactoring utilities
import { useFormModal } from "../../hooks/useFormModal";
import { CV_SUBMISSION_FORM_FIELDS } from "../../../../utils/dashboard/fieldConfigs";

// Import APIs
import { usersApi } from "../../../../services/Dashboard/usersApi";
import { companiesApi } from "../../../../services/Dashboard/companiesApi";
import useNotification from "../../hooks/useNotification";

/**
 * CVSubmissionFormModal - Dedicated form for recruitment pipeline entries (Section 4)
 * 
 * Allows Admin/HR to:
 * - Link a Seafarer to a Principal/Position
 * - Track experience, salary, and availability
 * - Capture cover letters and internal notes/ratings
 */
const CVSubmissionFormModal = ({ submission = null, onClose, onSave, scale = 1 }) => {
  const modalStyles = getModalStyles(scale);
  const titleStyles = getModalTitleStyles(scale);
  const { notify } = useNotification();

  // Reference data
  const [seafarers, setSeafarers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [loadingReference, setLoadingReference] = useState(true);

  // Load reference data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, companiesRes, positionsRes] = await Promise.all([
          usersApi.getUsers({ role: "Employee", page_size: 1000 }),
          companiesApi.getCompanies({ page_size: 1000 }),
          usersApi.getPositions(),  // GET /api/positions/ → [{ value, label }]
        ]);

        const userList = usersRes.users || usersRes.results || (Array.isArray(usersRes) ? usersRes : []);
        const companyList = companiesRes.companies || companiesRes.results || (Array.isArray(companiesRes) ? companiesRes : []);

        setSeafarers(userList);
        setCompanies(companyList);
        setRanks(positionsRes); // positions array: [{ value, label }]
      } catch (error) {
        console.error("Failed to load reference data for CV Submission:", error);
        notify.error("Failed to load users, companies or ranks");
      } finally {
        setLoadingReference(false);
      }
    };
    loadData();
  }, [notify]);

  // Enrich field config with dynamic data
  const enrichedFieldConfig = useMemo(() => {
    return CV_SUBMISSION_FORM_FIELDS.map((field) => {
      if (field.name === "user") {
        const options = seafarers.map((u) => ({
          value: u.id,
          label: `${u.first_name} ${u.middle_name || ""} ${u.last_name || ""} (${u.email})`,
        }));

        // ✅ IMPORTANT: Always include currently selected user if missing from reference data
        if (submission?.user && !options.some((o) => o.value === submission.user)) {
          options.unshift({
            value: submission.user,
            label: submission.user_name || `Seafarer ID: ${submission.user}`,
          });
        }
        return { ...field, options };
      }

      if (field.name === "company") {
        const options = companies.map((c) => ({
          value: c.id,
          label: c.company_name,
        }));

        // ✅ IMPORTANT: Always include currently selected company if missing from reference data
        if (submission?.company && !options.some((o) => o.value === submission.company)) {
          options.unshift({
            value: submission.company,
            label: submission.company_name || `Principal ID: ${submission.company}`,
          });
        }
        return { ...field, options };
      }

      if (field.name === "position") {
        // positions endpoint returns [{ value: "Master", label: "Master" }]
        // The backend assign-by-position expects the value string directly
        const options = ranks.map((p) => ({
          value: p.value ?? p.id,
          label: p.label ?? p.name ?? p.value,
        }));

        // Keep currently selected position if not in the list
        if (submission?.position && !options.some((o) => o.value === submission.position)) {
          options.unshift({
            value: submission.position,
            label: submission.position_name || submission.position,
          });
        }
        return { ...field, options };
      }
      return field;
    });
  }, [seafarers, companies, ranks, submission]);

  // Use form modal hook
  const {
    formData,
    errors,
    loading,
    isEditMode,
    handleChange,
    handleSave,
    handleClose,
  } = useFormModal({
    fieldConfig: enrichedFieldConfig,
    record: submission,
    onSave,
    onClose,
    successMessage: (isEdit) =>
      isEdit ? "Submission updated successfully" : "Submission created successfully",
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleSave]);

  // Render field
  const renderField = (field) => {
    const commonProps = {
      key: field.name,
      name: field.name,
      label: field.label,
      required: field.required,
      value: formData[field.name],
      onChange: (val) => handleChange(field.name, val),
      error: errors[field.name],
      placeholder: field.placeholder,
      variant: "dashboard",
      ...field.props,
    };

    switch (field.component) {
      case "BaseInput":
        return <BaseInput {...commonProps} type={field.type} />;
      case "Select":
        return <Select {...commonProps} options={field.options} />;
      case "DateInput":
        return <DateInput {...commonProps} />;
      case "TextArea":
        return <TextArea {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-submission-form-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto transition-all"
    >
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-visible border border-slate-200 dark:border-slate-800 flex flex-col my-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <h2 id="cv-submission-form-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                Principal Placement
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Assign candidate to a specific company and track their recruitment status.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {loadingReference ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-medium">Loading recruitment data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-6">
                {enrichedFieldConfig.map((field) => (
                  <div
                    key={field.name}
                    style={{ gridColumn: `span ${field.gridCols || 12}` }}
                  >
                    {renderField(field)}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-slate-500 dark:text-slate-400">Esc</kbd> to close</span>
                  <span>•</span>
                  <span><kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-slate-500 dark:text-slate-400">Ctrl+Enter</kbd> to save</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      isEditMode ? "Update Placement" : "Create Placement"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVSubmissionFormModal;
