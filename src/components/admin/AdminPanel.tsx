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
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-5xl rounded-2xl shadow-2xl border border-[#E5D7C9] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Minimalist Top Bar */}
        <div className="bg-[#2D1B12] text-[#FAF7F2] px-5 py-3 flex items-center justify-between border-b border-[#432A1D] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-base tracking-tight">Кофештаб</span>
            <span className="text-xs text-[#BC6C3F] font-medium">/ Управление контентом</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-[#3D261B] hover:bg-[#4E3224] text-xs text-[#DE9E68] transition-colors flex items-center gap-1.5"
                title="Выйти"
              >
                <Unlock className="w-3.5 h-3.5" />
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
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE6DC] border border-[#E5D7C9] flex items-center justify-center text-[#BC6C3F] mb-4 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-bold text-xl text-[#2C180F] mb-1.5">Вход в панель управления</h3>
            <p className="text-xs text-[#735A4B] mb-6">Введите пароль администратора для редактирования сайта</p>

            <form onSubmit={handleLogin} className="w-full space-y-3.5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5C2B1] focus:border-[#BC6C3F] text-sm outline-none transition-all pr-11 text-[#2C180F]"
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
                <div className="text-xs text-red-600 font-medium text-left px-1">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white font-semibold text-xs tracking-wide transition-all shadow-xs active:scale-98"
              >
                Войти в админку
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Minimalist Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-52 bg-[#F2EAE0] border-b md:border-b-0 md:border-r border-[#E0D0C0] p-2.5 flex md:flex-col gap-1 overflow-x-auto shrink-0">
              {[
                { id: "header", label: "Шапка", icon: LayoutGrid },
                { id: "hero", label: "Главный экран", icon: Sparkles },
                { id: "about", label: "О штабе", icon: FileText },
                { id: "menu", label: "Меню", icon: Coffee },
                { id: "eventsAndCraft", label: "Жизнь штаба", icon: Sparkles },
                { id: "hoursAndTourists", label: "График и гости", icon: Clock },
                { id: "footer", label: "Подвал и контакты", icon: MapPin },
                { id: "rawJson", label: "Редактор JSON", icon: Code },
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#2D1B12] text-[#FAF7F2] shadow-xs"
                        : "text-[#6B5446] hover:bg-[#E5D7C9]/70 hover:text-[#2C180F]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Fields Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#FAF7F2] space-y-6">
              
              {/* TAB: HEADER */}
              {activeTab === "header" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">Шапка и навигация</h4>
                    <p className="text-xs text-[#735A4B]">Название проекта, подзаголовок и социальные сети</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Название бренда</label>
                      <input
                        type="text"
                        value={formData.header.brandName}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandName: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Подзаголовок бренда</label>
                      <input
                        type="text"
                        value={formData.header.brandSubtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandSubtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Текст кнопки соцсетей</label>
                      <input
                        type="text"
                        value={formData.header.socialsButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, socialsButtonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Заголовок окна соцсетей</label>
                      <input
                        type="text"
                        value={formData.header.socialsModalTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, socialsModalTitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-[#2C180F]">Ссылки на соцсети и порталы</label>
                    <div className="space-y-2.5">
                      {formData.header.socials.map((soc, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5">Название</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                            />
                          </div>
                          <div className="sm:col-span-8">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5">Ссылка (URL)</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: HERO */}
              {activeTab === "hero" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">Главный экран (Hero)</h4>
                    <p className="text-xs text-[#735A4B]">Главный баннер, заголовок, текст и фоновое фото</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Плашка адреса / локации</label>
                    <input
                      type="text"
                      value={formData.hero.locationBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, locationBadge: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Главный заголовок страницы</label>
                    <input
                      type="text"
                      value={formData.hero.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, title: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] font-heading text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Основное описание</label>
                    <textarea
                      rows={3}
                      value={formData.hero.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, description: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] resize-y leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Текст первой кнопки</label>
                      <input
                        type="text"
                        value={formData.hero.primaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, primaryButtonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Текст второй кнопки</label>
                      <input
                        type="text"
                        value={formData.hero.secondaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, secondaryButtonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Фоновая фотография (URL или путь)</label>
                    <input
                      type="text"
                      value={formData.hero.bgImage}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">О штабе</h4>
                    <p className="text-xs text-[#735A4B]">История, концепция купеческого дома и карточки особенностей</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Тег раздела</label>
                      <input
                        type="text"
                        value={formData.about.sectionTag}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, sectionTag: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Заголовок раздела</label>
                      <input
                        type="text"
                        value={formData.about.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] font-heading font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Фотография штаба (путь или URL)</label>
                    <input
                      type="text"
                      value={formData.about.image}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: { ...formData.about, image: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Город (бейдж)</label>
                      <input
                        type="text"
                        value={formData.about.badgeCity}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, badgeCity: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Улица (бейдж)</label>
                      <input
                        type="text"
                        value={formData.about.badgeStreet}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, badgeStreet: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Берег (бейдж)</label>
                      <input
                        type="text"
                        value={formData.about.badgeSub}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, badgeSub: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5C2B1] text-xs outline-none text-[#2C180F]"
                      />
                    </div>
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-[#2C180F]">Абзацы текста истории</label>
                    {formData.about.paragraphs.map((par, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="block text-[11px] text-[#8C7465]">Абзац {idx + 1}</label>
                        <textarea
                          rows={3}
                          value={par}
                          onChange={(e) => {
                            const newPars = [...formData.about.paragraphs];
                            newPars[idx] = e.target.value;
                            setFormData({
                              ...formData,
                              about: { ...formData.about, paragraphs: newPars }
                            });
                          }}
                          className="w-full p-3 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] resize-y leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Feature Cards - Clean, spacious cards */}
                  <div className="space-y-3 pt-3 border-t border-[#E5D7C9]">
                    <label className="block text-xs font-semibold text-[#2C180F]">4 карточки особенностей</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {formData.about.features.map((feat, idx) => (
                        <div key={idx} className="p-3.5 bg-white rounded-xl border border-[#E5D7C9] space-y-2.5 shadow-xs">
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1">Заголовок карточки</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold text-[#2C180F]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1">Описание карточки</label>
                            <textarea
                              rows={2}
                              value={feat.description}
                              onChange={(e) => {
                                const newFeats = [...formData.about.features];
                                newFeats[idx].description = e.target.value;
                                setFormData({
                                  ...formData,
                                  about: { ...formData.about, features: newFeats }
                                });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#553E31] leading-relaxed resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MENU */}
              {activeTab === "menu" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">Меню Кофештаба</h4>
                    <p className="text-xs text-[#735A4B]">Фирменные угощения, кофе, бутерброды и напитки</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Заголовок меню</label>
                      <input
                        type="text"
                        value={formData.menu.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] font-heading font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Подзаголовок меню</label>
                      <input
                        type="text"
                        value={formData.menu.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Бейдж о песоченском фарфоре</label>
                    <input
                      type="text"
                      value={formData.menu.porcelainBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        menu: { ...formData.menu, porcelainBadge: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>

                  {/* 4 Main Highlight Cards - Spacious, Full-Width Multi-line Design */}
                  <div className="space-y-4 pt-3 border-t border-[#E5D7C9]">
                    <label className="block text-xs font-semibold text-[#2C180F]">Главные 4 позиции с фотографиями</label>
                    <div className="space-y-3.5">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3 shadow-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-5">
                              <label className="block text-[11px] text-[#8C7465] mb-1">Название блюда / напитка</label>
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
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold text-[#2C180F]"
                              />
                            </div>
                            <div className="sm:col-span-7">
                              <label className="block text-[11px] text-[#8C7465] mb-1">Путь к фото / URL</label>
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
                                placeholder="/images/..."
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#735A4B]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1">Описание позиции (состав, зерно, особенности)</label>
                            <textarea
                              rows={2}
                              value={card.description}
                              onChange={(e) => {
                                const newCards = [...formData.menu.highlightCards];
                                newCards[idx].description = e.target.value;
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, highlightCards: newCards }
                                });
                              }}
                              className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#4E372B] leading-relaxed resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional drinks & sweets */}
                  <div className="space-y-3 pt-4 border-t border-[#E5D7C9]">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C180F]">Другие напитки и выпечка</label>
                        <p className="text-[11px] text-[#8C7465]">Дополнительные позиции внизу блока меню</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            menu: {
                              ...formData.menu,
                              additionalDrinks: [
                                ...formData.menu.additionalDrinks,
                                { title: "Новая позиция", desc: "Описание напитка или десерта" }
                              ]
                            }
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#BC6C3F] hover:bg-[#A8582D] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Добавить напиток
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {formData.menu.additionalDrinks.map((dr, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5">Название</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold text-[#2C180F]"
                            />
                          </div>
                          <div className="sm:col-span-7">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5">Описание</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#553E31]"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newDr = formData.menu.additionalDrinks.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, additionalDrinks: newDr }
                                });
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: EVENTS & CRAFT */}
              {activeTab === "eventsAndCraft" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">Жизнь штаба</h4>
                    <p className="text-xs text-[#735A4B]">Квартирники, праздники во дворе, диафильмы и 3D-мастерская</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Заголовок</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] font-heading font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Подзаголовок</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-[#E5D7C9]">
                    <label className="block text-xs font-semibold text-[#2C180F]">Карточки событий и мастерской</label>
                    <div className="space-y-4">
                      {formData.eventsAndCraft.cards.map((c, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3 shadow-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-6">
                              <label className="block text-[11px] text-[#8C7465] mb-1">Заголовок блока</label>
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
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold text-[#2C180F]"
                              />
                            </div>
                            <div className="sm:col-span-6">
                              <label className="block text-[11px] text-[#8C7465] mb-1">Фотография (путь / URL)</label>
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
                                placeholder="/images/..."
                                className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#735A4B]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1">Основной текст описания</label>
                            <textarea
                              rows={3}
                              value={c.description}
                              onChange={(e) => {
                                const newCards = [...formData.eventsAndCraft.cards];
                                newCards[idx].description = e.target.value;
                                setFormData({
                                  ...formData,
                                  eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                                });
                              }}
                              className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#4E372B] leading-relaxed resize-y"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1">Сноска / Примечание</label>
                            <textarea
                              rows={2}
                              value={c.note || ""}
                              onChange={(e) => {
                                const newCards = [...formData.eventsAndCraft.cards];
                                newCards[idx].note = e.target.value;
                                setFormData({
                                  ...formData,
                                  eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                                });
                              }}
                              className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#664E3F] leading-relaxed resize-y"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: HOURS & TOURISTS */}
              {activeTab === "hoursAndTourists" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">График работы и гостям города</h4>
                    <p className="text-xs text-[#735A4B]">Часы открытия, подсказки для туристов и информация о переправе</p>
                  </div>

                  {/* Hours Card */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3 shadow-xs">
                    <label className="block text-xs font-bold text-[#2C180F]">Блок «График работы»</label>
                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Заголовок блока</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.hoursCard.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            hoursCard: {
                              ...formData.hoursAndTourists.hoursCard,
                              title: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1">График в будни (Пн–Пт)</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekdaysSchedule || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: {
                                ...formData.hoursAndTourists.hoursCard,
                                weekdaysSchedule: e.target.value
                              }
                            }
                          })}
                          placeholder="10:00 — 19:00"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold text-[#2C180F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1">График в выходные и праздники</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekendsSchedule || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: {
                                ...formData.hoursAndTourists.hoursCard,
                                weekendsSchedule: e.target.value
                              }
                            }
                          })}
                          placeholder="09:00 — 20:00"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold text-[#C97D5D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Примечание к графику</label>
                      <textarea
                        rows={2}
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
                        className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#553E31] leading-relaxed resize-y"
                      />
                    </div>
                  </div>

                  {/* Tourists Card */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3 shadow-xs">
                    <label className="block text-xs font-bold text-[#2C180F]">Блок «Гостям города»</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1">Заголовок</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: {
                                ...formData.hoursAndTourists.touristsCard,
                                title: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1">Текст кнопки гида</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.buttonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: {
                                ...formData.hoursAndTourists.touristsCard,
                                buttonText: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Описание помощи туристам</label>
                      <textarea
                        rows={3}
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
                        className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#553E31] leading-relaxed resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Ссылка на портал гида</label>
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
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                      />
                    </div>
                  </div>

                  {/* Crossing Banner */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3 shadow-xs">
                    <label className="block text-xs font-bold text-[#2C180F]">Баннер переправы через Волгу</label>
                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Заголовок баннера</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.crossingBanner.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            crossingBanner: {
                              ...formData.hoursAndTourists.crossingBanner,
                              title: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1">Описание переправы (паром, лодочники)</label>
                      <textarea
                        rows={2}
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
                        className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs text-[#553E31] leading-relaxed resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FOOTER */}
              {activeTab === "footer" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5D7C9] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2C180F]">Подвал и контакты</h4>
                    <p className="text-xs text-[#735A4B]">Адрес, ориентиры, ссылки и копирайт внизу сайта</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Точный адрес кофейни</label>
                    <input
                      type="text"
                      value={formData.footer.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, address: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Ориентир для гостей</label>
                    <textarea
                      rows={2}
                      value={formData.footer.landmark}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, landmark: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Ссылка на Telegram</label>
                      <input
                        type="text"
                        value={formData.footer.telegramUrl}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, telegramUrl: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Ссылка на ВКонтакте</label>
                      <input
                        type="text"
                        value={formData.footer.vkUrl}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, vkUrl: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1.5">Текст копирайта</label>
                    <input
                      type="text"
                      value={formData.footer.copyright}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyright: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D5C2B1] text-xs outline-none focus:border-[#BC6C3F] text-[#2C180F]"
                    />
                  </div>
                </div>
              )}

              {/* TAB: RAW JSON */}
              {activeTab === "rawJson" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-base text-[#2C180F]">Прямой JSON-редактор</h4>
                      <p className="text-[11px] text-[#735A4B]">Для опытных пользователей и пакетного редактирования</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyJson}
                      className="px-3.5 py-1.5 rounded-xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white text-xs font-medium shadow-xs transition-colors"
                    >
                      Применить JSON
                    </button>
                  </div>

                  <textarea
                    rows={16}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#281810] text-[#FAF7F2] font-mono text-xs outline-none border border-[#482E20] leading-relaxed shadow-inner"
                    spellCheck={false}
                  />

                  {jsonError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl font-medium">
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
          <div className="bg-[#EFE6DC] border-t border-[#DECFC0] px-5 py-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Изменения сохранены!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Сбросить весь контент к исходным настройкам?")) {
                    onReset();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C2B1] text-xs text-[#735A4B] hover:bg-[#FAF7F2] transition-colors"
                title="Сбросить все"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <label className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C2B1] text-xs text-[#735A4B] hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Импорт JSON</span>
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
                className="px-3 py-1.5 rounded-xl bg-[#2D1B12] hover:bg-[#3D261B] text-xs text-[#FAF7F2] flex items-center gap-1.5 transition-colors"
                title="Скачать content.json"
              >
                <Download className="w-3.5 h-3.5 text-[#DE9E68]" />
                <span className="hidden sm:inline">Экспорт JSON</span>
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-5 py-1.5 rounded-xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить на сайте</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
