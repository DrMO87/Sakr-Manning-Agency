import React, { useState, useEffect } from "react";
import { X, Briefcase, Plus, Loader2, Save } from "lucide-react";
import Button from "../Common/Button";
import { JOB_POSITION_FORM_FIELDS, getDefaultValues, validateFormData, transformForSave } from "../../../../utils/dashboard/fieldConfigs";
import { useDashboardData } from "../../context/DashboardDataContext";

// Import standard form components
import { BaseInput } from "../inputs/BaseInput";
import { Select } from "../inputs/Select";
import { DateInput } from "../inputs/DateInput";
import { TextArea } from "../../../form/inputs/TextArea";

const JobPositionModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    scale = 1
}) => {
    const { referenceOptions } = useDashboardData();
    
    // We add a 'job_order' field if it's not present in JOB_POSITION_FORM_FIELDS
    const formFields = [
        ...JOB_POSITION_FORM_FIELDS
    ];

    const [formData, setFormData] = useState(getDefaultValues(formFields));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(prev => ({ ...prev, ...initialData }));
            } else {
                setFormData(getDefaultValues(formFields));
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateFormData(formData, formFields);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }

        setIsSubmitting(true);
        const data = transformForSave(formData, formFields);
        
        try {
            await onSubmit(data);
            onClose();
        } catch (err) {
            // Error handled by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const renderField = (field) => {
        const commonProps = {
            key: field.name,
            name: field.name,
            label: field.label,
            value: formData[field.name] !== null && formData[field.name] !== undefined ? formData[field.name] : "",
            onChange: handleChange,
            error: errors[field.name],
            required: field.required,
            placeholder: field.placeholder,
            scale,
            ...field.props
        };

        if (field.name === "rank") {
            commonProps.options = referenceOptions?.ranks || [];
        }

        switch (field.component) {
            case 'Select': return <Select {...commonProps} />;
            case 'DateInput': return <DateInput {...commonProps} />;
            case 'TextArea': return <TextArea {...commonProps} />;
            case 'BaseInput':
            default:
                return <BaseInput {...commonProps} type={field.type || 'text'} />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" style={{ transform: `scale(${scale})` }}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
                                {initialData ? "Edit Vacancy" : "Add New Vacancy"}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                                {initialData ? "Update the details for this position." : "Fill in the details to create a new position."}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <form id="vacancyForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            {formFields.filter(f => f.component !== "TextArea").map(renderField)}
                        </div>
                        <div className="flex flex-col gap-5">
                            {formFields.filter(f => f.component === "TextArea").map(renderField)}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} scale={scale} className="font-semibold">
                        Cancel
                    </Button>
                    <Button type="submit" form="vacancyForm" variant="primary" disabled={isSubmitting} scale={scale} className="font-semibold shadow-md hover:shadow-lg">
                        {isSubmitting ? (
                            <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save size={16} className="mr-2" /> {initialData ? "Save Changes" : "Create Vacancy"}</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobPositionModal;
