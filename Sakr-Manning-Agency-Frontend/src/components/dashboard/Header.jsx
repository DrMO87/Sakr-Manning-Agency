// Header.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Bell, Menu, Home, ZoomIn, ZoomOut, Monitor, Sun, Moon, Settings, FileWarning, Clock, X } from "lucide-react";
import { COLORS } from "./Constants";
import useSearch from "./hooks/useSearch";
import UserProfile from "./Components/Data/UserProfile";
import useDocumentExpiry from "../../hooks/dashboard/useDocumentExpiry";
import { useDashboardData } from "./context/DashboardDataContext";

export const Header = ({
  pageTitle,
  onMenuClick,
  onLogout,
  onSearchSubmit,
  user,
  zoomLevel = 1,
  setZoomLevel,
  isDarkMode,
  setIsDarkMode,
  onOpenSettings,
  isSidebarCollapsed,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const { expiringDocuments } = useDocumentExpiry();
  const { reminders, removeReminder } = useDashboardData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const notifRef = useRef(null);
  const remindersRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (remindersRef.current && !remindersRef.current.contains(e.target)) {
        setShowReminders(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  const handleZoomIn = () => setZoomLevel && setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel && setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel && setZoomLevel(1);

  return (
    <header className="relative w-full h-[70px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm flex justify-between items-center px-6 md:px-10 z-[100] gap-5 transition-all duration-300 ease-in-out overflow-visible">
      {/* Faded blue gradient at the heading right part */}
      <div className="absolute top-0 right-0 bottom-0 w-[40%] bg-gradient-to-l from-blue-100/70 dark:from-blue-900/40 to-transparent -z-10 pointer-events-none"></div>

      <div className="flex items-center gap-5 z-10">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-slate-800 dark:text-white m-0 leading-8">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5 justify-end flex-1">
        <form onSubmit={handleSearchSubmit} className="contents hidden lg:contents">
          <div className="relative w-[220px] h-10 hidden lg:block">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full pl-10 pr-10 border-none bg-slate-100 dark:bg-slate-800 focus:bg-slate-200 dark:focus:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[22px] text-sm text-slate-900 dark:text-white outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:hover:text-slate-400 transition-colors"
              disabled={!searchQuery.trim()}
              title={searchQuery.trim() ? "Search" : ""}
            >
              <Search
                size={16}
                color={searchQuery.trim() ? COLORS.primary : "#A6A6A6"}
              />
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button onClick={handleZoomOut} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleZoomReset} className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all" title="Reset Zoom">
            {Math.round(zoomLevel * 100)}%
          </button>
          <button onClick={handleZoomIn} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all" title="Zoom In">
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
          title="Toggle Dark Mode"
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {isDarkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>

        {/* Reminders Toggle */}
        <div className="relative" ref={remindersRef}>
          <button
            onClick={() => setShowReminders(!showReminders)}
            title="Reminders"
            className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Clock size={18} strokeWidth={2} />
            {reminders?.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>

          {showReminders && (
            <div className="absolute top-12 right-0 w-80 max-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col z-[200]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                <h3 className="font-semibold text-slate-800 dark:text-white m-0">Reminders</h3>
                {reminders?.length > 0 && (
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2.5 py-1 rounded-full">
                    {reminders.length} Active
                  </span>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {reminders?.length > 0 ? (
                  <div className="flex flex-col">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 items-start relative group">
                        <button onClick={() => removeReminder(reminder.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                        <div className="p-2 rounded-xl shadow-sm flex-shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          <Clock size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate m-0 mb-0.5">
                            {reminder.assigneeName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-snug break-words">
                            {reminder.text}
                          </p>
                          <p className="text-[11px] font-bold m-0 mt-1.5 inline-block px-2 py-0.5 rounded-md bg-slate-100/50 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {reminder.date} at {reminder.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Clock size={20} className="opacity-40" />
                    </div>
                    <p className="text-sm font-medium m-0 text-slate-600 dark:text-slate-300">No Reminders</p>
                    <p className="text-xs m-0 mt-1 opacity-70">You don't have any active reminders.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Bell size={18} strokeWidth={2} />
            {expiringDocuments?.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 max-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col z-[200]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                <h3 className="font-semibold text-slate-800 dark:text-white m-0">Document Alerts</h3>
                {expiringDocuments?.length > 0 && (
                  <span className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full">
                    {expiringDocuments.length} Expiring
                  </span>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {expiringDocuments?.length > 0 ? (
                  <div className="flex flex-col">
                    {expiringDocuments.slice(0, 10).map((doc) => (
                      <div key={doc.id} onClick={() => { setShowNotifications(false); onNavigate('users', { id: doc.userId }); }} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 items-start cursor-pointer">
                        <div className={`p-2 rounded-xl shadow-sm flex-shrink-0 ${
                          doc.category === 'critical' || doc.category === 'expired' 
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50' 
                            : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50'
                        }`}>
                          <FileWarning size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate m-0 mb-0.5">
                            {doc.user}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 truncate leading-snug">
                            {doc.name} • {doc.number}
                          </p>
                          <p className={`text-[11px] font-bold m-0 mt-1.5 inline-block px-2 py-0.5 rounded-md ${
                            doc.category === 'expired' ? 'bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                            doc.category === 'critical' ? 'bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                            'bg-slate-100/50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {doc.category === 'expired' 
                              ? `Expired on ${doc.expiryDate}` 
                              : `Expiring in ${doc.daysToExpiry} days (${doc.expiryDate})`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {expiringDocuments.length > 10 && (
                      <button className="p-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-center font-medium transition-colors w-full border-none outline-none">
                        View All ({expiringDocuments.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Bell size={20} className="opacity-40" />
                    </div>
                    <p className="text-sm font-medium m-0 text-slate-600 dark:text-slate-300">All caught up!</p>
                    <p className="text-xs m-0 mt-1 opacity-70">No documents expiring soon.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Toggle */}
        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Settings size={18} strokeWidth={2} />
        </button>

        <button
          onClick={() => navigate("/")}
          title="Go to Landing Page"
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Home size={18} strokeWidth={2} />
        </button>

        <div className="hidden md:block border-l border-slate-200 dark:border-slate-700 h-8 mx-1"></div>

        <UserProfile user={user} onLogout={onLogout} scale={1} />
      </div>
    </header>
  );
};
