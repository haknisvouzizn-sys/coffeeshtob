import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Menu, X, Send, Globe, Compass, ExternalLink } from 'lucide-react';
import { smoothScrollTo } from '../utils/scroll';
import { HeaderContent } from '../types';

interface HeaderProps {
  content: HeaderContent;
}

export const Header: React.FC<HeaderProps> = ({ content }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const socialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close socials popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (socialsRef.current && !socialsRef.current.contains(event.target as Node)) {
        setSocialsOpen(false);
      }
    };
    if (socialsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [socialsOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setSocialsOpen(false);
    smoothScrollTo(id, 200, -75);
  };

  const getSocialIcon = (id: string) => {
    if (id.includes('tg') || id.includes('telegram')) return Send;
    if (id.includes('vk')) return Globe;
    return Compass;
  };

  // Filter out any admin-related nav items
  const cleanNavItems = (content.navItems || []).filter(
    item => item.id !== 'admin' && !item.label.toLowerCase().includes('админ')
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pt-2.5 sm:pt-4 pointer-events-none transform-gpu">
      <div 
        className={`pointer-events-auto w-full max-w-6xl rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-200 relative transform-gpu ${
          isScrolled
            ? 'bg-[#FAF6F0]/95 backdrop-blur-md border border-[#E5D8CC] shadow-md text-[#2D1E16]'
            : 'bg-[#FAF6F0]/90 backdrop-blur-md border border-[#ECE0D4] shadow-xs text-[#2D1E16]'
        }`}
      >
        {/* Brand Logo & Name */}
        <a 
          href="#hero" 
          onClick={(e) => handleNavClick(e, 'hero')}
          className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#C97D5D] to-[#B66645] flex items-center justify-center text-[#FAF7F2] shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Coffee className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-[#2D1E16] leading-tight">
              {content.brandName}
            </span>
            <span className="text-[10px] sm:text-xs text-[#8A7160] font-medium tracking-wider uppercase">
              {content.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold tracking-wide text-[#5C4537]">
          {cleanNavItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="hover:text-[#C97D5D] transition-colors py-1 cursor-pointer"
              id={`nav-link-${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative" ref={socialsRef}>
          <button
            onClick={() => {
              setSocialsOpen(!socialsOpen);
              setMobileMenuOpen(false);
            }}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all rounded-full shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              socialsOpen
                ? 'bg-[#A85938] text-white'
                : 'text-white bg-gradient-to-r from-[#C97D5D] to-[#B66645] hover:from-[#B66645] hover:to-[#A85938]'
            }`}
            id="header-socials-btn"
            aria-expanded={socialsOpen}
          >
            <span>{content.socialsButtonText}</span>
          </button>

          {/* Socials Popover Window */}
          {socialsOpen && (
            <div 
              className="absolute right-0 top-11 sm:top-13 w-[260px] sm:w-[280px] bg-[#FAF6F0] border border-[#E5D8CC] rounded-2xl p-3 sm:p-3.5 shadow-2xl z-50 text-[#2D1E16] animate-in fade-in zoom-in-95 duration-150"
              id="socials-popover-menu"
            >
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#EAE0D5]">
                <span className="font-heading text-base text-[#2D1E16] uppercase tracking-wide">
                  {content.socialsModalTitle}
                </span>
                <button
                  onClick={() => setSocialsOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#735A4B] hover:bg-[#EFE7DE] transition-colors cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {content.socials.map((item) => {
                  const Icon = getSocialIcon(item.id);
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-[#F3ECE3] hover:bg-[#ECE2D6] border border-[#E5D8CC] transition-all duration-150 flex items-center justify-between group active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#E5D8CC] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-[#2D1E16] group-hover:text-[#C97D5D] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-[#C97D5D] transition-colors shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSocialsOpen(false);
            }}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#3B261B] hover:bg-[#EFE7DE] active:scale-95 transition-all cursor-pointer"
            aria-label="Меню"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu with Smooth Animation */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-14 sm:top-18 left-3 right-3 bg-[#FAF6F0]/98 backdrop-blur-lg border border-[#E5D8CC] rounded-3xl p-4 shadow-2xl flex flex-col gap-1.5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {cleanNavItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="px-4 py-3 rounded-2xl hover:bg-[#EFE7DE] active:bg-[#EAE0D5] text-[#2D1E16] font-semibold text-base transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>{item.label}</span>
              <span className="text-xs text-[#B59E8E]">→</span>
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
