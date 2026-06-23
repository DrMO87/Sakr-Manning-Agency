// components/dashboard/Components/Modal/GenerateContractModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import Button from "../Common/Button";
import { getModalStyles } from "../../Styles/componentStyles";
import { getModalTitleStyles } from "../../Styles/cssClasses";
import { BaseInput } from "../inputs/BaseInput";
import { Select } from "../inputs/Select";
import { DateInput } from "../inputs/DateInput";
import { useFormModal } from "../../hooks/useFormModal";
import { useDashboardData } from "../../context/DashboardDataContext";
import documentsApi from "../../../../services/Dashboard/documentsApi";
import { shipsApi } from "../../../../services/Dashboard/shipsApi";
import { FileSignature, X, Ship } from "lucide-react";

/**
 * GenerateContractModal
 *
 * Flow:
 *  1. Pre-load the ship from submission.ship_details (or submission.ship).
 *  2. If the user has a ship, derive position options from that ship's job_orders[].positions.
 *  3. If the user has NO ship, show a ship selector first; on ship change, load full ship detail → positions.
 *  4. Admin must pick a position → sent as `job_position` in the contract payload.
 *  5. `ship_details` and `job_position_details` are available in CVSubmissionViewModal for read display.
 */
const GenerateContractModal = ({ submission, onClose, onSuccess, scale = 1 }) => {
  const modalStyles  = getModalStyles(scale);
  const titleStyles  = getModalTitleStyles(scale);

  const { fetchShipsByCompany } = useDashboardData();

  // ─── Vessel state ────────────────────────────────────────────────────────────
  const [companyShips, setCompanyShips]   = useState([]); // ships list for selector
  const [loadingShips, setLoadingShips]   = useState(false);
  const [selectedShipId, setSelectedShipId] = useState(null);
  const [selectedShipData, setSelectedShipData] = useState(null); // full ship object
  const [loadingShipDetail, setLoadingShipDetail] = useState(false);

  // ─── Position state ────────────────────────────────────────────────────────
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [positionError, setPositionError] = useState("");

  // ─── Determine pre-assigned ship from submission ───────────────────────────
  const preAssignedShip = useMemo(() => {
    if (submission?.ship_details?.id) return submission.ship_details;
    if (typeof submission?.ship === "object" && submission.ship?.id) return submission.ship;
    return null;
  }, [submission]);

  const preAssignedShipId = useMemo(() => {
    if (preAssignedShip?.id) return preAssignedShip.id;
    if (typeof submission?.ship === "number") return submission.ship;
    return null;
  }, [preAssignedShip, submission]);

  // ─── Load company ships for selector (when no pre-assigned ship) ───────────
  useEffect(() => {
    if (preAssignedShipId) return; // no need — ship already known
    const companyId = typeof submission?.company === "object"
      ? submission.company?.id
      : submission?.company;
    if (!companyId) return;
    (async () => {
      setLoadingShips(true);
      try {
        const ships = await fetchShipsByCompany(companyId);
        setCompanyShips(ships);
      } catch (e) {
        console.error("Failed to load ships", e);
      } finally {
        setLoadingShips(false);
      }
    })();
  }, [submission, preAssignedShipId, fetchShipsByCompany]);

  // ─── Load full ship detail (to get job_orders.positions) ──────────────────
  useEffect(() => {
    const id = preAssignedShipId || selectedShipId;
    if (!id) return;
    if (preAssignedShip && preAssignedShip.job_orders) {
      // already have full data from submission
      setSelectedShipData(preAssignedShip);
      return;
    }
    (async () => {
      setLoadingShipDetail(true);
      try {
        const detail = await shipsApi.getShipById(id);
        setSelectedShipData(detail);
      } catch (e) {
        console.error("Failed to load ship detail", e);
      } finally {
        setLoadingShipDetail(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preAssignedShipId, selectedShipId]);

  // ─── Derive position options from job_orders ───────────────────────────────
  const positionOptions = useMemo(() => {
    if (!selectedShipData?.job_orders) return [];
    const opts = [];
    selectedShipData.job_orders.forEach(order => {
      (order.positions || []).forEach(pos => {
        const label = [
          pos.rank_name || `Rank #${pos.rank}`,
          `Qty: ${pos.quantity}`,
          pos.salary_min && pos.salary_max
            ? `${pos.salary_min}–${pos.salary_max} ${pos.currency || ""}`
            : "",
          pos.contract_duration_months ? `${pos.contract_duration_months}mo` : "",
        ].filter(Boolean).join(" · ");
        opts.push({ value: String(pos.id), label, _raw: pos });
      });
    });
    return opts;
  }, [selectedShipData]);

  // ─── Static fields config ──────────────────────────────────────────────────
  const staticFields = [
    { name: "sign_on_date",  label: "Sign-On Date",          type: "date",   component: "DateInput", required: true,  defaultValue: "", gridCols: 6 },
    { name: "sign_off_date", label: "Sign-Off Date (Optional)", type: "date", component: "DateInput", required: false, defaultValue: "", gridCols: 6 },
    { name: "status",        label: "Initial Status",         type: "select", component: "Select",    required: true,
      gridCols: 12,
      options: [
        { value: "Draft",              label: "Draft" },
        { value: "Pending Signature",  label: "Pending Signature" },
        { value: "Active",             label: "Active" },
      ],
      defaultValue: "Draft"
    },
    { name: "repatriation_terms", label: "Repatriation Terms", type: "text", component: "BaseInput", required: false, placeholder: "e.g., Principal covers return flight...", defaultValue: "", gridCols: 6 },
    { name: "leave_pay_terms",    label: "Leave Pay Terms",    type: "text", component: "BaseInput", required: false, placeholder: "e.g., 30 days paid leave...",          defaultValue: "", gridCols: 6 },
  ];

  // ─── handleCreate ──────────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    if (!selectedPositionId) {
      setPositionError("Please select a job position.");
      throw new Error("Position required");
    }
    const shipId = preAssignedShipId || selectedShipId;
    if (!shipId) {
      setPositionError("Please select a ship first.");
      throw new Error("Vessel required");
    }
    const payload = {
      cv_submission_id:  submission.id,
      ship:              parseInt(shipId),
      job_position:      parseInt(selectedPositionId),
      sign_on_date:      data.sign_on_date,
      status:            data.status || "Draft",
      sign_off_date:     data.sign_off_date || undefined,
      repatriation_terms: data.repatriation_terms || undefined,
      leave_pay_terms:   data.leave_pay_terms || undefined,
    };
    const result = await documentsApi.createContract(payload);
    if (onSuccess) onSuccess(result);
    return { success: true };
  };

  const { formData, errors, loading, handleChange, handleSave, handleClose } = useFormModal({
    fieldConfig: staticFields,
    record: null,
    onSave: handleCreate,
    onClose,
    successMessage: () => "Contract generated successfully!",
  });

  // ─── Render helpers ────────────────────────────────────────────────────────
  const renderField = (field) => {
    const props = {
      key: field.name, name: field.name, label: field.label,
      required: field.required, value: formData[field.name],
      onChange: (val) => handleChange(field.name, val),
      error: errors[field.name], placeholder: field.placeholder,
      variant: "dashboard",
    };
    if (field.component === "Select")    return <Select    {...props} options={field.options} />;
    if (field.component === "DateInput") return <DateInput {...props} />;
    return <BaseInput {...props} type={field.type} />;
  };

  const shipId = preAssignedShipId || selectedShipId;
  const noShipYet = !shipId;

  return (
    <div
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto transition-all"
    >
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-visible border border-slate-200 dark:border-slate-800 flex flex-col my-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
              <FileSignature className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contract Setup</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Setting up contract terms for <strong className="text-slate-700 dark:text-slate-300">{submission.user_name || "Applicant"}</strong>
                {submission.position_name ? ` — ${submission.position_name}` : ""}.
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

        <div className="p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* ── Vessel selector (only when no pre-assigned ship) ── */}
            {!preAssignedShipId && (
              <div className="col-span-12">
                <Select
                  name="ship"
                  label="Vessel Assignment"
                  required
                  value={selectedShipId ? String(selectedShipId) : ""}
                  onChange={(val) => {
                    setSelectedShipId(val ? parseInt(val) : null);
                    setSelectedShipData(null);
                    setSelectedPositionId("");
                    setPositionError("");
                  }}
                  options={companyShips.map(s => ({
                    value: String(s.id),
                    label: `${s.ship_name}${s.imo_number ? ` (${s.imo_number})` : ""}`,
                  }))}
                  disabled={loadingShips}
                  placeholder={loadingShips ? "Loading ships…" : "Select Vessel"}
                  variant="dashboard"
                />
                {!loadingShips && companyShips.length === 0 && (
                  <span className="text-xs text-red-500 mt-1 block font-medium">
                    No ships found for this company.
                  </span>
                )}
              </div>
            )}

            {/* ── Pre-assigned ship info badge ── */}
            {preAssignedShipId && (
              <div className="col-span-12 flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Ship className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Assigned Vessel</span>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {preAssignedShip?.ship_name || `Vessel #${preAssignedShipId}`}
                    {preAssignedShip?.imo_number ? ` (${preAssignedShip.imo_number})` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* ── Position selector (shown once we have a ship) ── */}
            {!noShipYet && (
              <div className="col-span-12">
                <Select
                  name="job_position"
                  label="Job Position"
                  required
                  value={selectedPositionId}
                  onChange={(val) => {
                    setSelectedPositionId(val || "");
                    setPositionError("");
                  }}
                  options={positionOptions}
                  disabled={loadingShipDetail || positionOptions.length === 0}
                  placeholder={
                    loadingShipDetail
                      ? "Loading positions…"
                      : positionOptions.length === 0
                        ? "No positions available on this ship's job orders"
                        : "Select a position"
                  }
                  variant="dashboard"
                  error={positionError}
                />
                {!loadingShipDetail && positionOptions.length === 0 && (
                  <span className="text-xs text-amber-500 mt-1 block font-medium">
                    This ship has no open job order positions.
                  </span>
                )}
              </div>
            )}

            {/* ── Rest of contract fields ── */}
            {staticFields.map((field) => (
              <div
                key={field.name}
                style={{ gridColumn: `span ${field.gridCols || 12}` }}
              >
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span>Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-slate-500 dark:text-slate-400">Esc</kbd> to close</span>
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
                disabled={loading || noShipYet}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Setup...
                  </>
                ) : (
                  "Save Contract Setup"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateContractModal;
