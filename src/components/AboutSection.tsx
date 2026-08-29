import React from 'react';
import { Sprout, Sparkles, Users, BookOpen } from 'lucide-react';
import { AboutContent } from '../types';

interface AboutSectionProps {
  content: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content }) => {
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return Sparkles;
      case 'Users':
        return Users;
      case 'BookOpen':
        return BookOpen;
      case 'Sprout':
      default:
        return Sprout;
    }
  };

  return (
    <section 
      id="about" 
      className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE7] to-[#FAF7F2]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Photo Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#EFE5DB] to-[#E3D5C5] border border-[#E2D2C2] card-soft-shadow-hover group">
              <img
                src={content.image}
                alt={content.title}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/4.2] object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
                referrerPolicy="no-referrer"
              />

              {/* Location Badge on Photo with soft pastel styling */}
              <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E0D0BF] rounded-2xl p-3 sm:p-5 card-soft-shadow max-w-[190px] sm:max-w-[260px] transition-transform duration-300 ease-out group-hover:-translate-y-1">
                <div className="font-heading font-bold text-lg sm:text-2xl text-[#C97D5D] leading-tight mb-1">
                  {content.badgeCity}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#2D1E16] mb-0.5">
                  {content.badgeStreet}
                </div>
                <div className="text-[11px] text-[#7A6456]">
                  {content.badgeSub}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 sm:space-y-7">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C97D5D] block mb-2">
                {content.sectionTag}
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2D1E16] leading-[1.15] mb-4 sm:mb-5">
                {content.title}
              </h2>

              <div className="space-y-3.5 text-base sm:text-lg text-[#553E31] leading-relaxed">
                {content.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Feature Cards with subtle pastel gradients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mt-2">
              {content.features.map((feature) => {
                const IconComponent = getFeatureIcon(feature.icon);
                return (
                  <div 
                    key={feature.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#FAF6F0] to-[#F1E8DC] border border-[#E5D7C9] flex items-start gap-3 sm:gap-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#D8C4B0] group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E8DDD0] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-[#2D1E16] mb-0.5 group-hover:text-[#C97D5D] transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-[#685346] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
