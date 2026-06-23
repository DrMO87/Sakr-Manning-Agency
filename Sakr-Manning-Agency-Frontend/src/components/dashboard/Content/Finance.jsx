/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CircleDollarSign, Download, RefreshCw, Eye, Edit2, Trash2 } from "lucide-react";
import { COLORS, TOKENS } from "../Constants";
import { exportToExcel } from "../../../utils/exportHelpers";
import { generateAllPageStyles, getMainContainerStyles } from "../Styles/cssClasses";

import Button from "../Components/Common/Button";
import ConfirmDialog from "../Components/Common/ConfirmDialog";
import { DataTableLayout } from "../Components/Data/DataTableLayout";
import { AdvancedDataTable } from "../Components/Data/AdvancedDataTable";
import Pagination from "../../common/Pagination";

import FinanceFormModal from "../Components/Modal/FinanceFormModal";
import { FinanceViewModal } from "../Components/Modal/ViewModal";

import useNotification from "../hooks/useNotification";

import usePermissions from "../../../hooks/dashboard/usePermissions";
import useFinance from "../../../hooks/dashboard/useFinance";
import useUsers from "../../../hooks/dashboard/useUsers";
import useCompanies from "../../../hooks/dashboard/useCompanies";
import { useDashboardData } from "../context/DashboardDataContext";

