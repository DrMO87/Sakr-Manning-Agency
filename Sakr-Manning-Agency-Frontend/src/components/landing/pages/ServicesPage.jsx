import React from "react";
import Section from "../../common/Section";
import Button from "../../common/Button";
import InfiniteTicker from "../../common/InfiniteTicker";
import { ASSETS } from "../../../utils/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import { Anchor, Users, Briefcase, Settings, ShieldCheck, HeartPulse, PlaneTakeoff, GraduationCap } from "lucide-react";
import "../../../styles/globals.css";

const servicesDetails = [
  {
    title: "Suez Canal Transit Agent",
    description: "Reliable and seamless transit agency services through the Suez Canal, ensuring compliance, safety, and efficiency for every vessel passage.",
    icon: Anchor,
  },
  {
    title: "Crew Search & Selection",
    description: "Rigorous search and selection of top maritime professionals. We match the right talent to the right vessel, maintaining a database of STCW certified seafarers.",
    icon: Users,
  },
  {
    title: "Crew Conference",
    description: "Organizing and managing comprehensive crew conferences to ensure seafarers are updated on the latest company policies and maritime regulations.",
    icon: Briefcase,
  },
  {
    title: "Crewing System Update",
    description: "Modern crewing system management providing transparent, real-time technical updates and reports on crew performance and documentation.",
    icon: Settings,
  },
  {
    title: "Crew P&I Insurance",
    description: "Complete Protection and Indemnity insurance processing for our crew, ensuring peace of mind for both seafarers and ship owners.",
    icon: ShieldCheck,
  },
  {
    title: "Health Insurance",
    description: "Comprehensive health coverage facilitation for seafarers worldwide, maintaining strict adherence to medical fitness guidelines.",
    icon: HeartPulse,
  },
  {
    title: "Flights & Logistics",
    description: "Efficient organization of global crew travel, ticketing, and logistics to ensure smooth, on-time crew changes at any port.",
    icon: PlaneTakeoff,
  },
  {
    title: "Training & Cadet Programs",
    description: "Dedicated training and development programs for cadets and junior officers to build the next generation of maritime leaders.",
    icon: GraduationCap,
  },
];

export default function ServicesPage({ onNavigate }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="w-full bg-slate-50 overflow-x-hidden text-gray-800">
      
      {/* 1. Parallax Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-slate-900 flex items-center justify-center">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <div className="absolute inset-0 bg-slate-900/60 z-10" /> {/* Dark Overlay */}
          <img
            src={ASSETS.SERVICES}
            alt="Services Hero"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: opacityHero }}
          className="relative z-20 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-xl"
          >
            Premium <span className="text-[#0065AF]">Maritime</span> Services
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Sakr Manning Agency recognizes seafarers as our Principals' greatest asset. We are committed to meeting your needs with a strong focus on excellence.
          </motion.p>
        </motion.div>

        {/* Floating Abstract Element */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0065AF]/30 rounded-full blur-3xl z-10"
        />
      </section>

      {/* 2. Scrolling Marquee Service Tags */}
      <section className="bg-white border-b border-slate-200 py-6">
        <InfiniteTicker 
          items={servicesDetails} 
          speed={3} 
          renderItem={(item, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-full flex-shrink-0 hover:border-[#0065AF]/30 transition-colors cursor-default">
              <item.icon size={20} className="text-[#0065AF]" />
              <span className="font-semibold text-slate-700 text-sm sm:text-base uppercase tracking-wide whitespace-nowrap">{item.title}</span>
            </div>
          )}
        />
      </section>

      {/* 3. Hover-Expand Service Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h4 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#0065AF] font-bold tracking-widest uppercase mb-3"
          >
            Our Expertise
          </motion.h4>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900"
          >
            Comprehensive Crewing Solutions
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {servicesDetails.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative bg-white border border-slate-200 rounded-[22px] overflow-hidden hover:shadow-[0_20px_40px_rgba(0,101,175,0.1)] hover:-translate-y-2 hover:border-[#0065AF]/30 transition-all duration-500 flex flex-col items-center text-center p-8 cursor-pointer h-[280px]"
              >
                {/* Default State */}
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-500 group-hover:-translate-y-8 group-hover:opacity-0">
                  <div className="w-20 h-20 rounded-full bg-[#0065AF]/5 text-[#0065AF] flex items-center justify-center mb-6">
                    <Icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {service.title}
                  </h3>
                </div>

                {/* Hover/Expanded State */}
                <div className="absolute inset-0 p-8 bg-gradient-to-br from-white to-[#f0f7ff] flex flex-col items-center justify-center opacity-0 translate-y-8 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Icon size={32} className="text-[#0065AF] mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-[#0065AF] mb-3 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Glassmorphism CTA Banner */}
      <section className="w-full flex justify-center items-center px-4 sm:px-6 mb-24 max-w-7xl mx-auto">
        <div className="w-full bg-gradient-to-r from-slate-900 to-[#0065AF] rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-8 sm:px-12 lg:px-16 overflow-hidden relative">
          
          {/* Glass Decor elements */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-xl opacity-50"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-black/20 rounded-full mix-blend-overlay filter blur-xl opacity-50"></div>
          
          <div className="flex-1 z-10 text-center md:text-left backdrop-blur-sm">
            <h2 className="font-bold text-3xl md:text-4xl text-white mb-4 drop-shadow-md">
              Partner With Us
            </h2>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl drop-shadow-sm">
              Discover how our dedicated crewing services can strengthen your fleet. Get in touch today for more information.
            </p>
          </div>

          <div className="flex z-10 shrink-0 w-full md:w-auto backdrop-blur-md">
            <button
              onClick={() => onNavigate("contact")}
              className="px-10 py-5 bg-white hover:bg-slate-50 text-[#0065AF] rounded-full font-bold text-xl transition-all shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
