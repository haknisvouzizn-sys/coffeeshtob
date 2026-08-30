import React from 'react';
import { Coffee, MapPin, Send, Globe, Compass, ExternalLink } from 'lucide-react';
import { smoothScrollTo } from '../utils/scroll';
import { FooterContent, NavItem } from '../types';

interface FooterProps {
  content: FooterContent;
  navItems: NavItem[];
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ content, navItems, onOpenAdmin }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id, 200, -75);
  };

  // Filter out any unwanted or administrative navigation items
  const cleanNavItems = (navItems || []).filter(
    item => item.id !== 'admin' && !item.label.toLowerCase().includes('админ')
  );

  return (
    <footer 
      id="contacts" 
      className="bg-[#24160E] text-[#FAF7F2] pt-14 sm:pt-16 pb-10 sm:pb-12 px-4 sm:px-8 lg:px-12 border-t border-[#3B2519]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-[#3B2519]">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C97D5D] to-[#B66645] flex items-center justify-center text-[#FAF7F2] shadow-xs">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-[#FAF7F2] block leading-tight">
                  {content.brandName}
                </span>
                <span className="text-xs text-[#E09D77] tracking-wider uppercase font-medium">
                  {content.brandSubtitle}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#CFBCAD] leading-relaxed max-w-sm">
              {content.description}
            </p>
          </div>

          {/* Address & Hours Col */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E09D77]">
              {content.addressTitle}
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-[#E2D4C6] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#E09D77] shrink-0 mt-0.5" />
              <span>{content.address}</span>
            </div>
            <p className="text-xs text-[#A18C7E] leading-relaxed pl-6.5">
              {content.landmark}
            </p>
            <div className="pt-1 pl-6.5">
              <a
                href={content.mapsUrl || "https://yandex.ru/maps/?text=Тутаев+Волжская+набережная+19+Кофештаб"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#E09D77] hover:text-[#FAF7F2] transition-colors"
              >
                <span>{content.mapsButtonText || "Открыть на Яндекс.Картах"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Nav Links Col */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E09D77]">
              {content.navTitle}
            </h4>
            <ul className="space-y-2 text-sm text-[#CFBCAD]">
              {cleanNavItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="hover:text-[#E09D77] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials & Tourist Portal Col */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E09D77]">
              {content.socialsTitle}
            </h4>
            
            <div className="flex flex-col gap-2">
              <a
                href={content.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#331F14] hover:bg-[#42291B] border border-[#442A1D] transition-colors text-sm text-[#FAF7F2] group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-[#E09D77]" />
                  <span>{content.telegramLabel || "Telegram-канал"}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>

              <a
                href={content.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#331F14] hover:bg-[#42291B] border border-[#442A1D] transition-colors text-sm text-[#FAF7F2] group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#E09D77]" />
                  <span>{content.vkLabel || "ВКонтакте"}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>

              <a
                href={content.guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#331F14] hover:bg-[#42291B] border border-[#442A1D] transition-colors text-sm text-[#FAF7F2] group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-[#E09D77]" />
                  <span>{content.guideLabel || "Гид по Романову"}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E796D]">
          <p>© {new Date().getFullYear()} {content.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px]">{content.bottomAddress || "Волжская набережная, 19 · Романов"}</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-[11px] text-[#8E796D] hover:text-[#E09D77] transition-colors cursor-pointer"
                title="Панель администратора"
              >
                Вход для сотрудников
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
