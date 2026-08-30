import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Save, 
  UploadCloud, 
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
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Globe,
  Send,
  Compass
} from 'lucide-react';
import { SiteContent, HighlightCard, AdditionalDrink, FeatureItem, EventOrCraftCard } from '../../types';
import { loginAdmin, logoutAdmin, checkAdminSession, publishContentToServer } from '../../utils/api';
import { ImageUploadField } from './ImageUploadField';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  onSave: (newContent: SiteContent) => void;
  onReset: () => void;
  onExport: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  content,
  onSave,
  onReset,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>("menu");
  const [formData, setFormData] = useState<SiteContent>(content);
  
  // Publish & Draft state
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draftSavedMessage, setDraftSavedMessage] = useState<boolean>(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // Check server session on open
  useEffect(() => {
    if (isOpen) {
      setFormData(content);
      setIsCheckingAuth(true);
      checkAdminSession()
        .then((status) => {
          setIsAuthenticated(status.authenticated);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    }
  }, [isOpen, content]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError("Введите пароль");
      return;
    }

    setIsLoggingIn(true);
    setPasswordError("");

    try {
      await loginAdmin(passwordInput);
      setIsAuthenticated(true);
      setPasswordInput("");
    } catch (err: any) {
      setPasswordError(err.message || "Неверный пароль администратора");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  const handleSaveDraft = () => {
    onSave(formData);
    setDraftSavedMessage(true);
    setTimeout(() => setDraftSavedMessage(false), 3000);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishStatus(null);

    try {
      // 1. Save locally first so user never loses their draft
      onSave(formData);

      // 2. Publish to server / GitHub
      const res = await publishContentToServer(formData);
      setPublishStatus({
        type: 'success',
        message: res.message || '✓ Опубликовано успешно!',
      });
      setTimeout(() => setPublishStatus(null), 5000);
    } catch (err: any) {
      setPublishStatus({
        type: 'error',
        message: err.message || 'Не удалось опубликовать изменения. Ваши изменения сохранены локально. Попробуйте ещё раз.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border-0 sm:border border-[#E2D4C6] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Bar */}
        <div className="bg-[#F6EFE7] text-[#2D1E16] px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E5DACD] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE2D5] flex items-center justify-center text-[#C97D5D]">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-[#2D1E16]">Кофештаб</span>
                <span className="text-[11px] sm:text-xs text-[#995938] font-medium">Админ-панель</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-xs font-medium text-[#664D3E] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Выйти"
              >
                <Unlock className="w-3.5 h-3.5 text-[#C97D5D]" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] flex items-center justify-center transition-colors cursor-pointer"
              title="Закрыть (Предпросмотр)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Auth State */}
        {isCheckingAuth ? (
          <div className="p-12 flex flex-col items-center justify-center text-center my-auto">
            <RefreshCw className="w-8 h-8 text-[#C97D5D] animate-spin mb-3" />
            <p className="text-xs text-[#735A4B]">Проверка авторизации...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Login Screen */
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#EDE2D5] border border-[#DFCFC0] flex items-center justify-center text-[#C97D5D] mb-3.5 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#2D1E16] mb-1">ADMIN</h3>
            <p className="text-xs text-[#7A6456] mb-5">Управление меню и содержанием сайта</p>

            <form onSubmit={handleLogin} className="w-full space-y-3.5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5C6B7] focus:border-[#C97D5D] focus:ring-1 focus:ring-[#C97D5D] text-sm outline-none transition-all pr-11 text-[#2D1E16]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#9E8A7D] hover:text-[#2D1E16] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-left">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white font-semibold text-xs tracking-wide transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Войти</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-[#F3ECE2] border-b md:border-b-0 md:border-r border-[#E5DACD] p-3 flex md:flex-col justify-between shrink-0 overflow-y-auto">
              <div className="space-y-4 w-full">
                
                {/* Section Group: CONTENT */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E7566] px-3 mb-1.5">
                    Контент
                  </div>
                  <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setActiveTab("menu")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "menu"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <Coffee className={`w-4 h-4 shrink-0 ${activeTab === 'menu' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>Меню</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("hero")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "hero"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'hero' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>Главный экран</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("about")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "about"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'about' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>О штабе</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("events")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "events"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'events' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>Жизнь штаба</span>
                    </button>
                  </div>
                </div>

                {/* Section Group: BUSINESS */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E7566] px-3 mb-1.5">
                    Информация
                  </div>
                  <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setActiveTab("hours")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "hours"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <Clock className={`w-4 h-4 shrink-0 ${activeTab === 'hours' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>График и гости</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("contacts")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "contacts"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 shrink-0 ${activeTab === 'contacts' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>Контакты и соцсети</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("header")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                        activeTab === "header"
                          ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                          : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                      }`}
                    >
                      <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'header' ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                      <span>Шапка и бренд</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Actions Footer in Sidebar */}
              <div className="pt-3 border-t border-[#E5DACD] space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[#D5C6B7] hover:bg-[#FAF7F2] text-xs font-semibold text-[#2D1E16] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#8C7465]" />
                  <span>Сохранить черновик</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Публикация...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Опубликовать</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 text-center text-[11px] text-[#8E796D] hover:text-[#2D1E16] transition-colors cursor-pointer"
                >
                  Предпросмотр сайта
                </button>
              </div>

            </div>

            {/* Main Editor Canvas */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2] space-y-5">
              
              {/* Status Alert Banners */}
              {draftSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Черновик успешно сохранен в браузере. Нажмите «Опубликовать», чтобы обновить сайт.</span>
                </div>
              )}

              {publishStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
                    publishStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  {publishStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{publishStatus.message}</span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: MENU EDITOR (Phase 7) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "menu" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5DACD] pb-3">
                    <div>
                      <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Меню кофейни</h4>
                      <p className="text-xs text-[#7A6456]">Управление главными позициями, напитками и выпечкой</p>
                    </div>
                  </div>

                  {/* Section Headings */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок раздела</label>
                        <input
                          type="text"
                          value={formData.menu.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок</label>
                        <input
                          type="text"
                          value={formData.menu.subtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка о фарфоре</label>
                      <input
                        type="text"
                        value={formData.menu.porcelainBadge}
                        onChange={(e) => setFormData({
                          ...formData,
                          menu: { ...formData.menu, porcelainBadge: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* 1. Highlight Cards (with Photos) */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#2D1E16]">
                        Главные позиции меню (с фото)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newCard: HighlightCard = {
                            id: `item_${Date.now()}`,
                            title: 'Новая позиция',
                            description: 'Описание напитка или угощения',
                            image: '/images/photo_2026-08-28_23_24_29_1787998530911.jpg',
                          };
                          setFormData({
                            ...formData,
                            menu: {
                              ...formData.menu,
                              highlightCards: [...formData.menu.highlightCards, newCard],
                            },
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#C97D5D] hover:text-[#B86846] font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить позицию</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={card.id || idx} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs font-bold text-[#8C7465] w-5">{idx + 1}.</span>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const updated = [...formData.menu.highlightCards];
                                  updated[idx].title = e.target.value;
                                  setFormData({
                                    ...formData,
                                    menu: { ...formData.menu, highlightCards: updated },
                                  });
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs font-semibold outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                                placeholder="Название блюда или напитка"
                              />
                            </div>

                            {/* Reorder & Delete controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const updated = [...formData.menu.highlightCards];
                                  const temp = updated[idx - 1];
                                  updated[idx - 1] = updated[idx];
                                  updated[idx] = temp;
                                  setFormData({
                                    ...formData,
                                    menu: { ...formData.menu, highlightCards: updated },
                                  });
                                }}
                                className="p-1 rounded-lg bg-white border border-[#D8C9B9] hover:bg-[#EDE2D5] disabled:opacity-30 text-[#664F40] cursor-pointer"
                                title="Вверх"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formData.menu.highlightCards.length - 1}
                                onClick={() => {
                                  const updated = [...formData.menu.highlightCards];
                                  const temp = updated[idx + 1];
                                  updated[idx + 1] = updated[idx];
                                  updated[idx] = temp;
                                  setFormData({
                                    ...formData,
                                    menu: { ...formData.menu, highlightCards: updated },
                                  });
                                }}
                                className="p-1 rounded-lg bg-white border border-[#D8C9B9] hover:bg-[#EDE2D5] disabled:opacity-30 text-[#664F40] cursor-pointer"
                                title="Вниз"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.menu.highlightCards.filter((_, i) => i !== idx);
                                  setFormData({
                                    ...formData,
                                    menu: { ...formData.menu, highlightCards: updated },
                                  });
                                }}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent transition-colors cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <textarea
                              rows={2}
                              value={card.description}
                              onChange={(e) => {
                                const updated = [...formData.menu.highlightCards];
                                updated[idx].description = e.target.value;
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, highlightCards: updated },
                                });
                              }}
                              className="w-full p-2 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                              placeholder="Описание позиции"
                            />
                          </div>

                          <ImageUploadField
                            label="Фотография"
                            value={card.image}
                            onChange={(newUrl) => {
                              const updated = [...formData.menu.highlightCards];
                              updated[idx].image = newUrl;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: updated },
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Additional Drinks & Treats List */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-[#2D1E16]">
                          Дополнительные напитки и выпечка
                        </label>
                        <p className="text-[11px] text-[#8E796D]">Список согревающих чаев, какао и десертов</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newDrink: AdditionalDrink = {
                            title: 'Новый напиток',
                            desc: 'Описание или стоимость',
                          };
                          setFormData({
                            ...formData,
                            menu: {
                              ...formData.menu,
                              additionalDrinks: [...formData.menu.additionalDrinks, newDrink],
                            },
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#C97D5D] hover:text-[#B86846] font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить напиток</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.menu.additionalDrinks.map((drink, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={drink.title}
                            onChange={(e) => {
                              const updated = [...formData.menu.additionalDrinks];
                              updated[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: updated },
                              });
                            }}
                            className="w-full sm:w-1/3 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs font-semibold outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            placeholder="Название"
                          />
                          <input
                            type="text"
                            value={drink.desc}
                            onChange={(e) => {
                              const updated = [...formData.menu.additionalDrinks];
                              updated[idx].desc = e.target.value;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, additionalDrinks: updated },
                              });
                            }}
                            className="w-full sm:flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            placeholder="Описание или цена"
                          />
                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const updated = [...formData.menu.additionalDrinks];
                                const temp = updated[idx - 1];
                                updated[idx - 1] = updated[idx];
                                updated[idx] = temp;
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, additionalDrinks: updated },
                                });
                              }}
                              className="p-1 rounded-lg bg-white border border-[#D8C9B9] hover:bg-[#EDE2D5] disabled:opacity-30 text-[#664F40] cursor-pointer"
                              title="Вверх"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formData.menu.additionalDrinks.length - 1}
                              onClick={() => {
                                const updated = [...formData.menu.additionalDrinks];
                                const temp = updated[idx + 1];
                                updated[idx + 1] = updated[idx];
                                updated[idx] = temp;
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, additionalDrinks: updated },
                                });
                              }}
                              className="p-1 rounded-lg bg-white border border-[#D8C9B9] hover:bg-[#EDE2D5] disabled:opacity-30 text-[#664F40] cursor-pointer"
                              title="Вниз"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.menu.additionalDrinks.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, additionalDrinks: updated },
                                });
                              }}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: HERO (Главный экран) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "hero" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Главный экран (Hero)</h4>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка адреса и локации</label>
                      <input
                        type="text"
                        value={formData.hero.locationBadge}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, locationBadge: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Главный заголовок</label>
                      <input
                        type="text"
                        value={formData.hero.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, title: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs sm:text-sm font-bold font-heading outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Текст описания</label>
                      <textarea
                        rows={3}
                        value={formData.hero.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, description: e.target.value }
                        })}
                        className="w-full p-2.5 sm:p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] resize-y leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Текст первой кнопки</label>
                        <input
                          type="text"
                          value={formData.hero.primaryButtonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hero: { ...formData.hero, primaryButtonText: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Текст второй кнопки</label>
                        <input
                          type="text"
                          value={formData.hero.secondaryButtonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hero: { ...formData.hero, secondaryButtonText: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label="Фоновая фотография"
                      value={formData.hero.bgImage}
                      onChange={(newUrl) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: newUrl }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: ABOUT (О штабе) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "about" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">О штабе</h4>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок раздела</label>
                      <input
                        type="text"
                        value={formData.about.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          about: { ...formData.about, title: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка: Город</label>
                        <input
                          type="text"
                          value={formData.about.badgeCity}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, badgeCity: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка: Адрес</label>
                        <input
                          type="text"
                          value={formData.about.badgeStreet}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, badgeStreet: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка: Подпись</label>
                        <input
                          type="text"
                          value={formData.about.badgeSub}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, badgeSub: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label="Фото купеческого дома"
                      value={formData.about.image}
                      onChange={(newUrl) => setFormData({
                        ...formData,
                        about: { ...formData.about, image: newUrl }
                      })}
                    />
                  </div>

                  {/* Paragraphs of history */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#2D1E16]">Абзацы текста истории</label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              paragraphs: [...formData.about.paragraphs, ""],
                            },
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#C97D5D] hover:text-[#B86846] font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить абзац</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {formData.about.paragraphs.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <textarea
                            rows={3}
                            value={p}
                            onChange={(e) => {
                              const updated = [...formData.about.paragraphs];
                              updated[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                about: { ...formData.about, paragraphs: updated },
                              });
                            }}
                            className="flex-1 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] leading-relaxed"
                          />
                          {formData.about.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.about.paragraphs.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  about: { ...formData.about, paragraphs: updated },
                                });
                              }}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: EVENTS & CRAFT (Жизнь штаба) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "events" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Жизнь штаба</h4>
                    <p className="text-xs text-[#7A6456]">Квартирники, Квартальники и 3D-мастерская</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок раздела</label>
                        <input
                          type="text"
                          value={formData.eventsAndCraft.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventsAndCraft: { ...formData.eventsAndCraft, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок</label>
                        <input
                          type="text"
                          value={formData.eventsAndCraft.subtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventsAndCraft: { ...formData.eventsAndCraft, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.eventsAndCraft.cards.map((card, idx) => (
                      <div key={card.id || idx} className="p-4 rounded-2xl bg-white border border-[#E5DACD] space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок карточки</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const updated = [...formData.eventsAndCraft.cards];
                              updated[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: updated }
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs font-semibold outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#664F40] mb-1">Описание</label>
                          <textarea
                            rows={3}
                            value={card.description}
                            onChange={(e) => {
                              const updated = [...formData.eventsAndCraft.cards];
                              updated[idx].description = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: updated }
                              });
                            }}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#664F40] mb-1">Примечание</label>
                          <input
                            type="text"
                            value={card.note || ''}
                            onChange={(e) => {
                              const updated = [...formData.eventsAndCraft.cards];
                              updated[idx].note = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: updated }
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        <ImageUploadField
                          label="Фотография события"
                          value={card.image}
                          onChange={(newUrl) => {
                            const updated = [...formData.eventsAndCraft.cards];
                            updated[idx].image = newUrl;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: updated }
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: HOURS & TOURISTS (График и информация для гостей) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "hours" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">График работы и информация для гостей</h4>
                  </div>

                  {/* Hours Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#C97D5D]">График работы</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Будни (расписание)</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekdaysSchedule}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: {
                                ...formData.hoursAndTourists.hoursCard,
                                weekdaysSchedule: e.target.value,
                              },
                            },
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          placeholder="11:00-20:00"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Выходные (расписание)</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekendsSchedule}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: {
                                ...formData.hoursAndTourists.hoursCard,
                                weekendsSchedule: e.target.value,
                              },
                            },
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          placeholder="10:00-20:00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Примечание дежурных</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.hoursCard.note}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            hoursCard: {
                              ...formData.hoursAndTourists.hoursCard,
                              note: e.target.value,
                            },
                          },
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Tourists Portal */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#C97D5D]">Гостям города</h5>
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Описание для туристов</label>
                      <textarea
                        rows={3}
                        value={formData.hoursAndTourists.touristsCard.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            touristsCard: {
                              ...formData.hoursAndTourists.touristsCard,
                              description: e.target.value,
                            },
                          },
                        })}
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Текст кнопки гида</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.buttonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: {
                                ...formData.hoursAndTourists.touristsCard,
                                buttonText: e.target.value,
                              },
                            },
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Ссылка на гид (URL)</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.buttonUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: {
                                ...formData.hoursAndTourists.touristsCard,
                                buttonUrl: e.target.value,
                              },
                            },
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: CONTACTS & FOOTER */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "contacts" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Контакты и соцсети</h4>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Адрес</label>
                      <input
                        type="text"
                        value={formData.footer.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Ориентир на местности</label>
                      <input
                        type="text"
                        value={formData.footer.landmark}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, landmark: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Ссылка на Яндекс.Карты</label>
                      <input
                        type="text"
                        value={formData.footer.mapsUrl || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, mapsUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Telegram-канал (URL)</label>
                        <input
                          type="text"
                          value={formData.footer.telegramUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, telegramUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">ВКонтакте (URL)</label>
                        <input
                          type="text"
                          value={formData.footer.vkUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, vkUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB: HEADER & BRAND */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "header" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Шапка и название бренда</h4>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Название бренда</label>
                        <input
                          type="text"
                          value={formData.header.brandName}
                          onChange={(e) => setFormData({
                            ...formData,
                            header: { ...formData.header, brandName: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок</label>
                        <input
                          type="text"
                          value={formData.header.brandSubtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            header: { ...formData.header, brandSubtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
