import React, { useState, useEffect } from "react";
import { X, User, Palette, Building2, FileText, Database, Shield, Monitor, Moon, Sun, Search, ZoomIn, ZoomOut, List, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { BaseInput } from "../../../form/inputs/BaseInput";
import { TextArea } from "../../../form/inputs/TextArea";
import { useReferenceData } from "../../../../hooks/useReferenceData";
import useNotification from "../../hooks/useNotification";
import { useDashboardData } from "../../context/DashboardDataContext";
import { exportToCSV } from "../../../../utils/exportHelpers";
import { useDatabaseBackup } from "../../hooks/useDatabaseBackup";

const TABS = [
  { id: "profile", label: "Profile & Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "agency", label: "Agency Details", icon: Building2 },
  { id: "contracts", label: "Contract Defaults", icon: FileText },
  { id: "dropdowns", label: "Dropdown Data", icon: List },
  { id: "data", label: "System Management", icon: Database },
];

export const SettingsSidePanel = ({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  zoomLevel,
  setZoomLevel,
  user
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Reference Data hook
  const { data: refData, isLoading: isRefLoading, addReferenceItem, updateReferenceItem, deleteReferenceItem } = useReferenceData();
  const { notify } = useNotification();
  const { users, companies } = useDashboardData();
  const [isIndexing, setIsIndexing] = useState(false);
  const fileInputRef = React.useRef(null);
  
  const { 
    exportFullDatabase, 
    restoreFullDatabase, 
    isExporting, 
    isRestoring, 
    restoreProgress 
  } = useDatabaseBackup();

  const [selectedDropdown, setSelectedDropdown] = useState("flags");
  const [newItemData, setNewItemData] = useState({});
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState("");
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemData, setEditItemData] = useState({});
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  
  // Local storage state for Agency settings (until backend is ready)
  const [agencySettings, setAgencySettings] = useState({
    agencyName: "Sakr Manning Agency",
    registrationNumber: "SMA-12345",
    contactEmail: "info@sakrmaritime.com",
    contactPhone: "+1 234 567 8900",
    defaultRepatriation: "Principal covers economy class return flight to nearest international airport upon completion of contract.",
    defaultLeavePay: "As per POEA/MLC standard, 30 days basic wage per month of service.",
  });

  useEffect(() => {
    const saved = localStorage.getItem("sakr_agency_settings");
    if (saved) {
      setAgencySettings(JSON.parse(saved));
    }
  }, []);

  const handleSaveAgencySettings = (e) => {
    e.preventDefault();
    localStorage.setItem("sakr_agency_settings", JSON.stringify(agencySettings));
    notify.success("Agency settings saved successfully");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      restoreFullDatabase(file);
    }
  };

  const handleRebuildIndex = async () => {
    setIsIndexing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsIndexing(false);
    notify.success("Search index successfully rebuilt");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 z-[210] w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal preferences and agency defaults.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto py-4">
            <nav className="flex flex-col gap-1 px-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Forms */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20 p-8">
            
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profile & Account</h3>
                  <div className="grid gap-6">
                    <BaseInput
                      name="adminName"
                      label="Full Name"
                      value={user?.username || "Admin User"}
                      variant="dashboard"
                      disabled
                    />
                    <BaseInput
                      name="adminEmail"
                      label="Email Address"
                      value={user?.email || "admin@sakrmaritime.com"}
                      variant="dashboard"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Note: Profile changes must currently be handled by IT Support.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appearance Settings</h3>
                  
                  {/* Theme Toggle */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">System Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setIsDarkMode(false)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${!isDarkMode ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        <Sun className={`w-8 h-8 ${!isDarkMode ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${!isDarkMode ? 'text-blue-700' : 'text-slate-600 dark:text-slate-400'}`}>Light Mode</span>
                      </button>
                      <button 
                        onClick={() => setIsDarkMode(true)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-500'}`}
                      >
                        <Moon className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Zoom Level */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">UI Scale & Zoom</label>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <button 
                        onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(zoomLevel * 100)}%</span>
                      </div>
                      <button 
                        onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))}
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "agency" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleSaveAgencySettings}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Agency Information</h3>
                  <div className="grid gap-6">
                    <BaseInput
                      name="agencyName"
                      label="Official Agency Name"
                      value={agencySettings.agencyName}
                      onChange={(val) => setAgencySettings({...agencySettings, agencyName: val})}
                      variant="dashboard"
                    />
                    <BaseInput
                      name="registrationNumber"
                      label="Registration Number"
                      value={agencySettings.registrationNumber}
                      onChange={(val) => setAgencySettings({...agencySettings, registrationNumber: val})}
                      variant="dashboard"
                    />
                    <BaseInput
                      name="contactEmail"
                      label="Contact Email"
                      value={agencySettings.contactEmail}
                      onChange={(val) => setAgencySettings({...agencySettings, contactEmail: val})}
                      variant="dashboard"
                    />
                    <BaseInput
                      name="contactPhone"
                      label="Contact Phone"
                      value={agencySettings.contactPhone}
                      onChange={(val) => setAgencySettings({...agencySettings, contactPhone: val})}
                      variant="dashboard"
                    />
                    <div className="mt-4 flex justify-end">
                      <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "contracts" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleSaveAgencySettings}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contract Defaults</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">These standard terms will be used to auto-fill contract generation forms.</p>
                  <div className="grid gap-6">
                    <TextArea
                      name="defaultRepatriation"
                      label="Default Repatriation Terms"
                      value={agencySettings.defaultRepatriation}
                      onChange={(val) => setAgencySettings({...agencySettings, defaultRepatriation: val})}
                      variant="dashboard"
                      rows={4}
                    />
                    <TextArea
                      name="defaultLeavePay"
                      label="Default Leave Pay Terms"
                      value={agencySettings.defaultLeavePay}
                      onChange={(val) => setAgencySettings({...agencySettings, defaultLeavePay: val})}
                      variant="dashboard"
                      rows={4}
                    />
                    <div className="mt-4 flex justify-end">
                      <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all">
                        Save Defaults
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Data Management</h3>
                  
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-6">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-blue-500" /> Database Backup & Restore
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Export a complete JSON backup of all candidates, ships, and companies, or restore from an existing backup.</p>
                    
                    {isRestoring && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{restoreProgress.message}</span>
                          <span>{restoreProgress.current} / {restoreProgress.total}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${restoreProgress.total > 0 ? (restoreProgress.current / restoreProgress.total) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={exportFullDatabase}
                        disabled={isExporting || isRestoring}
                        className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isExporting ? "Exporting..." : "Export Database"}
                      </button>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                      />
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExporting || isRestoring}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                        Restore Database
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-emerald-500" /> Search Indexing
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Rebuild the global search index if you are experiencing missing search results.</p>
                    <button 
                      onClick={handleRebuildIndex}
                      disabled={isIndexing}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {isIndexing && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isIndexing ? "Rebuilding..." : "Rebuild Index"}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "dropdowns" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Manage Dropdown Lists</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Add new options to the dropdown menus used throughout the application.</p>
                  
                  {/* Category Selector */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { id: "flags", label: "Nationalities / Flags" },
                      { id: "vesselTypes", label: "Vessel Types" },
                      { id: "ranks", label: "Job Positions (Ranks)" },
                      { id: "companyTypes", label: "Principal Types" }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedDropdown(cat.id);
                          setNewItemData({});
                          setAddItemError("");
                          setEditingItemId(null);
                          setSearchTerm("");
                          setHighlightedRowId(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                          selectedDropdown === cat.id 
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Add New Form */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-8">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-500" /> Add New Option
                    </h4>
                    
                    {addItemError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800">
                        {addItemError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 items-end">
                      <BaseInput
                        name="name"
                        label={selectedDropdown === "companyTypes" ? "Type Name" : "Name"}
                        value={newItemData.name || ""}
                        onChange={(val) => setNewItemData({...newItemData, name: val})}
                        variant="dashboard"
                      />
                      
                      {selectedDropdown === "ranks" && (
                        <BaseInput
                          name="code"
                          label="Rank Code (e.g. MST)"
                          value={newItemData.code || ""}
                          onChange={(val) => setNewItemData({...newItemData, code: val})}
                          variant="dashboard"
                        />
                      )}
                      
                      <div className={selectedDropdown !== "ranks" ? "sm:col-span-1 flex items-end" : "sm:col-span-2 flex items-end"}>
                        <button 
                          onClick={async () => {
                            if (!newItemData.name) {
                              setAddItemError("Name is required");
                              return;
                            }
                            setIsAddingItem(true);
                            setAddItemError("");
                            
                            const res = await addReferenceItem(selectedDropdown, newItemData);
                            if (res.success) {
                              setNewItemData({});
                            } else {
                              setAddItemError(res.message);
                            }
                            setIsAddingItem(false);
                          }}
                          disabled={isAddingItem}
                          className="w-full sm:w-auto px-6 h-[46px] whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAddingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Items List */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Existing {selectedDropdown}
                      </h4>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`Search...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">ID</th>
                              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Name</th>
                              {selectedDropdown === "ranks" && (
                                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Code</th>
                              )}
                              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(refData[selectedDropdown] || [])
                              .filter(item => {
                                if (!searchTerm) return true;
                                const search = searchTerm.toLowerCase();
                                return (item.name?.toLowerCase() || "").includes(search) || 
                                       (item.code?.toLowerCase() || "").includes(search);
                              })
                              .filter((item, index, self) => {
                                if (selectedDropdown === "ranks") {
                                  return self.findIndex(t => t.name === item.name) === index;
                                }
                                return true;
                              })
                              .map(item => (
                              <tr 
                                key={item.id} 
                                className={`transition-colors group cursor-pointer ${
                                  highlightedRowId === item.id
                                    ? "bg-blue-100/40 dark:bg-blue-800/20 shadow-sm border border-blue-200 dark:border-blue-700/50"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                                onClick={(e) => {
                                  if (
                                    e.target.tagName.toLowerCase() === 'input' || 
                                    e.target.tagName.toLowerCase() === 'button' || 
                                    e.target.tagName.toLowerCase() === 'select' ||
                                    e.target.closest('button') ||
                                    editingItemId === item.id
                                  ) {
                                    return;
                                  }
                                  setHighlightedRowId(item.id === highlightedRowId ? null : item.id);
                                }}
                                onDoubleClick={(e) => {
                                  if (
                                    e.target.tagName.toLowerCase() === 'input' || 
                                    e.target.tagName.toLowerCase() === 'button' || 
                                    e.target.tagName.toLowerCase() === 'select' ||
                                    e.target.closest('button') ||
                                    editingItemId === item.id
                                  ) {
                                    return;
                                  }
                                  setHighlightedRowId(null);
                                  setEditingItemId(item.id);
                                  setEditItemData({ ...item });
                                }}
                              >
                                {editingItemId === item.id ? (
                                  <td colSpan={selectedDropdown === "ranks" ? 4 : 3} className="px-4 py-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                                      <input 
                                        type="text"
                                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white"
                                        value={editItemData.name || ""}
                                        onChange={(e) => setEditItemData({...editItemData, name: e.target.value})}
                                        placeholder="Name"
                                      />
                                      {selectedDropdown === "ranks" && (
                                        <input 
                                          type="text"
                                          className="w-24 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white"
                                          value={editItemData.code || ""}
                                          onChange={(e) => setEditItemData({...editItemData, code: e.target.value})}
                                          placeholder="Code"
                                        />
                                      )}
                                      <div className="flex items-center gap-2">
                                        <button 
                                          disabled={isUpdatingItem}
                                          onClick={async () => {
                                            setIsUpdatingItem(true);
                                            await updateReferenceItem(selectedDropdown, item.id, editItemData);
                                            setIsUpdatingItem(false);
                                            setEditingItemId(null);
                                          }}
                                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          {isUpdatingItem ? "Saving..." : "Save"}
                                        </button>
                                        <button 
                                          disabled={isUpdatingItem}
                                          onClick={() => setEditingItemId(null)}
                                          className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                  <>
                                    <td className="px-4 py-3 text-slate-500">#{item.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                                      {item.name}
                                    </td>
                                    {selectedDropdown === "ranks" && (
                                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                        {item.code?.split('-')[0] || item.code}
                                      </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button 
                                          onClick={() => {
                                            setEditingItemId(item.id);
                                            setEditItemData({ ...item });
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={async () => {
                                            if (window.confirm("Are you sure you want to delete this option?")) {
                                              setIsDeletingItem(item.id);
                                              await deleteReferenceItem(selectedDropdown, item.id);
                                              setIsDeletingItem(null);
                                            }
                                          }}
                                          disabled={isDeletingItem === item.id}
                                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                          title="Delete"
                                        >
                                          {isDeletingItem === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                            {(!refData[selectedDropdown] || refData[selectedDropdown].length === 0) && (
                              <tr>
                                <td colSpan={selectedDropdown === "ranks" ? 4 : 3} className="px-4 py-8 text-center text-slate-500">
                                  {isRefLoading ? "Loading..." : "No items found."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </>
  );
};
