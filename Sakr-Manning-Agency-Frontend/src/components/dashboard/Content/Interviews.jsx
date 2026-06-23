/* eslint-disable no-unused-vars */

// Content/Interviews.jsx - COMPLETE with Full CRUD + Calendar + Backend Filtering
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SmallProgressCard } from "../Components/Cards/StatisticsCards";
import { StatCard } from "../Components/Cards/StatCard";
import { AdvancedDataTable } from "../Components/Data/AdvancedDataTable";
import { DataTableLayout } from "../Components/Data/DataTableLayout";
import { BulkActionBar } from "../Components/Data/BulkActionBar";
import { generateStatPdfReport } from "../../../utils/pdfReportGenerator";
import { Video, Phone, Users, Info, Filter, Calendar as LucideCalendar, Clock, CalendarCheck, CheckCircle2, Eye, Edit2, Trash2, ChevronUp, ChevronDown, ClipboardCheck, AlertCircle } from "lucide-react";
import { ASSETS } from "../../../utils/constants";
import { exportToCSV, exportToJSON, exportToExcel } from "../../../utils/exportHelpers";
import { getMediaUrl } from "../../../utils/fileHelpers";

import {
  generateAllPageStyles,
  getMainContainerStyles,
  getPageTitleStyles,
} from "../Styles/cssClasses";
import Button from "../Components/Common/Button";
import Calendar from "../Components/Common/Calender";
import ConfirmDialog from "../Components/Common/ConfirmDialog";
import LoadingScreen from "../Components/Common/LoadingScreen";

import InterviewFormModal from "../Components/Modal/InterviewFormModal";
import ReminderModal from "../Components/Modal/ReminderModal";
import { InterviewViewModal } from "../Components/Modal/ViewModal";

import Pagination from "../../common/Pagination";
import SavedFilters from "../Components/Common/SavedFilters";

import useNotification from "../hooks/useNotification";

import usePermissions from "../../../hooks/dashboard/usePermissions";
import useInterviews from "../../../hooks/dashboard/useInterviews";
import { useDashboardData } from "../context/DashboardDataContext";
import { useCompanies } from "../../../hooks/dashboard/useCompanies";
import { useRanks } from "../../../hooks/dashboard/useRanks";

