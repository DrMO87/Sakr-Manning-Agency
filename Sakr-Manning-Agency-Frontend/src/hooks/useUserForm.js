import { useState, useCallback, useEffect, useRef } from "react";
import userService from "../services/Form/userService";
import { tokenStorage } from "../services/Auth/tokenStorage";

export const useUserForm = (options = {}) => {
  const {
    autoSaveInterval = 60000,
    enableAutoSave = true,
    targetUserId = null, // Optional target ID to edit someone else
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const autoSaveTimerRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = tokenStorage.getUser();
  }, []);

  // LOAD DATA
  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = currentUserRef.current;
      const idToUse = targetUserId || user?.id;
      if (!idToUse) throw new Error("No user ID available to load");

      const result = await userService.loadFullUserProfile(idToUse);

      if (result.success) {
        return { success: true, data: result.data };
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  // SAVE DATA (Used for both Manual Save and AutoSave)
  const saveFormData = useCallback(async (formData, stepIndex) => {
    setIsSaving(true);
    setError(null);
    try {
      const user = currentUserRef.current;
      const idToUse = targetUserId || user?.id;
      if (!idToUse) throw new Error("No user ID available to save");

      let result;
      if (typeof stepIndex !== 'undefined' && stepIndex !== null) {
        // Partial save for specific step
        result = await userService.saveStepData(idToUse, stepIndex, formData);
      } else {
        // Full save
        result = await userService.saveCompleteForm(idToUse, formData);
      }

      if (result.success) {
        setLastSaved(new Date());
        return { success: true, data: result.data, message: result.message };
      }
    } catch (err) {
      setError(err.message || "Failed to save data");
      return { success: false, message: err.message };
    } finally {
      setIsSaving(false);
    }
  }, [targetUserId]);

  // Auto-save Wrapper (backend only, no local storage)
  const autoSaveFormData = useCallback(
    async (formData, stepIndex) => {
      if (!enableAutoSave) return;
      await saveFormData(formData, stepIndex);
    },
    [enableAutoSave, saveFormData]
  );

  // Submit is essentially a Save + Validation (handled in UI)
  const submitForm = useCallback(async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const user = currentUserRef.current;
      const idToUse = targetUserId || user?.id;
      if (!idToUse) throw new Error("No user ID available to submit");

      const result = await userService.saveCompleteForm(idToUse, formData);
      
      if (result.success) {
        setLastSaved(new Date());
        return { success: true, data: result.data, message: result.message };
      }
    } catch (err) {
      setError(err.message || "Failed to submit form");
      return { success: false, message: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [targetUserId]);

  const startAutoSave = useCallback(
    (getFormData, getStep) => {
      if (!enableAutoSave) return;
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setInterval(() => {
        const step = getStep ? getStep() : undefined;
        autoSaveFormData(getFormData(), step);
      }, autoSaveInterval);
    },
    [enableAutoSave, autoSaveInterval, autoSaveFormData]
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
  }, []);

  useEffect(() => () => stopAutoSave(), [stopAutoSave]);

  return {
    isLoading,
    isSaving,
    isSubmitting,
    error,
    lastSaved,
    loadFormData,
    saveFormData,
    submitForm,
    autoSaveFormData,
    startAutoSave,
    stopAutoSave,
    setError,
  };
};

export default useUserForm;
