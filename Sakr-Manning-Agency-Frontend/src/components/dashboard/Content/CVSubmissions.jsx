/* eslint-disable no-unused-vars */

// Content/CVSubmissions.jsx — Seafarer Applicants / CV Submission Pipeline
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AdvancedDataTable } from "../Components/Data/AdvancedDataTable";
import { DataTableLayout } from "../Components/Data/DataTableLayout";
import { BulkActionBar } from "../Components/Data/BulkActionBar";
import { StatisticsCard } from "../Components/Cards/StatisticsCards";
import { StatCard } from "../Components/Cards/StatCard";
import { generateStatPdfReport } from "../../../utils/pdfReportGenerator";
import { ASSETS } from "../../../utils/constants";
import { exportToExcel, exportToJSON } from "../../../utils/exportHelpers";
import { getMediaUrl } from "../../../utils/fileHelpers";
import {
    generateAllPageStyles,
    getMainContainerStyles,
    getPageTitleStyles,
    getRowBetweenStyles,
} from "../Styles/cssClasses";
import Pagination from "../../common/Pagination";

import Button from "../Components/Common/Button";

import SavedFilters from "../Components/Common/SavedFilters";
import ConfirmDialog from "../Components/Common/ConfirmDialog";
import useNotification from "../hooks/useNotification";
import useCVSubmissions from "../../../hooks/dashboard/useCVSubmissions";
import CVSubmissionFormModal from "../Components/Modal/CVSubmissionFormModal";
import DocumentUploadModal from "../Components/AI/DocumentUploadModal";
import { CVSubmissionEditModal } from "../Components/Modal/ViewModal/CVSubmissionEditModal";
import GenerateContractModal from "../Components/Modal/GenerateContractModal";
import { generateBrandedCVPdf } from "../../../utils/dashboard/brandedCVGenerator";
import { useCompanies } from "../../../hooks/dashboard/useCompanies";
import { useRanks } from "../../../hooks/dashboard/useRanks";
import { PieChart, Users, User, ChevronDown, ChevronUp, Edit2, Trash2, Eye, Download, FileText, CheckCircle2, Clock, XCircle, Search, Star, Briefcase, Calendar } from "lucide-react";
import useInterviews from "../../../hooks/dashboard/useInterviews";
import InterviewFormModal from "../Components/Modal/InterviewFormModal";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

// ── Status pipeline (matches backend choice field) ──────────────────────────
const STATUS_PIPELINE = [
    "Pending",
    "Under Review",
    "Interviewed",
    "Shortlisted",
    "Approved",
    "Hired",
    "Rejected",
];

// Status is read directly from submission.status
const mapStatusToState = (status) => {
    if (status && STATUS_PIPELINE.includes(status)) return status;
    return "Pending";
};

// Thin button style — overrides the default 40 px height to a slimmer toolbar size
const thinBtn = {
    minHeight: 30,
    height: 30,
    padding: "0 14px",
    fontSize: 13,
    borderRadius: 8,
    fontWeight: 500,
    lineHeight: "30px",
};

