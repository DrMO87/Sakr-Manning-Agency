import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { ASSETS } from "../../../utils/constants";
import { getMediaUrl } from "../../../utils/fileHelpers";

const Header = ({ onNavigate, onOpenAuth, user, onLogout, currentPage, onOpenForm }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  const isAdmin = ["admin", "administrator"].includes(user?.role?.toLowerCase());

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact Us" },
  ];

  const handleNavClick = (id) => {
    setActive(id);
    onNavigate(id);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1920px] h-20 sm:h-24 md:h-24 lg:h-24 xl:h-28 mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-12 2xl:px-20">
        {/* Logo */}
        <div
          onClick={() => handleNavClick("home")}
          className="cursor-pointer flex items-center hover:opacity-90 transition-opacity"
        >
          <img
            src={ASSETS.LOGO}
            alt="Sakr Shipping Logo"
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-20 md:w-20 xl:h-24 xl:w-24 object-contain"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center flex-1 justify-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`relative group py-2 text-sm md:text-base font-bold tracking-wide transition-colors ${
                currentPage === link.id
                  ? "text-[#0065AF]"
                  : "text-slate-600 hover:text-[#0065AF]"
              }`}
            >
              {link.label}
              <span 
                className={`absolute bottom-0 left-0 h-[2px] bg-[#0065AF] transition-all duration-300 ${
                  currentPage === link.id ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Search + Right Actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => {
              if (currentPage !== 'home') {
                onNavigate('home');
                setTimeout(() => {
                  const element = document.getElementById('vacancies');
                  if (element) {
                    const yOffset = -80; // offset for the sticky header
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 150);
              } else {
                const element = document.getElementById('vacancies');
                if (element) {
                  const yOffset = -80; 
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }
            }}
            className="px-5 h-10 md:h-11 rounded-full bg-white text-[#0065AF] border border-[#0065AF] text-sm md:text-base font-semibold hover:bg-slate-50 hover:shadow-sm transition-all"
          >
            Open Vacancies
          </button>

          {!user ? (
            <>
              <button
                onClick={onOpenForm}
                className="px-6 h-10 md:h-11 rounded-full bg-[#0065AF] text-white text-sm md:text-base font-semibold hover:bg-[#00528f] hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                Online Form
              </button>
              <button
                onClick={onOpenAuth}
                className="px-6 h-10 md:h-11 rounded-full bg-slate-900 text-white text-sm md:text-base font-semibold hover:bg-slate-800 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/form")}
                className="px-6 h-10 md:h-11 rounded-full bg-[#0065AF] text-white text-sm md:text-base font-semibold hover:bg-[#00528f] hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                Online Form
              </button>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full p-1 shadow-sm">
                {/* Admin Dashboard shortcut */}
                {isAdmin && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-[#0065AF] hover:bg-[#0065AF] hover:text-white transition-colors shadow-sm"
                    title="Go to Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </button>
                )}

                <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#0065AF] to-blue-400 text-white font-bold text-sm shadow-sm ring-2 ring-white">
                  {user?.profile_image ? (
                    <img
                      src={getMediaUrl(user.profile_image)}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 text-sm md:text-base font-medium text-slate-600 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded bg-gray-100"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-white shadow px-4 sm:px-6 py-4 gap-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                handleNavClick(link.id);
                setIsMenuOpen(false);
              }}
              className={`text-sm sm:text-base font-medium transition ${active === link.id
                ? "text-[#0065AF] underline underline-offset-4"
                : "text-[#333333] hover:text-[#0065AF]"
                }`}
            >
              {link.label}
            </button>
          ))}
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="w-full h-9 sm:h-10 rounded-[22px] bg-[#0065AF] text-white text-sm sm:text-base font-medium hover:bg-[#004b82] transition"
            >
              Sign up
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Admin Dashboard shortcut - mobile */}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full h-9 sm:h-10 px-4 rounded-[22px] bg-[#0065AF] text-white text-sm sm:text-base font-medium hover:bg-[#004b82] transition"
                >
                  <LayoutDashboard size={16} />
                </button>
              )}
              <button
                onClick={onLogout}
                className="text-sm sm:text-base text-gray-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
