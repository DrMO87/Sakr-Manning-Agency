import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { BASE_WIDTH, COLORS, getScale } from "./Constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Header } from "./Header";
import { Sidebar, MobileSidebar } from "./Sidebar";
import globalSearchApi from "../../services/Dashboard/globalSearchApi";

import { OverviewPage } from "./Content/Overview";
import { CVManagement } from "./Content/CV";
import JobVacanciesPage from "./Content/JobVacancies";
import { CompanyManagement } from "./Content/Company";
import { InterviewManagement } from "./Content/Interviews";
import { DocumentManagement } from "./Content/Documents";
import { UserManagement } from "./Content/Users";
import { FinanceRecords } from "./Content/Finance";
import { SearchResults } from "./Content/SearchResults";
import { CVSubmissionsManagement } from "./Content/CVSubmissions";
import AIApplication from "./Content/AIApplication";
import ChatWidget from "./Components/AI/ChatWidget";
import { SettingsSidePanel } from "./Components/Modal/SettingsSidePanel";

import { ASSETS } from "../../utils/constants";
import { SearchProvider } from "./context/SearchContext";
import { DashboardDataProvider, useDashboardData } from "./context/DashboardDataContext";
import NotificationCenter from "./Components/Common/NotificationCenter";
import LoadingScreen from "./Components/Common/LoadingScreen";

const DashboardAppContent = ({ onLogout, user }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [navItemData, setNavItemData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavigate = useCallback((page, itemData = null) => {
    setCurrentPage(page);
    setNavItemData(itemData);
  }, []);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Lock body scroll and apply zoom styles to avoid window scrollbars
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [backendSearchResults, setBackendSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    loadingCompanies,
    loadingUsers,
    loadingRanks,
    companies,
    users,
    ranks
  } = useDashboardData();

  const isInitialLoading = (loadingCompanies && (companies?.length ?? 0) === 0) ||
    (loadingUsers && (users?.length ?? 0) === 0) ||
    (loadingRanks && (ranks?.length ?? 0) === 0);

  const appContainerRef = useRef(null);
  gsap.registerPlugin(useGSAP);

  useGSAP(() => {
    // Only animate after initial data is loaded
    if (isInitialLoading) return;
    
    const tl = gsap.timeline();
    tl.fromTo(".dashboard-sidebar", 
      { x: -200, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(".dashboard-header", 
      { y: -100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    .fromTo(".dashboard-main-content", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );
  }, { scope: appContainerRef, dependencies: [isInitialLoading] });

  const userData = user;

  const pageData = {
    dashboard: "Dashboard Overview",
    cvs: "Applicants Management",
    management: "Principals & Vessels Management",
    interviews: "Interviews Scheduling",
    documents: "Contracts",
    users: "Users Management",
    finance: "Finance Record",
    search: "Search Results",
    cvSubmissions: "Crew Management",
  };

  const handleSearchSubmit = useCallback(async (query) => {
    setSearchQuery(query);
    setCurrentPage("search");
    if (!query || query.trim().length < 2) return;
    setSearchLoading(true);
    try {
      const results = await globalSearchApi.search(query);
      setBackendSearchResults(results);
    } catch (err) {
      console.error("Global search error:", err);
      setBackendSearchResults({});
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleNavigateFromSearch = useCallback((page, itemData) => {
    handleNavigate(page, itemData);
  }, [handleNavigate]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const commonProps = useMemo(
    () => {
      const isMobileView = windowWidth < 768;
      return {
        scale: isMobileView ? 0.85 : 1,
        isMobile: isMobileView,
      };
    },
    [windowWidth]
  );

  const renderCurrentPage = () => {
    if (isInitialLoading) {
      return <LoadingScreen scale={1} message={"Initializing Dashboard"} subMessage={"Loading core data and reference systems"} />;
    }

    switch (currentPage) {
      case "dashboard":
        return <OverviewPage {...commonProps} user={userData} onNavigate={handleNavigate} />;
      case "cvs":
        return <CVManagement {...commonProps} initialItemData={navItemData} />;
      case "management":
        return <CompanyManagement {...commonProps} initialItemData={navItemData} />;
      case "vacancies":
        return <JobVacanciesPage {...commonProps} />;
      case "interviews":
        return <InterviewManagement {...commonProps} initialItemData={navItemData} />;
      case "documents":
        return <DocumentManagement {...commonProps} initialItemData={navItemData} />;
      case "users":
        return <UserManagement {...commonProps} initialItemData={navItemData} />;
      case "finance":
        return <FinanceRecords {...commonProps} initialItemData={navItemData} />;
      case "AI":
        return <AIApplication {...commonProps} initialItemData={navItemData} isDarkMode={isDarkMode} />;
      case "search":
        return (
          <SearchResults
            {...commonProps}
            searchQuery={searchQuery}
            backendResults={backendSearchResults}
            loading={searchLoading}
            onNavigate={handleNavigateFromSearch}
          />
        );
      case "cvSubmissions":
        return <CVSubmissionsManagement {...commonProps} initialItemData={navItemData} />;
      default:
        return (
          <PlaceholderPage pageTitle={pageData[currentPage]} scale={1} />
        );
    }
  };

  return (
    <SearchProvider currentPage={currentPage}>
      <div 
        ref={appContainerRef}
        className="flex overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300"
        style={{ 
          zoom: zoomLevel,
          height: zoomLevel === 1 ? '100vh' : `calc(100vh / ${zoomLevel})`,
          width: zoomLevel === 1 ? '100%' : `calc(100vw / ${zoomLevel})`
        }}
      >
        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="dashboard-sidebar hidden lg:block sticky top-0 flex-shrink-0 z-[110]" style={{ height: zoomLevel === 1 ? '100vh' : `calc(100vh / ${zoomLevel})` }}>
          <Sidebar
            currentPage={currentPage}
            onPageChange={handleNavigate}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            scale={1}
          />
        </div>

        {/* Mobile Sidebar (Controlled by state) */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          onPageChange={handleNavigate}
          scale={1}
        />

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col transition-all duration-300 min-w-0 relative h-full overflow-hidden"
          style={{ zoom: zoomLevel }}
        >
          <div className="dashboard-header w-full z-10 relative">
            <Header
              pageTitle={pageData[currentPage] || "Dashboard"}
              onMenuClick={() => setMobileMenuOpen(true)}
              onLogout={onLogout}
              onSearchSubmit={handleSearchSubmit}
              onNavigate={handleNavigate}
              user={userData}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </div>
          <div className="dashboard-main-content flex-1 overflow-auto w-full relative z-0">
            {renderCurrentPage()}
          </div>
        </div>

        <NotificationCenter scale={1} position="bottom-left" />

        <SettingsSidePanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          user={userData}
        />
      </div>
    </SearchProvider>
  );
};

const DashboardApp = (props) => {
  return (
    <DashboardDataProvider>
      <DashboardAppContent {...props} />
    </DashboardDataProvider>
  );
};

export const PlaceholderPage = ({ pageTitle }) => {
  return (
    <main className="flex-1 p-8 pt-[133px] bg-gray-50 overflow-auto">
      <div className="bg-white rounded-2xl p-8 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center gap-5">
        <div className="text-5xl">🚀</div>
        <h2 className="text-2xl font-semibold text-gray-800 m-0">
          Coming Soon
        </h2>
        <p className="text-gray-500 text-sm max-w-xs m-0">
          {pageTitle} page is under development. Check back soon!
        </p>
        <ChatWidget />
      </div>
    </main>
  );
};

export default DashboardApp;
