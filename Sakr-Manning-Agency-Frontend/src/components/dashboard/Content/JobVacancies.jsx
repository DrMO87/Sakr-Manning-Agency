import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Edit2, Trash2, Briefcase, RefreshCw, Layers, Download, FileText } from "lucide-react";
import { useJobPositions } from "../../../hooks/dashboard/useJobPositions";
import { useDashboardData } from "../context/DashboardDataContext";
import { AdvancedDataTable } from "../Components/Data/AdvancedDataTable";
import { DataTableLayout } from "../Components/Data/DataTableLayout";
import { BulkActionBar } from "../Components/Data/BulkActionBar";
import Button from "../Components/Common/Button";
import JobPositionModal from "../Components/Modal/JobPositionModal";
import useNotification from "../hooks/useNotification";
import Pagination from "../../common/Pagination";
import { generateAllPageStyles, getMainContainerStyles } from "../Styles/cssClasses";
import { exportToExcel } from "../../../utils/exportHelpers";
import { generateStatPdfReport } from "../../../utils/pdfReportGenerator";

export const JobVacanciesPage = ({ scale = 1, isMobile }) => {
    const { 
        jobPositions, 
        loading, 
        pagination, 
        fetchJobPositions, 
        createJobPosition, 

        updateJobPosition, 
        deleteJobPosition,
        canCreate,
        canEdit,
        canDelete
    } = useJobPositions();
    const { notify } = useNotification();
    const { referenceOptions } = useDashboardData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState(null);
    
    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    // Filter state
    const [activeFilters, setActiveFilters] = useState({
        rank: "",
        status: "",
        company: ""
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    // Column Visibility state
    const [hiddenCols, setHiddenCols] = useState([]);
    const [showColPicker, setShowColPicker] = useState(false);

    useEffect(() => {
        fetchJobPositions(appliedFilters);
    }, [fetchJobPositions, appliedFilters]);

    // Format data for the table
    const tableData = useMemo(() => {
        let filtered = jobPositions || [];
        return filtered.map((pos, idx) => ({
            id: pos.id,
            index: idx + 1,
            rank: pos.rank_name || "Unknown",
            company: pos.company_name || "N/A",
            vessel: pos.ship_name || "N/A",
            status: pos.status || "Open",
            required: pos.quantity || 1,
            signed: pos.filled_slots || 0,
            remaining: pos.remaining_slots || 0,
            assigned_to: pos.assigned_to && pos.assigned_to.length > 0 ? pos.assigned_to.join(", ") : "None",
            salary: pos.salary_min || pos.salary_max 
                ? `${pos.currency || '$'}${pos.salary_min || 0} - ${pos.salary_max || '...'}`
                : "Not specified",
            raw: pos
        }));
    }, [jobPositions]);

    const handleAdd = () => {
        setSelectedVacancy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        setSelectedVacancy(row.raw);
        setIsModalOpen(true);
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete the vacancy for ${row.rank}?`)) {
            await deleteJobPosition(row.id);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} vacancies?`)) {
            try {
                for (const id of selectedIds) {
                    await deleteJobPosition(id);
                }
                setSelectedIds([]);
                setShowBulkDelete(false);
            } catch (err) {
                console.error("Bulk delete failed", err);
            }
        }
    };

    const handleExportExcel = () => {
        exportToExcel(tableData.map(t => ({
            Rank: t.rank,
            Company: t.company,
            Vessel: t.vessel,
            Status: t.status,
            Required: t.required,
            Signed: t.signed,
            Remaining: t.remaining,
            AssignedTo: t.assigned_to,
            Salary: t.salary
        })), "job_vacancies.xlsx", "Vacancies");
    };

    const handleExportPdf = () => {
        const pdfCols = [
            { header: "Rank", key: "rank" },
            { header: "Principal", key: "company" },
            { header: "Vessel", key: "vessel" },
            { header: "Status", key: "status" },
            { header: "Required", key: "required" },
            { header: "Remaining", key: "remaining" }
        ];
        generateStatPdfReport("Job Vacancies Report", pdfCols, tableData);
    };

    const handleModalSubmit = async (data) => {
        if (selectedVacancy) {
            await updateJobPosition(selectedVacancy.id, data);
        } else {
            try {
                await createJobPosition(data);
            } catch (err) {
                console.error("Failed to create vacancy directly:", err);
                notify.error("Could not create vacancy. It may require a Job Order assignment.");
                throw err;
            }
        }
    };

    const handlePageChange = (newPage) => {
        fetchJobPositions({ ...appliedFilters, page: newPage });
    };

    const columns = [
        { key: "index", label: "#", width: 60, sortable: false, render: (val) => val },
        { key: "rank", label: "Rank", sortable: true },
        { key: "company", label: "Principal", sortable: true },
        { key: "vessel", label: "Vessel / Vessel", sortable: true },
        { 
            key: "status", 
            label: "Status", 
            sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    val === 'Open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    val === 'Closed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                    {val}
                </span>
            )
        },
        { key: "required", label: "Required", sortable: true },
        { key: "signed", label: "Signed", sortable: true },
        { key: "remaining", label: "Remaining", sortable: true },
        { key: "assigned_to", label: "Assigned To", sortable: false },
        { key: "salary", label: "Salary Range", sortable: false },
        {
            key: "actions",
            label: "Actions",
            width: 100,
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleDelete(row)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        }
    ];

    const filterFields = [
        { key: "rank", label: "Rank", type: "text", placeholder: "Search rank..." },
        { key: "company", label: "Principal", type: "text", placeholder: "Search company..." },
        { key: "status", label: "Status", type: "select", options: [
            { value: "Open", label: "Open" },
            { value: "Closed", label: "Closed" },
            { value: "Hold", label: "Hold" }
        ] }
    ];

    // Filter columns based on hiddenCols
    const visibleColumns = columns.filter(col => !hiddenCols.includes(col.key));

    const headerHeight = Math.round(80 * scale);

    return (
        <main style={{...getMainContainerStyles(scale, headerHeight), minWidth: 0}} className="flex flex-col h-full animate-in fade-in duration-300">
            <style>{generateAllPageStyles(scale)}</style>
            {/* Header section matching Principal.jsx style */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/10 dark:to-purple-400/10 border border-indigo-500/20">
                        <Briefcase size={24} className="text-indigo-600 dark:text-indigo-400 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Job Vacancies</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 m-0">
                            Manage all active and past job vacancies
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="icon" onClick={handleExportPdf} title="Export PDF" scale={scale} style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FileText size={16} className="text-red-500" />
                    </Button>
                    <Button variant="icon" onClick={handleExportExcel} title="Export Excel" scale={scale} style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                        <Download size={16} className="text-emerald-500" />
                    </Button>
                    <Button variant="icon" onClick={() => fetchJobPositions(appliedFilters)} title="Refresh" scale={scale} style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }}>
                        <RefreshCw size={16} />
                    </Button>
                    
                    {canCreate && (
                        <Button onClick={handleAdd} variant="primary" scale={scale} style={{ minHeight: 30, height: 30, padding: "0 14px", fontSize: 13, borderRadius: 8, fontWeight: 500 }}>
                            Add Vacancy
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                actions={[
                    {
                        label: "Delete Selected",
                        icon: <Trash2 size={16} />,
                        onClick: () => setShowBulkDelete(true),
                        variant: "danger",
                        hidden: !canDelete
                    }
                ]}
            />

            {/* Content area with Advanced Filters & Table */}
            <DataTableLayout
                columns={columns}
                storageKey="job_vacancies"
                fields={filterFields}
                filters={activeFilters}
                onFilterChange={(k, v) => setActiveFilters(prev => ({ ...prev, [k]: v }))}
                onApplyFilters={() => {
                    setAppliedFilters(activeFilters);
                }}
                onClearFilters={() => {
                    setActiveFilters({ rank: "", status: "", company: "" });
                    setAppliedFilters({});
                }}
            >
                <AdvancedDataTable
                    data={tableData}
                    columns={visibleColumns}
                    keyField="id"
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onRowClick={(row) => {
                        if (canEdit) handleEdit(row);
                    }}
                    isLoading={loading}
                    emptyStateMessage="No vacancies found."
                />
            </DataTableLayout>

            <div className="mt-4">
                <Pagination
                    page={pagination.currentPage}
                    pageSize={10}
                    total={pagination.count || tableData.length}
                    onChange={handlePageChange}
                    scale={scale}
                    showInfo={true}
                />
            </div>

            {/* Modals */}
            <JobPositionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedVacancy}
                scale={scale}
            />

            {/* Bulk Delete Confirmation */}
            {showBulkDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Confirm Bulk Delete</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to delete {selectedIds.length} vacancies? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleBulkDelete}>Delete All</Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default JobVacanciesPage;
