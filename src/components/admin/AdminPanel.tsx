import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  LayoutGrid, 
  Coffee, 
  Clock, 
  Sparkles, 
  FileText, 
  MapPin, 
  Code
} from 'lucide-react';
import { SiteContent } from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  onSave: (newContent: SiteContent) => void;
  onReset: () => void;
  onExport: () => void;
}

export const DEFAULT_ADMIN_PASSWORD = "kofeshtab2025";
const AUTH_STORAGE_KEY = "kofeshtab_admin_authenticated";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  content,
  onSave,
  onReset,
  onExport,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("header");
  const [formData, setFormData] = useState<SiteContent>(content);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>("");
  const [jsonError, setJsonError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setFormData(content);
      setJsonText(JSON.stringify(content, null, 2));
      const auth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, [isOpen, content]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setPasswordError("");
    } else {
      setPasswordError("Неверный пароль");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPasswordInput("");
  };

  const handleSaveChanges = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          setFormData(parsed);
          setJsonText(JSON.stringify(parsed, null, 2));
          onSave(parsed);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2500);
        }
      } catch (err) {
        alert("Ошибка формата JSON: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setFormData(parsed);
      setJsonError("");
      onSave(parsed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setJsonError("Ошибка JSON: " + (err as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E5D7C9] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Minimalist Top Bar */}
        <div className="bg-[#2D1B12] text-[#FAF7F2] px-5 py-3 flex items-center justify-between border-b border-[#432A1D]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base">Кофештаб</span>
            <span className="text-xs text-[#BC6C3F]">/ Редактор</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-[#3D261B] hover:bg-[#4E3224] text-xs text-[#DE9E68] transition-colors flex items-center gap-1"
                title="Выйти"
              >
                <Unlock className="w-3 h-3" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#3D261B] hover:bg-[#4E3224] text-[#E2D4C6] flex items-center justify-center transition-colors"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist Login Screen - NO password hint */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-xs mx-auto my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE6DC] border border-[#E5D7C9] flex items-center justify-center text-[#BC6C3F] mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-lg text-[#2C180F] mb-1">Панель управления</h3>
            <p className="text-xs text-[#735A4B] mb-5">Введите пароль для входа</p>

            <form onSubmit={handleLogin} className="w-full space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] focus:border-[#BC6C3F] text-sm outline-none transition-all pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#9E8A7D] hover:text-[#2C180F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="text-xs text-red-600 font-medium text-left">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white font-medium text-xs transition-all shadow-sm active:scale-98"
              >
                Войти
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Minimalist Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-48 bg-[#F2EAE0] border-b md:border-b-0 md:border-r border-[#E0D0C0] p-2 flex md:flex-col gap-1 overflow-x-auto shrink-0">
              {[
                { id: "header", label: "Шапка", icon: LayoutGrid },
                { id: "hero", label: "Главная", icon: Sparkles },
                { id: "about", label: "О штабе", icon: FileText },
                { id: "menu", label: "Меню", icon: Coffee },
                { id: "eventsAndCraft", label: "Жизнь", icon: Sparkles },
                { id: "hoursAndTourists", label: "График", icon: Clock },
                { id: "footer", label: "Контакты", icon: MapPin },
                { id: "rawJson", label: "JSON", icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === "rawJson") {
                        setJsonText(JSON.stringify(formData, null, 2));
                      }
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#2D1B12] text-[#FAF7F2]"
                        : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Fields Content */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#FAF7F2] space-y-4">
              
              {/* TAB: HEADER */}
              {activeTab === "header" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Название</label>
                      <input
                        type="text"
                        value={formData.header.brandName}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandName: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Подзаголовок</label>
                      <input
                        type="text"
                        value={formData.header.brandSubtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandSubtitle: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Кнопка в шапке</label>
                    <input
                      type="text"
                      value={formData.header.socialsButtonText}
                      onChange={(e) => setFormData({
                        ...formData,
                        header: { ...formData.header, socialsButtonText: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F]"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-medium text-[#2C180F]">Ссылки соцсетей</label>
                    {formData.header.socials.map((soc, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5D7C9] grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={soc.title}
                          onChange={(e) => {
                            const newSocials = [...formData.header.socials];
                            newSocials[idx].title = e.target.value;
                            setFormData({
                              ...formData,
                              header: { ...formData.header, socials: newSocials }
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={soc.url}
                          onChange={(e) => {
                            const newSocials = [...formData.header.socials];
                            newSocials[idx].url = e.target.value;
                            setFormData({
                              ...formData,
                              header: { ...formData.header, socials: newSocials }
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HERO */}
              {activeTab === "hero" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Метка локации</label>
                    <input
                      type="text"
                      value={formData.hero.locationBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, locationBadge: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Главный заголовок</label>
                    <input
                      type="text"
                      value={formData.hero.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, title: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Описание</label>
                    <textarea
                      rows={3}
                      value={formData.hero.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, description: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Кнопка 1</label>
                      <input
                        type="text"
                        value={formData.hero.primaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, primaryButtonText: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Кнопка 2</label>
                      <input
                        type="text"
                        value={formData.hero.secondaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, secondaryButtonText: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Фоновое фото (URL или путь)</label>
                    <input
                      type="text"
                      value={formData.hero.bgImage}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Тег раздела</label>
                      <input
                        type="text"
                        value={formData.about.sectionTag}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, sectionTag: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Заголовок</label>
                      <input
                        type="text"
                        value={formData.about.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, title: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Фотография (путь/URL)</label>
                    <input
                      type="text"
                      value={formData.about.image}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: { ...formData.about, image: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#735A4B]">Текст истории</label>
                    {formData.about.paragraphs.map((par, idx) => (
                      <textarea
                        key={idx}
                        rows={2}
                        value={par}
                        onChange={(e) => {
                          const newPars = [...formData.about.paragraphs];
                          newPars[idx] = e.target.value;
                          setFormData({
                            ...formData,
                            about: { ...formData.about, paragraphs: newPars }
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none resize-y"
                      />
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-medium text-[#2C180F]">Карточки особенностей</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.about.features.map((feat, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5D7C9] space-y-1.5">
                          <input
                            type="text"
                            value={feat.title}
                            onChange={(e) => {
                              const newFeats = [...formData.about.features];
                              newFeats[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                about: { ...formData.about, features: newFeats }
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={feat.description}
                            onChange={(e) => {
                              const newFeats = [...formData.about.features];
                              newFeats[idx].description = e.target.value;
                              setFormData({
                                ...formData,
                                about: { ...formData.about, features: newFeats }
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MENU */}
              {activeTab === "menu" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Заголовок</label>
                      <input
                        type="text"
                        value={formData.menu.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, title: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Подзаголовок</label>
                      <input
                        type="text"
                        value={formData.menu.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Плашка о фарфоре</label>
                    <input
                      type="text"
                      value={formData.menu.porcelainBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        menu: { ...formData.menu, porcelainBadge: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  {/* Highlights */}
                  <div className="pt-2 border-t border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-medium text-[#2C180F]">Главные позиции (с фото)</label>
                    <div className="space-y-2">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5D7C9] grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const newCards = [...formData.menu.highlightCards];
                              newCards[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: newCards }
                              });
                            }}
                            className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={card.description}
                            onChange={(e) => {
                              const newCards = [...formData.menu.highlightCards];
                              newCards[idx].description = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: newCards }
                              });
                            }}
                            className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                          />
                          <input
                            type="text"
                            value={card.image}
                            onChange={(e) => {
                              const newCards = [...formData.menu.highlightCards];
                              newCards[idx].image = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: newCards }
                              });
                            }}
                            placeholder="Фото /images/..."
                            className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#735A4B]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional drinks */}
                  <div className="pt-2 border-t border-[#E5D7C9] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#2C180F]">Другие напитки и сладости</label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            menu: {
                              ...formData.menu,
                              additionalDrinks: [
                                ...formData.menu.additionalDrinks,
                                { title: "Новая позиция", desc: "Описание" }
                              ]
                            }
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-[#BC6C3F] text-white text-[11px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Добавить
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {formData.menu.additionalDrinks.map((dr, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-[#E5D7C9] flex items-center gap-2">
                          <input
                            type="text"
                            value={dr.title}
                            onChange={(e) => {
                              const newDr = [...formData.menu.additionalDrinks];
                              newDr[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: newDr }
                              });
                            }}
                            className="w-1/3 px-2 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-medium"
                          />
                          <input
                            type="text"
                            value={dr.desc}
                            onChange={(e) => {
                              const newDr = [...formData.menu.additionalDrinks];
                              newDr[idx].desc = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: newDr }
                              });
                            }}
                            className="flex-1 px-2 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newDr = formData.menu.additionalDrinks.filter((_, i) => i !== idx);
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: newDr }
                              });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: EVENTS & CRAFT */}
              {activeTab === "eventsAndCraft" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Заголовок</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, title: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#735A4B] mb-1">Подзаголовок</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {formData.eventsAndCraft.cards.map((c, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] space-y-2">
                        <input
                          type="text"
                          value={c.title}
                          onChange={(e) => {
                            const newCards = [...formData.eventsAndCraft.cards];
                            newCards[idx].title = e.target.value;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                            });
                          }}
                          className="w-full px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold"
                        />
                        <textarea
                          rows={2}
                          value={c.description}
                          onChange={(e) => {
                            const newCards = [...formData.eventsAndCraft.cards];
                            newCards[idx].description = e.target.value;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                            });
                          }}
                          className="w-full px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                        <input
                          type="text"
                          value={c.image}
                          onChange={(e) => {
                            const newCards = [...formData.eventsAndCraft.cards];
                            newCards[idx].image = e.target.value;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                            });
                          }}
                          placeholder="Фото /images/..."
                          className="w-full px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HOURS & TOURISTS */}
              {activeTab === "hoursAndTourists" && (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-semibold text-[#2C180F]">График работы</label>
                    <input
                      type="text"
                      value={formData.hoursAndTourists.hoursCard.mainSchedule}
                      onChange={(e) => setFormData({
                        ...formData,
                        hoursAndTourists: {
                          ...formData.hoursAndTourists,
                          hoursCard: {
                            ...formData.hoursAndTourists.hoursCard,
                            mainSchedule: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={formData.hoursAndTourists.hoursCard.note}
                      onChange={(e) => setFormData({
                        ...formData,
                        hoursAndTourists: {
                          ...formData.hoursAndTourists,
                          hoursCard: {
                            ...formData.hoursAndTourists.hoursCard,
                            note: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-semibold text-[#2C180F]">Гостям города (Гид)</label>
                    <textarea
                      rows={2}
                      value={formData.hoursAndTourists.touristsCard.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        hoursAndTourists: {
                          ...formData.hoursAndTourists,
                          touristsCard: {
                            ...formData.hoursAndTourists.touristsCard,
                            description: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={formData.hoursAndTourists.touristsCard.buttonUrl}
                      onChange={(e) => setFormData({
                        ...formData,
                        hoursAndTourists: {
                          ...formData.hoursAndTourists,
                          touristsCard: {
                            ...formData.hoursAndTourists.touristsCard,
                            buttonUrl: e.target.value
                          }
                        }
                      })}
                      placeholder="Ссылка на гид"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E5D7C9] space-y-2">
                    <label className="block text-xs font-semibold text-[#2C180F]">Баннер переправы</label>
                    <input
                      type="text"
                      value={formData.hoursAndTourists.crossingBanner.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        hoursAndTourists: {
                          ...formData.hoursAndTourists,
                          crossingBanner: {
                            ...formData.hoursAndTourists.crossingBanner,
                            description: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB: FOOTER */}
              {activeTab === "footer" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Адрес</label>
                    <input
                      type="text"
                      value={formData.footer.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, address: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Ориентир</label>
                    <input
                      type="text"
                      value={formData.footer.landmark}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, landmark: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#735A4B] mb-1">Копирайт</label>
                    <input
                      type="text"
                      value={formData.footer.copyright}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyright: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB: RAW JSON */}
              {activeTab === "rawJson" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#2C180F]">Прямой JSON</label>
                    <button
                      type="button"
                      onClick={handleApplyJson}
                      className="px-2.5 py-1 rounded bg-[#BC6C3F] text-white text-xs"
                    >
                      Применить JSON
                    </button>
                  </div>

                  <textarea
                    rows={15}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#281810] text-[#FAF7F2] font-mono text-xs outline-none border border-[#482E20]"
                  />

                  {jsonError && (
                    <div className="text-xs text-red-600 font-medium">
                      {jsonError}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Minimalist Bottom Actions Bar */}
        {isAuthenticated && (
          <div className="bg-[#EFE6DC] border-t border-[#DECFC0] px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Сохранено
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Сбросить к исходным?")) {
                    onReset();
                    onClose();
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs text-[#735A4B] hover:bg-[#FAF7F2]"
                title="Сброс"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <label className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs text-[#735A4B] hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Загрузить</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={onExport}
                className="px-2.5 py-1.5 rounded-lg bg-[#2D1B12] hover:bg-[#3D261B] text-xs text-[#FAF7F2] flex items-center gap-1"
                title="Скачать content.json"
              >
                <Download className="w-3.5 h-3.5 text-[#DE9E68]" />
                <span className="hidden sm:inline">Скачать JSON</span>
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-1.5 rounded-lg bg-[#BC6C3F] hover:bg-[#A8582D] text-white text-xs font-semibold shadow-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
