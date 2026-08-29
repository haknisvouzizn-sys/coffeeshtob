import React from 'react';
import { Clock, Map, Ship, ExternalLink } from 'lucide-react';
import { HoursAndTouristsContent } from '../types';

interface HoursAndTouristsSectionProps {
  content: HoursAndTouristsContent;
}

export const HoursAndTouristsSection: React.FC<HoursAndTouristsSectionProps> = ({ content }) => {
  return (
    <section 
      id="hours" 
      className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-[#FAF7F2] border-t border-[#EAE0D5]"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C97D5D] block mb-2">
            {content.sectionTag}
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2D1E16] mb-3 sm:mb-4">
            {content.title}
          </h2>
          <p className="text-base sm:text-lg text-[#5C4638] leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* 2 Main Cards Grid with Smooth Hover Interactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch mb-6 sm:mb-8">
          
          {/* Card 1: График работы с разделением на будни и выходные */}
          <div 
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#FAF6F0] to-[#F1E8DC] border border-[#E5D7C9] flex flex-col justify-between card-soft-shadow-hover group"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E8DDD0] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center mb-5 transition-colors duration-200">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h3 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#2D1E16] mb-4 leading-snug group-hover:text-[#C97D5D] transition-colors duration-200">
                {content.hoursCard.title}
              </h3>

              <div className="space-y-3 mb-5">
                {/* Будни */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D4C6] flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#826A5A]">
                    Будни (Пн–Пт)
                  </span>
                  <span className="font-heading font-bold text-lg sm:text-xl text-[#2D1E16] tracking-wide">
                    {content.hoursCard.weekdaysSchedule || "10:00 — 19:00"}
                  </span>
                </div>

                {/* Выходные и праздники */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D4C6] flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C97D5D]">
                    Выходные и праздники
                  </span>
                  <span className="font-heading font-bold text-lg sm:text-xl text-[#C97D5D] tracking-wide">
                    {content.hoursCard.weekendsSchedule || "09:00 — 20:00"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#73594A] leading-relaxed pt-3.5 border-t border-[#E2D4C6]">
              {content.hoursCard.note}
            </p>
          </div>

          {/* Card 2: Гостям города */}
          <div 
            id="tourists" 
            className="lg:col-span-6 rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#FAF6F0] to-[#F1E8DC] border border-[#E5D7C9] text-[#2D1E16] card-soft-shadow-hover flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E8DDD0] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center mb-5 transition-colors duration-200">
                <Map className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h3 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#2D1E16] mb-3 leading-snug group-hover:text-[#C97D5D] transition-colors duration-200">
                {content.touristsCard.title}
              </h3>

              <p className="text-sm sm:text-base text-[#5E4739] leading-relaxed mb-5">
                {content.touristsCard.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2D4C6]">
              <a
                href={content.touristsCard.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] active:scale-95 text-white font-semibold text-sm sm:text-base tracking-wide transition-all shadow-xs group/btn min-h-[48px]"
              >
                <span>{content.touristsCard.buttonText}</span>
                <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Tourist Crossing Information Banner */}
        <div 
          className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#FAF6F0] via-[#F3ECE3] to-[#FAF6F0] border border-[#E5D7C9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-soft-shadow transition-all duration-300 ease-out hover:shadow-md hover:border-[#D8C4B0] group"
        >
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E8DDD0] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200">
              <Ship className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-[#2D1E16] mb-0.5 group-hover:text-[#C97D5D] transition-colors duration-200">
                {content.crossingBanner.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#685346] leading-relaxed max-w-2xl">
                {content.crossingBanner.description}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
