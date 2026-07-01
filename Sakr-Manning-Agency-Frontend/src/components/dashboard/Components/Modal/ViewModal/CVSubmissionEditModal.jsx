import React, { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Camera, X, Upload, FileText, CheckCircle, ChevronDown, ChevronUp, Save, Download, User, GraduationCap, Phone, HeartPulse, Plane, Award, Stethoscope, BookOpen, Anchor, Users, ShieldCheck, Trash2 } from "lucide-react";
import { useUserForm } from "../../../../../hooks/useUserForm";
import { useReferenceData } from "../../../../../hooks/useReferenceData";
import { ReferenceDataProvider } from "../../../../../context/ReferenceDataContext";
import { FormSaveProvider } from "../../../../../context/FormSaveContext";
import { ToastProvider, useToast } from "../../../../../context/ToastContext";
import { useAuthContext } from "../../../../../context/AuthContext";
import api from "../../../../../services/Auth/api";
import userService from "../../../../../services/Form/userService";
import { cvSubmissionsApi } from "../../../../../services/Dashboard/cvSubmissionsApi";
import GenerateContractModal from "./../GenerateContractModal";
import CVSubmissionFormModal from "./../CVSubmissionFormModal";
import { generateBrandedCVPdf } from "../../../../../utils/dashboard/brandedCVGenerator";
import { getMediaUrl } from "../../../../../utils/fileHelpers";

// Import all form steps from SakrForm
import { PositionPersonalForm } from "../../../../form/steps/PositionPersonalForm";
import { EducationForm } from "../../../../form/steps/EducationForm";
import { ContactForm } from "../../../../form/steps/ContactForm";
import { EmergencyForm } from "../../../../form/steps/EmergencyForm";
import { DocumentsForm } from "../../../../form/steps/DocumentsForm";
import { CertificatesForm } from "../../../../form/steps/CertificatesForm";
import { HealthForm } from "../../../../form/steps/HealthForm";
import { CoursesForm } from "../../../../form/steps/CoursesForm";
import { SeaServiceForm } from "../../../../form/steps/SeaServiceForm";
import { ReferencesForm } from "../../../../form/steps/ReferencesForm";
import { AdminAttachmentsSection } from '../../AdminAttachmentsSection';

// Error Boundary for internal form rendering
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Form section crashed:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-900 border border-red-300 rounded m-4">
          <h2 className="font-bold text-lg">Failed to render this section.</h2>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const themeStyles = {
  blue: "bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 ring-blue-500/10",
  emerald: "bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 ring-emerald-500/10",
  violet: "bg-violet-50/80 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/60 ring-violet-500/10",
  amber: "bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 ring-amber-500/10",
  rose: "bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 ring-rose-500/10",
  indigo: "bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 ring-indigo-500/10",
  cyan: "bg-cyan-50/80 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60 ring-cyan-500/10",
  teal: "bg-teal-50/80 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/60 ring-teal-500/10",
  orange: "bg-orange-50/80 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60 ring-orange-500/10",
  slate: "bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800/60 ring-slate-500/10",
};

