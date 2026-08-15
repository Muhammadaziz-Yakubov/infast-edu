import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenEnroll: (courseName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEnroll }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Kurslar', href: '#courses' },
    { name: 'Akademiya', href: '#academy' },
    { name: 'Natijalar', href: '#results' },
    { name: 'Ustozlar', href: '#mentors' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setActiveSection(href);
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 pb-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <nav
          className={`relative flex items-center justify-between px-4 sm:px-6 py-3 rounded-full transition-all duration-300 ${
            scrolled
              ? 'bg-zinc-950/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50'
              : 'bg-zinc-950/40 backdrop-blur-md border border-white/5'
          }`}
        >
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] rounded-lg"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center p-1 group-hover:border-[#FF6A00]/50 transition-colors">
              <img
                src="/logo.png"
                alt="InFast Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
                IN<span className="text-[#FF6A00]">FAST</span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-1 font-medium tracking-widest uppercase">
                IT-Academy
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                    activeSection === link.href
                      ? 'bg-[#FF6A00]/15 text-[#FF6A00]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-400 hover:text-white px-3 py-1.5 transition-colors duration-200"
            >
              Kirish
            </Link>

            <button
              onClick={() => onOpenEnroll()}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-full bg-[#FF6A00] hover:bg-[#E05D00] shadow-lg shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-200" />
              <span>Kursga yozilish</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-4"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm font-medium text-zinc-300 hover:text-white rounded-xl bg-white/5"
                >
                  Kirish
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEnroll();
                  }}
                  className="w-full py-3 text-center text-sm font-semibold text-white bg-[#FF6A00] rounded-xl shadow-lg shadow-[#FF6A00]/25"
                >
                  Kursga yozilish →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
