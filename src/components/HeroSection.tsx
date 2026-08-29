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
      className="relative min-h-[85vh] sm:min-h-[88vh] md:min-h-[92vh] lg:min-h-screen flex items-center pt-20 sm:pt-22 md:pt-24 lg:pt-32 pb-12 sm:pb-14 md:pb-16 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#271810] text-[#FAF7F2] overflow-hidden"
    >
      {/* Background Image with Dark Pastel Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={content.bgImage}
          alt={content.title}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover object-center opacity-35 scale-105 will-change-transform"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#271810] via-[#271810]/85 to-[#271810]/50" />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col items-start text-left">
        {/* Location pill - pushed up with generous bottom margin to create breathing room above headline */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2]/12 border border-[#FAF7F2]/20 text-[#EFE4D8] text-xs sm:text-sm font-semibold tracking-wide mb-6 sm:mb-8 md:mb-10 lg:mb-12 backdrop-blur-md shrink-0 shadow-xs"
          id="hero-location-badge"
        >
          <MapPin className="w-3.5 h-3.5 text-[#E09D77] shrink-0" />
          <span>{content.locationBadge}</span>
        </div>

        {/* Playfair Display Headline with refined editorial character and ample vertical breathing room */}
        <h1 
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#FAF7F2] leading-[1.15] mb-5 sm:mb-6 md:mb-7 lg:mb-8 max-w-4xl"
          id="hero-main-title"
        >
          {content.title}
        </h1>

        {/* Description */}
        <p 
          className="font-sans text-sm sm:text-base md:text-lg lg:text-xl text-[#DAC8B8] leading-relaxed max-w-2xl font-normal mb-8 sm:mb-10 md:mb-12 lg:mb-16"
        >
          {content.description}
        </p>

        {/* Action Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onExploreMenu}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] active:scale-95 text-[#FAF7F2] font-semibold text-sm sm:text-base tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center min-h-[48px]"
            id="hero-cta-menu"
          >
            {content.primaryButtonText}
          </button>

          <button
            onClick={onExploreAbout}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 active:scale-95 text-[#FAF7F2] border border-[#FAF7F2]/25 font-semibold text-sm sm:text-base tracking-wide transition-all cursor-pointer backdrop-blur-sm flex items-center justify-center min-h-[48px]"
            id="hero-cta-about"
          >
            {content.secondaryButtonText}
          </button>
        </div>
      </div>
    </section>
  );
};