// Accordion Component
const AccordionSection = ({ title, icon: Icon, colorTheme = "blue", children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const currentTheme = themeStyles[colorTheme] || themeStyles.blue;
  const textColor = currentTheme.split(' ').find(c => c.startsWith('text-')) || '';

  return (
    <div className={`bg-white dark:bg-slate-900/80 border rounded-2xl overflow-hidden mb-5 shadow-sm transition-all duration-300 ${isOpen ? currentTheme.split(' ').filter(c => c.startsWith('border-') || c.startsWith('ring-')).join(' ') + ' ring-4' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full group flex items-center justify-between p-5 transition-colors duration-200 ${isOpen ? currentTheme.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('hover:bg-') || c.startsWith('dark:bg-') || c.startsWith('dark:hover:bg-')).join(' ') : 'bg-transparent'}`}
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-2.5 rounded-xl transition-colors duration-200 ${isOpen ? 'bg-white/80 dark:bg-slate-950/50 shadow-sm ' + textColor : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className={`font-semibold text-lg tracking-tight ${isOpen ? textColor : 'text-slate-900 dark:text-white'}`}>{title}</h3>
        </div>
        <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/50 dark:bg-slate-950/30 ' + textColor : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      {isOpen && (
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 animate-in slide-in-from-top-2 fade-in duration-300">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};


// AdminAttachmentsSection extracted

export function CVSubmissionEditModal(props) {
  if (!props.isOpen) return null;
  return (
    <ToastProvider>
      <CVSubmissionEditModalInner {...props} />
    </ToastProvider>
  );
}

function CVSubmissionEditModalInner({ isOpen, onClose, submission }) {

  const [isUpdating, setIsUpdating] = useState(false);
  const { notify } = useToast();
  const { user: currentUser } = useAuthContext();
  const isAdminOrHR = currentUser?.role === "Admin" || currentUser?.role === "HR";

  const userId = useMemo(() => {
    return typeof submission?.user === 'object' ? submission?.user?.id : submission?.user;
  }, [submission]);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      documents: [],
      certificates: [],
      health: [],
      courses: [],
      seaServices: [],
      workExperiences: [],
      references: [],
    },
  });

  const {
    isLoading: isLoadingBackend,
    loadFormData,
  } = useUserForm({
    autoSaveInterval: 0, // No auto-save for admin
    enableAutoSave: false,
    targetUserId: userId,
  });

  const {
    data: referenceData,
    isLoading: isLoadingReference,
    loadReferenceData,
  } = useReferenceData({
    loadOnMount: true,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [showGenerateContract, setShowGenerateContract] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  // Initialize form data on mount
  useEffect(() => {
    const initializeForm = async () => {
      try {
        const refRes = await loadReferenceData();
        const rawPositions = refRes?.data?.positions || [];
        const positionsOpts = (rawPositions || []).map((item) => {
          if (typeof item === "string") {
            return { key: item, value: item, label: item };
          }
          const id = item.value ?? item.id;
          const name = item.label ?? item.name ?? item.title ?? String(id ?? "");
          return { key: id, value: id, label: name, code: item.code ?? "" };
        });

        const result = await loadFormData();

        if (result?.success && result?.data) {
          let application_for_position = result.data.application_for_position;

          if (application_for_position && typeof application_for_position === "string") {
            const matchedOpt = positionsOpts.find(
              (opt) => opt.label?.toLowerCase() === application_for_position.toLowerCase() || opt.value?.toString() === application_for_position
            );
            if (matchedOpt) {
              application_for_position = matchedOpt.value;
            }
          }

          methods.reset({
            ...result.data,
            application_for_position,
            documents: result.data.documents || [],
            certificates: result.data.certificates || [],
            health: result.data.health || [],
            courses: result.data.courses || [],
            seaServices: result.data.seaServices || [],
            references: result.data.references || [],
          });
        }
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize form:", err);
        notify.error("Failed to load applicant data.");
        setIsInitialized(true);
      }
    };

    if (userId) {
      initializeForm();
    }
  }, [userId, loadFormData, loadReferenceData, methods, notify]);

  if (!isOpen || !submission) return null;



  const photoInputRef = React.useRef(null);
  const handleInstantPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
      try {
        const result = await userService.uploadProfilePhoto(userId, file);
        if (result.success) {
          notify.success("Photo uploaded successfully! Refreshing...");
          
          // Inform the react-hook-form about the newly uploaded photo
          // CRITICAL: The form field is "profile_photo" (mapped to "profile_image" for backend by formMapper)
          methods.setValue("profile_photo", result.data.profile_image, { shouldDirty: false });

          // Softly mutate the local state to instantly display the preview without violently refreshing the page
          if (submission.user && typeof submission.user === 'object') {
              submission.user.profile_image = result.data.profile_image;
          }
          submission.profile_image = result.data.profile_image;
          
          // CRITICAL: Synchronize the photo to the CV Submission record in the backend so it doesn't disappear from the Crew Management table
          if (submission && submission.id) {
              try {
                  const fd = new FormData();
                  fd.append("profile_image", file);
                  await cvSubmissionsApi.updateSubmission(submission.id, fd);
              } catch (syncErr) {
                  console.error("Failed to sync photo to CV Submission record:", syncErr);
              }
          }
      } else {
        notify.error("Photo upload failed.");
      }
    } catch (err) {
      notify.error("Photo upload failed.");
    }
  };

  const handleInstantPhotoDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      const result = await userService.deleteProfilePhoto(userId);
      if (result.success) {
        notify.success("Photo deleted successfully!");
        methods.setValue("profile_photo", null, { shouldDirty: false });
        if (submission.user && typeof submission.user === 'object') {
            submission.user.profile_image = null;
        }
        submission.profile_image = null;
        
        if (submission && submission.id) {
            try {
                const fd = new FormData();
                fd.append("profile_image", "DELETE_PHOTO");
                await cvSubmissionsApi.updateSubmission(submission.id, fd);
            } catch (syncErr) {
                console.error("Failed to sync delete to CV Submission record:", syncErr);
            }
        }
      } else {
        notify.error("Failed to delete photo.");
      }
    } catch (err) {
      notify.error("Failed to delete photo.");
    }
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const currentValues = methods.getValues();
      const result = await userService.saveCompleteForm(userId, currentValues);
      
      if (result.success) {
        notify.success("Applicant data updated successfully.");
      } else {
        notify.error(result.message || "Failed to update applicant data.");
      }
    } catch (err) {
      console.error("Update error:", err);
      notify.error("Failed to update applicant data.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Temporarily change the button state or show a loading indicator if needed
      const res = await api.get("/documents/?user=" + userId);
      let docs = res.data?.results || res.data || [];
      // Ensure we only get documents for this user
      docs = docs.filter(d => d.user === parseInt(userId, 10));
      
      const fullData = methods.getValues();
      const enrichedSubmission = {
        ...submission,
        seafarer_application: fullData
      };
      
      // Generate the premium tabular CV with admin docs
      generateBrandedCVPdf(enrichedSubmission, { adminDocs: docs });
      notify.success("Exported official application successfully!");
    } catch (err) {
      console.error("Failed to fetch admin docs for export:", err);
      // Fallback to generating without admin docs if fetch fails
      const fullData = methods.getValues();
      generateBrandedCVPdf({ ...submission, seafarer_application: fullData });
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex bg-slate-50 dark:bg-slate-900">
      <div className="relative w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {submission?.user?.profile_image || submission?.profile_image ? (
                <img 
                  src={getMediaUrl(submission?.user?.profile_image || submission?.profile_image)} 
                  alt="Applicant" 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Applicant Profile</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white truncate">{submission.user_name || "Unknown"}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[60px]">
              Submission #{submission.id} &bull; {submission.generated_id || "No ID"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handleInstantPhotoUpload} />
            {submission?.user?.profile_image || submission?.profile_image ? (
              <button
                onClick={handleInstantPhotoDelete}
                className="flex items-center gap-2 px-4 py-2.5 text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-xl transition-colors shadow-sm font-medium text-sm"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
                Delete Photo
              </button>
            ) : (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 rounded-xl transition-colors shadow-sm font-medium text-sm"
                title="Instant Photo Upload"
              >
                <Camera className="w-4 h-4" />
                Upload Photo
              </button>
            )}

            {isAdminOrHR && (
              <button
                onClick={() => setShowPipelineModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 rounded-xl transition-colors shadow-sm font-medium text-sm"
                title="Principal Placement"
              >
                <CheckCircle className="w-4 h-4" />
                Principal Placement
              </button>
            )}

            {isAdminOrHR && (
              <button
                onClick={() => setShowGenerateContract(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 rounded-xl transition-colors shadow-sm font-medium text-sm"
                title="Contract Setup"
              >
                <FileText className="w-4 h-4" />
                Contract Setup
              </button>
            )}


            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm font-medium text-sm"
              title="Export to PDF"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
              title="Update Record"
              disabled={isUpdating || !isInitialized}
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "Saving..." : "Update"}
            </button>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative scroll-smooth print:overflow-visible print:p-0 bg-slate-50 dark:bg-slate-900/50">
          {!isInitialized || isLoadingBackend || isLoadingReference ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Loading Applicant Data...</p>
              </div>
            </div>
          ) : (
            <ReferenceDataProvider data={referenceData} isLoading={false}>
              <FormProvider {...methods}>
                <FormSaveProvider userId={userId} currentStep={0} onStepChange={() => {}}>
                  <div className="max-w-[95%] mx-auto space-y-2 pb-20 px-4 pt-6 print:space-y-4 print:max-w-none print:pb-0 w-full">
                    <AccordionSection title="Position & Personal Details" icon={User} colorTheme="blue" defaultOpen>
                      <PositionPersonalForm />
                    </AccordionSection>

                    <AccordionSection title="Education" icon={GraduationCap} colorTheme="indigo">
                      <EducationForm />
                    </AccordionSection>

                    <AccordionSection title="Contact Information" icon={Phone} colorTheme="emerald">
                      <ContactForm />
                    </AccordionSection>

                    <AccordionSection title="Emergency Contacts" icon={HeartPulse} colorTheme="rose">
                      <EmergencyForm />
                    </AccordionSection>

                    <AccordionSection title="Travel Documents & Attachments (Passports & Visas)" icon={Plane} colorTheme="cyan">
                      <DocumentsForm />
                    </AccordionSection>

                    <AccordionSection title="Certificates & Attachments" icon={Award} colorTheme="amber">
                      <CertificatesForm />
                    </AccordionSection>

                    <AccordionSection title="Health & Marine Medical" icon={Stethoscope} colorTheme="teal">
                      <HealthForm />
                    </AccordionSection>

                    <AccordionSection title="Courses" icon={BookOpen} colorTheme="violet">
                      <CoursesForm />
                    </AccordionSection>

                    <AccordionSection title="Sea Service Experience" icon={Anchor} colorTheme="blue">
                      <SeaServiceForm />
                    </AccordionSection>

                    <AccordionSection title="References" icon={Users} colorTheme="slate">
                      <ReferencesForm />
                    </AccordionSection>

                    {isAdminOrHR && (
                      <AccordionSection title="Admin Related Attachments" icon={ShieldCheck} colorTheme="orange" defaultOpen>
                        <AdminAttachmentsSection userId={userId} />
                      </AccordionSection>
                    )}
                  </div>
                </FormSaveProvider>
              </FormProvider>
            </ReferenceDataProvider>
          )}
        </div>
      </div>

      {showGenerateContract && (
        <GenerateContractModal
          submission={submission}
          onClose={() => setShowGenerateContract(false)}
          onSuccess={() => {
            setShowGenerateContract(false);
            notify.success("Contract generated successfully!");
          }}
        />
      )}

      {showPipelineModal && (
        <CVSubmissionFormModal
          isOpen={showPipelineModal}
          submission={submission}
          onClose={() => setShowPipelineModal(false)}
          onSave={() => {
            setShowPipelineModal(false);
            notify.success("Pipeline updated successfully!");
          }}
        />
      )}
    </div>
  );
}