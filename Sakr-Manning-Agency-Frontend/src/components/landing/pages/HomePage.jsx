import React, { useState, useEffect, useRef } from "react";
import Section from "../../common/Section";
import Button from "../../common/Button";
import Card from "../../common/Card";
import ImageBlock from "../../common/ImageBlock";
import { ASSETS } from "../../../utils/constants";
import { motion } from "framer-motion";
import "../../../styles/globals.css";
import { useNavigate } from "react-router-dom";
import { jobOrdersApi } from "../../../services/Dashboard/jobOrdersApi";
import InfiniteTicker from "../../common/InfiniteTicker";
import { Anchor, Users, Briefcase, Settings, ShieldCheck, HeartPulse, PlaneTakeoff, GraduationCap } from "lucide-react";


// ── Fallback shown while loading or when the API returns nothing ──────────
const FALLBACK_JOBS = [
  { title: "Deck Officer", text: "Experienced officer required for international routes" },
  { title: "Chief Engineer", text: "Senior engineer for bulk carrier fleet" },
  { title: "AB Seaman", text: "Able seaman for container vessel" },
  { title: "Cook / Catering Staff", text: "Catering positions available across our fleet" },
  { title: "Electrician", text: "Marine electrician for offshore assignments" },
];

const HomePage = ({ user, onOpenForm, onNavigate }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  // ── Live vacancies state ─────────────────────────────────────────────────
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [vacanciesLoading, setVacanciesLoading] = useState(true);

  const slides = [
    {
      services: [
        "Suez Canal Transit Agent",
        "Crew Search and Selection",
        "Crew Conference",
        "Crewing System Update",
      ],
      background: ASSETS.SLIDER_IMAGES[0],
    },
    {
      services: [
        "Crew P&I Insurance",
        "Health Insurance",
        "Organizing Flights Bookings",
        "Training & Cadet Programs",
      ],
      background: ASSETS.SLIDER_IMAGES[1],
    },
    {
      services: [
        "Crew Recruitment & Management",
        "Crew Performance Monitoring",
        "Travel & Logistics Arrangements",
        "Dedicated Principal Support",
      ],
      background: ASSETS.SLIDER_IMAGES[2],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 100000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // ── Fetch open job positions from the backend ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadVacancies = async () => {
      try {
        setVacanciesLoading(true);
        // We fetch positions directly as they represent the "Vacancies" for seafarers
        const response = await jobOrdersApi.getJobPositions();
        const list = Array.isArray(response) ? response : (response.results || response.job_positions || []);

        if (!cancelled && list.length > 0) {
          // Filter out jobs where rank_name is null, undefined, or empty
          const validPositions = list.filter(
            (p) => p && p.rank_name !== null && p.rank_name !== undefined && p.rank_name !== ""
          );

          if (validPositions.length > 0) {
            const mapped = validPositions.map((p) => ({
              title: p.rank_name,
              salaryMin: p.salary_min,
              salaryMax: p.salary_max,
              currency: p.currency || 'USD',
              duration: p.contract_duration_months,
              quantity: p.quantity,
              remarks: p.remarks,
              id: p.id,
            }));
            setJobs(mapped);
          }
        }
      } catch (err) {
        // Silently fall back to the static list
        console.warn("Could not load job positions from API:", err.message);
      } finally {
        if (!cancelled) setVacanciesLoading(false);
      }
    };

    loadVacancies();
    return () => { cancelled = true; };
  }, []);

  const jobsRef = useRef(null);

  const scrollToJobs = () => {
    if (jobsRef.current) {
      jobsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHeroImageLoad = () => {
    setHeroImageLoaded(true);
  };

  const handleHeroImageError = () => {
    setHeroImageLoaded(false);
  };

  return (
    <div className="w-full mx-auto bg-white">
      {/* Hero Section - RESPONSIVE */}
      <Section
        padding="none"
        layout="custom"
        margin="none"
        className="w-full h-[70vh] sm:h-[80vh] lg:h-[85vh] 2xl:h-[90vh] overflow-hidden rounded-none md:rounded-3xl 2xl:rounded-none relative mx-0 2xl:mx-0"
      >
        <div className="relative w-full h-full">
          <ImageBlock
            src={ASSETS.HOME_IMAGES[0]}
            alt="Hero Background"
            aspectRatio="auto"
            objectFit="cover"
            rounded="none"
            className="w-full h-full"
            onLoad={handleHeroImageLoad}
            onError={handleHeroImageError}
            loading="eager"
            overlay={
              heroImageLoaded ? (
                <div className="relative w-full h-full flex flex-col justify-center">
                  {/* Hero Text - RESPONSIVE */}
                  <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 lg:px-24 text-center h-full w-full">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight text-white mb-4 sm:mb-6 drop-shadow-lg"
                    >
                      Welcome To Sakr Manning Agency
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      className="font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight text-blue-100 mb-8 sm:mb-10 drop-shadow-md max-w-4xl"
                    >
                      For Recruiting Egyptian Labor Abroad
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                    >
                      <button
                        onClick={() => {
                          const element = document.getElementById('vacancies');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 sm:px-10 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg sm:text-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1"
                      >
                        Explore Opportunities
                      </button>
                    </motion.div>
                  </div>

                  {/* Services Tags - RESPONSIVE with horizontal scroll on mobile */}
                  <div className="w-full px-4 sm:px-6 md:px-12 mb-6 sm:mb-8 md:mb-10 mt-auto">
                    <div className="overflow-x-auto md:overflow-visible scrollbar-hide pb-4 md:pb-0">
                      <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-max md:min-w-0">
                        {[
                          "Recruiting Agency",
                          "Crew search and selection",
                          "Crewing system",
                          "Health insurance",
                        ].map((service, index) => (
                          <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 + (index * 0.1) }}
                            key={index}
                            className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-white/90 whitespace-nowrap bg-white/10 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/20 shadow-lg"
                          >
                            {service}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full"></div>
              )
            }
          />
        </div>
      </Section>

      {/* About Section - RESPONSIVE */}
      <Section
        layout="split"
        background="default"
        padding="lg"
        margin="none"
        className="container mx-auto w-full max-w-7xl 2xl:max-w-[1600px] flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-20 2xl:gap-24"
      >
        {/* About Image with decorative elements */}
        <motion.div
          className="w-full lg:w-1/2 relative"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-transparent rounded-[3rem] -z-10 transform -rotate-3 scale-105 opacity-70"></div>
          <ImageBlock
            src={ASSETS.HOME_IMAGES[1]}
            alt="Port Said maritime view with ships"
            className="w-full object-cover rounded-3xl md:rounded-[2.5rem] shadow-2xl"
            aspectRatio="square"
            loading="lazy"
          />
        </motion.div>

        {/* About Content */}
        <motion.div
          className="w-full lg:w-1/2 space-y-6 md:space-y-8 px-4 lg:px-0"
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6">
              About Us
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-8"></div>
          </div>
          
          <p className="font-medium text-lg sm:text-xl lg:text-2xl leading-relaxed text-slate-600">
            We are a certified and licensed manning agent based in Port Said, Egypt, fully compliant with <strong className="text-slate-800">MLC 2006 & STCW 2010</strong> regulations.
          </p>
          
          <p className="font-normal text-base sm:text-lg lg:text-xl leading-relaxed text-slate-500">
            We provide top-tier crewing services employing Egyptian seafarers.
            All our seamen are rigorously verified for the authenticity of their
            certificates and licenses, ensuring they are fully equipped to meet demanding international standards.
          </p>

          <div className="pt-6">
            <button
              onClick={() => onNavigate("about")}
              className="group flex items-center gap-2 text-[#0065AF] hover:text-blue-800 font-semibold text-lg transition-all hover:gap-3"
            >
              Discover our history
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </motion.div>
      </Section>

      {/* Services Section - Redesigned Grid */}
      <Section
        layout="centered"
        background="default"
        padding="lg"
        className="relative bg-slate-50 w-full"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-4">
              Our Premium Services
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: "Suez Canal Transit", icon: Anchor, desc: "Reliable transit agency services through the Suez Canal." },
              { title: "Crew Selection", icon: Users, desc: "Rigorous search and selection of top maritime professionals." },
              { title: "Crew Conferences", icon: Briefcase, desc: "Organizing and managing comprehensive crew conferences." },
              { title: "System Updates", icon: Settings, desc: "Modern crewing system management and technical updates." },
              { title: "P&I Insurance", icon: ShieldCheck, desc: "Complete Protection and Indemnity insurance for our crew." },
              { title: "Health Insurance", icon: HeartPulse, desc: "Comprehensive health coverage for seafarers worldwide." },
              { title: "Flight Bookings", icon: PlaneTakeoff, desc: "Efficient organization of global crew travel and logistics." },
              { title: "Cadet Programs", icon: GraduationCap, desc: "Dedicated training and development programs for cadets." },
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-blue-200 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col items-start"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon strokeWidth={1.5} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => onNavigate("services")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-[#0065AF] text-white rounded-full font-semibold text-lg transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(0,101,175,0.3)] hover:-translate-y-1"
            >
              View Full Service Details
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </Section>

      {/* ── Open Vacancies Section ── */}
      <div
        id="vacancies"
        ref={jobsRef}
        className="py-12 sm:py-16 w-full overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)" }}
      >
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 px-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Open Vacancies
          </h3>
          {!vacanciesLoading && (
            <p className="text-sm sm:text-base text-gray-500">
              {jobs === FALLBACK_JOBS
                ? "Sample positions — check back soon for live listings"
                : `${jobs.length} position${jobs.length !== 1 ? "s" : ""} currently available`}
            </p>
          )}
        </div>

        {/* Ticker or skeletons */}
        {vacanciesLoading ? (
          <div className="flex gap-6 overflow-x-hidden pb-8 px-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] sm:w-[380px] h-[240px] rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <InfiniteTicker
            items={jobs}
            speed={0.6}
            renderItem={(item, idx) => {
              const hasSalary = item.salaryMin && item.salaryMax;
              const formattedSalaryMin = hasSalary
                ? parseFloat(item.salaryMin).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : '';
              const formattedSalaryMax = hasSalary
                ? parseFloat(item.salaryMax).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : '';

              return (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[320px] sm:w-[380px] rounded-[22px] border border-slate-200 bg-white shadow-sm hover:shadow-[0_12px_30px_rgba(0,101,175,0.1)] hover:border-blue-200 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group cursor-default flex flex-col justify-between p-6"
                >
                  <div className="flex flex-col gap-4">
                    {/* Title + Open badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                    </div>

                    {/* Detail row (Salary & Duration) */}
                    <div className="flex flex-wrap items-center gap-3">
                      {hasSalary ? (
                        <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                          {formattedSalaryMin} - {formattedSalaryMax} {item.currency}
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                          Salary TBD
                        </span>
                      )}
                      {item.duration && (
                        <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                          {item.duration} Months
                        </span>
                      )}
                    </div>

                    {/* Description / Remarks */}
                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed line-clamp-2 mt-2">
                      {item.remarks || item.text || "Excellent opportunity. Join our global fleet today."}
                    </p>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Anchor size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sakr Manning</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Modern CTA Banner */}
      <Section
        layout="centered"
        background="none"
        padding="none"
        className="w-full flex justify-center items-center px-4 sm:px-6 mb-16"
      >
        <div className="w-full max-w-7xl bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 py-10 sm:py-12 px-8 sm:px-12 lg:px-16 overflow-hidden relative">
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="flex-1 z-10 text-center md:text-left">
            <h2 className="font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
              Ready to set sail?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl">
              Apply for a job today and take the next step in your maritime career with Sakr Manning Agency.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 z-10 shrink-0 w-full md:w-auto">
            <button
              onClick={() => navigate("/quick-apply")}
              className="px-10 py-4 bg-[#0065AF] hover:bg-[#2477C3] text-white rounded-full font-semibold text-lg transition-all shadow-[0_4px_14px_0_rgba(0,101,175,0.39)] hover:shadow-[0_6px_20px_rgba(0,101,175,0.23)] hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              Apply Now
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default HomePage;
