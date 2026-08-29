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
      <div className="absolute inset-0 z-0">
        <img
          src={content.bgImage}
          alt={content.title}
          className="w-full h-full object-cover object-center opacity-35 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#271810] via-[#271810]/85 to-[#271810]/50" />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col items-start text-left">
        {/* Location pill - shifted higher especially on tablet (sm/md) with balanced margins */}
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2]/12 border border-[#FAF7F2]/20 text-[#EFE4D8] text-xs sm:text-sm font-semibold tracking-wide mb-3 sm:mb-3.5 md:mb-4 lg:mb-6 backdrop-blur-md shrink-0"
          id="hero-location-badge"
        >
          <MapPin className="w-3.5 h-3.5 text-[#E09D77] shrink-0" />
          <span>{content.locationBadge}</span>
        </div>

        {/* Playfair Display Headline with refined editorial character */}
        <h1 
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#FAF7F2] leading-[1.14] mb-3 sm:mb-4 md:mb-5 lg:mb-6 max-w-4xl"
          id="hero-main-title"
        >
          {content.title}
        </h1>

        {/* Description */}
        <p 
          className="font-sans text-sm sm:text-base md:text-lg lg:text-xl text-[#DAC8B8] leading-relaxed max-w-2xl font-normal mb-6 sm:mb-7 md:mb-8 lg:mb-10"
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
