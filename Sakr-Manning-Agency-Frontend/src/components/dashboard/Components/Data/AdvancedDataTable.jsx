import React, { useState, useMemo } from "react";
import { User, ChevronDown, ChevronUp, ChevronRight, Settings2, Search } from "lucide-react";

export function AdvancedDataTable({
  data = [],
  columns = [],
  keyField = "id",
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  isLoading = false,
  emptyStateMessage = "No records found.",
  emptyStateIcon = <User size={32} />,
  expandable = false,
  renderExpandedRow = null,
  visibleColumns = null, // array of column keys that should be visible
  onToggleSidebar = null,
  isSidebarOpen = false,
  rowClassName = null,
}) {
  const [expandedRows, setExpandedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  const filteredData = useMemo(() => {
    if (!globalSearch) return data;
    const lowerSearch = globalSearch.toLowerCase();
    
    return data.filter(row => {
      return columns.some(col => {
        let val = row[col.key];
        if (val === null || val === undefined) return false;
        
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(lowerSearch);
        }
        
        return String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, globalSearch, columns]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.key === sortConfig.key);
      const valA = col && col.sortValue ? col.sortValue(a) : a[sortConfig.key];
      const valB = col && col.sortValue ? col.sortValue(b) : b[sortConfig.key];
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };
  const isSelectable = !!onSelectionChange;
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(data.map(row => row[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const activeColumns = useMemo(() => {
    if (!visibleColumns) return columns;
    return columns.filter(col => visibleColumns.includes(col.key));
  }, [columns, visibleColumns]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-800/20">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search in all columns..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-slate-200 shadow-sm"
          />
        </div>
        
        {onToggleSidebar && (
          <div className="flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all font-medium text-sm ${
                isSidebarOpen 
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 hover:text-blue-600"
              }`}
              title="Toggle Sidebar Filters"
            >
              <Settings2 size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        )}
      </div>


      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="overflow-x-auto flex-1">
        {/* Desktop Table View */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              {isSelectable && (
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer dark:border-slate-600 dark:bg-slate-700"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.headerClassName || ''} ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none' : ''}`}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className="flex items-center gap-1">
                    {col.label || col.title}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />
                    )}
                  </div>
                </th>
              ))}
              {expandable && (
                <th className="py-4 px-6 w-12"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <React.Fragment key={row[keyField]}>
                  <tr
                    className={`transition-colors group ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${
                      selectedIds.includes(row[keyField]) 
                        ? "bg-blue-50/50 dark:bg-blue-900/10" 
                        : highlightedRowId === row[keyField]
                          ? "bg-blue-100/40 dark:bg-blue-800/20 shadow-sm border border-blue-200 dark:border-blue-700/50"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    } ${rowClassName ? (typeof rowClassName === 'function' ? rowClassName(row) : rowClassName) : ""}`}
                    onClick={(e) => {
                      if (
                        e.target.tagName.toLowerCase() === 'input' || 
                        e.target.tagName.toLowerCase() === 'button' || 
                        e.target.tagName.toLowerCase() === 'select' ||
                        e.target.closest('button')
                      ) {
                        return;
                      }
                      setHighlightedRowId(row[keyField] === highlightedRowId ? null : row[keyField]);
                    }}
                    onDoubleClick={(e) => {
                      if (
                        e.target.tagName.toLowerCase() === 'input' || 
                        e.target.tagName.toLowerCase() === 'button' || 
                        e.target.tagName.toLowerCase() === 'select' ||
                        e.target.closest('button')
                      ) {
                        return;
                      }
                      // Clear highlight if they double clicked so it resets after modal closes
                      setHighlightedRowId(null);
                      onRowClick && onRowClick(row);
                    }}
                  >
                    {isSelectable && (
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer dark:border-slate-600 dark:bg-slate-700"
                          checked={selectedIds.includes(row[keyField])}
                          onChange={() => handleSelectRow(row[keyField])}
                        />
                      </td>
                    )}
                    {activeColumns.map((col) => (
                      <td key={col.key} className={`py-4 px-6 align-middle ${col.cellClassName || ''}`}>
                        <div className="font-sans text-sm font-medium text-slate-700 dark:text-slate-200">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </div>
                      </td>
                    ))}
                    {expandable && (
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={(e) => toggleRow(row[keyField], e)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                        >
                          {expandedRows.includes(row[keyField]) ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                  {expandable && expandedRows.includes(row[keyField]) && renderExpandedRow && (
                    <tr key={`${row[keyField]}-expanded`} className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50">
                      <td colSpan={activeColumns.length + (isSelectable ? 1 : 0) + 1 + (onToggleSidebar ? 1 : 0)} className="py-4 px-6">
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                          {renderExpandedRow(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={activeColumns.length + (isSelectable ? 1 : 0) + (expandable ? 1 : 0) + (onToggleSidebar ? 1 : 0)} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                      {emptyStateIcon}
                    </div>
                    <p className="font-medium text-sm">{emptyStateMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
          {sortedData.length > 0 ? (
            sortedData.map((row) => {
              const mobileCols = activeColumns.slice(0, 4); // Display max 4 columns on mobile
              const primaryCol = mobileCols[0];
              const secondaryCols = mobileCols.slice(1);
              const isSelected = selectedIds.includes(row[keyField]);

              return (
                <div
                  key={row[keyField]}
                  className={`bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm transition-colors ${
                    onRowClick ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-600" : ""
                  } ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : highlightedRowId === row[keyField]
                        ? "border-blue-400 bg-blue-50/50 dark:bg-blue-800/30"
                        : "border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={(e) => {
                    if (
                      e.target.tagName.toLowerCase() === 'input' || 
                      e.target.tagName.toLowerCase() === 'button' || 
                      e.target.tagName.toLowerCase() === 'select' ||
                      e.target.closest('button')
                    ) {
                      return;
                    }
                    onRowClick && onRowClick(row);
                  }}
                >
                  <div className="flex items-start justify-between border-b pb-3 mb-3 border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      {isSelectable && (
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer dark:border-slate-600 dark:bg-slate-700"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row[keyField])}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {primaryCol && (
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {primaryCol.render ? primaryCol.render(row[primaryCol.key], row) : row[primaryCol.key]}
                        </div>
                      )}
                    </div>
                    {expandable && (
                      <button 
                        onClick={(e) => toggleRow(row[keyField], e)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                      >
                        {expandedRows.includes(row[keyField]) ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {secondaryCols.map((col) => (
                      <div key={col.key} className="flex justify-between items-start text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap mr-4">
                          {col.label || col.title}:
                        </span>
                        <span className="text-right text-slate-700 dark:text-slate-200 truncate">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {expandable && expandedRows.includes(row[keyField]) && renderExpandedRow && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {renderExpandedRow(row)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3 border border-dashed rounded-xl border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                {emptyStateIcon}
              </div>
              <p className="font-medium text-sm">{emptyStateMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
