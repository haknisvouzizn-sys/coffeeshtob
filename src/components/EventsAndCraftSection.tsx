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
    <section id="events-and-crafts" className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 bg-[#FAF7F2] border-t border-[#EAE0D5]">
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

        {/* 2 Bento Cards Grid with Smooth Hover Interactions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {content.cards.map((card, idx) => {
            const Icon = getCardIcon(card.icon);
            const isFirst = idx === 0;
            return (
              <div 
                key={card.id}
                className={`${isFirst ? 'md:col-span-7' : 'md:col-span-5'} rounded-3xl p-6 sm:p-8 bg-[#F2EAE0] border border-[#E5D7C9] flex flex-col justify-between shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#D4BFA9] group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[#E5D7C9] group-hover:bg-[#BC6C3F] text-[#BC6C3F] group-hover:text-white flex items-center justify-center transition-colors duration-400">
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Photo inside card */}
                  <div className="rounded-2xl overflow-hidden mb-5 border border-[#E0D0BF] aspect-[16/9] bg-[#EFE6DC]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C180F] mb-3 group-hover:text-[#BC6C3F] transition-colors duration-300">
                    {card.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-[#5D4638] leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {card.note && (
                    <p className="text-xs sm:text-sm text-[#735A4B] leading-relaxed">
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
