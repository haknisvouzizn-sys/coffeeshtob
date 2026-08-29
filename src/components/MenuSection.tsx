import React from 'react';
import { Sparkles } from 'lucide-react';
import { MenuContent } from '../types';

interface MenuSectionProps {
  content: MenuContent;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ content }) => {
  return (
    <section 
      id="menu" 
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

        {/* 4 Cards Grid with Smooth Hover Interactions and Pastel Gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {content.highlightCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col rounded-3xl overflow-hidden bg-gradient-to-b from-[#FAF6F0] to-[#F1E8DC] border border-[#E5D7C9] card-soft-shadow-hover group cursor-default"
            >
              {/* Photo Area */}
              <div className="p-3 pb-0">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#EFE6DC]">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-start">
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#2D1E16] mb-1.5 leading-snug group-hover:text-[#C97D5D] transition-colors duration-200">
                  {card.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#665042] leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Drinks & Porcelain Serving Banner */}
        <div className="rounded-3xl p-5 sm:p-8 lg:p-10 bg-gradient-to-br from-[#F5ECE2] via-[#EFE5DA] to-[#ECE0D3] border border-[#E5D7C9] card-soft-shadow transition-all duration-300 ease-out hover:shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-[#DFCFC0]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C97D5D] block mb-1">
                {content.additionalDrinksTag}
              </span>
              <h3 className="font-heading font-bold text-xl sm:text-3xl text-[#2D1E16]">
                {content.additionalDrinksTitle}
              </h3>
            </div>
            
            {/* Vintage Porcelain Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-2xl bg-[#FAF7F2]/90 border border-[#DFCFC0] text-xs sm:text-sm text-[#7D5237] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C97D5D] shrink-0" />
              <span>{content.porcelainBadge}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
            {content.additionalDrinks.map((drink, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-[#FAF7F2]/80 border border-[#E5D7C9] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-[#FAF7F2] hover:border-[#D8C4B0] group"
              >
                <h4 className="font-bold text-sm sm:text-base text-[#2D1E16] mb-1 group-hover:text-[#C97D5D] transition-colors duration-200">
                  {drink.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#6B5345] leading-relaxed">
                  {drink.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
