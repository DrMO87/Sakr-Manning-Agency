// src/hooks/dashboard/useDocumentExpiry.js
import { useState, useEffect, useCallback } from "react";
import api from "../../services/Auth/api";

/**
 * Custom hook to aggregate expiring documents across the platform
 */
export const useDocumentExpiry = () => {
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateDaysToExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(expiryDate);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryCategory = (daysToExpiry) => {
    if (daysToExpiry === null) return "unknown";
    if (daysToExpiry < 0) return "expired";
    if (daysToExpiry <= 14) return "critical"; // <= 14 days is critical
    if (daysToExpiry <= 30) return "warning";  // <= 30 days is warning
    if (daysToExpiry <= 90) return "notice";   // <= 90 days is notice
    return "active";
  };

  const fetchAllDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [personalRes, licenseRes, vaccineRes, contractRes] = await Promise.allSettled([
        api.get("/users/personal-documents/"),
        api.get("/my-licenses/"),
        api.get("/vaccinations/"),
        api.get("/contracts/"),
      ]);

      let allDocs = [];

      // Process Personal Documents
      if (personalRes.status === "fulfilled" && personalRes.value?.data) {
        const data = Array.isArray(personalRes.value.data) ? personalRes.value.data : (personalRes.value.data.results || []);
        const formatted = data.map(doc => ({
          id: `doc_${doc.id}`,
          type: "Personal Document",
          name: doc.document_type || "Document",
          number: doc.document_number,
          user: doc.user_name || "Crew Member",
          userId: doc.user,
          expiryDate: doc.expiry_date,
          daysToExpiry: calculateDaysToExpiry(doc.expiry_date),
          category: getExpiryCategory(calculateDaysToExpiry(doc.expiry_date)),
        }));
        allDocs = [...allDocs, ...formatted];
      }

      // Process Licenses
      if (licenseRes.status === "fulfilled" && licenseRes.value?.data) {
        const data = Array.isArray(licenseRes.value.data) ? licenseRes.value.data : (licenseRes.value.data.results || []);
        const formatted = data.map(doc => ({
          id: `lic_${doc.id}`,
          type: "License/STCW",
          name: doc.license_type || "License",
          number: doc.license_number || doc.certificate_number,
          user: doc.user_name || "Crew Member",
          userId: doc.user,
          expiryDate: doc.expiration_date,
          daysToExpiry: calculateDaysToExpiry(doc.expiration_date),
          category: getExpiryCategory(calculateDaysToExpiry(doc.expiration_date)),
        }));
        allDocs = [...allDocs, ...formatted];
      }

      // Process Vaccinations
      if (vaccineRes.status === "fulfilled" && vaccineRes.value?.data) {
        const data = Array.isArray(vaccineRes.value.data) ? vaccineRes.value.data : (vaccineRes.value.data.results || []);
        const formatted = data.map(doc => ({
          id: `vac_${doc.id}`,
          type: "Vaccination",
          name: doc.vaccine_type || "Vaccine",
          number: "N/A",
          user: doc.user_name || "Crew Member",
          userId: doc.user,
          expiryDate: doc.expiry_date,
          daysToExpiry: calculateDaysToExpiry(doc.expiry_date),
          category: getExpiryCategory(calculateDaysToExpiry(doc.expiry_date)),
        }));
        allDocs = [...allDocs, ...formatted];
      }

      // Process Contracts and associated certificates
      if (contractRes.status === "fulfilled" && contractRes.value?.data) {
        const data = Array.isArray(contractRes.value.data) ? contractRes.value.data : (contractRes.value.data.results || []);
        // Base contract expiry (sign off date)
        const formattedContracts = data.map(doc => ({
          id: `con_${doc.id}`,
          type: "Contract",
          name: doc.rank_name || "Contract",
          number: "N/A",
          user: doc.user_name || doc.user_email || "Crew Member",
          userId: doc.user,
          expiryDate: doc.sign_off_date,
          daysToExpiry: calculateDaysToExpiry(doc.sign_off_date),
          category: getExpiryCategory(calculateDaysToExpiry(doc.sign_off_date)),
        }));
        allDocs = [...allDocs, ...formattedContracts];

        // Process Certificate of Competency (COC) and General Operator Certificate (GOC) if present
        data.forEach(contract => {
          const docs = contract.user_documents || {};
          // COC
          if (docs.coc?.expiry_date) {
            allDocs.push({
              id: `coc_${contract.id}`,
              type: "Certificate of Competency",
              name: docs.coc.certificate_name || "COC",
              number: docs.coc.certificate_number || "N/A",
              user: contract.user_name || contract.user_email || "Crew Member",
              userId: contract.user,
              expiryDate: docs.coc.expiry_date,
              daysToExpiry: calculateDaysToExpiry(docs.coc.expiry_date),
              category: getExpiryCategory(calculateDaysToExpiry(docs.coc.expiry_date)),
            });
          }
          // GOC
          if (docs.goc?.expiry_date) {
            allDocs.push({
              id: `goc_${contract.id}`,
              type: "General Operator Certificate",
              name: docs.goc.certificate_name || "GOC",
              number: docs.goc.certificate_number || "N/A",
              user: contract.user_name || contract.user_email || "Crew Member",
              userId: contract.user,
              expiryDate: docs.goc.expiry_date,
              daysToExpiry: calculateDaysToExpiry(docs.goc.expiry_date),
              category: getExpiryCategory(calculateDaysToExpiry(docs.goc.expiry_date)),
            });
          }
        });
      }

      // Filter to only include expiring or expired docs
      const expiring = allDocs.filter(doc => 
        doc.category === "expired" || 
        doc.category === "critical" || 
        doc.category === "warning" || 
        doc.category === "notice"
      );

      // Sort by urgency
      expiring.sort((a, b) => {
        if (a.daysToExpiry === null) return 1;
        if (b.daysToExpiry === null) return -1;
        return a.daysToExpiry - b.daysToExpiry;
      });

      setExpiringDocuments(expiring);
    } catch (error) {
      console.error("Failed to fetch expiring documents", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  return {
    expiringDocuments,
    loading,
    refresh: fetchAllDocuments
  };
};

export default useDocumentExpiry;