export function FinanceRecords({ scale = 1, isMobile = false }) {
  const { notify } = useNotification();
  const { canCreate, canEdit, canDelete, canManageFinance } = usePermissions();

  const {
    records: backendRecords,
    loading: recordsLoading,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchStats,
    pagination,
  } = useFinance();

  const { referenceOptions } = useDashboardData();
  const { getUserById } = useUsers();
  const { getCompanyById } = useCompanies();

  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    user: "",
    company: "",
    record_type: "",
    start_date_from: "",
    start_date_to: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    user: "",
    company: "",
    record_type: "",
    start_date_from: "",
    start_date_to: "",
  });

  useEffect(() => {
    fetchRecords({ ...activeFilters });
    loadStatistics();
  }, [fetchRecords, activeFilters]);

  const loadStatistics = async () => {
    const result = await fetchStats();
    if (result.success) {
      setStatistics(result.data);
    }
  };

  const [userMap, setUserMap] = useState({});
  const [companyMap, setCompanyMap] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (backendRecords.length === 0) return;

      setDetailsLoading(true);
      try {
        const userIds = [...new Set(backendRecords.map((r) => r.user))];
        const companyIds = [...new Set(backendRecords.map((r) => r.company))];

        const usersPromise = userIds.length > 0
          ? Promise.all(userIds.map((id) => getUserById(id)))
          : Promise.resolve([]);
        const companiesPromise = companyIds.length > 0
          ? Promise.all(companyIds.map((id) => getCompanyById(id)))
          : Promise.resolve([]);

        const [users, companies] = await Promise.all([usersPromise, companiesPromise]);

        const userLookup = {};
        users.forEach((result, idx) => {
          if (result && result.success) {
            const f = result.data?.first_name || "";
            const l = result.data?.last_name || "";
            let name = (f + " " + l).trim();
            userLookup[userIds[idx]] = name || "Unknown User";
          }
        });

        const companyLookup = {};
        companies.forEach((result, idx) => {
          if (result && result.success) {
            companyLookup[companyIds[idx]] =
              result.data.company_name || "Unknown Principal";
          }
        });

        setUserMap((prev) => ({ ...prev, ...userLookup }));
        setCompanyMap((prev) => ({ ...prev, ...companyLookup }));
      } catch (error) {
        console.error("Failed to load user/company details", error);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [backendRecords, getUserById, getCompanyById]);

  const records = useMemo(() => {
    return backendRecords.map((record, index) => ({
      index: (pagination.currentPage - 1) * (pagination.pageSize || 50) + index + 1,
      id: record.id,
      userId: record.user,
      user: userMap[record.user] || `User #${record.user}`,
      companyId: record.company,
      company: companyMap[record.company] || `Principal #${record.company}`,
      startDate: record.start_date,
      endDate: record.end_date,
      status: record.status || "Pending",
      totalDays: record.total_days,
      dailyRate: record.daily_rate,
      totalMoney: record.total_money,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      _original: record
    }));
  }, [backendRecords, userMap, companyMap, pagination.currentPage, pagination.pageSize]);

  const handleApplyFilters = useCallback(() => {
    setActiveFilters(filters);
    fetchRecords({ ...filters, page: 1 });
  }, [filters, fetchRecords]);

  const handleResetFilters = useCallback(() => {
    const empty = { status: "", user: "", company: "", record_type: "", start_date_from: "", start_date_to: "" };
    setFilters(empty);
    setActiveFilters(empty);
    fetchRecords({ page: 1 });
  }, [fetchRecords]);

  const handlePageChange = useCallback((newPage) => {
    fetchRecords({ ...activeFilters, page: newPage });
  }, [fetchRecords, activeFilters]);

  const handleEdit = useCallback(
    (record) => {
      if (!canEdit && !canManageFinance) {
        notify.error("You do not have permission to edit finance records");
        return;
      }
      setSelectedRecord(record._original);
      setShowFinanceModal(true);
    },
    [canEdit, canManageFinance, notify]
  );

  const handleViewRecord = useCallback((record) => {
    const displayRecord = {
      ...record._original,
      user_name: record.user, 
      company_name: record.company 
    };
    setViewingRecord(displayRecord);
    setShowViewModal(true);
  }, []);

  const handleDeleteClick = useCallback(
    (id) => {
      if (!canDelete && !canManageFinance) {
        notify.error("You do not have permission to delete finance records");
        return;
      }
      setRecordToDelete(id);
      setShowDeleteConfirm(true);
    },
    [canDelete, canManageFinance, notify]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!recordToDelete) return;
    const result = await deleteRecord(recordToDelete);
    if (result.success) {
      notify.success("Finance record deleted successfully");
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      await loadStatistics();
    }
  }, [recordToDelete, deleteRecord, notify, loadStatistics]);

  const handleAdd = useCallback(() => {
    if (!canCreate && !canManageFinance) {
      notify.error("You do not have permission to add finance records");
      return;
    }
    setSelectedRecord(null);
    setShowFinanceModal(true);
  }, [canCreate, canManageFinance, notify]);

  const handleSaveRecord = async (recordData) => {
    if (selectedRecord) {
      const result = await updateRecord(selectedRecord.id, recordData);
      if (result.success) {
        setShowFinanceModal(false);
        await loadStatistics();
      }
    } else {
      const result = await createRecord(recordData);
      if (result.success) {
        setShowFinanceModal(false);
        await loadStatistics();
      }
    }
  };

  const handleExportExcel = useCallback(async () => {
    if (records.length === 0) {
      notify.warning("No records to export");
      return;
    }
    const dataToExport = records.map(({ id, userId, companyId, _original, ...rest }) => rest);
    exportToExcel(dataToExport, `Finance_Records_${new Date().toISOString().split("T")[0]}.xlsx`, "Finance");
    notify.success("Finance records exported to Excel!");
  }, [records, notify]);

  const handleRefresh = useCallback(() => {
    fetchRecords({ ...activeFilters, page: pagination?.currentPage || 1 });
  }, [fetchRecords, activeFilters, pagination]);

  const columns = useMemo(() => [
    { key: "index", label: "#", width: 60, sortable: false, render: (v) => v },
    { key: "user", label: "User", sortable: true },
    { key: "company", label: "Principal", sortable: true },
    { key: "startDate", label: "Start Date", sortable: true },
    { key: "endDate", label: "End Date", sortable: true, render: (v) => v || "-" },
    { 
        key: "status", 
        label: "Status", 
        sortable: true,
        render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                val === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                val === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}>
                {val}
            </span>
        )
    },
    { key: "totalMoney", label: "Total", sortable: true, render: (v) => `$${v}` },
    {
      key: "actions",
      label: "Actions",
      width: 120,
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => handleViewRecord(row)}
                className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded transition-colors"
                title="View"
            >
                <Eye size={16} />
            </button>
            {(canEdit || canManageFinance) && (
                <button
                    onClick={() => handleEdit(row)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                    title="Edit"
                >
                    <Edit2 size={16} />
                </button>
            )}
            {(canDelete || canManageFinance) && (
                <button
                    onClick={() => handleDeleteClick(row.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
      ),
    }
  ], [canEdit, canDelete, canManageFinance, handleViewRecord, handleEdit, handleDeleteClick]);

  const filterFields = [
    {
      key: "record_type",
      label: "Record Type",
      type: "select",
      options: [
        { value: "INCOME", label: "Income" },
        { value: "EXPENSE", label: "Expense" },
      ]
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Pending", label: "Pending" },
        { value: "Overdue", label: "Overdue" },
        { value: "Cancelled", label: "Cancelled" },
      ]
    },
    {
      key: "user",
      label: "User / Seafarer",
      type: "select",
      options: (referenceOptions?.users || [])
    },
    {
      key: "company",
      label: "Principal",
      type: "select",
      options: (referenceOptions?.companies || [])
    },
    { key: "start_date_from", label: "Start Date From", type: "date" },
    { key: "start_date_to", label: "Start Date To", type: "date" },
  ];

  const headerHeight = Math.round(80 * scale);

  return (
    <main style={{...getMainContainerStyles(scale, headerHeight), minWidth: 0}} className="flex flex-col h-full animate-in fade-in duration-300">
      <style>{generateAllPageStyles(scale)}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 border border-emerald-500/20">
                <CircleDollarSign size={24} className="text-emerald-600 dark:text-emerald-400 relative z-10" />
            </div>
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white m-0 tracking-tight">Finance Records</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 m-0">
                    Manage financial transactions, incomes, and expenses.
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            {records.length > 0 && (
                <Button variant="icon" onClick={handleExportExcel} title="Export Excel" scale={scale} style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <Download size={16} className="text-emerald-500" />
                </Button>
            )}
            <Button variant="icon" onClick={handleRefresh} title="Refresh" scale={scale} style={{ width: 30, height: 30, borderRadius: 8, minHeight: 30 }}>
                <RefreshCw size={16} />
            </Button>
            
            {(canCreate || canManageFinance) && (
                <Button onClick={handleAdd} variant="primary" scale={scale} style={{ minHeight: 30, height: 30, padding: "0 14px", fontSize: 13, borderRadius: 8, fontWeight: 500 }}>
                    Add Record
                </Button>
            )}
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.total_records || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Money</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${statistics.total_money || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Daily Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${statistics.average_daily_rate || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${statistics.this_month_total || 0}</p>
          </div>
        </div>
      )}

      {/* Content area with Advanced Filters & Table */}
      <DataTableLayout
          columns={columns}
          storageKey="finance_records"
          fields={filterFields}
          filters={filters}
          onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleResetFilters}
      >
          <AdvancedDataTable
              data={records}
              columns={columns}
              keyField="id"
              onRowClick={(row) => handleViewRecord(row)}
              isLoading={recordsLoading || detailsLoading}
              emptyStateMessage="No finance records found."
          />
      </DataTableLayout>

      <div className="mt-4">
          <Pagination
              page={pagination.currentPage || 1}
              pageSize={pagination.pageSize || 50}
              total={pagination.count || records.length}
              onChange={handlePageChange}
              scale={scale}
              showInfo={true}
          />
      </div>

      {showFinanceModal && (
        <FinanceFormModal
          record={selectedRecord}
          onClose={() => setShowFinanceModal(false)}
          onSave={handleSaveRecord}
          scale={scale}
        />
      )}

      <FinanceViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingRecord(null);
        }}
        record={viewingRecord}
        onDelete={(id) => {
          setShowViewModal(false);
          setViewingRecord(null);
          handleDeleteClick(id);
        }}
        scale={scale}
        canDelete={canDelete || canManageFinance}
      />

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setRecordToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Record"
          message="Are you sure you want to delete this finance record? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          scale={scale}
          loading={recordsLoading}
        />
      )}
    </main>
  );
}

export default FinanceRecords;
