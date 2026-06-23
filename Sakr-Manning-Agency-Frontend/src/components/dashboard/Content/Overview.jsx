// Overview.jsx - Tailwind & Enhancements Refactored
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../Components/Cards/StatCard";
import { ActivityItem } from "../Components/Cards/ActivityItem";
import { StatusBadge } from "../Components/Cards/StatusBadge";
import { RecommendationCard } from "../Components/Cards/RecommendationCard";
import LoadingScreen from "../Components/Common/LoadingScreen";
import { COLORS } from "../Constants";
import { ASSETS } from "../../../utils/constants";
import { PlusCircle, Calendar, Building, FileText, CheckCircle2, LayoutDashboard, Clock, ChevronDown, ChevronUp } from "lucide-react";

// Chart Components
import { CVStatusChart } from "../Components/Charts/CVStatusChart";
import { InterviewTrendChart } from "../Components/Charts/InterviewTrendChart";
import { generateStatPdfReport } from "../../../utils/pdfReportGenerator";

// Modals
import CVFormModal from "../Components/Modal/CVFormModal";
import InterviewFormModal from "../Components/Modal/InterviewFormModal";
import CompanyFormModal from "../Components/Modal/CompanyFormModal";

// Data hooks
import useUsers from "../../../hooks/dashboard/useUsers";
import useCompanies from "../../../hooks/dashboard/useCompanies";
import { useJobOrders } from "../../../hooks/dashboard/useJobOrders";
import useInterviews from "../../../hooks/dashboard/useInterviews";
import useDocuments from "../../../hooks/dashboard/useDocuments";
import useCVDocuments from "../../../hooks/dashboard/useCVDocuments";
import useDocumentExpiry from "../../../hooks/dashboard/useDocumentExpiry";
import { FileWarning } from "lucide-react"; // Section 2

