import React, { useState, useMemo } from "react";
import { Filter, Columns, X, ChevronDown, ChevronRight, Search, Check, Save, Bookmark } from "lucide-react";

export function DataTableSidebar({
  isOpen,
  onClose,
  columns = [],
  visibleColumns = [],
  onVisibleColumnsChange,
  fields = [],
  filters = {},
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  savedViews = [],
  onSaveView,
  onLoadView,
}) {
  const [activeTab, setActiveTab] = useState("filters"); // 'filters' or 'columns'
  const [expandedFilters, setExpandedFilters] = useState({});
  const [filterSearch, setFilterSearch] = useState({});
  const [showSaveView, setShowSaveView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const toggleFilter = (key) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilterSearch = (key, value) => {
    setFilterSearch((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (fieldKey, optionValue) => {
    const currentValues = Array.isArray(filters[fieldKey]) ? filters[fieldKey] : (filters[fieldKey] ? [filters[fieldKey]] : []);
    let newValues;
    if (currentValues.includes(optionValue)) {
      newValues = currentValues.filter((v) => v !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }
    // If empty, set to undefined/empty string to clear it
    if (newValues.length === 0) newValues = "";
    else if (newValues.length === 1 && !fields.find(f => f.key === fieldKey)?.multiple) newValues = newValues[0];
    
    onFilterChange(fieldKey, newValues);
  };

  const toggleColumn = (colKey) => {
    if (visibleColumns.includes(colKey)) {
      onVisibleColumnsChange(visibleColumns.filter((k) => k !== colKey));
    } else {
      onVisibleColumnsChange([...visibleColumns, colKey]);
    }
  };

  const handleShowAllColumns = () => onVisibleColumnsChange(columns.map((c) => c.key));
  const handleHideAllColumns = () => onVisibleColumnsChange([]);

  const handleSaveView = () => {
    if (newViewName.trim() && onSaveView) {
      onSaveView(newViewName.trim());
      setNewViewName("");
      setShowSaveView(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl w-80 flex-shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Filter size={20} className="text-blue-600 dark:text-blue-400" />
          Settings
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-1 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("filters")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "filters"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab("columns")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "columns"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Columns
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {activeTab === "filters" && (
          <div className="space-y-4">
            {/* Search Field */}
            {fields.filter(f => f.type === "search").map(field => (
              <div key={field.key} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={field.placeholder || "Search..."}
                  value={filters[field.key] || ""}
                  onChange={(e) => onFilterChange(field.key, e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            ))}

            {/* Accordion Filters */}
            {fields.filter(f => f.type !== "search").map(field => {
              const isExpanded = expandedFilters[field.key] !== false; // default expanded
              const hasManyOptions = field.options && field.options.length > 5;
              const searchTerm = filterSearch[field.key] || "";
              
              const filteredOptions = field.options?.filter(opt => {
                const labelStr = opt.label ? String(opt.label).toLowerCase() : "";
                const searchStr = searchTerm ? String(searchTerm).toLowerCase() : "";
                return labelStr.includes(searchStr);
              });

              return (
                <div key={field.key} className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50">
                  <button
                    onClick={() => toggleFilter(field.key)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{field.label}</span>
                    {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      {hasManyOptions && (
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="text"
                            placeholder={`Search ${field.label}...`}
                            value={searchTerm}
                            onChange={(e) => handleFilterSearch(field.key, e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          />
                        </div>
                      )}
                      
                      {field.type === "select" || field.type === "multi-select" || field.type === "checkbox" ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {filteredOptions?.map(opt => {
                            const currentVals = Array.isArray(filters[field.key]) ? filters[field.key] : (filters[field.key] ? [filters[field.key]] : []);
                            const isChecked = currentVals.includes(opt.value);
                            
                            return (
                              <div key={opt.value} onClick={() => handleCheckboxChange(field.key, opt.value)} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isChecked 
                                    ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500" 
                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-blue-400"
                                }`}>
                                  {isChecked && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                  {opt.label}
                                </span>
                              </div>
                            );
                          })}
                          {filteredOptions?.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">No options found.</p>
                          )}
                        </div>
                      ) : field.type === "date" ? (
                         <input
                          type="date"
                          value={filters[field.key] || ""}
                          onChange={(e) => onFilterChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      ) : (
                         <input
                          type="text"
                          placeholder={field.placeholder || ""}
                          value={filters[field.key] || ""}
                          onChange={(e) => onFilterChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Saved Views Section */}
            {savedViews.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Views</h3>
                <div className="space-y-2">
                  {savedViews.map((view, idx) => (
                    <button
                      key={idx}
                      onClick={() => onLoadView(view)}
                      className="w-full flex items-center gap-2 p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <Bookmark size={14} className="text-blue-500" />
                      {view.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "columns" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button 
                onClick={handleShowAllColumns}
                className="flex-1 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Show All
              </button>
              <button 
                onClick={handleHideAllColumns}
                className="flex-1 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Hide All
              </button>
            </div>

            <div className="space-y-1">
              {columns.map(col => {
                const isVisible = visibleColumns.includes(col.key);
                return (
                  <div key={col.key} onClick={() => toggleColumn(col.key)} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer group transition-colors">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{col.title || col.label}</span>
                    {/* iOS style toggle */}
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isVisible ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isVisible ? 'translate-x-4' : 'translate-x-1'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-3">
        {activeTab === "filters" && showSaveView ? (
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="View name..."
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button onClick={handleSaveView} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Save</button>
            <button onClick={() => setShowSaveView(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={onClearFilters}
            className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onApplyFilters}
            className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-medium shadow-sm shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:shadow-md"
          >
            Apply Filters
          </button>
        </div>
        
        {activeTab === "filters" && !showSaveView && onSaveView && (
          <button 
            onClick={() => setShowSaveView(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            <Save size={14} />
            Save current view
          </button>
        )}
      </div>
    </div>
  );
}
