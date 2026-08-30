import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCw, 
  X, 
  GitBranch, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Copy, 
  Check,
  Eye,
  EyeOff,
  Save,
  Sliders
} from 'lucide-react';
import { 
  loginOwner, 
  logoutAdmin, 
  getOwnerStatus, 
  resetClientPassword, 
  OwnerStatusData,
  getStoredGitHubSettings,
  saveStoredGitHubSettings
} from '../../utils/api';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerPanel: React.FC<OwnerPanelProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [statusData, setStatusData] = useState<OwnerStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  // GitHub Settings state
  const [githubSettings, setGithubSettings] = useState<{
    owner: string;
    repo: string;
    branch: string;
    token: string;
  }>(getStoredGitHubSettings());
  const [savedGithubSuccess, setSavedGithubSuccess] = useState<boolean>(false);

  // Reset admin password tool state
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetResult, setResetResult] = useState<{
    newPassword: string;
    newHash: string;
    message: string;
    envInstruction: string;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  // Lock background body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadStatus();
    }
  }, [isOpen, isAuthenticated]);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await getOwnerStatus();
      setStatusData(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Введите пароль разработчика');
      return;
    }

    setIsLoggingIn(true);
    setPasswordError('');

    try {
      await loginOwner(passwordInput);
      setIsAuthenticated(true);
      setPasswordInput('');
      loadStatus();
    } catch (err: any) {
      setPasswordError(err.message || 'Неверный пароль разработчика');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setStatusData(null);
    setResetResult(null);
  };

  const handleSaveGitHubSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredGitHubSettings(githubSettings);
    setSavedGithubSuccess(true);
    setTimeout(() => setSavedGithubSuccess(false), 3500);
  };

  const handleGeneratePassword = async (generateRandom: boolean) => {
    setIsResetting(true);
    setResetResult(null);
    try {
      const res = await resetClientPassword({
        newPassword: generateRandom ? undefined : newAdminPassword,
        generateRandom,
      });
      setResetResult(res);
      setNewAdminPassword('');
    } catch (err: any) {
      alert(err.message || 'Ошибка сброса пароля');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'hash' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-[#1C1714] text-[#E8DCCF] w-full max-w-3xl sm:rounded-3xl shadow-2xl border border-[#3A2D25] flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#261E1A] px-5 py-3.5 flex items-center justify-between border-b border-[#3A2D25] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3A2A20] flex items-center justify-center text-[#E59866]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#F4EDE4]">
                Панель управления владельца / разработчика
              </h3>
              <p className="text-[11px] text-[#A68F7E]">Технический статус и управление доступом</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#3A2D25] hover:bg-[#4A3B32] text-xs font-medium text-[#E8DCCF] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-[#E59866]" />
                <span>Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#3A2D25] hover:bg-[#4A3B32] text-[#E8DCCF] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Login */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto my-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#2A1F19] border border-[#3D2C22] flex items-center justify-center text-[#E59866] mb-3 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <h4 className="font-heading font-bold text-base sm:text-lg text-[#F4EDE4] mb-1">
              Вход разработчика
            </h4>
            <p className="text-xs text-[#A68F7E] mb-5">
              Доступ к конфигурации инфраструктуры и сбросу паролей
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль разработчика"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#261E1A] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4] pr-11"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8A7565] hover:text-[#E8DCCF] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-300 font-medium text-left">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-[#C97D5D] hover:bg-[#B86846] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Войти</span>
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard */
          <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-5">
            
            {/* System Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* GitHub Status Card */}
              <div className="p-4 rounded-2xl bg-[#261E1A] border border-[#3A2D25] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F4EDE4]">
                    <GitBranch className="w-4 h-4 text-[#E59866]" />
                    <span>Синхронизация GitHub</span>
                  </div>
                  {statusData?.github.tokenConfigured ? (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Подключено
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Токен не задан
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#A68F7E] font-mono">
                  <div>Репозиторий: <span className="text-[#F4EDE4] font-semibold">{statusData?.github.owner}/{statusData?.github.repo}</span></div>
                  <div>Ветка: <span className="text-[#F4EDE4]">{statusData?.github.branch}</span></div>
                  <div>Токен на сервере: <span className={statusData?.github.tokenConfigured ? "text-emerald-400" : "text-amber-400"}>
                    {statusData?.github.tokenConfigured ? '✓ Активен' : '✕ Отсутствует'}
                  </span></div>
                </div>
              </div>

              {/* Infrastructure Security Card */}
              <div className="p-4 rounded-2xl bg-[#261E1A] border border-[#3A2D25] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F4EDE4]">
                    <Server className="w-4 h-4 text-[#E59866]" />
                    <span>Окружение Vercel</span>
                  </div>
                  <span className="text-[10px] bg-[#3A2D25] text-[#D8C9B9] px-2 py-0.5 rounded-full font-medium font-mono">
                    {statusData?.environment}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#A68F7E]">
                  <div>Хеш админа в .env: <span className="text-[#F4EDE4] font-mono">{statusData?.security.adminPasswordCustomHash ? 'Да' : 'По умолчанию'}</span></div>
                  <div>Секрет сессий (HMAC): <span className="text-[#F4EDE4] font-mono">{statusData?.security.sessionSecretSet ? 'Кастомный' : 'Автогенерация'}</span></div>
                </div>
              </div>

            </div>

            {/* Direct GitHub Integration & Token Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#261E1A] border border-[#3A2D25] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F4EDE4]">
                  <Sliders className="w-4 h-4 text-[#E59866]" />
                  <span>Прямая синхронизация с GitHub (Client & Cloud)</span>
                </div>
                {savedGithubSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Сохранено!
                  </span>
                )}
              </div>

              <p className="text-xs text-[#A68F7E] leading-relaxed">
                Укажите токен GitHub (Personal Access Token с правом <code className="text-[#E59866]">repo</code> или <code className="text-[#E59866]">Contents: Read & Write</code>), чтобы публиковать изменения прямо из браузера в репозиторий, даже если бекенд недоступен.
              </p>

              <form onSubmit={handleSaveGitHubSettings} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8C9B9] mb-1">GitHub Owner / User</label>
                    <input
                      type="text"
                      value={githubSettings.owner}
                      onChange={(e) => setGithubSettings({ ...githubSettings, owner: e.target.value })}
                      placeholder="webtyr"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1714] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8C9B9] mb-1">Repository Name</label>
                    <input
                      type="text"
                      value={githubSettings.repo}
                      onChange={(e) => setGithubSettings({ ...githubSettings, repo: e.target.value })}
                      placeholder="kofeshtab"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1714] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#D8C9B9] mb-1">Branch</label>
                    <input
                      type="text"
                      value={githubSettings.branch}
                      onChange={(e) => setGithubSettings({ ...githubSettings, branch: e.target.value })}
                      placeholder="main"
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1714] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#D8C9B9] mb-1">
                    Personal Access Token (ghp_... или github_pat_...)
                  </label>
                  <input
                    type="password"
                    value={githubSettings.token}
                    onChange={(e) => setGithubSettings({ ...githubSettings, token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1714] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8A7565]">
                    Токен сохраняется безопасно в вашем браузере
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C97D5D] hover:bg-[#B86846] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить настройки GitHub</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Admin Password Reset Tool */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#261E1A] border border-[#3A2D25] space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F4EDE4]">
                <KeyRound className="w-4 h-4 text-[#E59866]" />
                <span>Сброс пароля администратора для клиента</span>
              </div>

              <p className="text-xs text-[#A68F7E] leading-relaxed">
                Здесь вы можете сгенерировать новый пароль для панели <code className="text-[#E59866]">/admin</code> или задать свой. Новый пароль сразу начнет действовать в текущей сессии сервера, а также будет рассчитан его PBKDF2 (SHA-512) хеш для добавления в переменные окружения Vercel (<code className="text-[#E59866]">ADMIN_PASSWORD_HASH</code>).
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Задать свой пароль (мин. 6 симв.)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1C1714] border border-[#453429] focus:border-[#E59866] text-xs outline-none text-[#F4EDE4]"
                />
                <button
                  type="button"
                  disabled={isResetting || !newAdminPassword.trim()}
                  onClick={() => handleGeneratePassword(false)}
                  className="px-4 py-2 rounded-xl bg-[#3A2D25] hover:bg-[#4A3B32] disabled:opacity-40 text-xs font-semibold text-[#E8DCCF] transition-colors cursor-pointer"
                >
                  Установить введенный
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => handleGeneratePassword(true)}
                  className="px-4 py-2 rounded-xl bg-[#C97D5D] hover:bg-[#B86846] disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Случайный пароль
                </button>
              </div>

              {/* Reset Success Details */}
              {resetResult && (
                <div className="p-4 rounded-xl bg-[#1A251E] border border-emerald-800/80 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{resetResult.message}</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#141C17] border border-emerald-900 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[#8EAE98]">Пароль для клиента: </span>
                        <span className="text-white font-bold text-sm">{resetResult.newPassword}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(resetResult.newPassword, 'password')}
                        className="p-1.5 rounded-lg bg-[#233529] hover:bg-[#2F4938] text-emerald-300 transition-colors cursor-pointer"
                        title="Скопировать пароль"
                      >
                        {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141C17] border border-emerald-900 flex items-center justify-between gap-2">
                      <div className="min-w-0 truncate">
                        <span className="text-[#8EAE98]">ADMIN_PASSWORD_HASH: </span>
                        <span className="text-white text-[11px] select-all">{resetResult.newHash}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(resetResult.newHash, 'hash')}
                        className="p-1.5 rounded-lg bg-[#233529] hover:bg-[#2F4938] text-emerald-300 transition-colors cursor-pointer shrink-0"
                        title="Скопировать хеш"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A68F7E] font-sans">
                    {resetResult.envInstruction}
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
