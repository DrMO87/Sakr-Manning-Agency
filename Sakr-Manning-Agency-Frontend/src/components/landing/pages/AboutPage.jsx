import React, { useEffect, useState } from "react";
import Section from "../../common/Section";
import ImageBlock from "../../common/ImageBlock";
import Card from "../../common/Card";
import { ASSETS } from "../../../utils/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import "../../../styles/globals.css";

export default function AboutPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  // Values data matching the design
  const valuesData = [
    {
      title: "Safety First",
      description:
        "We prioritize the safety and well-being of our seafarers and vessels, ensuring full compliance with international maritime standards.",
      icon: ASSETS.A_ICONS[0],
      span: "col-span-1 md:col-span-2 row-span-2", // Bento large
      bg: "bg-blue-50 border-blue-100",
    },
    {
      title: "Integrity",
      description:
        "Transparency, honesty, and trust guide everything we do, from recruitment to daily operations.",
      icon: ASSETS.A_ICONS[1],
      span: "col-span-1",
      bg: "bg-white border-slate-100",
    },
    {
      title: "Excellence",
      description:
        "We strive for the highest quality in our services, providing skilled and reliable crews for every voyage.",
      icon: ASSETS.A_ICONS[2],
      span: "col-span-1",
      bg: "bg-white border-slate-100",
    },
    {
      title: "Teamwork",
      description:
        "We know that to remain a successful company we must work together, frequently rise above organizational, geographical, and cultural barriers.",
      icon: ASSETS.A_ICONS[5],
      span: "col-span-1 md:col-span-2", // Bento wide
      bg: "bg-slate-50 border-slate-200",
    },
    {
      title: "Sustainability",
      description:
        "We are committed to protecting the marine environment and promoting responsible practices at sea.",
      icon: ASSETS.A_ICONS[3],
      span: "col-span-1",
      bg: "bg-white border-slate-100",
    },
    {
      title: "Partnership",
      description:
        "We believe in long-term relationships, working closely with ship owners, principals, and seafarers to achieve shared success.",
      icon: ASSETS.A_ICONS[4],
      span: "col-span-1",
      bg: "bg-white border-slate-100",
    },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden text-gray-800">
      
      {/* 1. Ambient / Parallax Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-slate-900 flex items-center justify-center">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <div className="absolute inset-0 bg-slate-900/60 z-10" /> {/* Dark Overlay */}
          <img
            src={ASSETS.ABOUT_IMAGES[0]}
            alt="Maritime Hero"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: opacityHero }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-xl"
          >
            Pioneering <br/> <span className="text-blue-400">Global Maritime.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-blue-50 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Certified manning agents based in Port Said, Egypt. Delivering excellence, safety, and highly equipped STCW 1995 certified seafarers to the world.
          </motion.p>
        </motion.div>

        {/* Floating Abstract Element */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl z-10"
        />
      </section>

      {/* 2. Interactive Statistics & Story (Bento Style Intro) */}
      <section className="relative z-30 -mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center items-center text-center group hover:-translate-y-2 transition-transform duration-500"
          >
            <h3 className="text-5xl lg:text-6xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-500">15+</h3>
            <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">Years of Trust</p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col justify-center items-center text-center group hover:-translate-y-2 transition-transform duration-500"
          >
            <h3 className="text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-500">500+</h3>
            <p className="text-blue-300 font-semibold uppercase tracking-widest text-sm">Seafarers Deployed</p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-center items-center text-center group hover:-translate-y-2 transition-transform duration-500"
          >
            <h3 className="text-5xl lg:text-6xl font-black text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-500">Global</h3>
            <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">Partner Network</p>
          </motion.div>
        </div>
      </section>

      {/* 3. The Story & Vision (Floating Overlap Layout) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] transform rotate-3 -z-10" />
            <img 
              src={ASSETS.ABOUT_IMAGES[1]} 
              alt="Vision" 
              className="w-full rounded-3xl shadow-2xl object-cover aspect-square"
            />
            {/* Floating accent block */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden md:block"
            >
              <p className="text-slate-800 font-bold text-lg leading-tight">Setting the course for maritime excellence since day one.</p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h4 className="text-blue-600 font-bold tracking-widest uppercase mb-3">Our Vision</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Driving the Future of <br/>International Shipping
            </h2>
            <div className="space-y-6 text-lg text-slate-600">
              <p>
                At Sakr Manning Agency, our vision is to be a leading provider of marine crews for the international shipping industry, contributing to the growth of the national economy and foreign trade.
              </p>
              <p>
                We believe that excellence comes from the quality of people we provide. By continuously monitoring crew performance and handling complex logistics, we offer our clients a highly professional workforce, and our crews a safe, high-quality work environment.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Bento Box Values Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h4 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest uppercase mb-3"
            >
              Core Principles
            </motion.h4>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900"
            >
              The Values That Steer Us
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
            {valuesData.map((value, index) => (
              <motion.div
                key={index}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`group relative overflow-hidden rounded-3xl p-8 border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between ${value.span} ${value.bg}`}
              >
                {/* Subtle background icon for large cards */}
                {(value.span.includes("row-span-2") || value.span.includes("col-span-2")) && (
                  <img 
                    src={value.icon} 
                    className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" 
                    alt="" 
                  />
                )}
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                    <img
                      src={value.icon}
                      alt={`${value.title} icon`}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