export function InterviewManagement({ scale = 1, isMobile = false, initialItemData }) {
  const { notify } = useNotification();

  const { canScheduleInterviews, canEdit, canDelete } = usePermissions();

  // UI Helper Functions
  const getInterviewTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "video":
        return "Video Call";
      case "phone":
        return "Phone Call";
      case "in-person":
        return "In-Person";
      default:
        return type;
    }
  };

  const getInterviewTypeIcon = (type) => {
    const size = Math.round(18 * scale);
    const color = "#6B7280"; // Neutral gray
    
    switch (type?.toLowerCase()) {
      case "video":
        return <Video size={size} color={color} />;
      case "phone":
        return <Phone size={size} color={color} />;
      case "in-person":
        return <Users size={size} color={color} />;
      default:
        return <Info size={size} color={color} />;
    }
  };

  const formatInterviewDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      // Parse YYYY-MM-DD safely to avoid timezone shifts
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
      case "Confirmed":
        return "#14A40F";
      case "Scheduled":
        return "#1976D2";
      case "Pending":
        return "#757575";
      case "Cancelled":
        return "#F44336";
      case "Rescheduled":
        return "#FF9800";
      default:
        return "#333333";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Use custom hook for interviews data
  const {
    interviews: backendInterviews,
    loading: interviewsLoading,
    fetchInterviews, getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview,
    fetchInterviewStats,
    pagination
  } = useInterviews();

  const { companies, fetchCompanies: fetchAllCompanies } = useCompanies();
  const { ranks, fetchRanks } = useRanks();

  // centralized data
  const { fetchCompaniesByIds, companyMap, getCompanyName, users, addReminder } = useDashboardData();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInterview, setViewingInterview] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // "card" | "list"
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  // Column Picker State
  const [showColPicker, setShowColPicker] = useState(false);
  const [hiddenCols, setHiddenCols] = useState([
    "candidate_name", "candidate_email", "company_name", "position_name", "date", "time",
    "duration_minutes", "location", "meeting_link", "interviewer_name", "interviewer_email",
    "result", "notes", "feedback", "created_at", "updated_at"
  ]);

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("Scheduled");
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // ✅ Filter State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    candidate: "",
    status: "",
    company: "",
    scheduled_date: "",
    scheduled_date_from: "",
    scheduled_date_to: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    candidate: "",
    status: "",
    company: "",
    scheduled_date: "",
    scheduled_date_from: "",
    scheduled_date_to: "",
  });
  const [savedPresets, setSavedPresets] = useState([]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    const result = await fetchInterviewStats();
    if (result.success) {
      setStatistics(result.data);
    }
  }, [fetchInterviewStats]);

  // Load interviews and stats on mount
  useEffect(() => {
    fetchInterviews({ ...activeFilters });
    loadStatistics();
    fetchAllCompanies({ page_size: 1000 });
    fetchRanks();
  }, [fetchInterviews, getInterviewById, activeFilters, loadStatistics, fetchAllCompanies, fetchRanks]);

  // Handle initial item navigation
  const hasOpenedInitial = useRef(false);
  useEffect(() => {
    if (initialItemData && initialItemData.id && !hasOpenedInitial.current) {
      hasOpenedInitial.current = true;
      const loadAndOpen = async () => {
        try {
          // Check if we already have it in the list
          let interview = (backendInterviews || []).find(i => i.id === initialItemData.id);
          if (!interview) {
             const result = await getInterviewById(initialItemData.id);
             if (result && result.success) {
               interview = result.data;
             }
          }
          if (interview) {
            setViewingInterview(interview);
            setShowViewModal(true);
          }
        } catch (e) {
          console.log("Could not load initial item in Interviews", e);
        }
      };
      loadAndOpen();
    }
  }, [initialItemData, backendInterviews, getInterviewById]);

  // Batch fetch companies when interviews load
  useEffect(() => {
    if (backendInterviews.length > 0) {
      const companyIds = backendInterviews
        .map((i) => i.company)
        .filter((id) => id !== null && id !== undefined);

      if (companyIds.length > 0) {
        fetchCompaniesByIds(companyIds);
      }
    }
  }, [backendInterviews, fetchCompaniesByIds]);




  // Transform backend interviews to match UI format
  const interviews = useMemo(() => {
    return (backendInterviews || []).map((interview, index) => ({
      index: (pagination.currentPage - 1) * (pagination.pageSize || 50) + index + 1,
      id: interview.id,
      candidateId: interview.candidate,
      candidateName: interview?.candidate_name ? `${interview.candidate_name.split(" ")[0]} ${interview.candidate_name.split(" ")[1] || ""}`.trim() : "Unknown Candidate",
      candidateEmail: interview.candidate_email || "",
      companyId: interview.company || "Unknown Principal ID",
      company: interview.company_name || getCompanyName(interview.company),
      duration: interview.duration_minutes || 0,
      positionID: interview.position || "Not Specified",
      position: interview.position_name || "Not Specified",
      date: interview.scheduled_date,
      time: interview.scheduled_time
        ? interview.scheduled_time.substring(0, 5)
        : "00:00", // Format HH:MM
      type: interview.interview_type || "Video",
      status: interview.status || "Scheduled",
      meetingLink: interview.meeting_link || "",

      notes: interview.notes || "",
      feedback: interview.feedback || "",
      meetingResult: interview.result || "",
      interviewer_name: interview.interviewer_name || "",
      interviewer_email: interview.interviewer_email || "",
      location: interview.location || "",

      avatar: getMediaUrl(interview.candidate?.profile_image) || ASSETS.LOGO,
      createdAt: interview.created_at,
      createdBy: interview.created_by,
      // Store original data for editing
      _original: interview,
    }));
  }, [backendInterviews, companyMap]);

  // Interview statistics (use backend stats if available)
  const interviewStats = useMemo(() => {
    if (!statistics || !interviews.length) {
      return { today: 0, thisWeek: 0, pendingFeedback: 0, completed: 0, noShows: 0 };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let pendingFeedback = 0;
    let todayCount = 0;
    let thisWeekCount = 0;

    interviews.forEach((interview) => {
      const interviewDateStr = interview.date;
      const interviewDate = new Date(interviewDateStr);
      
      if (interviewDateStr === todayStr) {
        todayCount++;
      }
      
      if (interviewDate >= weekStart && interviewDate <= weekEnd) {
        thisWeekCount++;
      }

      let isPast = false;

      if (interviewDate < new Date(todayStr)) {
        isPast = true;
      } else if (interviewDateStr === todayStr && interview.time) {
        if (interview.time < now.toTimeString().substring(0, 5)) {
          isPast = true;
        }
      }

      if ((interview.status === "Scheduled" || interview.status === "Pending") && isPast) {
        pendingFeedback++;
      }
    });

    return {
      today: todayCount,
      thisWeek: thisWeekCount,
      pendingFeedback: pendingFeedback, // Using frontend calculation for immediate context
      completed: statistics.completed || 0,
      noShows: statistics.no_show || 0, 
    };
  }, [interviews, statistics]);

  // Bulk Handlers
  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      for (const id of selectedIds) {
        await deleteInterview(id);
      }
      notify.success(`${selectedIds.length} interviews deleted successfully`);
      setShowBulkDeleteConfirm(false);
      setSelectedIds([]);
      fetchInterviews({ page: pagination?.currentPage || 1 });
    } catch (err) {
      notify.error("Some deletions failed");
    }
  }, [selectedIds, deleteInterview, notify, fetchInterviews, getInterviewById, pagination]);

  const handleConfirmBulkStatus = useCallback(async () => {
    try {
      for (const id of selectedIds) {
        await updateInterview(id, { status: bulkStatusValue });
      }
      notify.success(`${selectedIds.length} interviews updated to ${bulkStatusValue}`);
      setShowBulkStatusModal(false);
      setSelectedIds([]);
      fetchInterviews({ page: pagination?.currentPage || 1 });
    } catch (err) {
      notify.error("Some status updates failed");
    }
  }, [selectedIds, bulkStatusValue, updateInterview, notify, fetchInterviews, getInterviewById, pagination]);

  // PDF Generation columns
  const pdfColumns = useMemo(() => [
    { key: "candidateName", header: "Candidate Name" },
    { key: "company", header: "Principal" },
    { key: "position", header: "Position" },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "status", header: "Status" }
  ], []);

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const handleApplyFilters = useCallback((appliedFilters) => {
    setActiveFilters(appliedFilters);
    setFilters(appliedFilters);
    setIsSidebarOpen(false);
    fetchInterviews({ ...appliedFilters, page: 1 });
  }, [fetchInterviews]);

  const handlePageChange = useCallback((newPage) => {
    fetchInterviews({ ...activeFilters, page: newPage });
  }, [fetchInterviews, getInterviewById, activeFilters]);

  const handleApplyPreset = useCallback((preset) => {
    setFilters(preset);
    setActiveFilters(preset);
    fetchInterviews({ ...preset, page: 1 });
  }, [fetchInterviews]);

  const handleFilterByStat = useCallback((type) => {
    let newFilters = { ...activeFilters };
    const todayStr = new Date().toISOString().split("T")[0];

    // Reset base filters for stats clicking
    newFilters.scheduled_date = "";
    newFilters.scheduled_date_from = "";
    newFilters.scheduled_date_to = "";
    newFilters.status = "";

    if (type === "today") {
      newFilters.scheduled_date = todayStr;
    } else if (type === "week") {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      newFilters.scheduled_date_from = weekStart.toISOString().split("T")[0];
      newFilters.scheduled_date_to = weekEnd.toISOString().split("T")[0];
    } else if (type === "pending") {
      newFilters.status = "Scheduled";
      newFilters.scheduled_date_to = todayStr;
    } else if (type === "completed") {
      newFilters.status = "Completed";
    }

    setActiveFilters(newFilters);
    setFilters(newFilters);
    fetchInterviews({ ...newFilters, page: 1 });
  }, [activeFilters, fetchInterviews]);

  const handleExportExcel = useCallback(() => {
    try {
      const allCols = [
        { key: "candidateName", header: "Candidate Name" },
        { key: "candidateEmail", header: "Candidate Email" },
        { key: "company", header: "Principal" },
        { key: "position", header: "Position" },
        { key: "date", header: "Date" },
        { key: "time", header: "Time" },
        { key: "duration_minutes", header: "Duration (min)" },
        { key: "location", header: "Location" },
        { key: "meeting_link", header: "Meeting Link" },
        { key: "interviewer_name", header: "Interviewer Name" },
        { key: "interviewer_email", header: "Interviewer Email" },
        { key: "result", header: "Result" },
        { key: "notes", header: "Notes" },
        { key: "feedback", header: "Feedback" },
        { key: "status", header: "Status" },
        { key: "type", header: "Type" }
      ];
      const visibleKeys = allCols.filter(c => !hiddenCols.includes(c.key)).map(c => c.key);
      const out = interviews.map(row => {
        const rowData = {};
        visibleKeys.forEach(k => rowData[k] = row[k]);
        return rowData;
      });
      exportToExcel(out, `Interviews_Export_${new Date().toISOString().split("T")[0]}.xlsx`, "Interviews");
      notify.success("Exported to Excel!");
    } catch {
      notify.error("Failed to export");
    }
  }, [interviews, hiddenCols, notify]);

  const handleExportPdf = useCallback(() => {
    try {
      const allCols = [
        { key: "candidateName", header: "Candidate Name" },
        { key: "candidateEmail", header: "Candidate Email" },
        { key: "company", header: "Principal" },
        { key: "position", header: "Position" },
        { key: "date", header: "Date" },
        { key: "time", header: "Time" },
        { key: "duration_minutes", header: "Duration (min)" },
        { key: "location", header: "Location" },
        { key: "meeting_link", header: "Meeting Link" },
        { key: "interviewer_name", header: "Interviewer Name" },
        { key: "interviewer_email", header: "Interviewer Email" },
        { key: "result", header: "Result" },
        { key: "notes", header: "Notes" },
        { key: "feedback", header: "Feedback" },
        { key: "status", header: "Status" },
        { key: "type", header: "Type" }
      ];
      const pdfCols = allCols.filter(c => !hiddenCols.includes(c.key));
      generateStatPdfReport(`Interviews_Export`, pdfCols, interviews);
      notify.success("Exported to PDF!");
    } catch {
      notify.error("Failed to export PDF");
    }
  }, [interviews, hiddenCols, notify]);

  const handleSavePreset = useCallback((name, vals) => {
    setSavedPresets(prev => [...prev, { name, filters: vals }]);
  }, []);

  const handleDeletePreset = useCallback((name) => {
    setSavedPresets(prev => prev.filter(p => p.name !== name));
  }, []);

  const filterFields = [
    {
      key: "candidate",
      label: "Candidate",
      type: "select",
      placeholder: "Select Candidate",
      options: (users || []).map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })),
    },
    {
      key: "company",
      label: "Principal",
      type: "select",
      placeholder: "All Principals",
      options: (companies || []).map(c => ({ value: c.id, label: c.company_name || c.name })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "All Statuses",
      options: [
        { value: "Scheduled", label: "Scheduled" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Pending", label: "Pending" },
        { value: "No Show", label: "No Show" },
        { value: "Rescheduled", label: "Rescheduled" },
      ],
    },
    {
      key: "scheduled_date",
      label: "Specific Date",
      type: "date",
    },
    {
      key: "scheduled_date_from",
      label: "Date From",
      type: "date",
    },
    {
      key: "scheduled_date_to",
      label: "Date To",
      type: "date",
    },
  ];

  const handleResetFilters = useCallback(() => {
    const emptyFilters = {
      candidate: "",
      status: "",
      company: "",
      scheduled_date: "",
      scheduled_date_from: "",
      scheduled_date_to: "",
    };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setIsSidebarOpen(false);
    fetchInterviews({ page: 1 });
  }, [fetchInterviews]);

  // ============================================
  // CRUD HANDLERS
  // ============================================
  const handleDateClick = useCallback(
    (dayOrDateStr, currentDate) => {
      if (!canScheduleInterviews) {
        notify.error("You do not have permission to schedule interviews");
        return;
      }

      let dateStr;
      if (typeof dayOrDateStr === 'string' && dayOrDateStr.includes('-')) {
        // Came from react-big-calendar (Calender.jsx)
        dateStr = dayOrDateStr;
      } else if (currentDate) {
        // Fallback for custom calendars passing day and date
        dateStr = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(dayOrDateStr).padStart(2, "0")}`;
      } else {
        return; // Unknown format
      }

      setSelectedDate(dateStr);
      setSelectedInterview(null);
      setShowAddModal(true);
    },
    [canScheduleInterviews, notify]
  );

  const handleInterviewClick = useCallback((interview) => {
    // Open View Modal on Calendar click instead of Edit
    setViewingInterview(interview._original || interview);
    setShowViewModal(true);
  }, []);

  const handleViewInterview = useCallback((interview) => {
    setViewingInterview(interview._original || interview);
    setShowViewModal(true);
  }, []);

  const handleAddInterview = useCallback(
    async (formData) => {
      const result = await createInterview(formData);
      if (result.success) {
        setShowAddModal(false);
        setSelectedDate(null);
        await loadStatistics();
      }
    },
    [createInterview, loadStatistics]
  );

  const handleEditInterview = useCallback(
    async (formData) => {
      if (!selectedInterview) return;

      // selectedInterview is now the raw backend object; use its id directly
      const interviewId = selectedInterview.id;
      const result = await updateInterview(interviewId, formData);
      if (result.success) {
        setShowEditModal(false);
        setSelectedInterview(null);
        await loadStatistics();
      }
    },
    [selectedInterview, updateInterview, loadStatistics]
  );

  const handleDeleteClick = useCallback(
    (interview) => {
      if (!canDelete && !canScheduleInterviews) {
        notify.error("You do not have permission to delete interviews");
        return;
      }

      setInterviewToDelete(interview.id);
      setShowDeleteConfirm(true);
    },
    [canDelete, canScheduleInterviews, notify]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!interviewToDelete) return;

    const result = await deleteInterview(interviewToDelete);
    if (result.success) {
      notify.success("Interview deleted successfully!");
      setShowDeleteConfirm(false);
      setInterviewToDelete(null);
      await loadStatistics();
    }
  }, [interviewToDelete, deleteInterview, loadStatistics]);

  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      if (!canEdit && !canScheduleInterviews) {
        notify.error("You do not have permission to update interview status");
        return;
      }

      const interview = (backendInterviews || []).find((i) => i.id === id);
      if (!interview) return;

      const statusMap = {
        pending: "Scheduled",
        confirmed: "Completed",
        scheduled: "Scheduled",
      };

      const backendStatus = statusMap[newStatus] || "Scheduled";

      const result = await updateInterview(id, { status: backendStatus });
      if (result.success) {
        notify.success(`Interview ${newStatus} successfully!`);
        await loadStatistics();
      }
    },
    [
      backendInterviews,
      updateInterview,
      canEdit,
      canScheduleInterviews,
      loadStatistics,
      notify,
    ]
  );


  const handleRefresh = useCallback(() => {
    fetchInterviews({ ...activeFilters, page: pagination?.currentPage || 1 });
  }, [fetchInterviews, getInterviewById, activeFilters, pagination]);

  const tableColumns = useMemo(() => [
    {
      key: "candidate",
      label: "Candidate",
      width: 250,
      render: (_, row) => (
        <div className="max-w-[200px]">
          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={row.candidateName}>{row.candidateName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={row.candidateEmail}>{row.candidateEmail}</div>
        </div>
      )
    },
    {
      key: "positionCompany",
      label: "Position & Principal",
      width: 200,
      render: (_, row) => (
        <div className="max-w-[180px]">
          <div className="font-medium text-slate-700 dark:text-slate-300 truncate" title={row.position}>{row.position}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate" title={row.company}>{row.company}</div>
        </div>
      )
    },
    {
      key: "dateTime",
      label: "Date & Time",
      width: 150,
      render: (_, row) => (
        <div className="max-w-[140px]">
          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{formatInterviewDate(row.date)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.time}</div>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 w-fit">
          {getInterviewTypeIcon(row.type)}
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{getInterviewTypeLabel(row.type)}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const newStatus = e.target.value;
            // Map common labels back to what backend expects if necessary, or just use handleStatusChange for specific transitions.
            // If the user selects a status, we directly update it. We can map using statusMap or call API directly.
            // But handleStatusChange expects (id, newStatus), we can call handleStatusChange(row.id, newStatus) but handleStatusChange in Interviews.jsx maps "pending" -> "Scheduled".
            // Let's call the generic handleStatusChange but allow any value. 
            // Wait, we can bypass the internal statusMap by calling handleStatusChange. Actually, handleStatusChange has a statusMap that overrides newStatus if it matches keys!
            // Let's just pass the selected value and if it matches a key it will be mapped.
            handleStatusChange(row.id, newStatus);
          }}
          disabled={!canEdit && !canScheduleInterviews}
          className={`inline-block text-xs font-semibold px-2 py-1 pr-6 rounded-full appearance-none outline-none border hover:opacity-80 focus:ring-2 focus:ring-blue-500/20 ${canEdit || canScheduleInterviews ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          style={{
            backgroundColor: `${getStatusColor(row.status)}15`,
            color: getStatusColor(row.status),
            borderColor: `${getStatusColor(row.status)}30`,
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${getStatusColor(row.status).replace('#', '')}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: `right 0.2rem center`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `1.2em 1.2em`
          }}
        >
          <option value="pending" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">Pending</option>
          <option value="Scheduled" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">Scheduled</option>
          <option value="Completed" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">Completed</option>
          <option value="Cancelled" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">Cancelled</option>
          <option value="Rescheduled" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">Rescheduled</option>
          <option value="No Show" className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">No Show</option>
        </select>
      )
    },
    { key: "candidate_name", label: "Candidate Name", render: (_, row) => row.candidateName || "-" },
    { key: "candidate_email", label: "Candidate Email", render: (_, row) => row.candidateEmail || "-" },
    { key: "company_name", label: "Principal", render: (_, row) => row.company || "-" },
    { key: "position_name", label: "Position", render: (_, row) => row.position || "-" },
    { key: "date", label: "Date", render: (_, row) => formatInterviewDate(row.date) },
    { key: "time", label: "Time", render: (_, row) => row.time || "-" },
    { key: "duration_minutes", label: "Duration (min)", render: (_, row) => row.duration_minutes || "-" },
    { key: "location", label: "Location", render: (_, row) => row.location || "-" },
    { key: "meeting_link", label: "Meeting Link", render: (_, row) => row.meeting_link ? <a href={row.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : "-" },
    { key: "interviewer_name", label: "Interviewer", render: (_, row) => row.interviewer_name || "-" },
    { key: "interviewer_email", label: "Interviewer Email", render: (_, row) => row.interviewer_email || "-" },
    { 
      key: "result", 
      label: "Result", 
      render: (_, row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.result === 'Passed' ? 'bg-green-100 text-green-800' :
          row.result === 'Failed' ? 'bg-red-100 text-red-800' :
          row.result === 'On Hold' ? 'bg-amber-100 text-amber-800' :
          'bg-slate-100 text-slate-800'
        }`}>
          {row.result || 'Pending'}
        </span>
      )
    },
    { key: "notes", label: "Notes", render: (_, row) => <div className="truncate max-w-[150px]" title={row.notes}>{row.notes || "-"}</div> },
    { key: "feedback", label: "Feedback", render: (_, row) => <div className="truncate max-w-[150px]" title={row.feedback}>{row.feedback || "-"}</div> },
    { key: "created_at", label: "Created At", render: (_, row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "updated_at", label: "Updated At", render: (_, row) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "-" },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleViewInterview(row)}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            {((row.status === "Scheduled" || row.status === "Pending") && (canEdit || canScheduleInterviews)) && (
              <button
                onClick={() => {
                  setSelectedInterview(row._original || row);
                  setShowEditModal(true);
                }}
                className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                title="Log Result"
              >
                <ClipboardCheck size={18} />
              </button>
            )}
            {(canEdit || canScheduleInterviews) && (
            <button
              onClick={() => {
                setSelectedInterview(row._original || row);
                setShowEditModal(true);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              title="Edit Interview"
            >
              <Edit2 size={18} />
            </button>
          )}
          {(canDelete || canScheduleInterviews) && (
            <button
              onClick={() => handleDeleteClick(row)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Interview"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )
    }
  ], [canEdit, canDelete, canScheduleInterviews, handleStatusChange, handleViewInterview, handleDeleteClick]);

  const bulkActions = useMemo(() => [
    {
      label: "Update Status",
      icon: <CheckCircle2 size={16} />,
      onClick: () => setShowBulkStatusModal(true),
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: () => setShowBulkDeleteConfirm(true),
      variant: "danger",
    },
  ], []);

  const headerHeight = Math.round(80 * scale);
  const cardGap = Math.round(20 * scale);

  return (
    <main style={getMainContainerStyles(scale, headerHeight)}>
      <style>{generateAllPageStyles(scale)}</style>

      {/* Title + Toolbar */}
      <section style={{ marginBottom: `${Math.round(20 * scale)}px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }} onClick={() => setIsStatsExpanded(!isStatsExpanded)} className="group mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBsNDAtNDBNMCAwbDQwIDQwIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] opacity-50 rounded-2xl mix-blend-overlay"></div>
              <Users size={24} className="text-blue-600 dark:text-blue-400 relative z-10" />
            </div>
            <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100 m-0 group-hover:text-blue-600 transition-colors">
              Manage Interviews
            </h2>
            <div className="text-slate-400 group-hover:text-blue-500 transition-colors ml-2">
              {isStatsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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

            {/* Schedule Interview (Admin only) */}
            {canScheduleInterviews && (
              <>
                <Button variant="primary" scale={scale} onClick={() => {
                  const d = new Date();
                  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  setSelectedDate(dateStr);
                  setSelectedInterview(null);
                  setShowAddModal(true);
                }} style={{ padding: "4px 12px", height: "30px", fontSize: "0.875rem", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                  + Add Interview
                </Button>
                <Button variant="outline" scale={scale} onClick={() => setShowReminderModal(true)} style={{ padding: "4px 12px", height: "30px", fontSize: "0.875rem", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                  + Add Reminder
                </Button>
              </>
            )}

            {/* Export & Columns */}
            <Button variant="outline" onClick={handleExportPdf} scale={scale} style={{ padding: "4px 12px", height: "30px", fontSize: "0.875rem", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} scale={scale} style={{ padding: "4px 12px", height: "30px", fontSize: "0.875rem", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              Export Excel
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      {isStatsExpanded && (
        <>
          {/* Statistics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
            <StatCard
              title="Today's Schedule"
              value={interviewStats.today.toString()}
              trend="Scheduled Today"
              icon={<Clock size={20} />}
              accentColor="#54D14D"
              onClick={() => handleFilterByStat("today")}
              isActive={activeFilters.scheduled_date === new Date().toISOString().split("T")[0]}
            />
            <StatCard
              title="This Week"
              value={interviewStats.thisWeek.toString()}
              trend="Next 7 Days"
              icon={<CalendarCheck size={20} />}
              accentColor="#EF7E5D"
              onClick={() => handleFilterByStat("week")}
              isActive={!!activeFilters.scheduled_date_from && !activeFilters.scheduled_date}
            />
            <StatCard
              title="Pending Feedback"
              value={interviewStats.pendingFeedback.toString()}
              trend="Action Required"
              trendDirection="down"
              icon={<AlertCircle size={20} />}
              accentColor="#F59E0B"
              onClick={() => handleFilterByStat("pending")}
              isActive={activeFilters.status === "Scheduled" && !!activeFilters.scheduled_date_to}
            />
            <StatCard
              title="Completed"
              value={interviewStats.completed.toString()}
              trend={interviewStats.noShows > 0 ? `${interviewStats.noShows} No Shows` : "All clear"}
              trendDirection={interviewStats.noShows > 0 ? "down" : undefined}
              icon={<CheckCircle2 size={20} />}
              accentColor="#35C2FD"
              onClick={() => handleFilterByStat("completed")}
              isActive={activeFilters.status === "Completed"}
            />
          </div>
        </>
      )}

      {/* Interview Calendar */}
      <div style={{ marginBottom: `${Math.round(32 * scale)}px` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: `${Math.round(16 * scale)}px`,
          }}
        >
          <h2
            style={{
              fontSize: `${Math.round(22 * scale)}px`,
              fontWeight: 500,
              color: "#000000",
              margin: 0,
            }}
          >
            Interview Calendar
          </h2>
        </div>
        <Calendar
          interviews={interviews}
          onDateClick={handleDateClick}
          onInterviewClick={handleInterviewClick}
        />
      </div>

      {/* Interviews List */}
      <div className="flex flex-col gap-5 mt-8">
        {/* Interviews List Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white m-0">
            Upcoming Interviews
          </h2>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Card View"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {interviewsLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-sm border border-slate-100 dark:border-slate-800">
            <LoadingScreen scale={scale} message="Loading interviews..." subMessage="Fetching upcoming candidate meetings and evaluations" />
          </div>
        ) : interviews.length > 0 ? (
          viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 border border-slate-200/70 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 flex justify-between items-center gap-4 relative group"
                >
                  {/* Left Section: Interview Details */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {interview.interviewer_name && (
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Interviewer: {interview.interviewer_name}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-inter">
                      {formatInterviewDate(interview.date)}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-inter">
                      {interview.time}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg w-fit mt-1 border border-slate-100 dark:border-slate-700">
                      {getInterviewTypeIcon(interview.type)}
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {getInterviewTypeLabel(interview.type)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Section: Candidate Details */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100 font-poppins">
                      {interview.candidateName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-inter break-all">
                      {interview.candidateEmail}
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 font-poppins mt-1">
                      {interview.position}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 font-poppins">
                      {interview.company}
                    </div>
                  </div>

                  {/* Right Section: Status & Actions */}
                  <div className="flex flex-col items-end gap-3 min-w-[120px]">
                    {/* Status Badge */}
                    <div
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${interview.status === 'pending' ? 'cursor-pointer hover:opacity-80' : ''}`}
                      style={{
                        backgroundColor: `${getStatusColor(interview.status)}15`,
                        color: getStatusColor(interview.status),
                        border: `1px solid ${getStatusColor(interview.status)}30`
                      }}
                      onClick={() => {
                        if (interview.status === "pending") {
                          handleStatusChange(interview.id, "confirm");
                        }
                      }}
                    >
                      {getStatusLabel(interview.status)}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => handleViewInterview(interview)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {((interview.status === "Scheduled" || interview.status === "Pending") && (canEdit || canScheduleInterviews)) && (
                          <button
                            onClick={() => {
                              setSelectedInterview(interview._original || interview);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Log Result"
                          >
                            <ClipboardCheck size={18} />
                          </button>
                        )}
                        {(canEdit || canScheduleInterviews) && (
                        <button
                          onClick={() => {
                            setSelectedInterview(interview._original || interview);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title="Edit Interview"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}

                      {(canDelete || canScheduleInterviews) && (
                        <button
                          onClick={() => handleDeleteClick(interview)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Interview"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
          ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
                {selectedIds.length > 0 && (
                  <div className="mb-4">
                    <BulkActionBar
                      selectedCount={selectedIds.length}
                      onClearSelection={() => setSelectedIds([])}
                      actions={bulkActions}
                    />
                  </div>
                )}
                <DataTableLayout
                    columns={tableColumns}
                    storageKey="interviews"
                    fields={filterFields}
                    filters={activeFilters}
                    onFilterChange={(k, v) => setActiveFilters(prev => ({ ...prev, [k]: v }))}
                    onApplyFilters={() => handleApplyFilters(activeFilters)}
                    onClearFilters={() => {
                        setActiveFilters({});
                        handleApplyFilters({});
                    }}
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <AdvancedDataTable
                      data={interviews}
                      columns={tableColumns}
                      keyField="id"
                      selectedIds={selectedIds}
                      onSelectionChange={setSelectedIds}
                      onRowClick={(row) => handleViewInterview(row)}
                      isLoading={interviewsLoading}
                    />
                </DataTableLayout>
              </div>
          )
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[22px] p-16 text-center border border-slate-100 dark:border-slate-800">
            <div className="mb-5 flex justify-center text-slate-300 dark:text-slate-700">
              <LucideCalendar size={64} />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white m-0 mb-3">
              No Interviews Scheduled
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click on the calendar to schedule your first interview
            </p>
          </div>
        )}

        {/* Pagination */}
        {!interviewsLoading && interviews.length > 0 && (
          <div style={{ marginTop: `${Math.round(20 * scale)}px` }}>
            <Pagination
              page={pagination?.currentPage || 1}
              pageSize={pagination?.pageSize || 50} // or 25 fixed
              total={pagination?.count || 0}
              onChange={handlePageChange}
              scale={scale}
              showInfo={true}
            />
          </div>
        )}
      </div>



      {showAddModal && (
        <InterviewFormModal
          isOpen={showAddModal}
          interview={null}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          onSave={handleAddInterview}
          preSelectedDate={selectedDate}
          scale={scale}
        />
      )}

      {/* Reminder Form Modal */}
      {showReminderModal && (
        <ReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          onSave={async (data) => {
            addReminder(data);
            setShowReminderModal(false);
          }}
          scale={scale}
        />
      )}

      {showEditModal && selectedInterview && (
        <InterviewFormModal
          isOpen={showEditModal}
          interview={selectedInterview}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInterview(null);
          }}
          onSave={handleEditInterview}
          scale={scale}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setInterviewToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Interview"
          message="Are you sure you want to delete this interview? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          scale={scale}
          loading={interviewsLoading}
        />
      )}

      {/* Interview View Modal */}
      <InterviewViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingInterview(null);
        }}
        interview={viewingInterview}
        onDelete={(id) => {
          setShowViewModal(false);
          setViewingInterview(null);
          setInterviewToDelete(id);
          setShowDeleteConfirm(true);
        }}
        scale={scale}
        canDelete={canDelete || canScheduleInterviews}
      />
    </main>
  );
}

