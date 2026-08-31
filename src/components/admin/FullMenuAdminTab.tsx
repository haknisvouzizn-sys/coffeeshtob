import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Coffee, 
  Utensils, 
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { FullMenuPageContent, MenuCategory, MenuItem } from '../../types';
import { ImageUploadField } from './ImageUploadField';

interface FullMenuAdminTabProps {
  fullMenu: FullMenuPageContent;
  onChange: (newFullMenu: FullMenuPageContent) => void;
}

export const FullMenuAdminTab: React.FC<FullMenuAdminTabProps> = ({
  fullMenu,
  onChange,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (fullMenu.categories || []).forEach((cat, idx) => {
      initial[cat.id] = idx === 0; // expand first category by default
    });
    return initial;
  });

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Helper to update full menu state
  const handleUpdate = (updates: Partial<FullMenuPageContent>) => {
    onChange({
      ...fullMenu,
      ...updates
    });
  };

  // Category Actions
  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCategory: MenuCategory = {
      id: newId,
      title: "Новая категория меню",
      subtitle: "Описание и особенности категории",
      items: [
        {
          id: `item-${Date.now()}`,
          name: "Название позиции",
          description: "Описание ингредиентов, порция и вкус.",
          price: "200 ₽",
          volume: "250 мл",
          badge: "Новинка",
          isAvailable: true
        }
      ]
    };
    handleUpdate({
      categories: [...fullMenu.categories, newCategory]
    });
    setExpandedCategories((prev) => ({ ...prev, [newId]: true }));
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fullMenu.categories.length) return;
    const newCats = [...fullMenu.categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;
    handleUpdate({ categories: newCats });
  };

  const handleDeleteCategory = (catIndex: number) => {
    const cat = fullMenu.categories[catIndex];
    if (confirm(`Удалить всю категорию «${cat.title}» и все её позиции (${cat.items.length})?`)) {
      const newCats = fullMenu.categories.filter((_, i) => i !== catIndex);
      handleUpdate({ categories: newCats });
    }
  };

  const handleUpdateCategory = (catIndex: number, updates: Partial<MenuCategory>) => {
    const newCats = [...fullMenu.categories];
    newCats[catIndex] = { ...newCats[catIndex], ...updates };
    handleUpdate({ categories: newCats });
  };

  // Item Actions inside Category
  const handleAddItem = (catIndex: number) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "Новый напиток или блюдо",
      description: "Состав, локальные ингредиенты и вкусовые ноты.",
      price: "220 ₽",
      volume: "200 мл",
      isAvailable: true
    };
    const newCats = [...fullMenu.categories];
    newCats[catIndex].items = [...newCats[catIndex].items, newItem];
    handleUpdate({ categories: newCats });
  };

  const handleDuplicateItem = (catIndex: number, itemIndex: number) => {
    const itemToDup = fullMenu.categories[catIndex].items[itemIndex];
    const duplicated: MenuItem = {
      ...itemToDup,
      id: `item-${Date.now()}`,
      name: `${itemToDup.name} (копия)`
    };
    const newCats = [...fullMenu.categories];
    const items = [...newCats[catIndex].items];
    items.splice(itemIndex + 1, 0, duplicated);
    newCats[catIndex].items = items;
    handleUpdate({ categories: newCats });
  };

  const handleMoveItem = (catIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const items = [...fullMenu.categories[catIndex].items];
    const targetIdx = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[itemIndex];
    items[itemIndex] = items[targetIdx];
    items[targetIdx] = temp;
    const newCats = [...fullMenu.categories];
    newCats[catIndex].items = items;
    handleUpdate({ categories: newCats });
  };

  const handleDeleteItem = (catIndex: number, itemIndex: number) => {
    const newCats = [...fullMenu.categories];
    newCats[catIndex].items = newCats[catIndex].items.filter((_, i) => i !== itemIndex);
    handleUpdate({ categories: newCats });
  };

  const handleUpdateItem = (catIndex: number, itemIndex: number, updates: Partial<MenuItem>) => {
    const newCats = [...fullMenu.categories];
    const items = [...newCats[catIndex].items];
    items[itemIndex] = { ...items[itemIndex], ...updates };
    newCats[catIndex].items = items;
    handleUpdate({ categories: newCats });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="border-b border-[#E5DACD] pb-3 flex items-center justify-between">
        <div>
          <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">
            Полное меню и цены (2-я страница)
          </h4>
          <p className="text-xs text-[#735A4B]">
            Управление всеми разделами, блюдами, напитками, ценами и описаниями второй страницы сайта
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="px-3 py-2 rounded-xl bg-[#C97D5D] hover:bg-[#B86846] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить категорию</span>
        </button>
      </div>

      {/* Page Header Settings */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5 shadow-2xs">
        <h5 className="font-bold text-xs text-[#2D1E16] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#C97D5D]" />
          <span>Заголовок и шапка страницы меню</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Тег страницы</label>
            <input
              type="text"
              value={fullMenu.sectionTag || ''}
              onChange={(e) => handleUpdate({ sectionTag: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
            />
          </div>

          <div className="sm:col-span-8">
            <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Главный заголовок страницы</label>
            <input
              type="text"
              value={fullMenu.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Подзаголовок страницы меню</label>
          <textarea
            rows={2}
            value={fullMenu.subtitle || ''}
            onChange={(e) => handleUpdate({ subtitle: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] resize-y"
          />
        </div>
      </div>

      {/* Porcelain Heritage Banner Notice */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3 shadow-2xs">
        <h5 className="font-bold text-xs text-[#2D1E16] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C97D5D]" />
          <span>Плашка традиции Песоченского фарфора</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Заголовок плашки</label>
            <input
              type="text"
              value={fullMenu.porcelainNotice?.title || ''}
              onChange={(e) => handleUpdate({
                porcelainNotice: {
                  ...fullMenu.porcelainNotice,
                  title: e.target.value
                }
              })}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Бейдж / значок традиции</label>
            <input
              type="text"
              value={fullMenu.porcelainNotice?.badgeText || ''}
              onChange={(e) => handleUpdate({
                porcelainNotice: {
                  ...fullMenu.porcelainNotice,
                  badgeText: e.target.value
                }
              })}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Текст описания традиции</label>
          <textarea
            rows={2}
            value={fullMenu.porcelainNotice?.description || ''}
            onChange={(e) => handleUpdate({
              porcelainNotice: {
                ...fullMenu.porcelainNotice,
                description: e.target.value
              }
            })}
            className="w-full p-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
          />
        </div>
      </div>

      {/* Special Notice (Milk / Syrups / Supplements) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-2 shadow-2xs">
        <label className="block text-xs font-bold text-[#2D1E16]">
          Информационная плашка внизу меню (растительное молоко, добавки, сиропы)
        </label>
        <textarea
          rows={2}
          value={fullMenu.specialNotice || ''}
          onChange={(e) => handleUpdate({ specialNotice: e.target.value })}
          placeholder="Альтернативное молоко (кокосовое, миндальное) +50 ₽..."
          className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
        />
      </div>

      {/* Categories & Items Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h5 className="font-bold text-sm text-[#2D1E16]">
            Категории меню ({fullMenu.categories.length})
          </h5>
          <span className="text-xs text-[#8E796D]">
            Всего позиций: {fullMenu.categories.reduce((a, c) => a + c.items.length, 0)}
          </span>
        </div>

        {fullMenu.categories.map((category, catIdx) => {
          const isExpanded = !!expandedCategories[category.id];
          return (
            <div 
              key={category.id || catIdx} 
              className="bg-white rounded-2xl border border-[#E5DACD] overflow-hidden shadow-2xs transition-all"
            >
              {/* Category Top Bar */}
              <div className="p-3 sm:p-4 bg-[#F8F2EC] border-b border-[#E8DDD2] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleCategoryExpand(category.id)}
                    className="p-1 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="font-heading font-bold text-sm sm:text-base text-[#2D1E16] truncate block">
                      {category.title || "Категория без названия"}
                    </span>
                    <span className="text-[11px] text-[#8E796D]">
                      {category.items.length} {category.items.length === 1 ? 'позиция' : category.items.length < 5 ? 'позиции' : 'позиций'}
                    </span>
                  </div>
                </div>

                {/* Category Reorder & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveCategory(catIdx, 'up')}
                    disabled={catIdx === 0}
                    className="p-1.5 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Переместить категорию выше"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCategory(catIdx, 'down')}
                    disabled={catIdx === fullMenu.categories.length - 1}
                    className="p-1.5 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Переместить категорию ниже"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(catIdx)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                    title="Удалить категорию"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Body */}
              {isExpanded && (
                <div className="p-3.5 sm:p-5 space-y-4">
                  {/* Category Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2]">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Название категории</label>
                      <input
                        type="text"
                        value={category.title}
                        onChange={(e) => handleUpdateCategory(catIdx, { title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#664F40] mb-1">Подзаголовок / примечание</label>
                      <input
                        type="text"
                        value={category.subtitle || ''}
                        onChange={(e) => handleUpdateCategory(catIdx, { subtitle: e.target.value })}
                        placeholder="Например: Свежая ярославская обжарка «3 зерна»"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Items List in this category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D1E16]">
                        Позиции в категории ({category.items.length})
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddItem(catIdx)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF0E6] hover:bg-[#F3E3D3] text-[#B66645] border border-[#E2D0C0] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить позицию</span>
                      </button>
                    </div>

                    {category.items.map((item, itemIdx) => (
                      <div 
                        key={item.id || itemIdx} 
                        className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
                          item.isAvailable === false 
                            ? 'bg-[#F4EFEA] border-[#DED3C7] opacity-80' 
                            : 'bg-[#FAF7F2] border-[#E5DACD]'
                        }`}
                      >
                        {/* Item Top Bar */}
                        <div className="flex items-center justify-between gap-2 border-b border-[#EAE0D5] pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#EAE0D5] text-[#735A4B] text-[10px] font-bold flex items-center justify-center">
                              {itemIdx + 1}
                            </span>
                            <span className="font-bold text-xs text-[#2D1E16]">
                              {item.name || "Позиция без названия"}
                            </span>
                            <span className="font-bold text-xs text-[#B65A2C]">
                              {item.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Toggle available */}
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(catIdx, itemIdx, { isAvailable: item.isAvailable === false ? true : false })}
                              className={`p-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer ${
                                item.isAvailable === false
                                  ? 'text-gray-500 hover:bg-gray-200'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={item.isAvailable === false ? "Включить в наличие" : "Отметить как временно нет"}
                            >
                              {item.isAvailable === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span className="text-[10px] hidden sm:inline">
                                {item.isAvailable === false ? "Временно нет" : "В наличии"}
                              </span>
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(catIdx, itemIdx)}
                              className="p-1 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] transition-colors cursor-pointer"
                              title="Дублировать позицию"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Reorder */}
                            <button
                              type="button"
                              onClick={() => handleMoveItem(catIdx, itemIdx, 'up')}
                              disabled={itemIdx === 0}
                              className="p-1 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              title="Выше"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(catIdx, itemIdx, 'down')}
                              disabled={itemIdx === category.items.length - 1}
                              className="p-1 rounded-lg text-[#735A4B] hover:bg-[#EAE0D5] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              title="Ниже"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(catIdx, itemIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-semibold text-[#664F40] mb-0.5">Название</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(catIdx, itemIdx, { name: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-[#664F40] mb-0.5">Цена (с ₽)</label>
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(catIdx, itemIdx, { price: e.target.value })}
                              placeholder="220 ₽"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#B65A2C] font-bold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-[#664F40] mb-0.5">Объем / Вес</label>
                            <input
                              type="text"
                              value={item.volume || ''}
                              onChange={(e) => handleUpdateItem(catIdx, itemIdx, { volume: e.target.value })}
                              placeholder="250 мл"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-[#664F40] mb-0.5">Бейдж / Тег</label>
                            <input
                              type="text"
                              value={item.badge || ''}
                              onChange={(e) => handleUpdateItem(catIdx, itemIdx, { badge: e.target.value })}
                              placeholder="Хит"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-semibold text-[#664F40] mb-0.5">Описание блюда / напитка</label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateItem(catIdx, itemIdx, { description: e.target.value })}
                            className="w-full p-2 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        {/* Optional Item Image */}
                        <ImageUploadField
                          label="Фото позиции (необязательно)"
                          value={item.image || ''}
                          onChange={(newUrl) => handleUpdateItem(catIdx, itemIdx, { image: newUrl })}
                          placeholder="https://... или /images/photo.jpg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
