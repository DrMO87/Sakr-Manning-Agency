import React, { useState } from "react";
import Section from "../../common/Section";
import ImageBlock from "../../common/ImageBlock";
import { MapPin, Phone, Mail, User, ChevronDown } from "lucide-react";
import { ASSETS } from "../../../utils/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import "../../../styles/globals.css";

const ContactPage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    subject: "",
    message: "",
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setForm({ name: "", email: "", department: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["Building No. 136, 5000 Units", "Alzohor District, Port Said", "Egypt"],
    },
    {
      icon: Phone,
      title: "Direct Lines",
      details: ["Tel/Fax: +20 663699271", "Mob: +20 1009250111", "Mob: +20 1003245666"],
    },
    {
      icon: Mail,
      title: "Email Desks",
      details: ["info@sakrshipping.com", "crew@sakrshipping.com", "sakrshipping@sakrshipping.com"],
      underline: true,
    },
  ];

  const teamMembers = [
    {
      name: "Mr. Osama Sakr",
      position: "Managing Director",
      bg: "bg-gradient-to-br from-blue-50 to-white"
    },
    {
      name: "Mr. Amr Sakr",
      position: "Crew Manager",
      bg: "bg-gradient-to-bl from-slate-50 to-white"
    },
  ];

  return (
    <div className="w-full bg-slate-50 overflow-x-hidden text-gray-800">
      
      {/* 1. Parallax Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-slate-900 flex flex-col justify-center">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <div className="absolute inset-0 bg-slate-900/70 z-10" />
          <img
            src={ASSETS.CONTACT}
            alt="Map showing our location"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: opacityHero }}
          className="relative z-20 text-center px-4 max-w-4xl mx-auto -mt-20"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-xl"
          >
            Get In <span className="text-[#0065AF]">Touch</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Whether you're looking to partner with us or join our crew, our dedicated desks are ready to assist you.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. Floating Glass Cards (Overlapping Hero) */}
      <section className="relative z-30 -mt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={idx}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + (idx * 0.1) }}
                className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,101,175,0.15)] transition-all duration-500 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#0065AF]/10 text-[#0065AF] flex items-center justify-center mb-6">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, i) => (
                    <p key={i} className={`text-slate-600 font-medium ${info.underline ? 'hover:text-[#0065AF] cursor-pointer transition-colors' : ''}`}>
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Smart Form & Stylized Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Map/Visual */}
          <div className="w-full lg:w-2/5 bg-slate-900 relative min-h-[400px] lg:min-h-auto">
            <div className="absolute inset-0 bg-[#0065AF]/20 mix-blend-multiply z-10" />
            <img 
              src={ASSETS.CONTACT} 
              alt="Global Reach" 
              className="w-full h-full object-cover opacity-50 absolute inset-0"
            />
            <div className="relative z-20 h-full flex flex-col justify-between p-12">
              <div className="w-16 h-1 bg-[#0065AF] rounded-full mb-8" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Global Reach, <br/> Local Expertise.
              </h2>
              <div className="mt-auto pt-12">
                <p className="text-blue-200 font-medium mb-2">Currently serving across</p>
                <p className="text-4xl font-black text-white">4 Continents</p>
              </div>
            </div>
          </div>

          {/* Right Side: Conversational Form */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 lg:p-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Send a Message</h2>
            <p className="text-slate-500 mb-10 font-medium">Fill out the form below and we'll get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Floating Label Input: Name */}
                <div className="relative group">
                  <input 
                    type="text" 
                    name="name" 
                    id="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full px-5 pb-3 pt-6 w-full text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#0065AF]/50 focus:border-[#0065AF] transition-all peer"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="name" 
                    className={`absolute text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${focusedField === 'name' ? 'text-[#0065AF]' : ''}`}
                  >
                    Your Name
                  </label>
                </div>

                {/* Floating Label Input: Email */}
                <div className="relative group">
                  <input 
                    type="email" 
                    name="email" 
                    id="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full px-5 pb-3 pt-6 w-full text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#0065AF]/50 focus:border-[#0065AF] transition-all peer"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${focusedField === 'email' ? 'text-[#0065AF]' : ''}`}
                  >
                    Email Address
                  </label>
                </div>
              </div>

              {/* Department Dropdown */}
              <div className="relative group">
                <select
                  name="department"
                  id="department"
                  value={form.department}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('department')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full px-5 pb-3 pt-6 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#0065AF]/50 focus:border-[#0065AF] transition-all peer cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  <option value="general">General Inquiry</option>
                  <option value="crewing">Crewing & Recruitment</option>
                  <option value="logistics">Travel & Logistics</option>
                  <option value="partnerships">Business Partnerships</option>
                </select>
                <label 
                  htmlFor="department" 
                  className={`absolute text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:scale-75 peer-focus:-translate-y-3 ${form.department === '' && focusedField !== 'department' ? 'scale-100 translate-y-0' : ''} ${focusedField === 'department' ? 'text-[#0065AF]' : ''}`}
                >
                  Department
                </label>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Floating Label Input: Subject */}
              <div className="relative group">
                <input 
                  type="text" 
                  name="subject" 
                  id="subject"
                  value={form.subject}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full px-5 pb-3 pt-6 w-full text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#0065AF]/50 focus:border-[#0065AF] transition-all peer"
                  placeholder=" "
                />
                <label 
                  htmlFor="subject" 
                  className={`absolute text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${focusedField === 'subject' ? 'text-[#0065AF]' : ''}`}
                >
                  Subject
                </label>
              </div>

              {/* Floating Label Textarea: Message */}
              <div className="relative group">
                <textarea 
                  name="message" 
                  id="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full px-5 pb-3 pt-6 h-32 w-full text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#0065AF]/50 focus:border-[#0065AF] transition-all peer resize-none"
                  placeholder=" "
                />
                <label 
                  htmlFor="message" 
                  className={`absolute text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${focusedField === 'message' ? 'text-[#0065AF]' : ''}`}
                >
                  Your Message
                </label>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-[#0065AF] hover:bg-[#1f568a] text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_20px_rgba(0,101,175,0.2)] hover:shadow-[0_12px_25px_rgba(0,101,175,0.3)] hover:-translate-y-1"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 4. Team Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200 mt-8 mb-16">
        <div className="text-center mb-16">
          <motion.h4 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#0065AF] font-bold tracking-widest uppercase mb-3"
          >
            Leadership
          </motion.h4>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900"
          >
            Meet Our Directors
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className={`group flex items-center gap-6 p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,101,175,0.1)] hover:-translate-y-2 hover:border-[#0065AF]/20 transition-all duration-500 ${member.bg}`}
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                <User size={32} className="text-slate-400 group-hover:text-[#0065AF] transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-[#0065AF] transition-colors">
                  {member.name}
                </h3>
                <p className="text-slate-500 font-medium text-lg uppercase tracking-wider text-sm">
                  {member.position}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
