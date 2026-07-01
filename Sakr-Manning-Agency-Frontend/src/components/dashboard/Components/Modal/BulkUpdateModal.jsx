import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { usersApi } from "../../../../services/Dashboard/usersApi";

export default function BulkUpdateModal({ isOpen, onClose, onApply, selectedCount }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [updates, setUpdates] = useState({
    rank: "",
    role: "",
    status: "",
    user_status: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadPositions();
    } else {
      setUpdates({ rank: "", role: "", status: "", user_status: "" });
    }
  }, [isOpen]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getPositions();
      setPositions(data || []);
    } catch (err) {
      console.error("Failed to load positions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const cleanUpdates = {};
    if (updates.rank) cleanUpdates.rank = updates.rank;
    if (updates.role) cleanUpdates.role = updates.role;
    if (updates.status) cleanUpdates.status = updates.status;
    if (updates.user_status) cleanUpdates.user_status = updates.user_status;

    onApply(cleanUpdates);
  };

  const hasChanges = Object.values(updates).some(v => v !== "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bulk Update</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Applying changes to <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCount}</span> selected users
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rank */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rank / Position</label>
            <select
              value={updates.rank}
              onChange={(e) => setUpdates({ ...updates, rank: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- No Change --</option>
              {positions.map((pos, idx) => {
                const val = pos.label || pos.value || pos;
                return <option key={idx} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <select
              value={updates.role}
              onChange={(e) => setUpdates({ ...updates, role: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- No Change --</option>
              <option value="Admin">Admin</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Applicant">Applicant</option>
              <option value="Crew">Crew</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Status</label>
            <select
              value={updates.status}
              onChange={(e) => setUpdates({ ...updates, status: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- No Change --</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Availability</label>
            <select
              value={updates.user_status}
              onChange={(e) => setUpdates({ ...updates, user_status: e.target.value })}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- No Change --</option>
              <option value="ON_SITE">On Site</option>
              <option value="VACATION">Vacation</option>
              <option value="MEDICAL VACATION">Medical Vacation</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hasChanges || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={16} />
            Apply Changes
          </button>
        </div>

      </div>
    </div>
  );
}