export function CVSubmissionsManagement({ scale = 1, isMobile = false, initialItemData }) {
    const { notify } = useNotification();
    const {
        submissions: backendSubmissions,
        loading,
        fetchSubmissions,
        getSubmissionById,
        updateStatus,
        createSubmission,
        updateSubmission,
        deleteSubmission,
        pagination,
    } = useCVSubmissions();
    const { companies, fetchCompanies } = useCompanies();
    const { ranks, fetchRanks } = useRanks();

    // Permissions (Fallback for now, or check from context if available)
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    // ── Modal states ──────────────────────────────────────────────────────────
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showGenerateContractModal, setShowGenerateContractModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Interview Modal States
    const { createInterview } = useInterviews();
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedSubmissionForInterview, setSelectedSubmissionForInterview] = useState(null);
    const handleSaveInterview = async (formData) => {
        try {
            await createInterview(formData);
            addNotification("Interview scheduled successfully", "success");
            setShowInterviewModal(false);
            setSelectedSubmissionForInterview(null);
        } catch (err) {
            addNotification(err?.message || "Failed to schedule interview", "error");
        }
    };

    // ── Bulk Actions State ────────────────────────────────────────────────────
    const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
    const [bulkStatusValue, setBulkStatusValue] = useState("Pending");
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // ── Expansion & Columns ───────────────────────────────────────────────────
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [showColPicker, setShowColPicker] = useState(false);
    const [hiddenCols, setHiddenCols] = useState([
      "cover_letter", "availability_date", "submitted_date", "reviewed_by", "reviewed_date", "notes", "rating", "created_at", "updated_at"
    ]);
    const [selectedIds, setSelectedIds] = useState([]);
    // ── Filter states ─────────────────────────────────────────────────────────
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Keys match BE params: position (int rank ID), status (iexact), date range
    const [filters, setFilters] = useState({
        user: "",
        status: "Pending",
        position: "",
        submitted_date_from: "",
        submitted_date_to: ""
    });
    const [activeFilters, setActiveFilters] = useState({
        user: "",
        status: "Pending",
        position: "",
        submitted_date_from: "",
        submitted_date_to: ""
    });
    const [savedPresets, setSavedPresets] = useState([]);

    // ── Data fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchSubmissions({ status: "Pending" });
        fetchCompanies({ page_size: 1000 });
        fetchRanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle initial item navigation
    const hasOpenedInitial = useRef(false);
    useEffect(() => {
        if (initialItemData && !loading && !hasOpenedInitial.current) {
            hasOpenedInitial.current = true;
            const loadAndOpen = async () => {
                try {
                    let result = null;
                    if (initialItemData.source === "needs_attention") {
                        // The ID is a user ID. Find the submission by user ID.
                        const userResult = await fetchSubmissions({ user: initialItemData.id });
                        if (userResult.success && userResult.data && userResult.data.length > 0) {
                             result = await getSubmissionById(userResult.data[0].id);
                        } else {
                             // Do nothing. No submission exists for this user yet.
                             return;
                        }
                    } else if (initialItemData.source === "CV submitted") {
                        // We might only have the email. We can try to query by email or we just abort if we don't know the submission ID
                        if (initialItemData.email) {
                           const emailResult = await fetchSubmissions({ email: initialItemData.email });
                           if (emailResult.success && emailResult.data && emailResult.data.length > 0) {
                               result = await getSubmissionById(emailResult.data[0].id);
                           } else {
                               return;
                           }
                        } else {
                            return;
                        }
                    } else {
                        // Regular submission ID
                        result = await getSubmissionById(initialItemData.id);
                    }

                    if (result && result.success && result.data) {
                        setSelectedSubmission(result.data);
                        setShowViewModal(true);
                    }
                } catch (e) {
                    console.log("Could not load initial item in CVSubmissions", e);
                }
            };
            loadAndOpen();
        }
    }, [initialItemData, loading, getSubmissionById, fetchSubmissions]);

    // ── Filter handlers ───────────────────────────────────────────────────────
    const buildBackendFilters = useCallback((vals) => {
        const backend = {};
        if (vals.user) {
            backend.user = vals.user.trim();
        }
        if (vals.status) backend.status = vals.status;
        if (vals.position) backend.position = vals.position;
        if (vals.submitted_date_from) backend.submitted_date_from = vals.submitted_date_from;
        if (vals.submitted_date_to) backend.submitted_date_to = vals.submitted_date_to;
        return backend;
    }, []);

    const handleRefresh = useCallback(() => {
        fetchSubmissions({ ...buildBackendFilters(activeFilters), page: pagination?.currentPage || 1 });
    }, [fetchSubmissions, activeFilters, buildBackendFilters, pagination.currentPage]);

    useEffect(() => {
        const onGenerateContract = (e) => {
            setSelectedSubmission(e.detail);
            setShowGenerateContractModal(true);
        };
        document.addEventListener('generate-contract', onGenerateContract);
        return () => document.removeEventListener('generate-contract', onGenerateContract);
    }, []);

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const handleDownloadPdf = useCallback(async (row) => {
        try {
            const result = await getSubmissionById(row.id);
            if (result.success) {
                generateBrandedCVPdf(result.data);
                notify.success("PDF generated successfully!");
            } else {
                notify.error("Could not load full submission details for PDF generation");
            }
        } catch (err) {
            notify.error("Failed to generate PDF");
        }
    }, [getSubmissionById, notify]);

    const handleAddManual = useCallback(() => {
        if (!canCreate) { notify.error("You do not have permission to add applicants"); return; }
        setSelectedSubmission(null);
        setShowSubmissionModal(true);
    }, [canCreate, notify]);

    const handleAddAI = useCallback(() => {
        if (!canCreate) { notify.error("You do not have permission to upload CVs"); return; }
        setShowAIModal(true);
    }, [canCreate, notify]);

    const handleEdit = useCallback((row) => {
        if (!canEdit) { notify.error("You do not have permission to edit applicants"); return; }
        const submission = backendSubmissions.find((s) => s.id === row.id);
        if (submission) {
            setSelectedSubmission(submission);
            setShowSubmissionModal(true);
        }
        else notify.error("Submission data not found");
    }, [backendSubmissions, canEdit, notify]);



    const handleView = useCallback(async (row) => {
        setViewLoading(true);
        try {
            const result = await getSubmissionById(row.id);
            if (result.success) {
                setSelectedSubmission(result.data);
                setShowViewModal(true);
            } else {
                notify.error("Could not load submission details");
            }
        } catch {
            notify.error("Failed to load submission details");
        } finally {
            setViewLoading(false);
        }
    }, [getSubmissionById, notify]);

    const handleDelete = useCallback((id) => {
        if (!canDelete) { notify.error("You do not have permission to delete applicants"); return; }
        setSubmissionToDelete(id);
        setShowDeleteConfirm(true);
    }, [canDelete, notify]);

    const handleConfirmDelete = useCallback(async () => {
        if (!submissionToDelete) return;
        try {
            const result = await deleteSubmission(submissionToDelete);
            if (result.success) {
                notify.success("Submission deleted successfully");
                setShowDeleteConfirm(false);
                setSubmissionToDelete(null);
                fetchSubmissions({ page: pagination.currentPage });
            } else {
                notify.error("Failed to delete submission");
            }
        } catch {
            notify.error("Error deleting submission");
        }
    }, [submissionToDelete, deleteSubmission, fetchSubmissions, pagination.currentPage, notify]);

    // ── Bulk Action Handlers ──────────────────────────────────────────────────
    const handleConfirmBulkDelete = useCallback(async () => {
        try {
            for (const id of selectedIds) {
                await deleteSubmission(id);
            }
            notify.success(`${selectedIds.length} submissions deleted successfully`);
            setShowBulkDeleteConfirm(false);
            setSelectedIds([]);
            fetchSubmissions({ page: pagination.currentPage });
        } catch (err) {
            notify.error("Some deletions failed");
        }
    }, [selectedIds, deleteSubmission, notify, fetchSubmissions, pagination.currentPage]);

    const handleConfirmBulkStatus = useCallback(async () => {
        try {
            for (const id of selectedIds) {
                await updateStatus(id, bulkStatusValue);
            }
            notify.success(`${selectedIds.length} submissions updated to ${bulkStatusValue}`);
            setShowBulkStatusModal(false);
            setSelectedIds([]);
            fetchSubmissions({ page: pagination.currentPage });
        } catch (err) {
            notify.error("Some status updates failed");
        }
    }, [selectedIds, bulkStatusValue, updateStatus, notify, fetchSubmissions, pagination.currentPage]);


    const getStatusStyles = (statusVal) => {
        switch (statusVal?.toLowerCase()) {
            case "pending":
            case "under review":
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
            case "interviewed":
            case "shortlisted":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
            case "approved":
            case "hired":
                return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
            case "rejected":
                return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
        }
    };

    const handleStatusChange = useCallback(async (id, newStatus) => {
        const result = await updateStatus(id, newStatus);
        if (result.success) {
            notify.success(`Status updated to ${newStatus}`);
            handleRefresh();
        }
    }, [updateStatus, handleRefresh]);

    const handleSaveSubmission = async (data) => {
        if (selectedSubmission) {
            await updateSubmission(selectedSubmission.id, data);
        } else {
            await createSubmission(data);
        }
        setShowSubmissionModal(false);
        handleRefresh();
    };

    const handleAISuccess = () => {
        notify.success("CV processed and saved successfully");
        handleRefresh();
    };

    // ── Data transform (per field reference) ──────────────────────────────────
    const userData = useMemo(() => {
        return (backendSubmissions || []).map((submission, index) => {
            const state = mapStatusToState(submission.status);

            // Lookup names from reference lists
            const companyObj = companies.find(c => c.id === submission.company);
            const rankObj = ranks.find(r => r.id === submission.position);

            return {
                index: (pagination.currentPage - 1) * (pagination.pageSize || 50) + index + 1,
                id: submission.id,
                // name: `${submission.user_name.split(" ")[0]} ${submission.user_name.split(" ")[1]}` || "—",
                name: submission.user_name || "-",
                generatedId: submission.generated_id || "—",
                company: submission.company_name || companyObj?.company_name || (submission.company ? `ID: ${submission.company}` : "—"),
                position: submission.position_name || rankObj?.rank_name || rankObj?.name || (submission.position ? `ID: ${submission.position}` : "—"),
                codedRank: (() => {
                    if (submission.coded_rank?.length) {
                        const mappedCodes = submission.coded_rank.map((r) => {
                            if (r.assigned_code && r.rank_code && r.assigned_code !== r.rank_code) {
                                return `${r.assigned_code}`;
                            }
                            return r.assigned_code || r.rank_code || "";
                        }).filter(Boolean);

                        if (mappedCodes.length > 2) {
                            return `${mappedCodes.slice(0, 2).join(" / ")}...`;
                        }
                        if (mappedCodes.length > 0) {
                            return mappedCodes.join(" / ");
                        }
                    }

                    if (submission.assigned_code && submission.rank_code && submission.assigned_code !== submission.rank_code) {
                        return `${submission.assigned_code} `;
                    }
                    return submission.assigned_code || submission.rank_code || "—";
                })(),
                experience:
                    submission.experience_years !== undefined && submission.experience_years !== null
                        ? `${submission.experience_years} yr${submission.experience_years !== 1 ? "s" : ""}`
                        : "—",
                salary: submission.salary || submission.salary_display || (submission.expected_salary ? `${submission.expected_salary} USD` : "—"),
                state,
                date: submission.submitted_date
                    ? new Date(submission.submitted_date).toLocaleDateString("en-GB")
                    : "—",
                avatar: getMediaUrl(submission.user?.profile_image || submission.profile_image) || DEFAULT_AVATAR,
                _original: submission,
            };
        });
    }, [backendSubmissions, companies, ranks, pagination.currentPage, pagination.pageSize]);

    const handleBulkExport = useCallback(() => {
        try {
            const selectedData = userData.filter(item => selectedIds.includes(item.id)).map(({ id, _raw, avatar, index, ...rest }) => rest);
            exportToExcel(selectedData, `CVSubmissions_Export_${new Date().toISOString().split("T")[0]}.xlsx`, "Submissions");
            notify.success(`${selectedData.length} Submissions exported to Excel!`);
            setSelectedIds([]);
        } catch (error) {
            notify.error("Failed to export data");
        }
    }, [userData, selectedIds, notify]);

    const bulkActions = useMemo(() => [
        { label: "Update Status", icon: <Edit2 size={16} />, onClick: () => setShowBulkStatusModal(true) },
        { label: "Export", icon: <Download size={16} />, onClick: handleBulkExport },
        { label: "Delete", icon: <Trash2 size={16} />, variant: "danger", onClick: () => setShowBulkDeleteConfirm(true) }
    ], [setShowBulkStatusModal, handleBulkExport, setShowBulkDeleteConfirm]);

    // ── Statistics (full pipeline) ────────────────────────────────────────────
    const statisticsData = useMemo(() => {
        const counts = userData.reduce((acc, item) => {
            acc[item.state] = (acc[item.state] || 0) + 1;
            return acc;
        }, {});

        return STATUS_PIPELINE.map((status, i) => {
            const count = counts[status] || 0;
            const COLORS = ["#A2A2A2", "#F59E0B", "#8B5CF6", "#3B82F6", "#0065AF", "#52C93F", "#E74C3C"];
            return {
                key: status.toLowerCase().replace(/\s+/g, "_"),
                label: `${status} (${count})`,
                value: count,
                color: COLORS[i],
            };
        });
    }, [userData]);

    const statCardsData = useMemo(() => {
        const counts = userData.reduce((acc, item) => {
            acc[item.state] = (acc[item.state] || 0) + 1;
            acc.total = (acc.total || 0) + 1;
            return acc;
        }, { total: 0 });

        const pdfColumns = [
            { key: "name", header: "Applicant Name" },
            { key: "generatedId", header: "ID" },
            { key: "company", header: "Principal" },
            { key: "position", header: "Position" },
            { key: "state", header: "Status" }
        ];

        return [
            { title: "Total Submissions", value: counts.total || 0, trend: "All Applications", icon: <FileText size={20} />, accent: "#3B82F6", onClick: () => generateStatPdfReport("Total Submissions", pdfColumns, userData) },
            { title: "Pending", value: counts["Pending"] || 0, trend: "Awaiting Review", icon: <Clock size={20} />, accent: "#F59E0B", onClick: () => generateStatPdfReport("Pending Submissions", pdfColumns, userData.filter(d => d.state === "Pending")) },
            { title: "Under Review", value: counts["Under Review"] || 0, trend: "Being Evaluated", icon: <Search size={20} />, accent: "#8B5CF6", onClick: () => generateStatPdfReport("Under Review Submissions", pdfColumns, userData.filter(d => d.state === "Under Review")) },
            { title: "Interviewed", value: counts["Interviewed"] || 0, trend: "Completed Interview", icon: <Users size={20} />, accent: "#3B82F6", onClick: () => generateStatPdfReport("Interviewed Submissions", pdfColumns, userData.filter(d => d.state === "Interviewed")) },
            { title: "Shortlisted", value: counts["Shortlisted"] || 0, trend: "Top Candidates", icon: <Star size={20} />, accent: "#0065AF", onClick: () => generateStatPdfReport("Shortlisted Submissions", pdfColumns, userData.filter(d => d.state === "Shortlisted")) },
            { title: "Approved", value: counts["Approved"] || 0, trend: "Approved Profiles", icon: <CheckCircle2 size={20} />, accent: "#10B981", onClick: () => generateStatPdfReport("Approved Submissions", pdfColumns, userData.filter(d => d.state === "Approved")) },
            { title: "Hired", value: counts["Hired"] || 0, trend: "Successfully Hired", icon: <Briefcase size={20} />, accent: "#52C93F", onClick: () => generateStatPdfReport("Hired Submissions", pdfColumns, userData.filter(d => d.state === "Hired")) },
            { title: "Rejected", value: counts["Rejected"] || 0, trend: "Rejected Profiles", icon: <XCircle size={20} />, accent: "#EF4444", onClick: () => generateStatPdfReport("Rejected Submissions", pdfColumns, userData.filter(d => d.state === "Rejected")) },
        ];
    }, [userData]);

    // ── Table columns (matching "In List" fields) ─────────────────────────────
    const columns = useMemo(() => [
        {
            key: "index",
            label: "#",
            width: 60,
            sortable: false,
            render: (val) => val,
        },
        {
            key: "name",
            label: "Name",
            width: 360,
            sortable: true,
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    {row.avatar && row.avatar !== DEFAULT_AVATAR ? (
                        <img src={row.avatar} alt={val} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <span>{val}</span>
                </div>
            ),
        },
        {
            key: "generatedId",
            label: "ID",
            width: 200,
            sortable: false,
            render: (val) => val,
        },
        {
            key: "company",
            label: "Principal",
            width: 300,
            sortable: true,
            render: (val) => val,
        },
        {
            key: "position",
            label: "Position",
            width: 300,
            sortable: true,
            render: (val) => (typeof val === "string" && val.split("/").length > 3) ? `${val.split("/")[0]} / ${val.split("/")[1]} / ${val.split("/")[2]} / ...` : (val || "—"),
        },
        {
            key: "codedRank",
            label: "Rank Code",
            width: 200,
            sortable: false,
            render: (val) => val,
        },
        {
            key: "experience",
            label: "Experience",
            width: 95,
            sortable: true,
            render: (val) => val,
        },
        {
            key: "salary",
            label: "Salary",
            width: 120,
            sortable: true,
            render: (val) => val,
        },
        {
            key: "state",
            label: "Status",
            width: 130,
            headerAlign: "center",
            headerTextAlign: "center",
            sortable: true,
            render: (val, row) => (
                <div className="relative inline-block w-32" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={val}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className={`appearance-none w-full border font-semibold text-xs px-3 py-1.5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${getStatusStyles(val)}`}
                    >
                        {STATUS_PIPELINE.map((s) => (
                            <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{s}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 opacity-60">
                        <ChevronDown size={14} />
                    </div>
                </div>
            ),
        },
        { key: "cover_letter", label: "Cover Letter", width: 200, sortable: false, render: (_, row) => <div className="truncate max-w-[150px]" title={row.cover_letter}>{row.cover_letter || "-"}</div> },
        { key: "availability_date", label: "Availability Date", width: 140, sortable: true, render: (_, row) => row.availability_date ? new Date(row.availability_date).toLocaleDateString() : "-" },
        { key: "submitted_date", label: "Submitted Date", width: 140, sortable: true, render: (_, row) => row.submitted_date ? new Date(row.submitted_date).toLocaleDateString() : "-" },
        { key: "reviewed_by", label: "Reviewed By", width: 150, sortable: false, render: (_, row) => row.reviewed_by || "-" },
        { key: "reviewed_date", label: "Reviewed Date", width: 140, sortable: true, render: (_, row) => row.reviewed_date ? new Date(row.reviewed_date).toLocaleDateString() : "-" },
        { key: "notes", label: "Notes", width: 200, sortable: false, render: (_, row) => <div className="truncate max-w-[150px]" title={row.notes}>{row.notes || "-"}</div> },
        { key: "rating", label: "Rating", width: 100, sortable: true, render: (_, row) => row.rating || "-" },
        { key: "created_at", label: "Created At", width: 140, sortable: true, render: (_, row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
        { key: "updated_at", label: "Updated At", width: 140, sortable: true, render: (_, row) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
        {
            key: "actions",
            label: "Actions",
            width: 160,
            render: (_, row) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Details"><Eye size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadPdf(row); }} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Download PDF"><Download size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedSubmissionForInterview(row); setShowInterviewModal(true); }} className="p-1.5 text-purple-500 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Schedule Interview"><Calendar size={18} /></button>
                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>}
                    {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>}
                </div>
            )
        },
    ], [canEdit, canDelete, handleView, handleEdit, handleDelete, handleStatusChange, handleDownloadPdf]);




    const handleApplyAdvancedFilters = useCallback((filtersObj) => {
        setActiveFilters(filtersObj);
        fetchSubmissions({ ...buildBackendFilters(filtersObj), page: 1 });
    }, [buildBackendFilters, fetchSubmissions]);

    const handleResetFilters = useCallback(() => {
        const empty = { user: "", status: "Pending", position: "", submitted_date_from: "", submitted_date_to: "" };
        setFilters(empty);
        setActiveFilters(empty);
        setIsSidebarOpen(false);
        fetchSubmissions({ status: "Pending", page: 1 });
    }, [fetchSubmissions]);

    // ── Saved preset handlers ─────────────────────────────────────────────────
    const handleApplyPreset = useCallback((preset) => {
        setFilters(preset);
        setActiveFilters(preset);
        fetchSubmissions({ ...buildBackendFilters(preset), page: 1 });
    }, [fetchSubmissions, buildBackendFilters]);

    const handleSavePreset = useCallback((name, vals) => setSavedPresets((p) => [...p, { name, filters: vals }]), []);
    const handleDeletePreset = useCallback((name) => setSavedPresets((p) => p.filter((x) => x.name !== name)), []);

    // ── Export handlers ───────────────────────────────────────────────────────
    const handleExportExcel = useCallback(() => {
        try {
            const allCols = [
                { key: "name", header: "Applicant Name" },
                { key: "generatedId", header: "ID" },
                { key: "company", header: "Principal" },
                { key: "position", header: "Position" },
                { key: "codedRank", header: "Rank" },
                { key: "experience", header: "Experience" },
                { key: "salary", header: "Salary" },
                { key: "state", header: "Status" },
                { key: "cover_letter", header: "Cover Letter" },
                { key: "availability_date", header: "Availability Date" },
                { key: "submitted_date", header: "Submitted Date" },
                { key: "reviewed_by", header: "Reviewed By" },
                { key: "reviewed_date", header: "Reviewed Date" },
                { key: "notes", header: "Notes" },
                { key: "rating", header: "Rating" },
                { key: "created_at", header: "Created At" }
            ];
            const visibleKeys = allCols.filter(c => !hiddenCols.includes(c.key)).map(c => c.key);
            const out = userData.map(row => {
                const rowData = {};
                visibleKeys.forEach(k => rowData[k] = row[k]);
                return rowData;
            });
            exportToExcel(out, `CVSubmissions_${new Date().toISOString().split("T")[0]}.xlsx`, "CV Submissions");
            notify.success("Exported to Excel!");
        } catch { notify.error("Failed to export"); }
    }, [userData, notify, hiddenCols]);

    const handleExportPdf = useCallback(() => {
        try {
            const allCols = [
                { key: "name", header: "Applicant Name" },
                { key: "generatedId", header: "ID" },
                { key: "company", header: "Principal" },
                { key: "position", header: "Position" },
                { key: "codedRank", header: "Rank" },
                { key: "experience", header: "Experience" },
                { key: "salary", header: "Salary" },
                { key: "state", header: "Status" },
                { key: "cover_letter", header: "Cover Letter" },
                { key: "availability_date", header: "Availability Date" },
                { key: "submitted_date", header: "Submitted Date" },
                { key: "reviewed_by", header: "Reviewed By" },
                { key: "reviewed_date", header: "Reviewed Date" },
                { key: "notes", header: "Notes" },
                { key: "rating", header: "Rating" },
                { key: "created_at", header: "Created At" }
            ];
            const pdfCols = allCols.filter(c => !hiddenCols.includes(c.key));
            generateStatPdfReport(`CV Submissions Export`, pdfCols, userData);
            notify.success("Exported to PDF!");
        } catch { notify.error("Failed to export PDF"); }
    }, [userData, notify, hiddenCols]);

    // ── Filter field config (all keys match BE query params) ──────────────────
    const filterFields = [
        {
            key: "user",
            label: "Seafarer ID",
            type: "text",
            placeholder: "Filter by Seafarer (User) ID",
        },
        {
            key: "status",
            label: "Application Status",
            type: "select",
            placeholder: "All Statuses",
            options: STATUS_PIPELINE.map(s => ({ value: s, label: `⬤ ${s}` })),
        },
        {
            key: "position",
            label: "Position (Rank)",
            type: "select",
            placeholder: "All Positions",
            options: (ranks || []).map(r => ({ value: r.id, label: r.rank_name || r.name })),
        },
        {
            key: "submitted_date_from",
            label: "Submitted From",
            type: "date",
        },
        {
            key: "submitted_date_to",
            label: "Submitted To",
            type: "date",
        },
    ];


    const headerHeight = Math.round(80 * scale);

    return (
        <CVErrorBoundary>
        <main style={getMainContainerStyles(scale, headerHeight)}>
            <style>{generateAllPageStyles(scale)}</style>

            {/* ── Statistics Card ──────────────────────────────────────────── */}
            <section style={{ marginBottom: `${Math.round(32 * scale)}px` }}>
                <div style={{ ...getRowBetweenStyles(scale), cursor: "pointer", userSelect: "none" }} onClick={() => setIsStatsExpanded(!isStatsExpanded)} className="group mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBsNDAtNDBNMCAwbDQwIDQwIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] opacity-50 rounded-2xl mix-blend-overlay"></div>
                            <PieChart size={24} className="text-emerald-600 dark:text-emerald-400 relative z-10" />
                        </div>
                        <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100 m-0 group-hover:text-emerald-600 transition-colors">
                            CV Submissions
                        </h2>
                        <div className="text-slate-400 group-hover:text-emerald-500 transition-colors ml-2">
                            {isStatsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                </div>

                {isStatsExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300 origin-top flex flex-col xl:flex-row gap-6 mb-8">
                        <div className="xl:w-1/3 min-w-[340px]">
                            <StatisticsCard
                                title="CV Submissions"
                                timeframeLabel={(activeFilters.submitted_date_from && activeFilters.submitted_date_to) ? `${activeFilters.submitted_date_from} to ${activeFilters.submitted_date_to}` : activeFilters.submitted_date_from ? `Since ${activeFilters.submitted_date_from}` : activeFilters.submitted_date_to ? `Until ${activeFilters.submitted_date_to}` : "All time"}
                                segments={statisticsData}
                                width={380}
                                height={220}
                                scale={scale}
                                loading={loading}
                                style={{
                                    height: "auto",
                                    minHeight: Math.round(220 * scale),
                                }}
                            />
                        </div>
                        <div className="xl:w-2/3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {statCardsData.map((card, idx) => (
                                <div key={idx} title="Click to download PDF report">
                                    <StatCard title={card.title} value={card.value.toString()} trend={card.trend} icon={card.icon} accentColor={card.accent} onClick={card.onClick} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
            {/* ── Title + Toolbar ──────────────────────────────────────────── */}
            <section style={{ marginBottom: `${Math.round(20 * scale)}px` }}>
                <div style={{ ...getRowBetweenStyles(scale), cursor: "pointer", userSelect: "none" }} onClick={() => setIsTableExpanded(!isTableExpanded)} className="group mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 border border-blue-500/20 group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBsNDAtNDBNMCAwbDQwIDQwIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] opacity-50 rounded-2xl mix-blend-overlay"></div>
                            <Users size={24} className="text-blue-600 dark:text-blue-400 relative z-10" />
                        </div>
                        <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100 m-0 group-hover:text-blue-600 transition-colors">
                            Manage seafarer applicants
                        </h2>
                        <div className="text-slate-400 group-hover:text-blue-500 transition-colors ml-2">
                            {isTableExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    {/* Action toolbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: `${Math.round(8 * scale)}px`,
                            flexWrap: "wrap",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Refresh */}
                        <Button
                            variant="icon"
                            onClick={handleRefresh}
                            ariaLabel="Press to refresh the table"
                            title="Press to refresh the table"
                            scale={scale}
                            style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }}
                        >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                            </svg>
                        </Button>

                        {/* Add Applicant (Admin only) */}
                        {canCreate && (
                            <Button variant="primary" scale={scale} onClick={handleAddManual} style={thinBtn}>
                                + Add Applicant
                            </Button>
                        )}

                        {/* Export & Columns — Always shown */}
                        <Button variant="outline" onClick={handleExportPdf} scale={scale} style={thinBtn}>
                            Export PDF
                        </Button>
                        <Button variant="outline" onClick={handleExportExcel} scale={scale} style={thinBtn}>
                            Export Excel
                        </Button>
                    </div>
                </div>

                {isTableExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300 origin-top">
                        {/* ── Data Table ───────────────────────────────────────────────── */}
                        <div
                            style={{
                                marginTop: `${Math.round(20 * scale)}px`,
                                marginBottom: `${Math.round(20 * scale)}px`,
                            }}
                        >
                            {/* Advanced Filter Bar and Table */}
                            <DataTableLayout
                                columns={columns}
                                storageKey="cv_submissions"
                                fields={filterFields}
                                filters={activeFilters}
                                onFilterChange={(k, v) => setActiveFilters(prev => ({ ...prev, [k]: v }))}
                                onApplyFilters={() => {
                                    handleApplyAdvancedFilters(activeFilters);
                                }}
                                onClearFilters={() => {
                                    setFilters({});
                                    fetchSubmissions(1, {});
                                }}
                                isSidebarOpen={isSidebarOpen}
                                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <AdvancedDataTable
                                    data={userData}
                                    columns={columns}
                                    keyField="id"
                                    selectedIds={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    onRowClick={handleView}
                                    isLoading={loading}
                                />
                            </DataTableLayout>

                            {/* Server-side Pagination */}
                            <div style={{ marginTop: "20px" }}>
                                <Pagination
                                    page={pagination.currentPage}
                                    pageSize={pagination.pageSize || 50}
                                    total={pagination.count}
                                    onChange={(p) => fetchSubmissions({ ...buildBackendFilters(activeFilters), page: p })}
                                    scale={scale}
                                    showInfo={true}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                actions={bulkActions}
            />

            {/* Modals ─────────────────────────────────────────────────────────────── */}

            {/* Bulk Delete Confirm */}
            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleConfirmBulkDelete}
                title="Bulk Delete Submissions"
                message={`Are you sure you want to delete ${selectedIds.length} selected submissions? This action cannot be undone.`}
                confirmLabel="Delete All"
                variant="danger"
                scale={scale}
                loading={loading}
            />

            {/* Bulk Status Modal */}
            {showBulkStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">Update Status</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Change the status for {selectedIds.length} selected submission(s).</p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Status</label>
                            <select value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer">
                                {STATUS_PIPELINE.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setShowBulkStatusModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={handleConfirmBulkStatus} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">Apply Status</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modals ───────────────────────────────────────────────────── */}
            {showSubmissionModal && (
                <CVSubmissionFormModal
                    isOpen={showSubmissionModal}
                    submission={selectedSubmission}
                    onClose={() => setShowSubmissionModal(false)}
                    onSave={handleSaveSubmission}
                    scale={scale}
                />
            )}

            {showAIModal && (
                <DocumentUploadModal
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                    onSuccess={handleAISuccess}
                    scale={scale}
                />
            )}

            {/* ── View Loading Overlay ─────────────────────────────────────── */}
            {viewLoading && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(15, 23, 42, 0.55)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: Math.round(16 * scale),
                }}>
                    <div style={{
                        width: Math.round(52 * scale), height: Math.round(52 * scale),
                        border: `${Math.round(4 * scale)}px solid rgba(255,255,255,0.15)`,
                        borderTopColor: "#6366F1",
                        borderRadius: "50%",
                        animation: "cv-spin 0.75s linear infinite",
                    }} />
                    <p style={{ color: "#fff", fontSize: Math.round(14 * scale), fontWeight: 500, margin: 0 }}>
                        Loading application details…
                    </p>
                    <style>{`@keyframes cv-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {showInterviewModal && (
                <InterviewFormModal
                    isOpen={showInterviewModal}
                    interview={null}
                    onClose={() => {
                        setShowInterviewModal(false);
                        setSelectedSubmissionForInterview(null);
                    }}
                    onSave={handleSaveInterview}
                    preSelectedCandidate={selectedSubmissionForInterview?.user?.id || selectedSubmissionForInterview?.user_id}
                    preSelectedPosition={selectedSubmissionForInterview?.position?.id || selectedSubmissionForInterview?.position}
                    scale={scale}
                />
            )}

            {showViewModal && (
                <CVSubmissionEditModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    submission={selectedSubmission}
                    onDelete={canDelete ? handleDelete : null}
                    scale={scale}
                    canDelete={canDelete}
                />
            )}

            {showGenerateContractModal && (
                <GenerateContractModal
                    submission={selectedSubmission}
                    onClose={() => setShowGenerateContractModal(false)}
                    onSuccess={() => {
                        setShowGenerateContractModal(false);
                    }}
                    scale={scale}
                />
            )}

            {/* Enhanced Filter Modal */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setSubmissionToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Submission"
                message="Are you sure you want to delete this submission? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                scale={scale}
                loading={loading}
            />
        </main>
        </CVErrorBoundary>
    );
}
class CVErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-8 text-red-500 bg-white z-50 fixed inset-0"><h2>Global Crash:</h2><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}