const formatTimestamp = (dateString) => {
  if (!dateString) return "Unknown time";
  const date = new Date(dateString);
  const diffMs = Date.now() - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

export const OverviewPage = ({ scale, isMobile, onNavigate, user }) => {
  const navigate = useNavigate();

  const activityPageMap = {
    "New registration": "users",
    "Interview scheduled": "interviews",
    "Principal registered": "management",
    "Contract generated": "documents",
    "CV submitted": "cvs",
  };

  const handleActivityClick = (title, id, extra = {}) => {
    if (onNavigate && activityPageMap[title]) onNavigate(activityPageMap[title], { id, source: title, ...extra });
  };

  const handleRecommendationClick = (rec) => {
    if (onNavigate && rec.type) onNavigate(rec.type, { id: rec.id, source: "needs_attention" });
  };

  const { users, loading: usersLoading, fetchUsers, getUserStatusCounts } = useUsers();
  const { companies, loading: companiesLoading, fetchCompanies, fetchCompanyStats, createCompany } = useCompanies();
  const { jobOrders, fetchJobOrders } = useJobOrders();
  const { interviews, loading: interviewsLoading, fetchInterviews, fetchInterviewStats, createInterview } = useInterviews();
  const { contracts, loading: documentsLoading, fetchContracts } = useDocuments();
  const { documents: cvDocuments, loading: cvsLoading, fetchDocuments, pagination: cvPagination, createDocument } = useCVDocuments();
  const { expiringDocuments } = useDocumentExpiry();

  const [isNeedsAttentionOpen, setIsNeedsAttentionOpen] = useState(true);
  const [isExpiringDocumentsOpen, setIsExpiringDocumentsOpen] = useState(true);
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyStats, setCompanyStats] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchUsers(),
        fetchCompanies(),
        fetchJobOrders({ status: "Open", page_size: 1000 }),
        fetchInterviews(),
        fetchContracts(),
        fetchDocuments({ page_size: 1000 }),
        fetchInterviewStats().then(res => { if (res?.success) setInterviewStats(res.data); }),
      ]);
    };
    load();
  }, []);

  useEffect(() => {
    if (companies.length > 0 && fetchCompanyStats) {
      fetchCompanyStats().then((res) => { if (res?.success) setCompanyStats(res.data); });
    }
  }, [companies.length]);

  const kpis = useMemo(() => {
    const statusCounts = getUserStatusCounts();
    return {
      totalSeafarers: statusCounts.total,
      totalCVs: cvPagination.count || cvDocuments?.length || 0,
      totalCompanies: companyStats?.total_companies ?? companies.length,
      openPositions: jobOrders?.reduce((total, jo) => {
        if (jo.status === 'Cancelled' || jo.status === 'Closed') return total;
        return total + (jo.positions?.reduce((sum, p) => sum + (p.remaining_slots !== undefined ? p.remaining_slots : (p.quantity || 0)), 0) || 0);
      }, 0) || 0,
      recentRegistrations: statusCounts.recentRegistrations,
    };
  }, [companies, cvDocuments, cvPagination.count, companyStats, getUserStatusCounts, jobOrders]);

  const statCards = useMemo(() => {
    const userCols = [
      { key: "name", header: "Name", render: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || "N/A" },
      { key: "email", header: "Email", render: (r) => r.email || "N/A" },
      { key: "status", header: "Status", render: (r) => r.user_status || r.status || "Active" }
    ];
    const cvCols = [
      { key: "name", header: "Candidate Name", render: (r) => r.name || r.candidate_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || "Anonymous" },
      { key: "email", header: "Email", render: (r) => r.email || "N/A" },
      { key: "position", header: "Position", render: (r) => r.position || r.applied_position || "Not Specified" },
      { key: "status", header: "Status", render: (r) => r.status || "Pending" }
    ];
    const companyCols = [
      { key: "name", header: "Principal Name", render: (r) => r.company_name || r.name || "N/A" },
      { key: "email", header: "Email", render: (r) => r.contact_email || r.email || "N/A" },
      { key: "contact_person", header: "Contact Phone", render: (r) => r.contact_phone || r.contact_person || "N/A" },
      { key: "open_positions", header: "Open Positions", render: (r) => r.open_positions?.toString() || "0" }
    ];
    const positionsCols = [
      { key: "company_name", header: "Principal", render: (r) => r.company_name || r.name || "N/A" },
      { key: "title", header: "Position Title", render: (r) => r.title || r.position_title || "N/A" },
      { key: "vacancies", header: "Vacancies", render: (r) => r.vacancies?.toString() || "0" },
      { key: "status", header: "Status", render: (r) => r.status || "Open" }
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = users.filter(u => u.created_at && new Date(u.created_at) >= thirtyDaysAgo);

    let allPositions = [];
    jobOrders.forEach(jo => {
      if (jo.status !== 'Cancelled' && jo.status !== 'Closed' && jo.positions) {
        jo.positions.forEach(p => {
          const rem = p.remaining_slots !== undefined ? p.remaining_slots : (p.quantity || 0);
          if (rem > 0) {
            allPositions.push({
              company_name: jo.company_name,
              title: p.rank_name,
              vacancies: rem,
              status: jo.status || "Open"
            });
          }
        });
      }
    });

    return [
      { title: "Total Seafarers", value: kpis.totalSeafarers.toString(), trend: "Registered in system", icon: "👥", accent: COLORS.primary || "#1E40AF", onClick: () => generateStatPdfReport("Total Seafarers", userCols, users) },
      { title: "Total CVs", value: kpis.totalCVs?.toString(), trend: "All CV submissions", icon: "📋", accent: "#7C3AED", onClick: () => generateStatPdfReport("Total CVs", cvCols, cvDocuments || []) },
      { title: "Total Principals", value: kpis.totalCompanies.toString(), trend: "Registered companies", icon: "🏢", accent: "#1D4ED8", onClick: () => generateStatPdfReport("Registered Principals", companyCols, companies) },
      { title: "Open Positions", value: kpis.openPositions.toString(), trend: "Across all companies", icon: "💼", accent: "#166534", onClick: () => generateStatPdfReport("Open Positions", positionsCols, allPositions) },
      { title: "New Registrations", value: kpis.recentRegistrations.toString(), trend: "Last 30 days", icon: "🤵", accent: "#6D28D9", onClick: () => generateStatPdfReport("Recent Registrations", userCols, recentUsers) },
    ];
  }, [kpis, users, cvDocuments, companies, jobOrders]);

  const activities = useMemo(() => {
    const all = [];
    const get = (item) => item.created_at || item.createdAt;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pushIfRecent = (dateStr, entry) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d >= thirtyDaysAgo) all.push({ ...entry, date: d });
    };
    users.forEach((u) => pushIfRecent(get(u), { id: u.id, title: "New registration", name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email, timestamp: formatTimestamp(get(u)) }));
    interviews.forEach((i) => pushIfRecent(get(i), { id: i.id, title: "Interview scheduled", name: i.candidate_name || "Unknown Candidate", timestamp: formatTimestamp(get(i)) }));
    companies.forEach((c) => pushIfRecent(get(c), { id: c.id, title: "Principal registered", name: c.company_name || c.name, timestamp: formatTimestamp(get(c)) }));
    contracts.forEach((c) => pushIfRecent(get(c), { id: c.id, title: "Contract generated", name: c.user_name || "Unknown User", timestamp: formatTimestamp(get(c)) }));
    cvDocuments?.forEach((doc) => {
        pushIfRecent(get(doc), {
          id: doc.id,
          title: "CV submitted",
          name: doc.name || doc.email || "Anonymous",
          timestamp: formatTimestamp(get(doc)),
          email: doc.email
        });
      });
    return all.sort((a, b) => b.date - a.date).slice(0, 15).map(({ date, ...rest }) => rest);
  }, [users, interviews, companies, contracts, cvDocuments]);

  const statusBadges = useMemo(() => {
    const pending = interviewStats?.pending ?? interviewStats?.scheduled ?? interviews?.filter((i) => ["Scheduled", "Rescheduled", "Pending"].includes(i.status)).length;
    return {
      pending,
      interview: interviewStats?.total_interviews ?? interviews?.length,
      accepted: cvDocuments?.filter((d) => d.status?.toLowerCase() === "active").length,
      rejected: cvDocuments?.filter((d) => d.status?.toLowerCase() === "blacklist").length
    };
  }, [interviews, cvDocuments, interviewStats]);

  const interviewTrendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const count = interviews?.filter(inv => inv.created_at?.startsWith(dateString)).length || 0;
      data.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count });
    }
    return data;
  }, [interviews]);

  const recommendations = useMemo(() => {
    const items = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(); sevenDaysFromNow.setDate(now.getDate() + 7);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
    users.forEach((user) => {
      const hasInterview = interviews?.some((i) => i.candidate === user.id);
      if (!hasInterview && user.created_at && new Date(user.created_at) >= thirtyDaysAgo) {
        items.push({ id: user.id, type: "cvs", name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown", position: user.ranks?.[0]?.rank?.name || "Not Specified", company: "N/A", status: "pending", submittedDate: user.created_at.split("T")[0], interviewDate: null });
      }
    });
    interviews?.forEach((interview) => {
      if (["Scheduled", "Rescheduled"].includes(interview.status)) {
        const schedDate = new Date(interview.scheduled_date);
        if (schedDate >= now && schedDate <= sevenDaysFromNow) {
          items.push({ id: interview.id, type: "interviews", name: interview.candidate_name || "Unknown Candidate", position: interview.position || "Not Specified", company: interview.company_name || "N/A", status: "interview", submittedDate: null, interviewDate: interview.scheduled_date });
        }
      }
    });
    return items.slice(0, 10);
  }, [users, interviews]);

  const isLoading = usersLoading || companiesLoading || interviewsLoading || cvsLoading || documentsLoading;

  if (isLoading) {
    return (
      <main className="flex-1 min-h-screen pt-[90px] px-6 lg:px-10 flex items-center justify-center">
        <LoadingScreen message="Loading Dashboard Data" subMessage="Collecting the latest maritime analytics and KPIs" />
      </main>
    );
  }

  const currentHour = new Date().getHours();
  let greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <main className="flex-1 min-w-0 min-h-screen pt-[90px] px-6 lg:px-10 pb-12 overflow-x-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mb-2">{greeting}, {user?.first_name || "Admin"}! 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 font-sans">Here's what's happening with your agency today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowCVModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"><PlusCircle size={18} /><span>Add CV</span></button>
          <button onClick={() => setShowInterviewModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-colors shadow-sm"><Calendar size={18} /><span>Schedule Interview</span></button>
          <button onClick={() => setShowCompanyModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-colors shadow-sm"><Building size={18} /><span>Register Principal</span></button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statCards.map((card, idx) => (
            <div key={idx} className="snap-start flex-shrink-0" title="Click to download PDF report">
              <StatCard title={card.title} value={card.value} trend={card.trend} icon={card.icon} accentColor={card.accent} onClick={card.onClick} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-semibold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-500" />CV Status Distribution</h3>
          <CVStatusChart data={statusBadges} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-semibold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"><Calendar size={20} className="text-blue-500" />Interviews Over Time (14 Days)</h3>
          <InterviewTrendChart data={interviewTrendData} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="flex flex-col gap-8">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between cursor-pointer mb-5 group" onClick={() => setIsNeedsAttentionOpen(!isNeedsAttentionOpen)}>
              <h2 className="font-heading font-semibold text-xl text-slate-800 dark:text-white flex items-center gap-2 m-0">
                <Clock size={22} className="text-amber-500" />
                Needs Attention
              </h2>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {isNeedsAttentionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {isNeedsAttentionOpen && (
              <div className="bg-white dark:bg-slate-900 rounded-[22px] p-2 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex-1 min-h-[400px] max-h-[500px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={idx}
                    name={rec.name}
                    position={rec.position}
                    company={rec.company}
                    status={rec.status}
                    submittedDate={rec.submittedDate}
                    interviewDate={rec.interviewDate}
                    onClick={() => handleRecommendationClick(rec)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4 mt-16">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                    <CheckCircle2 size={48} className="text-emerald-500 dark:text-emerald-400 opacity-80" />
                  </div>
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-300">All caught up!</p>
                  <p className="text-sm">No items currently need your attention.</p>
                </div>
              )}
            </div>
            )}
          </div>
        </section>

        <section className="flex flex-col">
          <div className="flex items-center justify-between cursor-pointer mb-5 group" onClick={() => setIsExpiringDocumentsOpen(!isExpiringDocumentsOpen)}>
            <h2 className="font-heading font-semibold text-xl text-slate-800 dark:text-white flex items-center gap-2 m-0">
              <FileWarning size={22} className="text-red-500" />
              Expiring Documents
            </h2>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isExpiringDocumentsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {isExpiringDocumentsOpen && (
            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-2 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex-1 min-h-[300px] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
            {expiringDocuments?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {expiringDocuments.map((doc) => (
                  <div key={doc.id} onClick={() => navigate(`/dashboard/users?editUser=${doc.userId}`)} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-900 shadow-sm cursor-pointer group">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${doc.category === 'expired' || doc.category === 'critical' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                        <FileWarning size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-base m-0">{doc.user}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{doc.name} • {doc.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                      <div className={`text-right ${doc.category === 'expired' || doc.category === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                        <p className="text-sm font-bold m-0">{doc.category === 'expired' ? 'Expired' : `${doc.daysToExpiry} days`}</p>
                        <p className="text-xs m-0">{doc.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4 mt-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                  <CheckCircle2 size={48} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p>No documents expiring soon.</p>
              </div>
            )}
          </div>
          )}
        </section>

        <section className="flex flex-col">
          <div className="flex items-center justify-between cursor-pointer mb-5 group" onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}>
            <h2 className="font-heading font-semibold text-xl text-slate-800 dark:text-white flex items-center gap-2 m-0">
              <LayoutDashboard size={22} className="text-blue-500" />
              Recent Activity
            </h2>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isRecentActivityOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {isRecentActivityOpen && (
            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-[500px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.title}
                  name={activity.name}
                  timestamp={activity.timestamp}
                  onClick={() => handleActivityClick(activity.title, activity.id, activity.email ? { email: activity.email } : {})}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4 mt-16">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                  <FileText size={48} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No recent activity</p>
                <p className="text-sm">Check back later for updates.</p>
              </div>
            )}
          </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <CVFormModal 
        isOpen={showCVModal} 
        onClose={() => setShowCVModal(false)} 
        onSave={async (cvData) => {
          const result = await createDocument(cvData);
          if (result && result.success) {
            setShowCVModal(false);
            fetchDocuments({ page_size: 1000 });
          }
        }} 
        scale={scale} 
      />

      {showInterviewModal && (
        <InterviewFormModal 
          isOpen={showInterviewModal} 
          interview={null}
          onClose={() => setShowInterviewModal(false)} 
          onSave={async (interviewData) => {
            const result = await createInterview(interviewData);
            if (result && result.success) {
              setShowInterviewModal(false);
              fetchInterviews();
            }
          }} 
          scale={scale} 
        />
      )}

      {showCompanyModal && (
        <CompanyFormModal 
          company={null}
          onClose={() => setShowCompanyModal(false)} 
          onSave={async (companyData) => {
            const result = await createCompany(companyData);
            if (result && result.success) {
              setShowCompanyModal(false);
              fetchCompanies();
            }
          }} 
          scale={scale} 
        />
      )}
    </main>
  );
};

