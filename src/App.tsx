import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { EventsAndCraftSection } from './components/EventsAndCraftSection';
import { HoursAndTouristsSection } from './components/HoursAndTouristsSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { OwnerPanel } from './components/owner/OwnerPanel';
import { smoothScrollTo } from './utils/scroll';
import { useSiteContent } from './data/useSiteContent';

export const App: React.FC = () => {
  const { content, updateContent, resetToDefault, exportJson } = useSiteContent();
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState<boolean>(false);

  // Check URL hash or path for /admin or #admin / #owner on mount and route changes
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash === '#owner' || hash === '#/owner' || path.startsWith('/owner')) {
        setIsOwnerOpen(true);
        setIsAdminOpen(false);
      } else if (hash === '#admin' || hash === '#/admin' || path.startsWith('/admin')) {
        setIsAdminOpen(true);
        setIsOwnerOpen(false);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);

    // Keyboard shortcuts:
    // Ctrl+Shift+A / Cmd+Shift+A -> Admin Panel
    // Ctrl+Shift+O / Cmd+Shift+O -> Owner Panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsOwnerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin' || window.location.hash === '#/admin' || window.location.pathname.startsWith('/admin')) {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleCloseOwner = () => {
    setIsOwnerOpen(false);
    if (window.location.hash === '#owner' || window.location.hash === '#/owner' || window.location.pathname.startsWith('/owner')) {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleExploreMenu = () => {
    smoothScrollTo('menu', 200, -75);
  };

  const handleExploreAbout = () => {
    smoothScrollTo('about', 200, -75);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1F16] flex flex-col font-sans selection:bg-[#BC6C3F]/20 selection:text-[#382015]">
      {/* Header */}
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

      {/* Footer */}
      <Footer 
        content={content.footer} 
        navItems={content.header.navItems}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Admin Panel (/admin) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        content={content}
        onSave={updateContent}
        onReset={resetToDefault}
        onExport={exportJson}
      />

      {/* Owner & Developer Panel (/owner) */}
      <OwnerPanel
        isOpen={isOwnerOpen}
        onClose={handleCloseOwner}
      />
    </div>
  );
};

export default App;
