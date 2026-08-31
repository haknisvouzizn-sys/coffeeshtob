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
  Calendar,
  AlertCircle,
  GitBranch,
  GitCommit,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Server,
  UserCheck,
  Utensils
} from 'lucide-react';
import { SiteContent } from '../../types';
import { 
  saveContentViaNetlifyFunction, 
  fetchServerlessInfo, 
  ServerlessSiteInfo 
} from '../../utils/netlifySync';
import { 
  initNetlifyIdentity, 
  getCurrentIdentityUser, 
  isIdentityLoggedIn, 
  openIdentityLogin, 
  openIdentitySignup, 
  logoutIdentity, 
  onIdentityStateChange 
} from '../../utils/netlifyIdentity';
import { NetlifyIdentityUser } from '../../vite-env';
import { ImageUploadField } from './ImageUploadField';
import { FullMenuAdminTab } from './FullMenuAdminTab';

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
  onExport,
}) => {
  const [currentUser, setCurrentUser] = useState<NetlifyIdentityUser | null>(getCurrentIdentityUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isIdentityLoggedIn());
  const [activeTab, setActiveTab] = useState<string>("header");
  const [formData, setFormData] = useState<SiteContent>(content);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // Serverless / Netlify Function Sync State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [serverlessInfo, setServerlessInfo] = useState<ServerlessSiteInfo | null>(null);
  const [publishStatus, setPublishStatus] = useState<{ 
    type: 'success' | 'error'; 
    message: string; 
    commitUrl?: string;
    sha?: string;
    repo?: string;
    branch?: string;
  } | null>(null);

  // Initialize Netlify Identity & listen to auth state changes
  useEffect(() => {
    initNetlifyIdentity((user) => {
      setCurrentUser(user);
      setIsAuthenticated(Boolean(user && user.email));
    });

    const unsubscribe = onIdentityStateChange((user) => {
      setCurrentUser(user);
      setIsAuthenticated(Boolean(user && user.email));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch serverless info when modal opens or tab changes to serverless
  useEffect(() => {
    if (isOpen) {
      setFormData(content);
      fetchServerlessInfo().then((info) => {
        if (info) setServerlessInfo(info);
      });
    }
  }, [isOpen, content]);

  const handleLoginClick = () => {
    openIdentityLogin();
  };

  const handleSignupClick = () => {
    openIdentitySignup();
  };

  const handleLogoutClick = async () => {
    await logoutIdentity();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Main Save & Publish action:
   * Sends formData to Netlify Serverless Function (/api/save-content or /.netlify/functions/save-content)
   * The function authenticates with Netlify Identity and commits changes to GitHub repo using server-side env vars.
   */
  const handlePublishToGitHub = async () => {
    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const res = await saveContentViaNetlifyFunction(
        formData,
        `Обновление контента сайта [автор: ${currentUser?.email || 'admin'}]`
      );

      onSave(formData);
      setPublishStatus({
        type: 'success',
        message: res.message,
        commitUrl: res.commitUrl,
        sha: res.sha,
        repo: res.repo,
        branch: res.branch,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      console.error('Publish via Netlify function failed:', err);
      // Fallback: save to local memory/state so user progress is never lost
      onSave(formData);
      setPublishStatus({
        type: 'error',
        message: (err as Error).message || 'Ошибка сохранения через Netlify Function',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmReset = () => {
    onReset();
    setConfirmResetOpen(false);
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
          onSave(parsed);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2500);
        }
      } catch (err) {
        alert("Ошибка формата JSON файла: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "header", label: "Шапка и соцсети", icon: LayoutGrid },
    { id: "hero", label: "Главный экран", icon: Sparkles },
    { id: "about", label: "О штабе", icon: FileText },
    { id: "menu", label: "Меню (блок)", icon: Coffee },
    { id: "fullMenu", label: "Полное меню (2-я стр.)", icon: Utensils },
    { id: "eventsAndCraft", label: "Жизнь штаба", icon: Calendar },
    { id: "hoursAndTourists", label: "График и гости", icon: Clock },
    { id: "footer", label: "Подвал и контакты", icon: MapPin },
    { id: "serverless", label: "Netlify & GitHub", icon: Server },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl border-0 sm:border border-[#E2D4C6] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Clean Light Top Bar */}
        <div className="bg-[#F6EFE7] text-[#2D1E16] px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E5DACD] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EDE2D5] flex items-center justify-center text-[#C97D5D]">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-[#2D1E16]">Кофештаб</span>
              <span className="text-[11px] sm:text-xs text-[#995938] font-medium">Панель управления</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/80 rounded-xl border border-[#E5DACD] text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[#553E31] font-medium truncate max-w-[180px]">
                  {currentUser.email}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                  Admin
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-xs font-medium text-[#664D3E] transition-colors flex items-center gap-1 cursor-pointer"
                title="Выйти из учетной записи"
              >
                <Unlock className="w-3.5 h-3.5 text-[#C97D5D]" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] flex items-center justify-center transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Login Screen with Netlify Identity */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto w-full space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#EDE2D5] border border-[#DFCFC0] flex items-center justify-center text-[#C97D5D] shadow-xs">
              <ShieldCheck className="w-7 h-7 text-[#C97D5D]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-xl text-[#2D1E16]">Вход в панель управления</h3>
              <p className="text-xs text-[#7A6456] max-w-sm">
                Авторизация осуществляется через Netlify Identity с защищенными JWT-токенами и серверным доступом к репозиторию.
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <button
                type="button"
                onClick={handleLoginClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Войти через Netlify Identity</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-[#7A6456] pt-2">
                <span>Нет учетной записи?</span>
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="text-[#C97D5D] hover:underline font-semibold cursor-pointer"
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-white/70 rounded-xl border border-[#E5DACD] text-left text-[11px] text-[#7A6456] space-y-1.5 w-full">
              <div className="font-semibold text-[#2D1E16] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#C97D5D]" />
                <span>Безопасная Serverless-архитектура</span>
              </div>
              <p className="leading-relaxed">
                Пароли и ключи GitHub больше не хранятся в коде браузера. Все коммиты выполняет серверная функция Netlify Function через токен из переменных окружения.
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* Responsive Tabs */}
            <div className="w-full md:w-56 bg-[#F3ECE2] border-b md:border-b-0 md:border-r border-[#E5DACD] p-2 md:p-3 flex md:flex-col gap-1 md:gap-1.5 overflow-x-auto shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                        : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Fields Content */}
            <div className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto bg-[#FAF7F2] space-y-4 sm:space-y-5">
              
              {/* TAB: HEADER */}
              {activeTab === "header" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Шапка и соцсети</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-3 rounded-2xl border border-[#E5DACD]">
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
                    <div className="bg-white p-3 rounded-2xl border border-[#E5DACD]">
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

                  {/* Nav items */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD] space-y-2.5">
                    <label className="block text-xs font-bold text-[#2D1E16]">Пункты навигации</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {formData.header.navItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DACD] space-y-1.5">
                          <input
                            type="text"
                            placeholder="Название"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...formData.header.navItems];
                              newItems[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                header: { ...formData.header, navItems: newItems }
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Якорь (#about)"
                            value={item.href}
                            onChange={(e) => {
                              const newItems = [...formData.header.navItems];
                              newItems[idx].href = e.target.value;
                              setFormData({
                                ...formData,
                                header: { ...formData.header, navItems: newItems }
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD] space-y-2.5">
                    <label className="block text-xs font-bold text-[#2D1E16]">Ссылки соцсетей</label>
                    <div className="space-y-2">
                      {formData.header.socials.map((soc, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DACD] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              placeholder="Название"
                              value={soc.title}
                              onChange={(e) => {
                                const newSocials = [...formData.header.socials];
                                newSocials[idx].title = e.target.value;
                                setFormData({
                                  ...formData,
                                  header: { ...formData.header, socials: newSocials }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-8">
                            <input
                              type="text"
                              placeholder="URL ссылка"
                              value={soc.url}
                              onChange={(e) => {
                                const newSocials = [...formData.header.socials];
                                newSocials[idx].url = e.target.value;
                                setFormData({
                                  ...formData,
                                  header: { ...formData.header, socials: newSocials }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
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
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Главный экран (Hero)</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      label="Фоновое фото"
                      value={formData.hero.bgImage}
                      onChange={(newUrl) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: newUrl }
                      })}
                      placeholder="https://... или /images/hero.jpg"
                    />
                  </div>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">О штабе</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Тег секции</label>
                        <input
                          type="text"
                          value={formData.about.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, sectionTag: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок</label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Плашка: Пояснение</label>
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
                      placeholder="https://... или /images/house.jpg"
                    />
                  </div>

                  {/* Paragraphs */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#2D1E16]">Параграфы истории</label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              paragraphs: [...formData.about.paragraphs, ""]
                            }
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
                              const newParagraphs = [...formData.about.paragraphs];
                              newParagraphs[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                about: { ...formData.about, paragraphs: newParagraphs }
                              });
                            }}
                            className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] resize-y leading-relaxed"
                          />
                          {formData.about.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newParagraphs = formData.about.paragraphs.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  about: { ...formData.about, paragraphs: newParagraphs }
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Удалить абзац"
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

              {/* TAB: MENU */}
              {activeTab === "menu" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Меню и напитки</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Тег секции</label>
                        <input
                          type="text"
                          value={formData.menu.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, sectionTag: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок меню</label>
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок меню</label>
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
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Бейдж фарфора</label>
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
                  </div>

                  {/* 4 Highlight Cards */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-2.5">
                    <label className="block text-xs font-bold text-[#2D1E16]">4 главные карточки угощений</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={card.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2">
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Название</label>
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
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Описание</label>
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
                              className="w-full p-2 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            />
                          </div>
                          <ImageUploadField
                            label="Фото угощения"
                            value={card.image}
                            onChange={(newUrl) => {
                              const newCards = [...formData.menu.highlightCards];
                              newCards[idx].image = newUrl;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: newCards }
                              });
                            }}
                            placeholder="https://... или /images/dessert.jpg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional drinks */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Тег доп. напитков</label>
                        <input
                          type="text"
                          value={formData.menu.additionalDrinksTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, additionalDrinksTag: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок доп. напитков</label>
                        <input
                          type="text"
                          value={formData.menu.additionalDrinksTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, additionalDrinksTitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#2D1E16]">Позиции напитков</label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              menu: {
                                ...formData.menu,
                                additionalDrinks: [...formData.menu.additionalDrinks, { title: "", desc: "" }]
                              }
                            });
                          }}
                          className="inline-flex items-center gap-1 text-xs text-[#C97D5D] hover:text-[#B86846] font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        {formData.menu.additionalDrinks.map((drink, idx) => (
                          <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                placeholder="Название"
                                value={drink.title}
                                onChange={(e) => {
                                  const newDrinks = [...formData.menu.additionalDrinks];
                                  newDrinks[idx].title = e.target.value;
                                  setFormData({
                                    ...formData,
                                    menu: { ...formData.menu, additionalDrinks: newDrinks }
                                  });
                                }}
                                className="w-full px-2 py-1 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                              />
                              {formData.menu.additionalDrinks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDrinks = formData.menu.additionalDrinks.filter((_, i) => i !== idx);
                                    setFormData({
                                      ...formData,
                                      menu: { ...formData.menu, additionalDrinks: newDrinks }
                                    });
                                  }}
                                  className="ml-1 p-1 text-red-500 hover:bg-red-50 rounded-md cursor-pointer shrink-0"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Описание"
                              value={drink.desc}
                              onChange={(e) => {
                                const newDrinks = [...formData.menu.additionalDrinks];
                                newDrinks[idx].desc = e.target.value;
                                setFormData({
                                  ...formData,
                                  menu: { ...formData.menu, additionalDrinks: newDrinks }
                                });
                              }}
                              className="w-full p-2 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FULL MENU (2nd Page) */}
              {activeTab === "fullMenu" && formData.fullMenu && (
                <FullMenuAdminTab
                  fullMenu={formData.fullMenu}
                  onChange={(newFullMenu) => setFormData({
                    ...formData,
                    fullMenu: newFullMenu
                  })}
                />
              )}

              {/* TAB: EVENTS & CRAFT */}
              {activeTab === "eventsAndCraft" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Жизнь штаба</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Тег секции</label>
                        <input
                          type="text"
                          value={formData.eventsAndCraft.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventsAndCraft: { ...formData.eventsAndCraft, sectionTag: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок секции</label>
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
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок секции</label>
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

                  {/* 2 Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {formData.eventsAndCraft.cards.map((card, idx) => (
                      <div key={card.id} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-2.5">
                        <span className="text-xs font-bold text-[#C97D5D] uppercase tracking-wider block">
                          Карточка {idx + 1}: {card.title}
                        </span>

                        <div>
                          <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const newCards = [...formData.eventsAndCraft.cards];
                              newCards[idx].title = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст</label>
                          <textarea
                            rows={3}
                            value={card.description}
                            onChange={(e) => {
                              const newCards = [...formData.eventsAndCraft.cards];
                              newCards[idx].description = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                              });
                            }}
                            className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Примечание</label>
                          <input
                            type="text"
                            value={card.note || ""}
                            onChange={(e) => {
                              const newCards = [...formData.eventsAndCraft.cards];
                              newCards[idx].note = e.target.value;
                              setFormData({
                                ...formData,
                                eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        <ImageUploadField
                          label="Фото карточки"
                          value={card.image}
                          onChange={(newUrl) => {
                            const newCards = [...formData.eventsAndCraft.cards];
                            newCards[idx].image = newUrl;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                            });
                          }}
                          placeholder="https://... или /images/event.jpg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HOURS & TOURISTS */}
              {activeTab === "hoursAndTourists" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">График и гости</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Тег секции</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: { ...formData.hoursAndTourists, sectionTag: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Заголовок секции</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: { ...formData.hoursAndTourists, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок секции</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: { ...formData.hoursAndTourists, subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Hours Card */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">График работы</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок карточки</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, title: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись для будней</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekdaysLabel || "Будни (Пн–Пт)"}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, weekdaysLabel: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Часы работы в будни</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekdaysSchedule}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, weekdaysSchedule: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись для выходных</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekendsLabel || "Выходные и праздники"}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, weekendsLabel: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Часы работы в выходные</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.weekendsSchedule}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, weekendsSchedule: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Примечание к графику</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.hoursCard.note}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              hoursCard: { ...formData.hoursAndTourists.hoursCard, note: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tourists Card */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Карточка «Гостям города»</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: { ...formData.hoursAndTourists.touristsCard, title: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст кнопки перехода</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.touristsCard.buttonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: {
                              ...formData.hoursAndTourists,
                              touristsCard: { ...formData.hoursAndTourists.touristsCard, buttonText: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст описания</label>
                      <textarea
                        rows={3}
                        value={formData.hoursAndTourists.touristsCard.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            touristsCard: { ...formData.hoursAndTourists.touristsCard, description: e.target.value }
                          }
                        })}
                        className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка (URL гида)</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.touristsCard.buttonUrl}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            touristsCard: { ...formData.hoursAndTourists.touristsCard, buttonUrl: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Crossing banner */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Баннер переправы</label>
                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.crossingBanner.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            crossingBanner: { ...formData.hoursAndTourists.crossingBanner, title: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Описание переправы</label>
                      <textarea
                        rows={2}
                        value={formData.hoursAndTourists.crossingBanner.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: {
                            ...formData.hoursAndTourists,
                            crossingBanner: { ...formData.hoursAndTourists.crossingBanner, description: e.target.value }
                          }
                        })}
                        className="w-full p-2.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FOOTER */}
              {activeTab === "footer" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-[#2D1E16]">Подвал и контакты</h4>
                  </div>

                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Название бренда</label>
                        <input
                          type="text"
                          value={formData.footer.brandName}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, brandName: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">Подзаголовок</label>
                        <input
                          type="text"
                          value={formData.footer.brandSubtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, brandSubtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1">Краткое описание</label>
                      <textarea
                        rows={2}
                        value={formData.footer.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, description: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Address info */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Адрес и карты</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок адреса</label>
                        <input
                          type="text"
                          value={formData.footer.addressTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, addressTitle: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст кнопки карт</label>
                        <input
                          type="text"
                          value={formData.footer.mapsButtonText || "Открыть на Яндекс.Картах"}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, mapsButtonText: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Полный адрес</label>
                      <input
                        type="text"
                        value={formData.footer.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, address: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ориентир</label>
                      <input
                        type="text"
                        value={formData.footer.landmark}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, landmark: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка на Яндекс.Карты (URL)</label>
                      <input
                        type="text"
                        value={formData.footer.mapsUrl || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          footer: { ...formData.footer, mapsUrl: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Navigation and Socials titles */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Ссылки и соцсети</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок меню</label>
                        <input
                          type="text"
                          value={formData.footer.navTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, navTitle: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок соцсетей</label>
                        <input
                          type="text"
                          value={formData.footer.socialsTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, socialsTitle: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись Telegram</label>
                        <input
                          type="text"
                          value={formData.footer.telegramLabel || "Telegram-канал"}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, telegramLabel: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка Telegram (URL)</label>
                        <input
                          type="text"
                          value={formData.footer.telegramUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, telegramUrl: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись ВКонтакте</label>
                        <input
                          type="text"
                          value={formData.footer.vkLabel || "ВКонтакте"}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, vkLabel: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка ВКонтакте (URL)</label>
                        <input
                          type="text"
                          value={formData.footer.vkUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, vkUrl: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись Гида</label>
                        <input
                          type="text"
                          value={formData.footer.guideLabel || "Гид по Романову"}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, guideLabel: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка на Гид (URL)</label>
                        <input
                          type="text"
                          value={formData.footer.guideUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, guideUrl: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Copyright and bottom text */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Копирайт</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст копирайта</label>
                        <input
                          type="text"
                          value={formData.footer.copyright}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, copyright: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Адрес в нижнем углу</label>
                        <input
                          type="text"
                          value={formData.footer.bottomAddress || "Волжская набережная, 19 · Романов"}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, bottomAddress: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: NETLIFY FUNCTIONS & SERVERLESS GITHUB SYNC */}
              {activeTab === "serverless" && (
                <div className="space-y-4">
                  <div className="border-b border-[#E5DACD] pb-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#C97D5D]" />
                      <h4 className="font-heading font-bold text-base text-[#2D1E16]">Netlify Functions & Серверная архитектура</h4>
                    </div>
                  </div>

                  {/* Architecture Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#C97D5D]">
                        <Server className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-[#2D1E16]">Serverless Endpoint</span>
                      </div>
                      <p className="text-xs font-mono font-semibold text-emerald-700">
                        /.netlify/functions/save-content
                      </p>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#C97D5D]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-[#2D1E16]">Авторизация</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Netlify Identity JWT
                      </p>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#C97D5D]">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-[#2D1E16]">GitHub Токен</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Серверный (Netlify Env)
                      </p>
                    </div>
                  </div>

                  {/* Server Details */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DACD] space-y-3.5">
                    <h5 className="font-heading font-bold text-sm text-[#2D1E16] flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-[#C97D5D]" />
                      <span>Параметры репозитория на сервере</span>
                    </h5>

                    <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E5DACD] text-xs space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-[#EAE0D5]">
                        <span className="text-[#7A6456]">Репозиторий GitHub:</span>
                        <span className="font-mono font-bold text-[#2D1E16]">
                          {serverlessInfo?.repo || 'tryphonbrooks/kofeshtab'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#EAE0D5]">
                        <span className="text-[#7A6456]">Ветка (Branch):</span>
                        <span className="font-mono font-bold text-[#2D1E16]">
                          {serverlessInfo?.branch || 'main'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-[#EAE0D5]">
                        <span className="text-[#7A6456]">Файл контента:</span>
                        <span className="font-mono font-bold text-[#2D1E16]">public/content.json</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[#7A6456]">Текущий пользователь Netlify:</span>
                        <span className="font-semibold text-emerald-700">{currentUser?.email || 'Не авторизован'}</span>
                      </div>
                    </div>

                    {/* How to configure Netlify Environment Variables Guide */}
                    <div className="p-3.5 bg-[#F6EFE7] rounded-xl border border-[#E2D4C6] text-xs space-y-2">
                      <div className="font-bold text-[#553E31]">
                        Настройка переменных в панели управления Netlify:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-[#664D3E] leading-relaxed">
                        <li>Откройте панель <strong>Netlify → Site configuration → Environment variables</strong>.</li>
                        <li>Добавьте переменную <code>GITHUB_TOKEN</code> (персональный токен GitHub с правами <code>repo</code>).</li>
                        <li>(Опционально) Задайте <code>GITHUB_REPO</code> (например <code>tryphonbrooks/kofeshtab</code>).</li>
                        <li>В разделе <strong>Netlify → Identity</strong> включите Identity сервис для регистрации администраторов.</li>
                      </ol>
                    </div>

                    {/* Status Message */}
                    {publishStatus && (
                      <div 
                        className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                          publishStatus.type === 'success' 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                      >
                        {publishStatus.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{publishStatus.message}</div>
                          {publishStatus.commitUrl && (
                            <a 
                              href={publishStatus.commitUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 underline font-semibold flex items-center gap-1 hover:text-emerald-900 mt-1"
                            >
                              <span>Посмотреть коммит на GitHub</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons inside Tab */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handlePublishToGitHub}
                        disabled={isPublishing}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                        <span>Опубликовать через Netlify Function</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          fetchServerlessInfo().then((info) => {
                            if (info) {
                              setServerlessInfo(info);
                              alert('Статус функции Netlify успешно обновлен.');
                            }
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Проверить статус
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Status Notification banner above footer if there is any publish status */}
        {isAuthenticated && publishStatus?.message && (
          <div className={`px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between border-t transition-all shrink-0 ${
            publishStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {publishStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{publishStatus.message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setPublishStatus(null)} 
              className="p-1 text-[#8C7465] hover:text-[#2D1E16] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clean Bottom Action Bar */}
        {isAuthenticated && (
          <div className="bg-[#F6EFE7] px-4 sm:px-6 py-3 border-t border-[#E5DACD] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Serverless Status indicator */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-100/90 text-emerald-900 border border-emerald-300/70">
                <Server className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                <span className="truncate max-w-[220px] sm:max-w-[320px]">
                  Netlify Function → GitHub ({serverlessInfo?.branch || 'main'})
                </span>
              </div>

              {/* Local Export / Import fallback buttons */}
              <button
                type="button"
                onClick={onExport}
                className="p-2 rounded-xl bg-white hover:bg-[#F2E8DC] border border-[#D8C9B9] text-[#553E31] text-xs font-medium transition-colors cursor-pointer"
                title="Экспорт JSON файла"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <label
                className="p-2 rounded-xl bg-white hover:bg-[#F2E8DC] border border-[#D8C9B9] text-[#553E31] text-xs font-medium transition-colors cursor-pointer"
                title="Импорт JSON файла"
              >
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#D8C9B9] text-[#8C4E3D] hover:text-red-700 text-xs font-medium transition-colors cursor-pointer"
                title="Сбросить все изменения"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2E8DC] border border-[#D8C9B9] text-[#553E31] text-xs font-semibold transition-colors cursor-pointer"
              >
                Закрыть
              </button>

              <button
                type="button"
                onClick={handlePublishToGitHub}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isPublishing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <GitCommit className="w-4 h-4 text-white" />
                )}
                <span>{isPublishing ? "Публикация на GitHub..." : "Сохранить и опубликовать"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Reset */}
        {confirmResetOpen && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 border border-[#E5DACD] max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-heading font-bold text-base text-[#2D1E16]">Сбросить все тексты?</h5>
                <p className="text-xs text-[#7A6456] mt-1">Все поля вернутся к начальным значениям по умолчанию.</p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Да, сбросить
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
