import { useState } from "react";
import { usersApi } from "../../../services/Dashboard/usersApi";
import { companiesApi } from "../../../services/Dashboard/companiesApi";
import { jobOrdersApi } from "../../../services/Dashboard/jobOrdersApi";
import { interviewsApi } from "../../../services/Dashboard/interviewsApi";
import { exportToJSON } from "../../../utils/exportHelpers";
import useNotification from "./useNotification";

export const useDatabaseBackup = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreProgress, setRestoreProgress] = useState({ current: 0, total: 0, message: "" });
    const { notify } = useNotification();

    const fetchAllPages = async (fetchFn, key = "results") => {
        try {
            const res = await fetchFn({ page_size: 5000 });
            if (Array.isArray(res)) return res;
            if (res && res[key]) return res[key];
            if (res && res.data) return res.data;
            return [];
        } catch (err) {
            console.error("Error fetching all pages:", err);
            return [];
        }
    };

    const exportFullDatabase = async () => {
        setIsExporting(true);
        notify.info("Compiling full database backup...");
        try {
            const [users, companies, jobOrders, interviews] = await Promise.all([
                fetchAllPages(usersApi.getUsers),
                fetchAllPages(companiesApi.getCompanies),
                fetchAllPages(jobOrdersApi.getJobOrders, "job_orders"),
                fetchAllPages(interviewsApi.getInterviews)
            ]);

            const backupData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: "1.0",
                },
                collections: {
                    users,
                    companies,
                    jobOrders,
                    interviews
                }
            };

            exportToJSON(backupData, `sakr_full_backup_${new Date().getTime()}.json`);
            notify.success("Database backup completed successfully!");
        } catch (error) {
            console.error("Backup failed:", error);
            notify.error("Failed to compile database backup.");
        } finally {
            setIsExporting(false);
        }
    };

    const restoreFullDatabase = async (file) => {
        if (!file) return;

        setIsRestoring(true);
        setRestoreProgress({ current: 0, total: 100, message: "Parsing backup file..." });

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.collections) {
                throw new Error("Invalid backup file format");
            }

            const { users = [], companies = [], jobOrders = [], interviews = [] } = backupData.collections;
            
            const totalItems = users.length + companies.length + jobOrders.length + interviews.length;
            let currentItem = 0;

            const updateProgress = (msg) => {
                currentItem++;
                setRestoreProgress({ current: currentItem, total: totalItems, message: msg });
            };

            // 1. Restore Companies
            for (const company of companies) {
                try {
                    const { id, created_at, updated_at, ...data } = company;
                    await companiesApi.createCompany(data);
                } catch (e) {
                    console.warn("Failed to restore company:", company.name, e);
                }
                updateProgress(`Restoring company: ${company.name}`);
            }

            // 2. Restore Users
            for (const user of users) {
                try {
                    const { id, created_at, updated_at, cv_file, avatar, ...data } = user;
                    await usersApi.createUser(data);
                } catch (e) {
                    console.warn("Failed to restore user:", user.email, e);
                }
                updateProgress(`Restoring user: ${user.email || user.first_name}`);
            }

            // 3. Restore Job Orders
            for (const order of jobOrders) {
                try {
                    const { id, created_at, updated_at, ...data } = order;
                    await jobOrdersApi.createJobOrder(data);
                } catch (e) {
                    console.warn("Failed to restore job order:", order.order_number, e);
                }
                updateProgress(`Restoring job order...`);
            }

            // 4. Restore Interviews
            for (const interview of interviews) {
                try {
                    const { id, created_at, updated_at, ...data } = interview;
                    await interviewsApi.createInterview(data);
                } catch (e) {
                    console.warn("Failed to restore interview:", interview.id, e);
                }
                updateProgress(`Restoring interview...`);
            }

            notify.success("Database restore completed! Some items may have skipped if they already exist.");
        } catch (error) {
            console.error("Restore failed:", error);
            notify.error(error.message || "Failed to restore database from file.");
        } finally {
            setIsRestoring(false);
            setRestoreProgress({ current: 0, total: 0, message: "" });
        }
    };

    return {
        exportFullDatabase,
        restoreFullDatabase,
        isExporting,
        isRestoring,
        restoreProgress
    };
};
