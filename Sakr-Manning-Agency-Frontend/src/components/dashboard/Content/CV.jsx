import React, { useState, useEffect, useMemo, useCallback } from "react";
import { exportToExcel } from "../../../utils/exportHelpers";
import ConfirmDialog from "../Components/Common/ConfirmDialog";
import Pagination from "../../common/Pagination";
import useNotification from "../hooks/useNotification";
import usePermissions from "../../../hooks/dashboard/usePermissions";
import useCVDocuments from "../../../hooks/dashboard/useCVDocuments";
import CVFormModal from "../Components/Modal/CVFormModal";
import CVViewModal from "../Components/Modal/ViewModal/CVViewModal";
import { StatCard } from "../Components/Cards/StatCard";
import LoadingScreen from "../Components/Common/LoadingScreen";
import { COLORS } from "../Constants";
import {
  FileText, CheckCircle2, Clock, XCircle, Search, Filter,
  Download, Plus, Edit2, Trash2, RefreshCw, Eye, User
} from "lucide-react";

import { AdvancedDataTable } from "../Components/Data/AdvancedDataTable";
import { DataTableLayout } from "../Components/Data/DataTableLayout";
import { BulkActionBar } from "../Components/Data/BulkActionBar";
import { generateStatPdfReport } from "../../../utils/pdfReportGenerator";

