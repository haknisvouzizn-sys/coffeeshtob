import React from 'react';
import { Coffee, MapPin, Send, Globe, Compass, ExternalLink } from 'lucide-react';
import { smoothScrollTo } from '../utils/scroll';
import { FooterContent, NavItem } from '../types';

interface FooterProps {
  content: FooterContent;
  navItems: NavItem[];
}

export const Footer: React.FC<FooterProps> = ({ content, navItems }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id, 450, -75);
  };

  return (
    <footer id="contacts" className="bg-[#26170F] text-[#FAF7F2] pt-16 pb-12 px-5 sm:px-8 lg:px-12 border-t border-[#3D281C]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#3D281C]">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#BC6C3F] flex items-center justify-center text-white shadow-xs">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-[#FAF7F2] block leading-tight">
                  {content.brandName}
                </span>
                <span className="text-xs text-[#DE9E68] tracking-wider uppercase">
                  {content.brandSubtitle}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#CDB9AA] leading-relaxed max-w-sm">
              {content.description}
            </p>
          </div>

          {/* Address & Hours Col */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#DE9E68]">
              {content.addressTitle}
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-[#E2D4C6] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#DE9E68] shrink-0 mt-1" />
              <span>{content.address}</span>
            </div>
            <p className="text-xs text-[#9E8A7D] leading-relaxed pl-6.5">
              {content.landmark}
            </p>
            <div className="pt-1 pl-6.5">
              <a
                href="https://yandex.ru/maps/?text=Тутаев+Волжская+набережная+19+Кофештаб"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#DE9E68] hover:text-[#FAF7F2] transition-colors"
              >
                <span>Открыть на Яндекс.Картах</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Nav Links Col */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#DE9E68]">
              {content.navTitle}
            </h4>
            <ul className="space-y-2 text-sm text-[#CDB9AA]">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="hover:text-[#DE9E68] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials & Tourist Portal Col */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#DE9E68]">
              {content.socialsTitle}
            </h4>
            
            <div className="flex flex-col gap-2.5">
              <a
                href={content.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#352116] hover:bg-[#432A1C] border border-[#482E20] transition-colors text-sm text-[#FAF7F2] group"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-[#DE9E68]" />
                  <span>Telegram-канал</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>

              <a
                href={content.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#352116] hover:bg-[#432A1C] border border-[#482E20] transition-colors text-sm text-[#FAF7F2] group"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#DE9E68]" />
                  <span>ВКонтакте</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>

              <a
                href={content.guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#352116] hover:bg-[#432A1C] border border-[#482E20] transition-colors text-sm text-[#FAF7F2] group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-[#DE9E68]" />
                  <span>Гид по Романову</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#9E8A7D] group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7568]">
          <p>© {new Date().getFullYear()} {content.copyright}</p>
          <p className="text-[11px]">Волжская набережная, 19 · Романов</p>
        </div>
      </div>
    </footer>
  );
};
