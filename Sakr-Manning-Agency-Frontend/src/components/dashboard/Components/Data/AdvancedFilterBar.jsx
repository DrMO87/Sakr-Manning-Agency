import React, { useState } from "react";
import { Filter, Search, Plus, X, Save } from "lucide-react";

export function AdvancedFilterBar({
  fields = [],
  onApplyFilters,
  initialFilters = {}
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleClear = () => {
    const emptyFilters = {};
    fields.forEach(f => emptyFilters[f.key] = "");
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  // Separate the primary search field from others
  const searchField = fields.find(f => f.type === 'search') || fields[0];
  const advancedFields = fields.filter(f => f.key !== searchField.key);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[22px] p-4 mb-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
      <form onSubmit={handleApply} className="flex flex-col gap-4">
        {/* Top Row: Main Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={searchField.placeholder || "Search..."}
              value={filters[searchField.key] || ""}
              onChange={(e) => handleChange(searchField.key, e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            {advancedFields.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  showAdvanced 
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Advanced Filters Row */}
        {showAdvanced && advancedFields.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {advancedFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={filters[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer"
                  >
                    <option value="">{field.placeholder || "Any"}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    placeholder={field.placeholder || ""}
                    value={filters[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
