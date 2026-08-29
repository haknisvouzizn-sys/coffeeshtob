import React from 'react';
import { Music, Printer } from 'lucide-react';
import { EventsAndCraftContent } from '../types';

interface EventsAndCraftSectionProps {
  content: EventsAndCraftContent;
}

export const EventsAndCraftSection: React.FC<EventsAndCraftSectionProps> = ({ content }) => {
  const getCardIcon = (iconName?: string) => {
    if (iconName === 'Printer') return Printer;
    return Music;
  };

  return (
    <section 
      id="events-and-crafts" 
      className="py-14 sm:py-24 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE7] to-[#FAF7F2] border-t border-[#EAE0D5]"
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

        {/* 2 Bento Cards Grid with Smooth Hover Interactions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-stretch">
          {content.cards.map((card, idx) => {
            const Icon = getCardIcon(card.icon);
            const isFirst = idx === 0;
            return (
              <div 
                key={card.id}
                className={`${isFirst ? 'md:col-span-7' : 'md:col-span-5'} rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#FAF6F0] to-[#F1E8DC] border border-[#E5D7C9] flex flex-col justify-between card-soft-shadow-hover group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E8DDD0] group-hover:bg-[#C97D5D] text-[#C97D5D] group-hover:text-white flex items-center justify-center transition-colors duration-200">
                      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Photo inside card */}
                  <div className="rounded-2xl overflow-hidden mb-4 sm:mb-5 border border-[#E0D0BF] aspect-[16/9] bg-[#EFE6DC]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <h3 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#2D1E16] mb-2 sm:mb-3 leading-snug group-hover:text-[#C97D5D] transition-colors duration-200">
                    {card.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-[#5E4739] leading-relaxed mb-3 sm:mb-4">
                    {card.description}
                  </p>

                  {card.note && (
                    <p className="text-xs sm:text-sm text-[#7D6657] leading-relaxed">
                      {card.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
