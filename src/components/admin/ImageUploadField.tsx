import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { GitHubConfig, uploadImageToGitHub, optimizeImageFile } from '../../utils/githubSync';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  ghConfig: GitHubConfig;
  placeholder?: string;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  ghConfig,
  placeholder = 'https://... или /images/photo.jpg',
  helperText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Пожалуйста, выберите файл изображения (JPEG, PNG, WebP)' });
      return;
    }

    setStatusMessage(null);
    setIsUploading(true);

    try {
      // Check if GitHub token is configured
      if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
        // Direct upload to GitHub repository
        const result = await uploadImageToGitHub(file, ghConfig);
        onChange(result.rawUrl);
        setStatusMessage({
          type: 'success',
          text: `Фото успешно загружено в репозиторий GitHub (${result.rawUrl})!`,
        });
      } else {
        // Fallback to local DataURL optimization (preview / instant offline storage)
        const { dataUrl } = await optimizeImageFile(file);
        onChange(dataUrl);
        setStatusMessage({
          type: 'success',
          text: 'Фото оптимизировано и сохранено локально. Чтобы файл загрузился в репозиторий, укажите токен во вкладке «GitHub».',
        });
      }
    } catch (err: unknown) {
      console.error('Image upload failed', err);
      // If github upload failed, fallback to local dataUrl so user isn't blocked
      try {
        const { dataUrl } = await optimizeImageFile(file);
        onChange(dataUrl);
        setStatusMessage({
          type: 'error',
          text: `Ошибка GitHub: ${(err as Error).message}. Изображение временно сохранено локально.`,
        });
      } catch (fallbackErr) {
        setStatusMessage({
          type: 'error',
          text: (err as Error).message || 'Не удалось обработать изображение',
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2 bg-[#FAF7F2] p-3 sm:p-3.5 rounded-xl border border-[#E5DACD]">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#664F40]">
          {label}
        </label>
        {ghConfig.token ? (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            GitHub автозагрузка активна
          </span>
        ) : (
          <span className="text-[10px] bg-[#EDE2D5] text-[#7A6456] px-2 py-0.5 rounded-full font-medium">
            Локальный режим
          </span>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D8C9B9] text-xs outline-none focus:border-[#C97D5D] text-[#2D1E16] font-mono"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelected(e.target.files[0]);
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-2 bg-[#C97D5D] hover:bg-[#B86846] disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95"
          title="Выбрать файл с устройства"
        >
          {isUploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Загрузить фото</span>
        </button>
      </div>

      {/* Drop Zone & Preview area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-2.5 sm:p-3 text-center transition-all cursor-pointer flex items-center justify-between gap-3 ${
          dragOver
            ? 'border-[#C97D5D] bg-[#F3EBE1]'
            : 'border-[#E0D3C4] hover:border-[#C97D5D] bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 text-left min-w-0">
          {value ? (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[#E5DACD] bg-[#F6EFE7] shrink-0">
              <img
                src={value}
                alt="Превью"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#FAF7F2] border border-[#E5DACD] flex items-center justify-center shrink-0 text-[#A69284]">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#2D1E16] truncate">
              {value ? 'Нажмите для замены фото' : 'Нажмите для выбора фото'}
            </div>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[#C97D5D] flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />
          <span>Выбрать</span>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
          <span className="leading-tight">{statusMessage.text}</span>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-[#8C7465]">{helperText}</p>
      )}
    </div>
  );
};
