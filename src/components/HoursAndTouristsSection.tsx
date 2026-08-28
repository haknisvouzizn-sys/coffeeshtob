import React from 'react';
import { motion } from 'motion/react';
import { Clock, Map, Ship, ExternalLink } from 'lucide-react';
import { HoursAndTouristsContent } from '../types';

interface HoursAndTouristsSectionProps {
  content: HoursAndTouristsContent;
}

export const HoursAndTouristsSection: React.FC<HoursAndTouristsSectionProps> = ({ content }) => {
  return (
    <motion.section 
      id="hours" 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 bg-[#FAF7F2] border-t border-[#EAE0D5]"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#BC6C3F] block mb-2">
            {content.sectionTag}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#2C180F] mb-4">
            {content.title}
          </h2>
          <p className="text-base sm:text-lg text-[#553E31] leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* 2 Main Cards Grid with Smooth Hover Interactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-8">
          
          {/* Card 1: График работы */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6 rounded-3xl p-6 sm:p-10 bg-[#F2EAE0] border border-[#E5D7C9] flex flex-col justify-between shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#D4BFA9] group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-200">
                <Clock className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#2C180F] mb-6 group-hover:text-[#BC6C3F] transition-colors duration-200">
                {content.hoursCard.title}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E0D0BF] flex items-center justify-between">
                  <span className="font-serif font-bold text-lg sm:text-2xl text-[#2C180F]">
                    {content.hoursCard.mainSchedule}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#73594A] leading-relaxed pt-4 border-t border-[#E2D4C6]">
              {content.hoursCard.note}
            </p>
          </motion.div>

          {/* Card 2: Гостям города */}
          <motion.div 
            id="tourists" 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6 rounded-3xl p-6 sm:p-10 bg-[#F2EAE0] border border-[#E5D7C9] text-[#2C180F] shadow-sm flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#D4BFA9] group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-200">
                <Map className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#2C180F] mb-4 group-hover:text-[#BC6C3F] transition-colors duration-200">
                {content.touristsCard.title}
              </h3>

              <p className="text-sm sm:text-base text-[#5D4638] leading-relaxed mb-6">
                {content.touristsCard.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2D4C6]">
              <a
                href={content.touristsCard.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#BC6C3F] hover:bg-[#A95A2E] active:scale-95 text-white font-medium text-sm sm:text-base transition-all shadow-sm group/btn"
              >
                <span>{content.touristsCard.buttonText}</span>
                <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Tourist Crossing Information Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          className="rounded-3xl p-6 sm:p-8 bg-[#F2EAE0] border border-[#E5D7C9] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:border-[#D4BFA9] group"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200">
              <Ship className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-[#2C180F] mb-1 group-hover:text-[#BC6C3F] transition-colors duration-200">
                {content.crossingBanner.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#664E3F] leading-relaxed max-w-2xl">
                {content.crossingBanner.description}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
};
