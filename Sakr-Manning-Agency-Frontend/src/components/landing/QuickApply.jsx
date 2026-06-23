import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ASSETS } from "../../utils/constants";
import Button from "../common/Button";
import { useQuickApply } from "../../hooks/dashboard/useQuickApply";
import { useApplicationStatus } from "../../hooks/useApplicationStatus";
import { jobOrdersApi } from "../../services/Dashboard/jobOrdersApi";
import { usersApi } from "../../services/Dashboard/usersApi";
import { Paperclip, UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react';
import { Select } from "../form/inputs/Select";

const QuickApply = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = React.useState([]);
    const [loadingVacancies, setLoadingVacancies] = React.useState(false);
    const [positions, setPositions] = React.useState([]);

    const {
        submitApplication,
        isSubmitting,
        isSubmitted,
        error: submitError,
        clearError
    } = useQuickApply();

    const { status, isLoading: statusLoading } = useApplicationStatus();

    useEffect(() => {
        if (!statusLoading) {
            if (status === "Pending" || status === "Blacklist") {
                navigate("/notify", { replace: true });
            }
        }
    }, [status, statusLoading, navigate]);

    useEffect(() => {
        const fetchVacancies = async () => {
            setLoadingVacancies(true);
            try {
                const response = await jobOrdersApi.getJobPositions({ status: "Open" });
                const list = Array.isArray(response) ? response : (response.results || response.job_positions || []);
                setVacancies(list);
            } catch (error) {
                console.error("Failed to fetch vacancies:", error);
            } finally {
                setLoadingVacancies(false);
            }
        };
        fetchVacancies();
    }, []);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const list = await usersApi.getPositions();
                setPositions(list);
            } catch (error) {
                console.error("Failed to fetch positions:", error);
            }
        };
        fetchPositions();
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm();

    const cvFile = watch("file");

    const onSubmit = async (data) => {
        let job_position_details = null;
        if (data.job_position) {
            const selectedVacancy = vacancies.find(v => v.id === parseInt(data.job_position));
            if (selectedVacancy) {
                job_position_details = selectedVacancy;
            }
        }

        const result = await submitApplication({
            ...data,
            job_position_details
        }, positions);

        if (result.success) {
            setTimeout(() => {
                navigate("/");
            }, 4000);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center relative p-6 font-poppins" style={{
                backgroundImage: `url(${ASSETS.QUICKBG})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-0"></div>
                <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-10 text-center border border-white/20">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Received!</h2>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                        Your application is now <strong className="text-slate-800">Pending Review</strong>.<br /><br />
                        Our recruiters will review your CV and contact you shortly with the next steps.
                    </p>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-[progress_4s_ease-in-out]"></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-4">Redirecting to Home page...</p>
                </div>
                <style>{`
                    @keyframes progress {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-poppins relative bg-slate-50">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-transparent px-6 py-6 lg:px-20 flex items-center gap-4">
                <img src={ASSETS.LOGO} alt="Sakr Logo" className="w-12 h-12 object-contain drop-shadow-lg" />
                <h1 className="text-xl font-bold text-white drop-shadow-md hidden sm:block tracking-widest">SAKR MANNING AGENCY</h1>
            </div>

            {/* Main Content container */}
            <div 
                className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 py-24 lg:px-20 lg:py-12 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${ASSETS.QUICKBG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent z-0"></div>

                {/* Left Text */}
                <div className="relative z-10 w-full lg:w-1/2 text-left mb-12 lg:mb-0 lg:pr-12 pt-12 lg:pt-0">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold tracking-widest mb-6 uppercase">
                        Fast & Simple
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-lg mb-6">
                        Create detailed crew profiles with a few <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">simple steps.</span>
                    </h1>
                    <p className="text-lg text-slate-200 max-w-xl font-light leading-relaxed">
                        Join our world-class maritime network. Upload your CV and let our dedicated team match you with the perfect vessel.
                    </p>
                </div>

                {/* Right Form Card */}
                <div className="relative z-10 w-full lg:w-[480px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-8 sm:p-10 border border-white/50 transform transition-all hover:shadow-blue-900/20">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Quick Apply</h2>
                        <p className="text-slate-500 text-sm">Enter your details to start your journey.</p>
                    </div>

                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between text-sm">
                            <span>{submitError}</span>
                            <button onClick={clearError} className="text-red-400 hover:text-red-600 font-bold text-xl ml-2">&times;</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Name & Phone in Row on Desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">Full Name *</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:bg-white focus:border-[#0065AF] focus:ring-2 focus:ring-[#0065AF]/20 transition-all text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm"
                                    placeholder="John Doe"
                                    {...register("full_name", {
                                        required: "Name required",
                                        minLength: { value: 2, message: "Too short" }
                                    })}
                                />
                                {errors.full_name && <p className="text-red-500 text-xs ml-1 mt-1">{errors.full_name.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">Phone Number *</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:bg-white focus:border-[#0065AF] focus:ring-2 focus:ring-[#0065AF]/20 transition-all text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm"
                                    placeholder="+20123456789"
                                    {...register("phone_number", {
                                        required: "Phone required",
                                        minLength: { value: 8, message: "Invalid phone" }
                                    })}
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs ml-1 mt-1">{errors.phone_number.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">Email Address *</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:bg-white focus:border-[#0065AF] focus:ring-2 focus:ring-[#0065AF]/20 transition-all text-slate-800 placeholder-slate-400 text-sm outline-none shadow-sm"
                                placeholder="john@example.com"
                                {...register("email", {
                                    required: "Email required",
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                })}
                            />
                            {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Rank */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">General Position (Rank)</label>
                            <div className="bg-white/60 rounded-xl border border-slate-200 p-0.5 shadow-sm focus-within:ring-2 focus-within:ring-[#0065AF]/20 focus-within:border-[#0065AF] transition-all">
                                <Select
                                    name="position"
                                    placeholder="Select Rank (Optional)"
                                    searchable={true}
                                    value={watch("position")}
                                    onChange={(val) => setValue("position", val)}
                                    options={(positions || []).map((pos) => ({
                                        value: pos.value ?? pos.id,
                                        label: pos.label ?? pos.name ?? String(pos),
                                    }))}
                                    variant="light"
                                />
                            </div>
                        </div>

                        {/* Vacancy */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wide">Specific Vacancy</label>
                            <div className="bg-white/60 rounded-xl border border-slate-200 p-0.5 shadow-sm focus-within:ring-2 focus-within:ring-[#0065AF]/20 focus-within:border-[#0065AF] transition-all">
                                <Select
                                    name="job_position"
                                    placeholder="Select Vacancy (Optional)"
                                    searchable={true}
                                    value={watch("job_position")}
                                    onChange={(val) => setValue("job_position", val)}
                                    disabled={loadingVacancies}
                                    options={vacancies.map((vacancy) => ({
                                        value: vacancy.id,
                                        label: `${vacancy.rank_name} ${vacancy.ship_name ? `@ ${vacancy.ship_name}` : ""} ${vacancy.company_name ? `(${vacancy.company_name})` : ""}`.trim()
                                    }))}
                                    variant="light"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Upload CV *</label>
                            <div className="relative group w-full">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                    {...register("file", {
                                        required: "CV is required",
                                        validate: {
                                            fileSize: (files) => {
                                                if (!files || !files[0]) return true;
                                                return files[0].size <= 5242880 || "Max 5MB";
                                            },
                                            fileType: (files) => {
                                                if (!files || !files[0]) return true;
                                                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                                return allowedTypes.includes(files[0].type) || "Only PDF/Word allowed";
                                            }
                                        }
                                    })}
                                />
                                <div className={`w-full py-6 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300
                                    ${cvFile && cvFile[0] 
                                        ? 'border-green-400 bg-green-50' 
                                        : 'border-slate-300 bg-slate-50 group-hover:border-[#0065AF] group-hover:bg-[#0065AF]/5'
                                    }`}
                                >
                                    {cvFile && cvFile[0] ? (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <p className="text-sm font-semibold text-green-700 text-center truncate max-w-full px-4">
                                                {cvFile[0].name}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">{(cvFile[0].size / 1024).toFixed(1)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0065AF] mb-3 group-hover:-translate-y-1 transition-transform">
                                                <UploadCloud size={24} />
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium text-center">
                                                <span className="text-[#0065AF] font-bold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {errors.file && <p className="text-red-500 text-xs ml-1 mt-1">{errors.file.message}</p>}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                disabled={isSubmitting}
                                className="w-full sm:w-1/3 px-4 py-4 rounded-full bg-white text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-2/3 px-4 py-4 rounded-full bg-[#0065AF] text-white font-bold hover:bg-[#00528f] shadow-lg shadow-[#0065AF]/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuickApply;
