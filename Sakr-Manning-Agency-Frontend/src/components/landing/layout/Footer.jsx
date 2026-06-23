import React, { useState } from "react";
import { ASSETS } from "../../../utils/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer({ onNavigate, currentPage, onOpenForm }) {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setShowSuccess(true);
    setEmail("");

    setTimeout(() => setShowSuccess(false), 2000);
  };

  const contactInfo = [
    { label: "Mobile", value: "00201009250111", link: "tel:00201009250111" },
    { label: "Tel / Fax", value: "0020663616209", link: "tel:0020663616209" },
    { label: "General", value: "info@sakrshipping.com", link: "mailto:info@sakrshipping.com" },
    { label: "Shipping", value: "sakrshipping@sakrshipping.com", link: "mailto:sakrshipping@sakrshipping.com" },
    { label: "Crewing", value: "crew@sakrshipping.com", link: "mailto:crew@sakrshipping.com" },
  ];

  return (
    <footer className="w-full bg-[#031F33] text-slate-300 pt-16 pb-8 border-t border-[#0a2f4c]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Company Info */}
          <div className="flex flex-col gap-6">
            <img
              src={ASSETS.LOGO}
              alt="Sakr Manning Agency"
              className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
            />
            <p className="text-sm leading-relaxed text-slate-400">
              Your trusted partner in maritime crewing. Fully certified and compliant with MLC 2006 & STCW 2010 regulations.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {["FACEBOOK", "TWITTER", "LINKEDIN"].map((icon) => (
                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <img
                    src={ASSETS.SOCIAL_MEDIA[icon]}
                    alt={icon}
                    className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:brightness-200 transition-all"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {[
                { id: "home", label: "Home", action: () => onNavigate("home") },
                { id: "about", label: "About Us", action: () => onNavigate("about") },
                { id: "services", label: "Our Services", action: () => onNavigate("services") },
                { id: "onlineForm", label: "Submit Application", action: onOpenForm },
                { id: "contact", label: "Contact Us", action: () => onNavigate("contact") },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={link.action}
                  className="text-left text-sm hover:text-blue-400 transition-colors w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-semibold text-lg">Contact Us</h3>
            <ul className="flex flex-col gap-4 text-sm">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex flex-col">
                  <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">{item.label}</span>
                  <a href={item.link} className="hover:text-blue-400 transition-colors">
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-semibold text-lg">Newsletter</h3>
            <p className="text-sm text-slate-400">
              Subscribe to receive the latest job openings and maritime news.
            </p>
            
            <div className="relative flex flex-col gap-3 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSubscribe}
                disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-3 text-sm transition-colors relative"
              >
                Subscribe Now
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white"
                    >
                      Success!
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} Sakr Manning Agency. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="hover:text-slate-300 transition-colors">Terms of Service</button>
            <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
