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
  Shield,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { SiteContent } from '../../types';
import { 
  getStoredGitHubConfig, 
  saveGitHubConfig, 
  commitContentToGitHub, 
  testGitHubConnection, 
  GitHubConfig 
} from '../../utils/githubSync';
import { 
  verifyAdminPassword, 
  changeAdminPassword, 
  resetAdminPasswordToDefault, 
  hasCustomPassword,
  checkLockout,
  recordFailedAttempt,
  resetLockout,
  setSessionWithExpiry,
  isSessionValid,
  clearAdminSession
} from '../../utils/security';
import { ImageUploadField } from './ImageUploadField';

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
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // Security & Password change state
  const [lockout, setLockout] = useState(checkLockout());
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [pwdChangeStatus, setPwdChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCustomPwdActive, setIsCustomPwdActive] = useState<boolean>(hasCustomPassword());
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);

  // GitHub Sync State
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(getStoredGitHubConfig());
  const [showGhToken, setShowGhToken] = useState<boolean>(false);
  const [ghLoading, setGhLoading] = useState<boolean>(false);
  const [ghStatus, setGhStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; url?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(content);
      setGhConfig(getStoredGitHubConfig());
      setIsCustomPwdActive(hasCustomPassword());
      setLockout(checkLockout());

      if (isSessionValid()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [isOpen, content]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockout.isLocked) return;
    const interval = setInterval(() => {
      const current = checkLockout();
      setLockout(current);
      if (!current.isLocked) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockout.isLocked]);

  const handleUpdateGhConfig = (newCfg: Partial<GitHubConfig>) => {
    const updated = { ...ghConfig, ...newCfg };
    setGhConfig(updated);
    saveGitHubConfig(updated);
  };

  const handleTestGitHub = async () => {
    setGhLoading(true);
    setGhStatus(null);
    try {
      const res = await testGitHubConnection(ghConfig);
      setGhStatus({ type: 'success', message: res.message });
    } catch (err: unknown) {
      setGhStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setGhLoading(false);
    }
  };

  const handlePublishToGitHub = async () => {
    // Also save locally first
    onSave(formData);
    setGhLoading(true);
    setGhStatus(null);

    try {
      const res = await commitContentToGitHub(formData, ghConfig);
      setGhStatus({
        type: 'success',
        message: res.message,
        url: res.commitUrl,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setGhStatus({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setGhLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentLock = checkLockout();
    if (currentLock.isLocked) {
      setPasswordError(`Вход временно заблокирован. Подождите ${currentLock.remainingSeconds} сек.`);
      return;
    }

    try {
      const isValid = await verifyAdminPassword(passwordInput);
      if (isValid) {
        setIsAuthenticated(true);
        setSessionWithExpiry(120); // 2 hours session
        resetLockout();
        setPasswordError("");
        setPasswordInput("");
      } else {
        const afterFail = recordFailedAttempt();
        setLockout(afterFail);
        if (afterFail.isLocked) {
          setPasswordError(`Слишком много неверных попыток. Вход заблокирован на 2 минуты.`);
        } else {
          setPasswordError(`Неверный пароль. Осталось попыток: ${afterFail.attemptsLeft}`);
        }
      }
    } catch (err) {
      setPasswordError("Ошибка при проверке пароля: " + (err as Error).message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAdminSession();
    setPasswordInput("");
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeStatus(null);

    if (newPassword.length < 6) {
      setPwdChangeStatus({ type: 'error', message: 'Новый пароль должен содержать не менее 6 символов.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdChangeStatus({ type: 'error', message: 'Новые пароли не совпадают.' });
      return;
    }

    const isOldValid = await verifyAdminPassword(oldPassword);
    if (!isOldValid) {
      setPwdChangeStatus({ type: 'error', message: 'Текущий пароль введен неверно.' });
      return;
    }

    try {
      await changeAdminPassword(newPassword);
      setIsCustomPwdActive(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPwdChangeStatus({ type: 'success', message: 'Пароль администратора успешно изменен и защищен SHA-256 хешированием!' });
    } catch (err) {
      setPwdChangeStatus({ type: 'error', message: (err as Error).message });
    }
  };

  const handleResetPasswordDefault = () => {
    if (confirm("Вернуть пароль по умолчанию (kofeshtab2025)?")) {
      resetAdminPasswordToDefault();
      setIsCustomPwdActive(false);
      setPwdChangeStatus({ type: 'success', message: 'Пароль сброшен к стандартному (kofeshtab2025).' });
    }
  };

  const handleSaveChanges = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
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
    { id: "menu", label: "Меню и напитки", icon: Coffee },
    { id: "eventsAndCraft", label: "Жизнь штаба", icon: Calendar },
    { id: "hoursAndTourists", label: "График и гости", icon: Clock },
    { id: "footer", label: "Подвал и контакты", icon: MapPin },
    { id: "security", label: "Безопасность и пароль", icon: Shield },
    { id: "github", label: "Синхронизация с GitHub", icon: GitBranch },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF7F2] text-[#2C1F16] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E2D4C6] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Clean Light Top Bar */}
        <div className="bg-[#F6EFE7] text-[#2D1E16] px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#E5DACD] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE2D5] flex items-center justify-center text-[#C97D5D]">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-[#2D1E16]">Кофештаб</span>
              <span className="text-xs text-[#995938] font-medium ml-2">/ Панель управления</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-xs font-medium text-[#664D3E] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Выйти из админки"
              >
                <Unlock className="w-3.5 h-3.5 text-[#C97D5D]" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}
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

        {/* Login Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE2D5] border border-[#DFCFC0] flex items-center justify-center text-[#C97D5D] mb-4 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-bold text-xl text-[#2D1E16] mb-1.5">Вход в панель управления</h3>
            <p className="text-xs text-[#7A6456] mb-6">Введите пароль для редактирования всех текстов сайта</p>

            <form onSubmit={handleLogin} className="w-full space-y-3.5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль администратора"
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
                <div className="text-xs text-red-600 font-medium text-left px-1">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white font-semibold text-xs tracking-wide transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                Войти
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Light Sidebar Tabs */}
            <div className="w-full md:w-56 bg-[#F3ECE2] border-b md:border-b-0 md:border-r border-[#E5DACD] p-2.5 flex md:flex-col gap-1 overflow-x-auto shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white text-[#B65A2C] shadow-xs border border-[#DFCFC0]"
                        : "text-[#634E41] hover:bg-[#EBE0D3] hover:text-[#2D1E16]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C97D5D]' : 'text-[#8E7566]'}`} />
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
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Шапка, меню и соцсети</h4>
                    <p className="text-xs text-[#7A6456]">Название кофейни, ссылки в шапке и всплывающее окно соцсетей</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD]">
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Название бренда в шапке</label>
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
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD]">
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Подзаголовок бренда</label>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD]">
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Текст кнопки соцсетей в шапке</label>
                      <input
                        type="text"
                        value={formData.header.socialsButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, socialsButtonText: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5DACD]">
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок окна со списком соцсетей</label>
                      <input
                        type="text"
                        value={formData.header.socialsModalTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          header: { ...formData.header, socialsModalTitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Nav items */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Пункты навигационного меню в шапке</label>
                    <div className="space-y-2">
                      {formData.header.navItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs text-[#8E796D] w-20 shrink-0 font-mono">#{item.id}</span>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newNav = [...formData.header.navItems];
                              newNav[idx].label = e.target.value;
                              setFormData({
                                ...formData,
                                header: { ...formData.header, navItems: newNav }
                              });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Ссылки в окне соцсетей</label>
                    <div className="space-y-2.5">
                      {formData.header.socials.map((soc, idx) => (
                        <div key={idx} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DACD] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5 font-medium">Название</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                            />
                          </div>
                          <div className="sm:col-span-8">
                            <label className="block text-[11px] text-[#8C7465] mb-0.5 font-medium">Ссылка (URL)</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
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
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Главный экран (Hero)</h4>
                    <p className="text-xs text-[#7A6456]">Заголовок, текст приветствия, кнопки и фоновое изображение</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Плашка адреса и локации</label>
                      <input
                        type="text"
                        value={formData.hero.locationBadge}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, locationBadge: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Главный заголовок на первом экране</label>
                      <input
                        type="text"
                        value={formData.hero.title}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-sm font-bold font-heading outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Текст описания</label>
                      <textarea
                        rows={3}
                        value={formData.hero.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          hero: { ...formData.hero, description: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] resize-y leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Текст первой кнопки</label>
                        <input
                          type="text"
                          value={formData.hero.primaryButtonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hero: { ...formData.hero, primaryButtonText: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Текст второй кнопки</label>
                        <input
                          type="text"
                          value={formData.hero.secondaryButtonText}
                          onChange={(e) => setFormData({
                            ...formData,
                            hero: { ...formData.hero, secondaryButtonText: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label="Фоновая фотография главного экрана"
                      value={formData.hero.bgImage}
                      onChange={(newUrl) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, bgImage: newUrl }
                      })}
                      ghConfig={ghConfig}
                      placeholder="https://... или /images/hero.jpg"
                      helperText="Изображение оптимизируется и отправляется в GitHub или сохраняется локально"
                    />
                  </div>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">О штабе</h4>
                    <p className="text-xs text-[#7A6456]">История купеческого дома, параграфы о дежурных и карточки особенностей</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Тег секции</label>
                        <input
                          type="text"
                          value={formData.about.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, sectionTag: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок секции</label>
                        <input
                          type="text"
                          value={formData.about.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            about: { ...formData.about, title: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Плашка на фото: Город</label>
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
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Плашка на фото: Адрес</label>
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
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Плашка на фото: Пояснение</label>
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
                      label="Фотография купеческого дома"
                      value={formData.about.image}
                      onChange={(newUrl) => setFormData({
                        ...formData,
                        about: { ...formData.about, image: newUrl }
                      })}
                      ghConfig={ghConfig}
                      placeholder="https://... или /images/house.jpg"
                      helperText="Фотография отображается в секции «О штабе» рядом с историей"
                    />
                  </div>

                  {/* Paragraphs */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#2D1E16]">Параграфы описания истории</label>
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

                    <div className="space-y-3">
                      {formData.about.paragraphs.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <textarea
                            rows={3}
                            value={p}
                            onChange={(e) => {
                              const newParas = [...formData.about.paragraphs];
                              newParas[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                about: { ...formData.about, paragraphs: newParas }
                              });
                            }}
                            className="flex-1 p-3 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] leading-relaxed"
                          />
                          {formData.about.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newParas = formData.about.paragraphs.filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  about: { ...formData.about, paragraphs: newParas }
                                });
                              }}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Удалить абзац"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">4 карточки особенностей (иконки и тексты)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.about.features.map((feat, idx) => (
                        <div key={feat.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2">
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок</label>
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
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Описание</label>
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
                              className="w-full p-2 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
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
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Меню и напитки</h4>
                    <p className="text-xs text-[#7A6456]">Заголовки, 4 главные карточки угощений и блок дополнительных напитков</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Тег секции</label>
                        <input
                          type="text"
                          value={formData.menu.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, sectionTag: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок меню</label>
                        <input
                          type="text"
                          value={formData.menu.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, title: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Подзаголовок меню</label>
                        <input
                          type="text"
                          value={formData.menu.subtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, subtitle: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Бейдж фарфора (в блоке доп. напитков)</label>
                        <input
                          type="text"
                          value={formData.menu.porcelainBadge}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, porcelainBadge: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Highlight Cards */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">4 главные карточки угощений</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.menu.highlightCards.map((card, idx) => (
                        <div key={card.id} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2">
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
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
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
                            label="Фотография угощения"
                            value={card.image}
                            onChange={(newUrl) => {
                              const newCards = [...formData.menu.highlightCards];
                              newCards[idx].image = newUrl;
                              setFormData({
                                ...formData,
                                menu: { ...formData.menu, highlightCards: newCards }
                              });
                            }}
                            ghConfig={ghConfig}
                            placeholder="https://... или /images/dessert.jpg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional drinks */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Тег блока доп. напитков</label>
                        <input
                          type="text"
                          value={formData.menu.additionalDrinksTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, additionalDrinksTag: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок блока доп. напитков</label>
                        <input
                          type="text"
                          value={formData.menu.additionalDrinksTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            menu: { ...formData.menu, additionalDrinksTitle: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#2D1E16]">Позиции дополнительных напитков</label>
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
                          <span>Добавить напиток</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {formData.menu.additionalDrinks.map((drink, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] space-y-2 relative">
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
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
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
                                  className="ml-1 p-1 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
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

              {/* TAB: EVENTS & CRAFT */}
              {activeTab === "eventsAndCraft" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Жизнь штаба</h4>
                    <p className="text-xs text-[#7A6456]">Квартирники, Квартальники, кинопоказы и мастерская 3D-печати наличников</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Тег секции</label>
                        <input
                          type="text"
                          value={formData.eventsAndCraft.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventsAndCraft: { ...formData.eventsAndCraft, sectionTag: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок секции</label>
                        <input
                          type="text"
                          value={formData.eventsAndCraft.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            eventsAndCraft: { ...formData.eventsAndCraft, title: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Подзаголовок секции</label>
                      <input
                        type="text"
                        value={formData.eventsAndCraft.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          eventsAndCraft: { ...formData.eventsAndCraft, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* 2 Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.eventsAndCraft.cards.map((card, idx) => (
                      <div key={card.id} className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
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
                            className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Основной текст</label>
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
                          <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Примечание внизу карточки</label>
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
                            className="w-full px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                          />
                        </div>

                        <ImageUploadField
                          label="Фотография события или мастерской"
                          value={card.image}
                          onChange={(newUrl) => {
                            const newCards = [...formData.eventsAndCraft.cards];
                            newCards[idx].image = newUrl;
                            setFormData({
                              ...formData,
                              eventsAndCraft: { ...formData.eventsAndCraft, cards: newCards }
                            });
                          }}
                          ghConfig={ghConfig}
                          placeholder="https://... или /images/event.jpg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HOURS & TOURISTS */}
              {activeTab === "hoursAndTourists" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">График и гости города</h4>
                    <p className="text-xs text-[#7A6456]">Расписание работы штаба, гид для туристов и информация о переправе через Волгу</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Тег секции</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.sectionTag}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: { ...formData.hoursAndTourists, sectionTag: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Заголовок секции</label>
                        <input
                          type="text"
                          value={formData.hoursAndTourists.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            hoursAndTourists: { ...formData.hoursAndTourists, title: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Подзаголовок секции</label>
                      <input
                        type="text"
                        value={formData.hoursAndTourists.subtitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          hoursAndTourists: { ...formData.hoursAndTourists, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                      />
                    </div>
                  </div>

                  {/* Hours Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Карточка графика работы</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Карточка «Гостям города»</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Текст описания для туристов</label>
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
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Баннер переправы через Волгу</label>
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
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Подвал и контакты</h4>
                    <p className="text-xs text-[#7A6456]">Адрес, ориентир, ссылки на Яндекс.Карты, соцсети и копирайт</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Название бренда в подвале</label>
                        <input
                          type="text"
                          value={formData.footer.brandName}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, brandName: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Подзаголовок</label>
                        <input
                          type="text"
                          value={formData.footer.brandSubtitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            footer: { ...formData.footer, brandSubtitle: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#664F40] mb-1.5">Краткое описание проекта</label>
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
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Блок адреса и карт</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок блока адреса</label>
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
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Заголовки колонок и прямые ссылки</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок колонки меню</label>
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
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Заголовок колонки соцсетей</label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка на Telegram (URL)</label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Ссылка на ВКонтакте (URL)</label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8C7465] mb-1 font-medium">Подпись Туристического гида</label>
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
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DACD] space-y-3">
                    <label className="block text-xs font-bold text-[#2D1E16]">Копирайт и нижняя строка</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* TAB: SECURITY & PASSWORD */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <h4 className="font-heading font-bold text-lg text-[#2D1E16] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#C97D5D]" />
                      <span>Безопасность и смена пароля</span>
                    </h4>
                    <p className="text-xs text-[#7A6456]">
                      Управление доступом к панели администратора, защита от перебора и хеширование паролей
                    </p>
                  </div>

                  {/* Security Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-2 text-[#C97D5D]">
                        <KeyRound className="w-4 h-4" />
                        <span className="text-xs font-bold text-[#2D1E16]">Статус пароля</span>
                      </div>
                      <p className="text-xs font-semibold text-[#8C7465]">
                        {isCustomPwdActive ? (
                          <span className="text-emerald-700 font-bold">✓ Установлен личный пароль</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Стандартный пароль</span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#8E796D]">Хранится в зашифрованном виде SHA-256 с солью</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-2 text-[#C97D5D]">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold text-[#2D1E16]">Anti-Brute Force</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Активна (5 попыток)
                      </p>
                      <p className="text-[11px] text-[#8E796D]">Блокировка на 2 минуты при частых ошибках ввода</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-[#E5DACD] space-y-1">
                      <div className="flex items-center gap-2 text-[#C97D5D]">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold text-[#2D1E16]">Сессия</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Автовыход через 2 часа
                      </p>
                      <p className="text-[11px] text-[#8E796D]">Сессия защищена от утечек</p>
                    </div>
                  </div>

                  {/* Password Change Form */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5DACD] space-y-4">
                    <h5 className="font-heading font-bold text-sm text-[#2D1E16] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#C97D5D]" />
                      <span>Изменить пароль администратора</span>
                    </h5>

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Текущий пароль
                        </label>
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Введите старый пароль"
                          required
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Новый пароль (минимум 6 символов)
                        </label>
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Введите новый надежный пароль"
                          required
                          minLength={6}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Подтверждение нового пароля
                        </label>
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Повторите новый пароль"
                          required
                          minLength={6}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="text-xs text-[#8E796D] hover:text-[#2D1E16] flex items-center gap-1.5 cursor-pointer py-1"
                        >
                          {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showNewPwd ? "Скрыть вводимые пароли" : "Показать вводимые пароли"}</span>
                        </button>
                      </div>

                      {pwdChangeStatus && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                            pwdChangeStatus.type === 'success'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border border-red-200 text-red-700'
                          }`}
                        >
                          {pwdChangeStatus.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <span>{pwdChangeStatus.message}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Сохранить новый пароль</span>
                        </button>

                        {isCustomPwdActive && (
                          <button
                            type="button"
                            onClick={handleResetPasswordDefault}
                            className="px-4 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Сбросить к стандартному
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Public URL and access information */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DACD] space-y-2">
                    <h6 className="font-heading font-bold text-xs text-[#2D1E16]">
                      Как открывать админку после скрытия ссылки в подвале:
                    </h6>
                    <ul className="text-xs text-[#664D3E] space-y-1 list-disc list-inside">
                      <li>Через адресную строку: добавьте <strong>/admin</strong> или <strong>#admin</strong> в конце адреса сайта.</li>
                      <li>Быстрое сочетание клавиш на клавиатуре: <strong>Ctrl + Shift + A</strong> (или <strong>Cmd + Shift + A</strong> на Mac).</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB: GITHUB SYNC */}
              {activeTab === "github" && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5DACD] pb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-[#C97D5D]" />
                      <h4 className="font-heading font-bold text-lg text-[#2D1E16]">Синхронизация с GitHub</h4>
                    </div>
                    <p className="text-xs text-[#7A6456] mt-1">
                      Прямая запись изменений в репозиторий GitHub через официальный GitHub Contents API. Изменения коммитятся в файл <code className="bg-[#EDE2D5] px-1.5 py-0.5 rounded text-[#2D1E16] font-mono text-[11px]">public/content.json</code>.
                    </p>
                  </div>

                  {/* Informational banner */}
                  <div className="p-4 rounded-2xl bg-[#F6EFE7] border border-[#E5DACD] text-xs text-[#5C4537] space-y-2">
                    <div className="font-bold text-[#2D1E16] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C97D5D]" />
                      <span>Как это работает:</span>
                    </div>
                    <p className="leading-relaxed">
                      При нажатии <strong>«Опубликовать на GitHub»</strong> админка формирует коммит и обновляет файл контента прямо в вашем репозитории. Если у вас подключен GitHub Pages или CI/CD деплой, сайт сразу обновится для всех посетителей.
                    </p>
                    <p className="text-[11px] text-[#8C7465]">
                      Токен доступа хранится исключительно локально в вашем браузере и никогда не передается третьим лицам.
                    </p>
                  </div>

                  {/* Repository Settings */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E5DACD] space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#2D1E16]">
                      Настройки репозитория
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Владелец / Организация (Owner)
                        </label>
                        <input
                          type="text"
                          value={ghConfig.owner}
                          onChange={(e) => handleUpdateGhConfig({ owner: e.target.value })}
                          placeholder="например: tryphonbrooks или логин на GitHub"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Имя репозитория (Repo)
                        </label>
                        <input
                          type="text"
                          value={ghConfig.repo}
                          onChange={(e) => handleUpdateGhConfig({ repo: e.target.value })}
                          placeholder="например: kofeshtab"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Ветка (Branch)
                        </label>
                        <input
                          type="text"
                          value={ghConfig.branch}
                          onChange={(e) => handleUpdateGhConfig({ branch: e.target.value })}
                          placeholder="main"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#664F40] mb-1">
                          Путь к файлу контента
                        </label>
                        <input
                          type="text"
                          value={ghConfig.filePath}
                          onChange={(e) => handleUpdateGhConfig({ filePath: e.target.value })}
                          placeholder="public/content.json"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16]"
                        />
                      </div>
                    </div>

                    {/* GitHub Personal Access Token */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#664F40]">
                          GitHub Personal Access Token (PAT)
                        </label>
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo&description=KofeshtabAdmin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#C97D5D] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Создать токен на GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showGhToken ? "text" : "password"}
                          value={ghConfig.token}
                          onChange={(e) => handleUpdateGhConfig({ token: e.target.value })}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGhToken(!showGhToken)}
                          className="absolute right-3 top-2.5 text-[#9E8A7D] hover:text-[#2D1E16] cursor-pointer"
                          title={showGhToken ? "Скрыть токен" : "Показать токен"}
                        >
                          {showGhToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8C7465] mt-1">
                        Для записи файлов токену требуется разрешение <strong>repo</strong> (Full control of private repositories) или права на чтение и запись для публичного репозитория.
                      </p>
                    </div>

                    {/* Status Message */}
                    {ghStatus && (
                      <div 
                        className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                          ghStatus.type === 'success' 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                      >
                        {ghStatus.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{ghStatus.message}</div>
                          {ghStatus.url && (
                            <a 
                              href={ghStatus.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-700 underline font-semibold flex items-center gap-1 hover:text-emerald-900 mt-1"
                            >
                              <span>Открыть коммит на GitHub</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons inside Tab */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleTestGitHub}
                        disabled={ghLoading || !ghConfig.token || !ghConfig.owner || !ghConfig.repo}
                        className="px-4 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] disabled:opacity-50 disabled:cursor-not-allowed text-[#664D3E] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {ghLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5 text-[#C97D5D]" />}
                        <span>Проверить подключение</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePublishToGitHub}
                        disabled={ghLoading || !ghConfig.token || !ghConfig.owner || !ghConfig.repo}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        {ghLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                        <span>Опубликовать на GitHub</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Clean Light Bottom Action Bar */}
        {isAuthenticated && (
          <div className="bg-[#F6EFE7] px-5 sm:px-6 py-3.5 border-t border-[#E5DACD] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#C97D5D] to-[#B86846] hover:from-[#B86846] hover:to-[#A75736] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить локально</span>
              </button>

              {/* Quick Publish to GitHub button */}
              <button
                type="button"
                onClick={handlePublishToGitHub}
                disabled={ghLoading}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#24292F] hover:bg-[#1B1F23] disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Отправить коммит с обновлениями в репозиторий GitHub"
              >
                {ghLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitCommit className="w-3.5 h-3.5 text-[#E09D77]" />
                )}
                <span>На GitHub</span>
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Сохранено!</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Reset button */}
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Сбросить все тексты к исходным"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8E7566]" />
                <span className="hidden sm:inline">Сброс</span>
              </button>

              {/* Export backup JSON */}
              <button
                type="button"
                onClick={onExport}
                className="px-3 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Скачать файл резервной копии контента"
              >
                <Download className="w-3.5 h-3.5 text-[#8E7566]" />
                <span className="hidden sm:inline">Скачать JSON</span>
              </button>

              {/* Import backup JSON */}
              <label 
                className="px-3 py-2 rounded-xl bg-[#EDE2D5] hover:bg-[#E4D7C9] text-[#664D3E] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Загрузить файл контента из резервной копии"
              >
                <Upload className="w-3.5 h-3.5 text-[#8E7566]" />
                <span className="hidden sm:inline">Загрузить JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2E8DC] border border-[#D8C9B9] text-[#553E31] text-xs font-semibold transition-colors cursor-pointer"
              >
                Закрыть
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
