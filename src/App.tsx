import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { EventsAndCraftSection } from './components/EventsAndCraftSection';
import { HoursAndTouristsSection } from './components/HoursAndTouristsSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { smoothScrollTo } from './utils/scroll';
import { useSiteContent } from './data/useSiteContent';

export const App: React.FC = () => {
  const { content, updateContent, resetToDefault, exportJson } = useSiteContent();
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Check URL hash or path for /admin or #admin on mount
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || hash === '#/admin' || path.startsWith('/admin')) {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);

    // Keyboard shortcut Ctrl+Shift+A or Cmd+Shift+A to toggle admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    window.location.hash = 'admin';
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleExploreMenu = () => {
    smoothScrollTo('menu', 500, -80);
  };

  const handleExploreAbout = () => {
    smoothScrollTo('about', 500, -80);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1F16] flex flex-col font-sans selection:bg-[#BC6C3F]/20 selection:text-[#382015]">
      {/* Dynamic Header with clean socials modal */}
      <Header content={content.header} />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection 
          content={content.hero}
          onExploreMenu={handleExploreMenu} 
          onExploreAbout={handleExploreAbout} 
        />

        {/* About Section */}
        <AboutSection content={content.about} />

        {/* Menu & Specialties Section */}
        <MenuSection content={content.menu} />

        {/* Events & 3D Craft Workshop */}
        <EventsAndCraftSection content={content.eventsAndCraft} />

        {/* Schedule & Tourists Guide */}
        <HoursAndTouristsSection content={content.hoursAndTourists} />
      </main>

      {/* Footer with Contacts & Admin access */}
      <Footer 
        content={content.footer} 
        navItems={content.header.navItems} 
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Autonomous In-App Admin Panel (Zero External Services Needed) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        content={content}
        onSave={updateContent}
        onReset={resetToDefault}
        onExport={exportJson}
      />
    </div>
  );
};

export default App;
