import { useState, useCallback } from "react";
import { jobOrdersApi } from "../../services/Dashboard/jobOrdersApi";
import useNotification from "../../components/dashboard/hooks/useNotification";
import { usePermissions } from "./usePermissions";

/**
 * Custom hook for managing Job Positions (Vacancies)
 */
export const useJobPositions = () => {
    const [jobPositions, setJobPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
    });
    
    const { notify } = useNotification();
    const { canEdit, canDelete, canCreate } = usePermissions();

    const fetchJobPositions = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const data = await jobOrdersApi.getJobPositions(filters);
            
            const list = Array.isArray(data) ? data : (data.results || data.job_positions || []);
            setJobPositions(list);
            
            if (!Array.isArray(data)) {
                setPagination({
                    count: data.count || list.length,
                    next: data.next || null,
                    previous: data.previous || null,
                    currentPage: filters.page || 1
                });
            } else {
                setPagination(prev => ({ ...prev, count: data.length, currentPage: filters.page || 1 }));
            }
            
            return { success: true, data: list };
        } catch (err) {
            const msg = err.message || "Failed to load job positions";
            notify.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [notify]);

    const createJobPosition = useCallback(async (data) => {
        if (!canCreate) {
            notify.error("Permission denied");
            return { success: false, error: "Permission denied" };
        }
        
        setLoading(true);
        try {
            const newPos = await jobOrdersApi.createJobPosition(data);
            setJobPositions(prev => [newPos, ...prev]);
            notify.success("Vacancy created successfully");
            return { success: true, data: newPos };
        } catch (err) {
            const msg = err.message || "Failed to create vacancy";
            notify.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [canCreate, notify]);

    const updateJobPosition = useCallback(async (id, data) => {
        if (!canEdit) {
            notify.error("Permission denied");
            return { success: false, error: "Permission denied" };
        }
        
        setLoading(true);
        try {
            const updated = await jobOrdersApi.updateJobPosition(id, data);
            setJobPositions(prev => prev.map(p => p.id === id ? updated : p));
            notify.success("Vacancy updated successfully");
            return { success: true, data: updated };
        } catch (err) {
            const msg = err.message || "Failed to update vacancy";
            notify.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [canEdit, notify]);

    const deleteJobPosition = useCallback(async (id) => {
        if (!canDelete) {
            notify.error("Permission denied");
            return { success: false, error: "Permission denied" };
        }
        
        setLoading(true);
        try {
            await jobOrdersApi.deleteJobPosition(id);
            setJobPositions(prev => prev.filter(p => p.id !== id));
            notify.success("Vacancy deleted successfully");
            return { success: true };
        } catch (err) {
            const msg = err.message || "Failed to delete vacancy";
            notify.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [canDelete, notify]);

    return {
        jobPositions,
        loading,
        pagination,
        canCreate,
        canEdit,
        canDelete,
        fetchJobPositions,
        createJobPosition,
        updateJobPosition,
        deleteJobPosition
    };
};
