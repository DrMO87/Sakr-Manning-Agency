// components/dashboard/Components/Modal/JobOrderManagementModal.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, Briefcase, Plus, Loader2, Trash2, Search, ChevronRight, UserPlus, FileText, CheckCircle2, Anchor } from "lucide-react";
import Button from "../Common/Button";
import { useJobOrders } from "../../../../hooks/dashboard/useJobOrders";
import { JOB_ORDER_FORM_FIELDS, JOB_POSITION_FORM_FIELDS, getDefaultValues, validateFormData, transformForSave } from "../../../../utils/dashboard/fieldConfigs";
import useNotification from "../../hooks/useNotification";
import { useDashboardData } from "../../context/DashboardDataContext";

// Import standard form components
import { BaseInput } from "../inputs/BaseInput";
import { Select } from "../inputs/Select";
import { DateInput } from "../inputs/DateInput";
import { TextArea } from "../../../form/inputs/TextArea";

const JobOrderManagementModal = ({
    isOpen,
    onClose,
    company,
    scale = 1
}) => {
    const {
        jobOrders,
        loading,
        fetchJobOrders,
        createJobOrder,
        updateJobOrder,
        deleteJobOrder,
        addPositionToOrder,
        removePosition,
        canCreate,
        canDelete
    } = useJobOrders();
    const { notify } = useNotification();
    const { referenceOptions, shipsByCompany, fetchShipsByCompany, loadingShips } = useDashboardData();
    const companyShips = useMemo(() => {
        if (!company?.id) return [];
        return shipsByCompany[company.id] || [];
    }, [shipsByCompany, company?.id]);

    // UI State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form States
    const [orderFormData, setOrderFormData] = useState(getDefaultValues(JOB_ORDER_FORM_FIELDS));
    const [posFormData, setPosFormData] = useState(getDefaultValues(JOB_POSITION_FORM_FIELDS));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        if (isOpen && company?.id) {
            fetchJobOrders({ company: company.id });
            fetchShipsByCompany(company.id);
            setOrderFormData(prev => ({ ...prev, company: company.id }));
        }
    }, [isOpen, company?.id, fetchJobOrders, fetchShipsByCompany]);

    // Sync selectedOrder
    useEffect(() => {
        if (selectedOrder && jobOrders.length > 0) {
            const updatedOrder = jobOrders.find(o => o.id === selectedOrder.id);
            if (updatedOrder) {
                setSelectedOrder(updatedOrder);
            }
        }
    }, [jobOrders]);

    // Filtered list
    const filteredOrders = useMemo(() => {
        if (!Array.isArray(jobOrders)) return [];
        if (!searchTerm) return jobOrders;
        const lower = searchTerm.toLowerCase();
        return jobOrders.filter(o =>
            o.reference_number.toLowerCase().includes(lower) ||
            (o.ship_name || "").toLowerCase().includes(lower)
        );
    }, [jobOrders, searchTerm]);

    // Handlers
    const handleOrderChange = (name, val) => {
        setOrderFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handlePosChange = (name, val) => {
        setPosFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        const validation = validateFormData(orderFormData, JOB_ORDER_FORM_FIELDS);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            notify.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        const data = transformForSave(orderFormData, JOB_ORDER_FORM_FIELDS);
        data.company = company.id;

        const result = await createJobOrder(data);
        if (result.success) {
            const defaults = getDefaultValues(JOB_ORDER_FORM_FIELDS);
            setOrderFormData({ ...defaults, company: company.id });
            setSelectedOrder(result.data);
            notify.success("Job order created successfully!");
        }
        setIsSubmitting(false);
    };

    const handleAddPosition = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;

        const validation = validateFormData(posFormData, JOB_POSITION_FORM_FIELDS);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }

        setIsSubmitting(true);
        const data = transformForSave(posFormData, JOB_POSITION_FORM_FIELDS);
        data.job_order = selectedOrder.id;

        const result = await addPositionToOrder(data);
        if (result.success) {
            setPosFormData(getDefaultValues(JOB_POSITION_FORM_FIELDS));
            fetchJobOrders({ company: company.id });
            notify.success("Position added successfully!");
        }
        setIsSubmitting(false);
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("Delete this Job Order and all its positions?")) return;
        const result = await deleteJobOrder(id);
        if (result.success && selectedOrder?.id === id) {
            setSelectedOrder(null);
            notify.success("Job order deleted.");
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedOrder) return;

        const previousOrder = { ...selectedOrder };
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));

        const result = await updateJobOrder(selectedOrder.id, { status: newStatus });
        if (!result.success) {
            setSelectedOrder(previousOrder);
        } else {
            fetchJobOrders({ company: company.id });
            notify.success(`Status updated to ${newStatus}`);
        }
    };

    const getStatusColor = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "active" || s === "open") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
        if (s === "pending" || s === "in progress") return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
        if (s === "fulfilled") return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30";
        if (s === "cancelled") return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    };

    const renderField = (field, currentData, onChange) => {
        const commonProps = {
            name: field.name,
            label: field.label,
            required: field.required,
            value: currentData[field.name],
            onChange: (val) => onChange(field.name, val),
            error: errors[field.name],
            placeholder: field.placeholder,
            variant: "dashboard",
            scale: scale
        };

        if (field.name === "rank") {
            return <Select {...commonProps} key={field.name} options={(referenceOptions?.ranks || [])} />;
        }
        if (field.name === "ship") {
            const shipOptions = companyShips.map(s => ({
                value: s.id,
                label: s.ship_name || s.name
            }));
            return <Select {...commonProps} key={field.name} options={shipOptions} isLoading={loadingShips} />;
        }
        if (field.component === "DateInput") {
            return <DateInput {...commonProps} key={field.name} />;
        }
        if (field.component === "Select" && field.options) {
            return <Select {...commonProps} key={field.name} options={field.options} />;
        }
        if (field.component === "TextArea") {
            return <TextArea {...commonProps} key={field.name} rows={3} />;
        }

        return <BaseInput {...commonProps} key={field.name} type={field.type} />;
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200 font-sans"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800"
                style={{ maxHeight: "90vh" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-inner">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0 leading-tight">Job Order Management</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 m-0 mt-0.5">{company?.name || "Principal Profile"}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        title="Close window"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                    {/* Left Panel: Job Orders List */}
                    <div className="w-full md:w-80 lg:w-96 bg-slate-50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
                        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50">
                            <div className="relative group">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search job orders..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                                    <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
                                    <p className="text-sm font-medium">Loading orders...</p>
                                </div>
                            ) : jobOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <Briefcase size={32} className="opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No job orders found.</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center px-4 leading-relaxed">Create a new job order from the right panel to get started.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {filteredOrders.map(order => {
                                        const isSelected = selectedOrder?.id === order.id;
                                        return (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border relative overflow-hidden group ${
                                                    isSelected 
                                                    ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm" 
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                                                }`}
                                            >
                                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>}
                                                
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {order.reference_number}
                                                    </span>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                        {order.status || "Pending"}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                                    <Anchor size={12} className={isSelected ? 'text-blue-500' : ''} />
                                                    <span className="truncate">{order.ship_name || "No ship assigned"}</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex -space-x-1">
                                                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                                                {order.positions?.length || 0}
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Positions</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {order.request_date || "-"}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} 
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Dynamic Form / Detail View */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative">
                        {!selectedOrder ? (
                            /* Create New Order Form */
                            <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 border border-blue-100 dark:border-blue-800/50">
                                            <Plus size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Create New Job Order</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fill in the details below to start a new recruitment request for this company.</p>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                        <form onSubmit={handleCreateOrder} className="flex flex-col gap-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {JOB_ORDER_FORM_FIELDS.slice(0, -1).map(field => {
                                                    if (field.name === "company") return null; 
                                                    return renderField(field, orderFormData, handleOrderChange);
                                                })}
                                            </div>
                                            
                                            <div className="pt-2">
                                                {renderField(JOB_ORDER_FORM_FIELDS[JOB_ORDER_FORM_FIELDS.length - 1], orderFormData, handleOrderChange)}
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-[160px] h-11 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all" scale={scale}>
                                                    {isSubmitting ? (
                                                        <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Processing...</span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2"><Plus size={18} /> Create Order</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Manage Positions View */
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                {/* Detail Header */}
                                <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 shrink-0">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                    Positions for <span className="text-blue-600 dark:text-blue-400">{selectedOrder.reference_number}</span>
                                                </h3>
                                                <div className="relative group">
                                                    <select
                                                        value={selectedOrder.status || "Pending"}
                                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                                        className={`appearance-none text-xs uppercase tracking-wider font-bold py-1.5 pl-3 pr-8 rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow ${getStatusColor(selectedOrder.status)}`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Open">Open</option>
                                                        <option value="Active">Active</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Fulfilled">Fulfilled</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Add, configure, or remove required ranks for this job order.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)} scale={scale} className="shrink-0 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <Plus size={14} className="mr-1.5" /> New Order
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50 custom-scrollbar">
                                    {/* Add Position Panel */}
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <UserPlus size={16} />
                                            </div>
                                            <h4 className="font-bold text-sm">Add New Position</h4>
                                        </div>
                                        <form onSubmit={handleAddPosition}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {JOB_POSITION_FORM_FIELDS.filter(f => f.component !== "TextArea").map(field => renderField(field, posFormData, handlePosChange))}
                                            </div>
                                            <div className="mt-4">
                                                {JOB_POSITION_FORM_FIELDS.filter(f => f.component === "TextArea").map(field => renderField(field, posFormData, handlePosChange))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} scale={scale} className="rounded-xl font-semibold shadow hover:shadow-md transition-all">
                                                    {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-1.5" />}
                                                    Add Position
                                                </Button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Positions List */}
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 px-1 flex items-center justify-between">
                                            <span>Current Requirements</span>
                                            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{selectedOrder.positions?.length || 0}</span>
                                        </h4>
                                        
                                        <div className="flex flex-col gap-3">
                                            {selectedOrder.positions?.length === 0 ? (
                                                <div className="text-center bg-white dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-10">
                                                    <UserPlus size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No positions added yet.</p>
                                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Use the form above to add required ranks.</p>
                                                </div>
                                            ) : (
                                                selectedOrder.positions.map((pos, idx) => (
                                                    <div key={pos.id || idx} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{pos.rank_name}</span>
                                                                <span className="font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs">
                                                                    Req: {pos.quantity}
                                                                </span>
                                                                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 text-xs">
                                                                    Signed: {pos.filled_slots || 0}
                                                                </span>
                                                                <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 text-xs">
                                                                    Rem: {pos.remaining_slots || 0}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                                                    <span className="text-emerald-500">💰</span> 
                                                                    {pos.salary_min || '?'}-{pos.salary_max || '?'} {pos.currency}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                                                    <span className="text-amber-500">⏳</span> 
                                                                    {pos.contract_duration_months} Months
                                                                </span>
                                                            </div>
                                                            {pos.assigned_to && pos.assigned_to.length > 0 && (
                                                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                    <span className="text-slate-400 dark:text-slate-500">Assigned To: </span>
                                                                    {pos.assigned_to.join(", ")}
                                                                </div>
                                                            )}
                                                            {pos.remarks && (
                                                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 italic">
                                                                    <span className="text-slate-400 dark:text-slate-500 font-semibold non-italic mr-1">Note:</span>
                                                                    {pos.remarks}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => removePosition(pos.id, selectedOrder.id)} 
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-4 shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500/50 opacity-0 group-hover:opacity-100 focus:opacity-100" 
                                                            title="Remove Position"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end shrink-0">
                    <Button variant="outline" onClick={onClose} scale={scale} className="rounded-xl font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-10 px-6 text-sm">
                        Close Window
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JobOrderManagementModal;
