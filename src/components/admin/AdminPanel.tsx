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
  Compass, 
  Sparkles, 
  FileText, 
  MapPin, 
  ExternalLink,
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

// Default master password
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

  // Sync form data whenever content or modal opens
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

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEFAULT_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setPasswordError("");
    } else {
      setPasswordError("Неверный пароль. Попробуйте еще раз.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPasswordInput("");
  };

  // Save changes
  const handleSaveChanges = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Import JSON File
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
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (err) {
        alert("Ошибка в формате JSON файла: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Apply Raw JSON
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setFormData(parsed);
      setJsonError("");
      onSave(parsed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setJsonError("Ошибка JSON: " + (err as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E5D7C9] flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-[#382015] text-[#FAF7F2] px-6 py-4 flex items-center justify-between border-b border-[#4A2E20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BC6C3F] flex items-center justify-center text-white font-serif font-bold shadow-xs">
              К
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">Кофештаб · Автономная панель</h2>
              <p className="text-xs text-[#DE9E68]">Управление контентом без сторонних сервисов</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#4A2E20] hover:bg-[#5C3B2A] text-xs text-[#DE9E68] transition-colors flex items-center gap-1.5"
                title="Выйти из админки"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#4A2E20] hover:bg-[#5C3B2A] text-[#E2D4C6] flex items-center justify-center transition-colors"
              title="Закрыть панель"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated / Login Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#F0E6D8] border border-[#E5D7C9] flex items-center justify-center text-[#BC6C3F] mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="font-serif font-bold text-2xl text-[#2C180F] mb-2">Вход в панель управления</h3>
            <p className="text-sm text-[#735A4B] mb-6">
              Введите пароль для редактирования разделов, цен, расписания и фотографий.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D5C2B1] focus:border-[#BC6C3F] focus:ring-2 focus:ring-[#BC6C3F]/20 text-sm outline-none transition-all pr-11"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#9E8A7D] hover:text-[#2C180F]"
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
                className="w-full py-3 rounded-2xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white font-medium text-sm transition-all shadow-md active:scale-98"
              >
                Войти в админку
              </button>
            </form>

            <div className="mt-8 p-3.5 rounded-2xl bg-[#EFE6DC] border border-[#DDCFC0] text-xs text-[#6F5747] text-left w-full">
              <p className="font-semibold text-[#2C180F] mb-1">🔑 Ваш сгенерированный пароль:</p>
              <code className="bg-white/80 px-2 py-0.5 rounded text-[#BC6C3F] font-mono text-xs select-all">
                {DEFAULT_ADMIN_PASSWORD}
              </code>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation Tabs */}
            <div className="w-full md:w-64 bg-[#F2EAE0] border-b md:border-b-0 md:border-r border-[#E0D0C0] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("header")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "header"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>1. Шапка и Соцсети</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hero")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "hero"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>2. Главный экран</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "about"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>3. О штабе</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "menu"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <Coffee className="w-4 h-4 shrink-0" />
                <span>4. Меню и напитки</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("eventsAndCraft")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "eventsAndCraft"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>5. Жизнь штаба</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hoursAndTourists")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "hoursAndTourists"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>6. График и Туристы</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "footer"
                    ? "bg-[#382015] text-[#FAF7F2] shadow-xs"
                    : "text-[#6B5446] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>7. Контакты и Футер</span>
              </button>

              <div className="my-2 border-t border-[#DDCFC0] hidden md:block" />

              <button
                type="button"
                onClick={() => {
                  setJsonText(JSON.stringify(formData, null, 2));
                  setActiveTab("rawJson");
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap ${
                  activeTab === "rawJson"
                    ? "bg-[#BC6C3F] text-white shadow-xs"
                    : "text-[#8E705C] hover:bg-[#E5D7C9]/60 hover:text-[#2C180F]"
                }`}
              >
                <Code className="w-4 h-4 shrink-0" />
                <span>Исходный JSON</span>
              </button>
            </div>

            {/* Main Form Fields Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#FAF7F2] space-y-6">
              
              {/* TAB 1: HEADER & SOCIALS */}
              {activeTab === "header" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Шапка сайта и Социальные сети
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Название кофейни</label>
                      <input
                        type="text"
                        value={formData.header.brandName}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandName: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Подзаголовок бренда</label>
                      <input
                        type="text"
                        value={formData.header.brandSubtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, brandSubtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Текст кнопки соцсетей в шапке</label>
                    <input
                      type="text"
                      value={formData.header.socialsButtonText}
                      onChange={(e) => setFormData({
                        ...formData,
                        header: { ...formData.header, socialsButtonText: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                    />
                  </div>

                  {/* Social links list */}
                  <div className="pt-3 border-t border-[#E5D7C9]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#2C180F]">Ссылки на соцсети</h4>
                    </div>

                    <div className="space-y-3">
                      {formData.header.socials.map((soc, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#8C7667]">Название</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#8C7667]">Ссылка (URL)</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HERO */}
              {activeTab === "hero" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Главный экран (Hero)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Плашка адреса над заголовком</label>
                    <input
                      type="text"
                      value={formData.hero.locationBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, locationBadge: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Главный заголовок</label>
                    <input
                      type="text"
                      value={formData.hero.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, title: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Основное описание</label>
                    <textarea
                      rows={3}
                      value={formData.hero.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, description: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Текст кнопки 1 (Меню)</label>
                      <input
                        type="text"
                        value={formData.hero.primaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, primaryButtonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Текст кнопки 2 (О штабе)</label>
                      <input
                        type="text"
                        value={formData.hero.secondaryButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, secondaryButtonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Фоновое изображение (URL или путь)</label>
                    <input
                      type="text"
                      value={formData.hero.bgImage}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm focus:border-[#BC6C3F] outline-none"
                    />
                    {formData.hero.bgImage && (
                      <div className="mt-2 h-28 rounded-xl overflow-hidden border border-[#D5C2B1] relative">
                        <img src={formData.hero.bgImage} alt="Hero preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Раздел «О штабе»
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Метка раздела</label>
                      <input
                        type="text"
                        value={formData.about.sectionTag}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, sectionTag: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Главный заголовок</label>
                      <input
                        type="text"
                        value={formData.about.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Фотография дома (URL или путь)</label>
                    <input
                      type="text"
                      value={formData.about.image}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: { ...formData.about, image: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                    />
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#735A4B]">Абзацы истории</label>
                    {formData.about.paragraphs.map((par, idx) => (
                      <textarea
                        key={idx}
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none resize-y"
                      />
                    ))}
                  </div>

                  {/* Features */}
                  <div className="pt-3 border-t border-[#E5D7C9]">
                    <h4 className="text-sm font-semibold text-[#2C180F] mb-3">Карточки особенностей</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.about.features.map((feat, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] space-y-2">
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
                            placeholder="Заголовок..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                          />
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
                            placeholder="Описание..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MENU */}
              {activeTab === "menu" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Меню и напитки
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Заголовок раздела</label>
                      <input
                        type="text"
                        value={formData.menu.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Подзаголовок раздела</label>
                      <input
                        type="text"
                        value={formData.menu.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Плашка о фарфоре</label>
                    <input
                      type="text"
                      value={formData.menu.porcelainBadge}
                      onChange={(e) => setFormData({
                        ...formData,
                        menu: { ...formData.menu, porcelainBadge: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                    />
                  </div>

                  {/* Highlight Cards with photos */}
                  <div className="pt-3 border-t border-[#E5D7C9]">
                    <h4 className="text-sm font-semibold text-[#2C180F] mb-3">Главные позиции с фото</h4>
                    <div className="space-y-4">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E5D7C9] flex flex-col sm:flex-row gap-4 items-start">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#EFE6DC] shrink-0 border border-[#D5C2B1]">
                            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2 w-full">
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-bold"
                            />
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
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
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
                              placeholder="Путь к фото /images/..."
                              className="w-full px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-[11px] text-[#735A4B]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional drinks list */}
                  <div className="pt-3 border-t border-[#E5D7C9]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#2C180F]">Другие напитки и сладости</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            menu: {
                              ...formData.menu,
                              additionalDrinks: [
                                ...formData.menu.additionalDrinks,
                                { title: "Новая позиция", desc: "Описание напитка или выпечки" }
                              ]
                            }
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#BC6C3F] text-white text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Добавить
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.menu.additionalDrinks.map((dr, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E5D7C9] flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                              className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
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
                              className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newDr = formData.menu.additionalDrinks.filter((_, i) => i !== idx);
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: newDr }
                              });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: EVENTS & CRAFT */}
              {activeTab === "eventsAndCraft" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Жизнь штаба (Квартирники и 3D-печать)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Заголовок раздела</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#735A4B] mb-1">Подзаголовок раздела</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {formData.eventsAndCraft.cards.map((c, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3">
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
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-sm font-bold"
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
                          placeholder="Описание..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
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
                          placeholder="Примечание внизу карточки..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
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
                          placeholder="Путь к фото /images/..."
                          className="w-full px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: HOURS & TOURISTS */}
              {activeTab === "hoursAndTourists" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    График работы и Гостям города
                  </h3>

                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3">
                    <h4 className="text-sm font-bold text-[#2C180F]">Блок «График работы»</h4>
                    <div>
                      <label className="block text-xs text-[#735A4B] mb-1">Расписание (часы)</label>
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
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#735A4B] mb-1">Примечание дежурных</label>
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
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3">
                    <h4 className="text-sm font-bold text-[#2C180F]">Блок «Гостям города»</h4>
                    <div>
                      <label className="block text-xs text-[#735A4B] mb-1">Описание для туристов</label>
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
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#735A4B] mb-1">Текст кнопки гида</label>
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
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#735A4B] mb-1">Ссылка на гид (URL)</label>
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
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#E5D7C9] space-y-3">
                    <h4 className="text-sm font-bold text-[#2C180F]">Баннер переправы через Волгу</h4>
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
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs font-semibold"
                    />
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
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C2B1] text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: FOOTER & CONTACTS */}
              {activeTab === "footer" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-bold text-xl text-[#2C180F] border-b border-[#E5D7C9] pb-2">
                    Контакты и Подвал (Футер)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Точный адрес</label>
                    <input
                      type="text"
                      value={formData.footer.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, address: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Ориентир на местности</label>
                    <input
                      type="text"
                      value={formData.footer.landmark}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, landmark: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#735A4B] mb-1">Текст копирайта внизу страницы</label>
                    <input
                      type="text"
                      value={formData.footer.copyright}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyright: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B1] text-sm outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 8: RAW JSON EDITOR */}
              {activeTab === "rawJson" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5D7C9] pb-2">
                    <h3 className="font-serif font-bold text-xl text-[#2C180F]">
                      Прямой JSON-редактор
                    </h3>
                    <button
                      type="button"
                      onClick={handleApplyJson}
                      className="px-3 py-1.5 rounded-xl bg-[#BC6C3F] text-white text-xs font-medium"
                    >
                      Применить изменения из JSON
                    </button>
                  </div>

                  <p className="text-xs text-[#735A4B]">
                    Вы можете напрямую скопировать этот JSON или отредактировать любое значение:
                  </p>

                  <textarea
                    rows={16}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#281810] text-[#FAF7F2] font-mono text-xs leading-relaxed outline-none border border-[#482E20]"
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

        {/* Bottom Actions Bar (Available when Authenticated) */}
        {isAuthenticated && (
          <div className="bg-[#EFE6DC] border-t border-[#DECFC0] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl font-medium animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Сохранено на сайте!
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Reset to defaults button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Сбросить все изменения к исходным значениям по умолчанию?")) {
                    onReset();
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-white border border-[#D5C2B1] hover:bg-[#FAF7F2] text-xs text-[#735A4B] transition-colors flex items-center gap-1.5"
                title="Сбросить к исходным настройкам"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс</span>
              </button>

              {/* Import content.json */}
              <label className="px-3 py-2 rounded-xl bg-white border border-[#D5C2B1] hover:bg-[#FAF7F2] text-xs text-[#735A4B] transition-colors flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              {/* Download content.json */}
              <button
                type="button"
                onClick={onExport}
                className="px-3.5 py-2 rounded-xl bg-[#382015] hover:bg-[#4A2E20] text-xs text-[#FAF7F2] transition-colors flex items-center gap-1.5"
                title="Скачать файл content.json для деплоя на Vercel"
              >
                <Download className="w-3.5 h-3.5 text-[#DE9E68]" />
                <span>Скачать content.json</span>
              </button>

              {/* Save & Apply */}
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-5 py-2 rounded-xl bg-[#BC6C3F] hover:bg-[#A8582D] text-white text-xs font-semibold shadow-md active:scale-98 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить на сайте</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
