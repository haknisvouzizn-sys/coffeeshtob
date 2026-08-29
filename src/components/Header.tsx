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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 sm:pt-5 pointer-events-none transition-all duration-200">
      <div 
        className={`pointer-events-auto w-full max-w-6xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-200 relative ${
          isScrolled
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E5D7C9] shadow-md text-[#2C180F]'
            : 'bg-[#FAF7F2]/90 backdrop-blur-sm border border-[#EAE0D5] shadow-sm text-[#2C180F]'
        }`}
      >
        {/* Brand Logo & Name */}
        <a 
          href="#hero" 
          onClick={(e) => handleNavClick(e, 'hero')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#BC6C3F] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Coffee className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#2C180F] leading-tight">
              {content.brandName}
            </span>
            <span className="text-[10px] sm:text-xs text-[#735A4B] tracking-wider uppercase">
              {content.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-[#553E31]">
          {cleanNavItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="hover:text-[#BC6C3F] transition-colors py-1 cursor-pointer"
              id={`nav-link-${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 relative" ref={socialsRef}>
          <button
            onClick={() => {
              setSocialsOpen(!socialsOpen);
              setMobileMenuOpen(false);
            }}
            className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all rounded-full shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              socialsOpen
                ? 'bg-[#A95A2E] text-white'
                : 'text-white bg-[#BC6C3F] hover:bg-[#A95A2E]'
            }`}
            id="header-socials-btn"
            aria-expanded={socialsOpen}
          >
            <span>{content.socialsButtonText}</span>
          </button>

          {/* Socials Popover Window */}
          {socialsOpen && (
            <div 
              className="absolute right-0 top-12 sm:top-14 w-[260px] sm:w-[280px] bg-[#FAF7F2] border border-[#E5D7C9] rounded-2xl p-3 sm:p-3.5 shadow-2xl z-50 text-[#2C180F] animate-in fade-in zoom-in-95 duration-150"
              id="socials-popover-menu"
            >
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#EAE0D5]">
                <span className="font-serif font-bold text-sm sm:text-base text-[#2C180F]">
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
                      className="px-3 py-2.5 rounded-xl bg-[#F2EAE0] hover:bg-[#EAE0D5] border border-[#E5D7C9] transition-all duration-150 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-150">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm text-[#2C180F] group-hover:text-[#BC6C3F] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-[#BC6C3F] transition-colors shrink-0" />
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
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#3B261B] hover:bg-[#EFE7DE] transition-colors cursor-pointer"
            aria-label="Меню"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-16 sm:top-20 left-4 right-4 bg-[#FAF7F2] border border-[#E5D7C9] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-1.5 lg:hidden animate-in fade-in duration-150">
          {cleanNavItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="px-4 py-2.5 rounded-2xl hover:bg-[#EFE7DE] text-[#2C180F] font-medium text-sm sm:text-base transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
