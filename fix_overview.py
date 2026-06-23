import re

path = r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Frontend\src\components\dashboard\Content\Overview.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# We know the block starts at `const { users, loading: usersLoading`
# and ends right before `const interviewTrendData = useMemo(() => {`
start_marker = "const { users, loading: usersLoading, fetchUsers, getUserStatusCounts } = useUsers();"
end_marker = "const interviewTrendData = useMemo(() => {"

if start_marker in content and end_marker in content:
    pre = content.split(start_marker)[0]
    post = end_marker + content.split(end_marker, 1)[1]
    
    new_block = """const { users, loading: usersLoading, fetchUsers, getUserStatusCounts } = useUsers();
  const { companies, loading: companiesLoading, fetchCompanies, fetchCompanyStats } = useCompanies();
  const { interviews, loading: interviewsLoading, fetchInterviews, fetchInterviewStats } = useInterviews();
  const { contracts, loading: documentsLoading, fetchContracts } = useDocuments();
  const { documents: cvDocuments, loading: cvsLoading, fetchDocuments, pagination: cvPagination } = useCVDocuments();
  const { expiringDocuments } = useDocumentExpiry();

  const [isNeedsAttentionOpen, setIsNeedsAttentionOpen] = useState(true);
  const [isExpiringDocumentsOpen, setIsExpiringDocumentsOpen] = useState(true);
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true);
  const [companyStats, setCompanyStats] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchUsers(),
        fetchCompanies(),
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
      openPositions: companyStats?.total_open_positions ?? companies.reduce((sum, c) => sum + (c.open_positions || 0), 0),
      recentRegistrations: statusCounts.recentRegistrations,
    };
  }, [companies, cvDocuments, cvPagination.count, companyStats, getUserStatusCounts]);

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
      { key: "name", header: "Company Name", render: (r) => r.company_name || r.name || "N/A" },
      { key: "email", header: "Email", render: (r) => r.contact_email || r.email || "N/A" },
      { key: "contact_person", header: "Contact Phone", render: (r) => r.contact_phone || r.contact_person || "N/A" },
      { key: "open_positions", header: "Open Positions", render: (r) => r.open_positions?.toString() || "0" }
    ];
    const positionsCols = [
      { key: "company_name", header: "Company", render: (r) => r.company_name || r.name || "N/A" },
      { key: "title", header: "Position Title", render: (r) => r.title || r.position_title || "N/A" },
      { key: "status", header: "Status", render: (r) => r.status || "Open" }
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = users.filter(u => u.created_at && new Date(u.created_at) >= thirtyDaysAgo);

    let allPositions = [];
    companies.forEach(c => {
      if (c.vacancies) {
        allPositions = [...allPositions, ...c.vacancies.map(v => ({ company_name: c.name, title: v.title, status: v.status }))];
      }
    });

    return [
      { title: "Total Seafarers", value: kpis.totalSeafarers.toString(), trend: "Registered in system", icon: "👥", accent: COLORS.primary || "#1E40AF", onClick: () => generateStatPdfReport("Total Seafarers", userCols, users) },
      { title: "Total CVs", value: kpis.totalCVs?.toString(), trend: "All CV submissions", icon: "📋", accent: "#7C3AED", onClick: () => generateStatPdfReport("Total CVs", cvCols, cvDocuments || []) },
      { title: "Total Companies", value: kpis.totalCompanies.toString(), trend: "Registered companies", icon: "🏢", accent: "#1D4ED8", onClick: () => generateStatPdfReport("Registered Companies", companyCols, companies) },
      { title: "Open Positions", value: kpis.openPositions.toString(), trend: "Across all companies", icon: "💼", accent: "#166534", onClick: () => generateStatPdfReport("Open Positions", positionsCols, allPositions) },
      { title: "New Registrations", value: kpis.recentRegistrations.toString(), trend: "Last 30 days", icon: "🆕", accent: "#6D28D9", onClick: () => generateStatPdfReport("Recent Registrations", userCols, recentUsers) },
    ];
  }, [kpis, users, cvDocuments, companies]);

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
    companies.forEach((c) => pushIfRecent(get(c), { id: c.id, title: "Company registered", name: c.company_name || c.name, timestamp: formatTimestamp(get(c)) }));
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

  """
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(pre + new_block + post)
    print("Fixed Overview.jsx")
else:
    print("Could not find markers")
