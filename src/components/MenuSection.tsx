import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { MenuContent } from '../types';

interface MenuSectionProps {
  content: MenuContent;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ content }) => {
  return (
    <motion.section 
      id="menu" 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 bg-[#FAF7F2] border-t border-[#EAE0D5] transform-gpu will-change-[opacity,transform]"
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

        {/* 4 Cards Grid with Smooth Hover Interactions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 sm:mb-12">
          {content.highlightCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col rounded-3xl overflow-hidden bg-[#F2EAE0] border border-[#E5D7C9] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#D4BFA9] group cursor-default"
            >
              {/* Photo Area */}
              <div className="p-3 pb-0">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#EFE6DC]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-start">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2C180F] mb-2 leading-snug group-hover:text-[#BC6C3F] transition-colors duration-200">
                  {card.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#5D4638] leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Drinks & Porcelain Serving Banner */}
        <div className="rounded-3xl p-6 sm:p-8 lg:p-10 bg-[#F2EAE0] border border-[#E5D7C9] shadow-sm transition-all duration-300 ease-out hover:shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E0D0C0]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#BC6C3F] block mb-1">
                {content.additionalDrinksTag}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C180F]">
                {content.additionalDrinksTitle}
              </h3>
            </div>
            
            {/* Vintage Porcelain Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E0D0C0] text-xs sm:text-sm text-[#7D5237] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#BC6C3F] shrink-0" />
              <span>{content.porcelainBadge}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {content.additionalDrinks.map((drink, idx) => (
              <div 
                key={idx} 
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#E5D7C9] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-[#FAF7F2] hover:border-[#D4BFA9] group"
              >
                <h4 className="font-bold text-sm sm:text-base text-[#2C180F] mb-1 group-hover:text-[#BC6C3F] transition-colors duration-200">
                  {drink.title}
                </h4>
                <p className="text-xs text-[#664E3F] leading-relaxed">
                  {drink.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.section>
  );
};
