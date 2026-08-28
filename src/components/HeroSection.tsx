import React from 'react';
import { MapPin } from 'lucide-react';
import { HeroContent } from '../types';

interface HeroSectionProps {
  content: HeroContent;
  onExploreMenu: () => void;
  onExploreAbout: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onExploreMenu, onExploreAbout }) => {
  return (
    <section 
      id="hero"
      className="relative min-h-[90vh] sm:min-h-screen flex items-center pt-28 sm:pt-32 pb-16 sm:pb-20 px-5 sm:px-8 lg:px-12 bg-[#2E1C12] text-[#FAF7F2] overflow-hidden"
    >
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={content.bgImage}
          alt={content.title}
          className="w-full h-full object-cover object-center opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E1C12] via-[#2E1C12]/80 to-[#2E1C12]/50" />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Location pill */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/15 text-[#EFE4D8] text-xs sm:text-sm font-medium tracking-wide mb-6 sm:mb-8 backdrop-blur-sm"
          id="hero-location-badge"
        >
          <MapPin className="w-3.5 h-3.5 text-[#DE9E68] shrink-0" />
          <span>{content.locationBadge}</span>
        </div>

        {/* Title */}
        <h1 
          className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#FAF7F2] leading-[1.1] mb-6 max-w-3xl"
          id="hero-main-title"
        >
          {content.title}
        </h1>

        {/* Alive description */}
        <p className="font-sans text-base sm:text-lg md:text-xl text-[#D8C7B8] leading-relaxed max-w-2xl font-normal mb-8 sm:mb-10">
          {content.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
          <button
            onClick={onExploreMenu}
            className="px-7 py-3.5 rounded-full bg-[#BC6C3F] hover:bg-[#A95A2E] active:scale-95 text-[#FAF7F2] font-medium text-sm sm:text-base transition-all shadow-md cursor-pointer"
            id="hero-cta-menu"
          >
            {content.primaryButtonText}
          </button>

          <button
            onClick={onExploreAbout}
            className="px-7 py-3.5 rounded-full bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 active:scale-95 text-[#FAF7F2] border border-[#FAF7F2]/25 font-medium text-sm sm:text-base transition-all cursor-pointer backdrop-blur-sm"
            id="hero-cta-about"
          >
            {content.secondaryButtonText}
          </button>
        </div>
      </div>
    </section>
  );
};