export function CVManagement({ scale = 1, isMobile = false, initialItemData }) {
  const { notify } = useNotification();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    documents,
    loading,
    pagination,
    fetchDocuments,
    setDocumentStatus,
    downloadDocument,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useCVDocuments();

  // Modal state
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCV, setViewingCV] = useState(null);
  
  // Single Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  // Bulk Selection & Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("Pending");

  // Handle initial item navigation
  const hasOpenedInitial = React.useRef(false);
  useEffect(() => {
    if (initialItemData && initialItemData.id && !loading && !hasOpenedInitial.current) {
      hasOpenedInitial.current = true;
      const cv = documents.find(d => d.id === initialItemData.id);
      if (cv) {
        setViewingCV(cv);
        setShowViewModal(true);
      } else {
        const loadAndOpen = async () => {
          try {
             const result = await fetchDocuments({ search: initialItemData.id });
             if (result && result.success && result.data && result.data.length > 0) {
               setViewingCV(result.data[0]);
               setShowViewModal(true);
             }
          } catch (e) {
            console.log("Could not load initial item in CVs", e);
          }
        };
        loadAndOpen();
      }
    }
  }, [initialItemData, documents, loading, fetchDocuments]);

  const [activeFilters, setActiveFilters] = useState({});

  // Load documents on mount
  useEffect(() => {
    fetchDocuments({ page: 1 });
  }, []);

  const buildBackendFilters = useCallback((vals) => {
    const backend = {};
    if (vals.search) {
      if (vals.search.includes("@")) {
        backend.email = vals.search.trim();
      } else {
        backend.name = vals.search.trim();
      }
    }
    if (vals.status) backend.status = vals.status;
    if (vals.position) backend.position = vals.position;
    return backend;
  }, []);

  // Filter fields configuration for AdvancedFilterBar
  const filterFields = [
    { key: "search", label: "Search", type: "search", placeholder: "Search by name or email..." },
    { key: "status", label: "Status", type: "select", placeholder: "All Statuses", options: [
      { label: "Pending", value: "Pending" },
      { label: "Active", value: "Active" },
      { label: "Blacklist", value: "Blacklist" },
    ]},
    { key: "position", label: "Position", type: "select", placeholder: "All Positions", options: [
      { label: "Master", value: "Master" },
      { label: "Chief Officer", value: "Chief Officer" },
      { label: "Second Officer", value: "Second Officer" },
      { label: "Chief Engineer", value: "Chief Engineer" },
      { label: "Oiler", value: "Oiler" },
      { label: "Bosun", value: "Bosun" },
      { label: "Able Seaman", value: "Able Seaman" },
    ]}
  ];

  const handleApplyFilters = useCallback((filtersObj) => {
    setActiveFilters(filtersObj);
    fetchDocuments({ ...buildBackendFilters(filtersObj), page: 1 });
  }, [fetchDocuments, buildBackendFilters]);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchDocuments({ ...buildBackendFilters(activeFilters), page: newPage });
    },
    [fetchDocuments, buildBackendFilters, activeFilters]
  );

  // ── Transform API response into table rows ──
  const cvData = useMemo(() => {
    return (documents || []).map((doc, index) => ({
      index: (pagination.currentPage - 1) * pagination.pageSize + index + 1,
      id: doc.id,
      name: doc.name || "—",
      generated_id: doc.generated_id || "—",
      email: doc.email || "—",
      phone: doc.phone_number || "—",
      position: doc.position || "—",
      file: doc.file || null,
      fileLabel: doc.file ? doc.file.split("/").pop().split("_").pop() : "No file",
      date: doc.created_at
        ? new Date(doc.created_at).toLocaleDateString("en-GB")
        : "—",
      status: doc.status || "Pending",
      _raw: doc,
    }));
  }, [documents, pagination.currentPage, pagination.pageSize]);

  // ── Statistics ──
  const statisticsData = useMemo(() => {
    const counts = cvData.reduce(
      (acc, item) => {
        const s = item.status;
        acc[s] = (acc[s] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 }
    );

    const pdfColumns = [
      { key: "name", header: "Candidate Name" },
      { key: "email", header: "Email Address" },
      { key: "phone", header: "Phone Number" },
      { key: "position", header: "Position" },
      { key: "status", header: "Status" }
    ];

    return [
      { title: "Total CVs", value: counts.total || 0, trend: "All Submissions", icon: <FileText size={20} />, accent: COLORS.primary || "#1E40AF", onClick: () => generateStatPdfReport("Total CVs", pdfColumns, cvData) },
      { title: "Pending", value: counts["Pending"] || 0, trend: "Awaiting Review", icon: <Clock size={20} />, accent: "#F59E0B", onClick: () => generateStatPdfReport("Pending CVs", pdfColumns, cvData.filter(d => d.status === "Pending")) },
      { title: "Active", value: counts["Active"] || 0, trend: "Approved Candidates", icon: <CheckCircle2 size={20} />, accent: "#10B981", onClick: () => generateStatPdfReport("Active Candidates", pdfColumns, cvData.filter(d => d.status === "Active")) },
      { title: "Blacklist", value: counts["Blacklist"] || 0, trend: "Rejected Profiles", icon: <XCircle size={20} />, accent: "#EF4444", onClick: () => generateStatPdfReport("Blacklisted Profiles", pdfColumns, cvData.filter(d => d.status === "Blacklist")) },
    ];
  }, [cvData]);

  // ── Single Actions ──
  const handleStatusChange = useCallback(async (id, newStatus) => {
    const result = await setDocumentStatus(id, newStatus);
    if (result.success) {
      notify.success(`Status updated to ${newStatus}`);
      fetchDocuments({ page: pagination.currentPage });
    }
  }, [setDocumentStatus, fetchDocuments, pagination.currentPage, notify]);

  const handleView = useCallback((row) => {
    const doc = row._raw;
    if (doc) {
      setViewingCV(doc);
      setShowViewModal(true);
    }
  }, []);

  const handleDownload = useCallback(async (row) => {
    const doc = row._raw;
    if (doc?.file) {
      await downloadDocument(doc.id, doc.file.split("/").pop());
      notify.success("CV downloaded successfully!");
    } else {
      notify.error("No file available for download");
    }
  }, [downloadDocument, notify]);

  const handleAddCV = useCallback(() => {
    if (!canCreate) { notify.error("No permission"); return; }
    setSelectedCV(null);
    setShowCVModal(true);
  }, [canCreate, notify]);

  const handleEditCV = useCallback((row) => {
    if (!canEdit) { notify.error("No permission"); return; }
    setSelectedCV(row._raw);
    setShowCVModal(true);
  }, [canEdit, notify]);

  const handleSaveCV = async (cvData) => {
    if (selectedCV) {
      const result = await updateDocument(selectedCV.id, cvData);
      if (result.success) setShowCVModal(false);
    } else {
      const result = await createDocument(cvData);
      if (result.success) setShowCVModal(false);
    }
  };

  const handleDelete = useCallback((id) => {
    if (!canDelete) { notify.error("No permission"); return; }
    setCvToDelete(id);
    setShowDeleteConfirm(true);
  }, [canDelete, notify]);

  const handleConfirmDelete = useCallback(async () => {
    if (!cvToDelete) return;
    const result = await deleteDocument(cvToDelete);
    if (result.success) {
      notify.success("CV deleted successfully");
      setShowDeleteConfirm(false);
      setCvToDelete(null);
      fetchDocuments({ page: pagination.currentPage });
    }
  }, [cvToDelete, deleteDocument, fetchDocuments, pagination.currentPage, notify]);

  // ── Bulk Actions ──
  const handleBulkExport = useCallback(() => {
    try {
      const selectedData = cvData.filter(item => selectedIds.includes(item.id)).map(({ id, _raw, file, ...rest }) => rest);
      exportToExcel(selectedData, `CVs_Export_${new Date().toISOString().split("T")[0]}.xlsx`, "CVs");
      notify.success(`${selectedData.length} CVs exported to Excel!`);
      setSelectedIds([]);
    } catch (error) {
      notify.error("Failed to export data");
    }
  }, [cvData, selectedIds, notify]);

  const handleBulkExportPdf = useCallback(() => {
    try {
      const selectedData = cvData.filter(item => selectedIds.includes(item.id));
      const pdfCols = [
        { key: "name", header: "Candidate Name" },
        { key: "email", header: "Email Address" },
        { key: "phone", header: "Phone Number" },
        { key: "position", header: "Position" },
        { key: "status", header: "Status" }
      ];
      generateStatPdfReport(`CVs_Export_Selected`, pdfCols, selectedData);
      notify.success(`${selectedData.length} CVs exported to PDF!`);
      setSelectedIds([]);
    } catch (error) {
      notify.error("Failed to export PDF");
    }
  }, [cvData, selectedIds, notify]);

  const handleExportExcel = useCallback(() => {
    try {
      const dataToExport = cvData.map(({ id, _raw, file, ...rest }) => rest);
      exportToExcel(dataToExport, `CVs_Export_${new Date().toISOString().split("T")[0]}.xlsx`, "CVs");
      notify.success("CVs exported to Excel!");
    } catch (error) {
      notify.error("Failed to export data");
    }
  }, [cvData, notify]);

  const handleExportPdf = useCallback(() => {
    try {
      const pdfCols = [
        { key: "name", header: "Candidate Name" },
        { key: "email", header: "Email Address" },
        { key: "phone", header: "Phone Number" },
        { key: "position", header: "Position" },
        { key: "status", header: "Status" }
      ];
      generateStatPdfReport(`CVs_Export`, pdfCols, cvData);
      notify.success("CVs exported to PDF!");
    } catch (error) {
      notify.error("Failed to export PDF");
    }
  }, [cvData, notify]);

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      // Execute deletions sequentially or Promise.all. For safety, sequentially.
      for (const id of selectedIds) {
        await deleteDocument(id);
      }
      notify.success(`${selectedIds.length} CVs deleted successfully`);
      setShowBulkDeleteConfirm(false);
      setSelectedIds([]);
      fetchDocuments({ page: pagination.currentPage });
    } catch (err) {
      notify.error("Some deletions failed");
    }
  }, [selectedIds, deleteDocument, notify, fetchDocuments, pagination.currentPage]);

  const handleConfirmBulkStatus = useCallback(async () => {
    try {
      for (const id of selectedIds) {
        await setDocumentStatus(id, bulkStatusValue);
      }
      notify.success(`${selectedIds.length} CVs updated to ${bulkStatusValue}`);
      setShowBulkStatusModal(false);
      setSelectedIds([]);
      fetchDocuments({ page: pagination.currentPage });
    } catch (err) {
      notify.error("Some status updates failed");
    }
  }, [selectedIds, bulkStatusValue, setDocumentStatus, notify, fetchDocuments, pagination.currentPage]);

  // ── Advanced Data Table Configuration ──
  const getStatusStyles = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case "pending": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      case "active": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "blacklist": return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
      default: return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const columns = [
    { key: "index", label: "#", render: (val) => <span className="text-sm font-medium text-slate-500">{val}</span> },
    { key: "name", label: "Name / ID", render: (_, row) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-500">{row.generated_id}</span>
      </div>
    )},
    { key: "contact", label: "Contact Info", render: (_, row) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-700 dark:text-slate-300">{row.email}</span>
        <span className="text-xs text-slate-500 dark:text-slate-500">{row.phone}</span>
      </div>
    )},
    { key: "position", label: "Position", render: (val) => <span className="text-sm text-slate-700 dark:text-slate-300">{val}</span> },
    { key: "fileLabel", label: "Document", render: (val, row) => row.file ? (
      <button onClick={(e) => { e.stopPropagation(); handleDownload(row); }} className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        <FileText size={14} />
        <span className="truncate max-w-[120px]">{val}</span>
      </button>
    ) : <span className="text-sm text-slate-400">—</span> },
    { key: "status", label: "Status", render: (val, row) => (
      <div className="relative inline-block w-32" onClick={(e) => e.stopPropagation()}>
        <select
          value={val}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`appearance-none w-full border font-semibold text-xs px-3 py-1.5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${getStatusStyles(val)}`}
        >
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
          <option value="Blacklist">Blacklist</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    )},
    { key: "actions", label: "Actions", headerClassName: "text-right", cellClassName: "text-right", render: (_, row) => (
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30" title="View Details"><Eye size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDownload(row); }} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Download CV"><Download size={16} /></button>
        {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEditCV(row); }} className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30" title="Edit"><Edit2 size={16} /></button>}
        {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Delete"><Trash2 size={16} /></button>}
      </div>
    )}
  ];

  const bulkActions = [
    { label: "Update Status", icon: <Edit2 size={16} />, onClick: () => setShowBulkStatusModal(true) },
    { label: "Export Excel", icon: <Download size={16} />, onClick: handleBulkExport },
    { label: "Export PDF", icon: <Download size={16} />, onClick: handleBulkExportPdf },
    { label: "Delete", icon: <Trash2 size={16} />, variant: "danger", onClick: () => setShowBulkDeleteConfirm(true) }
  ];

  if (loading && documents.length === 0) {
    return (
      <main className="flex-1 min-h-screen pt-[90px] px-6 lg:px-10 flex items-center justify-center">
        <LoadingScreen message="Loading CVs" subMessage="Fetching candidate documents..." />
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 min-h-screen pt-[90px] px-6 lg:px-10 pb-24 overflow-x-hidden relative">
      
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Applicants Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-sans">
            Manage and review submitted candidate CVs.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => fetchDocuments({ page: pagination?.currentPage || 1 })} className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleExportPdf} className="flex items-center justify-center h-10 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm" title="Export PDF">
            Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center justify-center h-10 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm" title="Export Excel">
            Export Excel
          </button>
          {canCreate && (
            <button onClick={handleAddCV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20">
              <Plus size={18} /><span>Add CV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="mb-8">
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statisticsData.map((card, idx) => (
            <div key={idx} className="snap-start flex-shrink-0" title="Click to download PDF report">
              <StatCard title={card.title} value={card.value.toString()} trend={card.trend} icon={card.icon} accentColor={card.accent} onClick={card.onClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filter Bar and Table */}
      <DataTableLayout
        columns={columns}
        storageKey="cv_documents"
        fields={filterFields}
        filters={activeFilters}
        onFilterChange={(k, v) => setActiveFilters(prev => ({ ...prev, [k]: v }))}
        onApplyFilters={() => {
          handleApplyFilters(activeFilters);
        }}
        onClearFilters={() => {
          setActiveFilters({});
          handleApplyFilters({});
        }}
      >
        <AdvancedDataTable 
          data={cvData} 
          columns={columns} 
          keyField="id"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={handleView}
          isLoading={loading}
        />
      </DataTableLayout>

      {/* Pagination */}
      {pagination.count > 0 && (
        <div className="flex justify-center mt-6">
          <Pagination page={pagination.currentPage} pageSize={pagination.pageSize} total={pagination.count} onChange={handlePageChange} scale={scale} showInfo={true} />
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar 
        selectedCount={selectedIds.length} 
        onClearSelection={() => setSelectedIds([])} 
        actions={bulkActions} 
      />

      {/* Modals & Dialogs */}
      <CVFormModal isOpen={showCVModal} onClose={() => setShowCVModal(false)} cv={selectedCV} onSave={handleSaveCV} scale={scale} />

      {showViewModal && (
        <CVViewModal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setViewingCV(null); }} cv={viewingCV} onDelete={(id) => { setShowViewModal(false); handleDelete(id); }} onDownload={handleDownload} scale={scale} canDelete={canDelete} />
      )}

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setCvToDelete(null); }} onConfirm={handleConfirmDelete} title="Delete CV" message="Are you sure you want to delete this CV? This action cannot be undone." confirmLabel="Delete" variant="danger" scale={scale} loading={loading} />

      <ConfirmDialog isOpen={showBulkDeleteConfirm} onClose={() => setShowBulkDeleteConfirm(false)} onConfirm={handleConfirmBulkDelete} title="Bulk Delete CVs" message={`Are you sure you want to delete ${selectedIds.length} selected CVs? This action cannot be undone.`} confirmLabel="Delete All" variant="danger" scale={scale} loading={loading} />

      {/* Bulk Status Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">Update Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Change the status for {selectedIds.length} selected candidate(s).</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Status</label>
              <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer">
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Blacklist">Blacklist</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowBulkStatusModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleConfirmBulkStatus} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">Apply Status</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

