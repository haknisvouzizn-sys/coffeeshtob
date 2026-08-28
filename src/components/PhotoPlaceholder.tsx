import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface PhotoPlaceholderProps {
  label?: string;
  sublabel?: string;
  aspectRatio?: string;
  className?: string;
  imageSrc?: string;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  label = 'ЗДЕСЬ БУДЕТ ВАШЕ ФОТО',
  sublabel,
  aspectRatio = 'aspect-[4/3]',
  className = '',
  imageSrc
}) => {
  if (imageSrc) {
    return (
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#E8DDD2] ${aspectRatio} ${className}`}>
        <img
          src={imageSrc}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#EFE7DE] border border-[#E2D5C8] flex flex-col items-center justify-center p-6 text-center ${aspectRatio} ${className}`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 max-w-[85%]">
        <div className="w-10 h-10 rounded-2xl bg-[#E2D4C5] flex items-center justify-center text-[#8C7262]">
          <ImageIcon className="w-5 h-5 stroke-[1.5]" />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#856D5E]">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-[#A69182] leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

