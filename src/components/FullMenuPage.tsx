import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  X, 
  ArrowLeft, 
  Coffee, 
  Utensils, 
  CupSoda, 
  Cake, 
  Gift, 
  CheckCircle2, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { FullMenuPageContent, MenuCategory, MenuItem } from '../types';

interface FullMenuPageProps {
  content: FullMenuPageContent;
  onBackToHome: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const FullMenuPage: React.FC<FullMenuPageProps> = ({
  content,
  onBackToHome,
  onNavigateToSection
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique tags across all items
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    content.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.badge) {
          tags.add(item.badge);
        }
      });
    });
    return Array.from(tags);
  }, [content.categories]);

  // Filtered categories and items based on search and selected filters
  const filteredCategories = useMemo(() => {
    return content.categories
      .map((category) => {
        // If a specific category is selected, only keep that category
        if (selectedCategory !== 'all' && category.id !== selectedCategory) {
          return null;
        }

        const filteredItems = category.items.filter((item) => {
          // Search query check
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(q);
            const matchesDesc = item.description.toLowerCase().includes(q);
            const matchesPrice = item.price.toLowerCase().includes(q);
            const matchesBadge = item.badge ? item.badge.toLowerCase().includes(q) : false;
            if (!matchesName && !matchesDesc && !matchesPrice && !matchesBadge) {
              return false;
            }
          }

          // Tag filter check
          if (selectedTag !== 'all') {
            if (item.badge !== selectedTag) {
              return false;
            }
          }

          return true;
        });

        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...category,
          items: filteredItems
        };
      })
      .filter((cat): cat is MenuCategory => cat !== null);
  }, [content.categories, selectedCategory, searchQuery, selectedTag]);

  const totalItemsCount = useMemo(() => {
    return content.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [content.categories]);

  const matchingItemsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  const getCategoryIcon = (categoryId: string) => {
    if (categoryId.includes('coffee')) return Coffee;
    if (categoryId.includes('author')) return Sparkles;
    if (categoryId.includes('tea') || categoryId.includes('kvas')) return CupSoda;
    if (categoryId.includes('food') || categoryId.includes('snack')) return Utensils;
    if (categoryId.includes('dessert') || categoryId.includes('pastr')) return Cake;
    if (categoryId.includes('souvenir') || categoryId.includes('3d')) return Gift;
    return Coffee;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1F16] pt-20 sm:pt-24 pb-16 sm:pb-24">
      {/* Top Breadcrumb & Return Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 sm:px-5 rounded-2xl bg-[#F4EDE4] border border-[#E5DACD]">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#735A4B]">
            <button
              onClick={onBackToHome}
              className="hover:text-[#C97D5D] transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Главная</span>
            </button>
            <span className="text-[#C4B2A3]">/</span>
            <span className="text-[#2D1E16] font-semibold">Меню и цены</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8E796D]">
            <span>Позиций в меню:</span>
            <span className="font-bold text-[#C97D5D] bg-white px-2 py-0.5 rounded-full border border-[#DFCFC0]">
              {totalItemsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header of Menu Page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E6] border border-[#E2D0C0] text-xs font-bold uppercase tracking-widest text-[#B66645] mb-3 sm:mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C97D5D]" />
            <span>{content.sectionTag || "ПОЛНОЕ МЕНЮ И ЦЕНЫ"}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2D1E16] mb-3 sm:mb-4 leading-tight">
            {content.title || "Меню Кофештаба"}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#5C4537] leading-relaxed max-w-2xl mx-auto">
            {content.subtitle || "Свежесваренный кофе, травяные чаи в антикварном фарфоре, сыры из Борисоглеба и романовский квас"}
          </p>
        </div>
      </div>

      {/* Vintage Porcelain Heritage Notice Banner */}
      {content.porcelainNotice && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
          <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-[#F6EFE6] via-[#F2E7DC] to-[#EFE1D4] border border-[#E2D2C3] card-soft-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#E2D2C3] text-[#C97D5D] flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">
                    {content.porcelainNotice.title}
                  </h3>
                  {content.porcelainNotice.badgeText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C97D5D]/15 text-[#9C4D2E] text-[11px] font-semibold">
                      {content.porcelainNotice.badgeText}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#665042] leading-relaxed max-w-3xl">
                  {content.porcelainNotice.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToSection('about')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DFCFC0] text-xs font-semibold text-[#664D3E] hover:text-[#C97D5D] transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs self-end sm:self-center"
            >
              Подробнее об истории →
            </button>
          </div>
        </div>
      )}

      {/* Interactive Search & Filters Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-3xl border border-[#E5DACD] space-y-3.5 shadow-xs">
          
          {/* Top row: Search input & Active count */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E8A7D]" />
              <input
                type="text"
                placeholder="Поиск по меню (название, ингредиенты, цена, тег)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#D8C9B9] focus:border-[#C97D5D] focus:ring-1 focus:ring-[#C97D5D] text-xs sm:text-sm outline-none transition-all text-[#2D1E16]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8A7D] hover:text-[#2D1E16] cursor-pointer"
                  title="Очистить"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag('all');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#EAE0D5] hover:bg-[#DFCFC0] text-xs font-semibold text-[#664D3E] transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Сбросить фильтры</span>
              </button>
            )}
          </div>

          {/* Category Tabs (Scrollable pills) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#C97D5D] to-[#B86846] text-white shadow-xs'
                  : 'bg-white text-[#5C4537] hover:bg-[#F2EAE0] border border-[#E2D4C6]'
              }`}
            >
              Все категории ({totalItemsCount})
            </button>

            {content.categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C97D5D] to-[#B86846] text-white shadow-xs'
                      : 'bg-white text-[#5C4537] hover:bg-[#F2EAE0] border border-[#E2D4C6]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{cat.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#EAE0D5] text-[#7A604F]'
                  }`}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Tag Badges Filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EAE0D5] text-xs">
              <span className="text-[11px] font-semibold text-[#8E796D] mr-1">Особенности:</span>
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedTag === 'all'
                    ? 'bg-[#C97D5D] text-white font-semibold'
                    : 'bg-[#EFE7DE] text-[#664D3E] hover:bg-[#E5DACD]'
                }`}
              >
                Все
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    selectedTag === tag
                      ? 'bg-[#C97D5D] text-white font-semibold shadow-2xs'
                      : 'bg-[#EFE7DE] text-[#664D3E] hover:bg-[#E5DACD]'
                  }`}
                >
                  <span>{tag}</span>
                  {selectedTag === tag && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Categories and Menu Items Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-[#E5DACD] p-8 max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#C97D5D] flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#2D1E16] mb-1.5">
              По вашему запросу ничего не найдено
            </h3>
            <p className="text-xs sm:text-sm text-[#735A4B] mb-5">
              Попробуйте изменить запрос или сбросить активные фильтры
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTag('all');
              }}
              className="px-5 py-2.5 rounded-full bg-[#C97D5D] hover:bg-[#B86846] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Показать все позиции
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.id);
            return (
              <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 pb-3.5 mb-6 sm:mb-8 border-b-2 border-[#E5DACD]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#C97D5D] border border-[#DFCFC0] flex items-center justify-center shrink-0">
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2D1E16]">
                        {category.title}
                      </h2>
                      {category.subtitle && (
                        <p className="text-xs sm:text-sm text-[#735A4B] mt-0.5">
                          {category.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#A38D7E] self-end sm:self-auto">
                    {category.items.length} {category.items.length === 1 ? 'позиция' : category.items.length < 5 ? 'позиции' : 'позиций'}
                  </span>
                </div>

                {/* Items Grid (Adaptive cards with high contrast and refined details) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-3xl p-4 sm:p-5 transition-all duration-200 border flex flex-col justify-between group ${
                        item.isAvailable === false
                          ? 'bg-[#F2ECE4]/60 border-[#E2D5C7] opacity-60'
                          : 'bg-white hover:bg-[#FAF6F0] border-[#E8DDD1] hover:border-[#D8C7B5] shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-3.5 sm:gap-4">
                        {/* Optional Item Image Thumbnail */}
                        {item.image && (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF0E6] shrink-0 border border-[#E5DACD] self-start">
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Text & Price block */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16] leading-snug group-hover:text-[#C97D5D] transition-colors">
                              {item.name}
                            </h3>
                            
                            <span className="font-heading font-bold text-base sm:text-lg text-[#B65A2C] whitespace-nowrap shrink-0">
                              {item.price}
                            </span>
                          </div>

                          {/* Badges / Volume */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {item.volume && (
                              <span className="text-[11px] font-semibold text-[#8E796D] bg-[#F4EDE4] px-2 py-0.5 rounded-md">
                                {item.volume}
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[11px] font-semibold text-[#995938] bg-[#FAF0E6] border border-[#E8D6C6] px-2 py-0.5 rounded-md">
                                {item.badge}
                              </span>
                            )}
                            {item.isAvailable === false && (
                              <span className="text-[11px] font-medium text-[#7E6C60] bg-[#E8DFD5] px-2 py-0.5 rounded-md">
                                Временно нет
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-[#5C4537] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Special Notice / Additives & Milk Alternatives Banner */}
      {content.specialNotice && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="p-4 sm:p-6 rounded-3xl bg-[#F6EFE7] border border-[#E5DACD] flex items-center gap-3.5 shadow-2xs">
            <Info className="w-5 h-5 text-[#C97D5D] shrink-0" />
            <p className="text-xs sm:text-sm text-[#665042] leading-relaxed font-medium">
              {content.specialNotice}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Action Footer on Menu Page */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <div className="rounded-3xl p-6 sm:p-10 bg-[#2D1E16] text-[#FAF7F2] border border-[#3D291F] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#FAF7F2]">
              Ждем вас в гости в Кофештабе!
            </h3>
            <p className="text-xs sm:text-sm text-[#CFBCAD] leading-relaxed">
              Кофейня расположена в старинном купеческом доме прямо на Волжской набережной, 19. Приходите согреться кофе, полистать редкие книги или просто полюбоваться волжскими просторами.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigateToSection('hours')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-98 cursor-pointer text-center"
            >
              График и как добраться
            </button>
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer text-center"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
