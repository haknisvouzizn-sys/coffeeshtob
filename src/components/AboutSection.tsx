import React from 'react';
import { motion } from 'motion/react';
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
    <motion.section 
      id="about" 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 bg-[#FAF7F2] transform-gpu will-change-[opacity,transform]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Photo Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden bg-[#EFE7DE] border border-[#E3D4C5] shadow-md transition-all duration-300 ease-out hover:shadow-xl group">
              <img
                src={content.image}
                alt={content.title}
                className="w-full aspect-[4/4.2] object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
              />

              {/* Location Badge on Photo */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#FAF7F2]/95 backdrop-blur-sm border border-[#E0D0BF] rounded-2xl p-4 sm:p-5 shadow-lg max-w-[240px] sm:max-w-[260px] transition-transform duration-300 ease-out group-hover:-translate-y-1">
                <div className="font-serif font-bold text-2xl text-[#BC6C3F] leading-tight mb-1">
                  {content.badgeCity}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#2C180F] mb-0.5">
                  {content.badgeStreet}
                </div>
                <div className="text-[11px] text-[#785E4E]">
                  {content.badgeSub}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#BC6C3F] block mb-2">
                {content.sectionTag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2C180F] leading-[1.15] mb-5">
                {content.title}
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-[#553E31] leading-relaxed">
                {content.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              {content.features.map((feature) => {
                const IconComponent = getFeatureIcon(feature.icon);
                return (
                  <div 
                    key={feature.id}
                    className="p-4 rounded-2xl bg-[#F2EAE0] border border-[#E5D7C9] flex items-start gap-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#D4BFA9] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200">
                      <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#2C180F] mb-1 group-hover:text-[#BC6C3F] transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-[#664C3D] leading-relaxed">
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
    </motion.section>
  );
};
