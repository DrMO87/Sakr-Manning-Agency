import React, { useState, useEffect, useMemo } from "react";
import { DataTableSidebar } from "./DataTableSidebar";
import { X } from "lucide-react";

/**
 * A modern wrapper layout that pairs a Data Table with a sliding Right Sidebar.
 * Handles responsive layout (Push on desktop, Overlay on mobile).
 */
export function DataTableLayout({
  children, // Expected to be AdvancedDataTable
  columns = [],
  defaultVisibleColumns = null,
  storageKey = "", // If provided, persists visible columns and saved views to localStorage
  fields = [],
  filters = {},
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  isSidebarOpen: externalIsSidebarOpen,
  onSidebarToggle,
}) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false);
  
  const isSidebarOpen = externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen;
  
  const handleToggleSidebar = () => {
    if (onSidebarToggle) {
      onSidebarToggle();
    } else {
      setInternalIsSidebarOpen(!internalIsSidebarOpen);
    }
  };
  
  // Local state for visible columns if no default is provided, though usually handled by parent.
  // We'll manage visible columns internally and pass it to the child via React.cloneElement
  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`${storageKey}_columns`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch(e) {}
      }
    }
    return defaultVisibleColumns || columns.map(c => c.key);
  });

  const [savedViews, setSavedViews] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`${storageKey}_views`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch(e) {}
      }
    }
    return [];
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleVisibleColumnsChange = (newCols) => {
    setVisibleColumns(newCols);
    if (storageKey) {
      localStorage.setItem(`${storageKey}_columns`, JSON.stringify(newCols));
    }
  };

  const handleSaveView = (name) => {
    const newView = { name, filters, columns: visibleColumns };
    const newViews = [...savedViews, newView];
    setSavedViews(newViews);
    if (storageKey) {
      localStorage.setItem(`${storageKey}_views`, JSON.stringify(newViews));
    }
  };

  const handleLoadView = (view) => {
    if (view.columns) handleVisibleColumnsChange(view.columns);
    if (view.filters) {
      // Apply filters by triggering onChange for each key, then applying
      Object.keys(view.filters).forEach(key => {
        onFilterChange(key, view.filters[key]);
      });
      // We need a slight delay to let state update before applying, or we can just call apply if parent handles it
      setTimeout(() => {
        if (onApplyFilters) onApplyFilters(view.filters);
      }, 0);
    }
    if (isMobile) setIsSidebarOpen(false);
  };

  // Clone children to pass down visibleColumns and sidebar toggle
  const clonedChild = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Only inject into custom components to avoid React warnings on DOM elements
      if (typeof child.type === 'function' || typeof child.type === 'object') {
        return React.cloneElement(child, {
          visibleColumns,
          onToggleSidebar: handleToggleSidebar,
          isSidebarOpen
        });
      }
    }
    return child;
  });

  return (
    <div className="relative flex w-full flex-1 gap-4 min-h-[400px]">
      {/* Main Table Area */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {clonedChild}
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          transition-all duration-300 ease-in-out h-full z-50 rounded-[22px] overflow-hidden
          ${isMobile ? "fixed top-0 right-0 h-full max-w-[85vw] shadow-2xl" : "relative"}
          ${isSidebarOpen ? "w-80 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="w-80 h-full">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleToggleSidebar}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <DataTableSidebar
            isOpen={isSidebarOpen}
            onClose={handleToggleSidebar}
            columns={columns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={handleVisibleColumnsChange}
            fields={fields}
            filters={filters}
            onFilterChange={onFilterChange}
            onApplyFilters={onApplyFilters}
            onClearFilters={onClearFilters}
            savedViews={savedViews}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
          />
        </div>
      </div>
    </div>
  );
}
