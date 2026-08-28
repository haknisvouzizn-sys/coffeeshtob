import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MenuSection } from './components/MenuSection';
import { EventsAndCraftSection } from './components/EventsAndCraftSection';
import { HoursAndTouristsSection } from './components/HoursAndTouristsSection';
import { Footer } from './components/Footer';
import { smoothScrollTo } from './utils/scroll';
import { useSiteContent } from './data/useSiteContent';

export const App: React.FC = () => {
  const { content } = useSiteContent();

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

      {/* Footer with Contacts & Links */}
      <Footer 
        content={content.footer} 
        navItems={content.header.navItems} 
      />
    </div>
  );
};

export default App;
