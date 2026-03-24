import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ConverterHeader({ icon: Icon, title, description, gradient = 'from-blue-500 to-purple-600' }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 ml-13 pl-1">{description}</p>
    </div>
  );
}

export function ConvertButton({ onClick, loading, disabled, label }) {
  const { t } = useTranslation();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary w-full justify-center py-4 text-base"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {t('converter.converting')}
        </>
      ) : (
        label || t('converter.convert')
      )}
    </motion.button>
  );
}

export function ResultCard({ result, onReset, title }) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = React.useState(false);
  if (!result) return null;

  // 항상 상대 경로 사용 — 개발(Vite 프록시), 프로덕션(same-origin) 모두 동작
  const downloadUrl = result.downloadUrl.startsWith('http')
    ? result.downloadUrl
    : result.downloadUrl;

  async function handleDownload() {
    try {
      setDownloading(true);
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(downloadUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={24} className="text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title || t('converter.success')}</h3>

          <div className="space-y-1 mb-4">
            {result.filename && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('converter.file')}: <span className="font-medium text-gray-700 dark:text-gray-300">{result.filename}</span>
              </p>
            )}
            {result.size && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('converter.size')}: <span className="font-medium text-gray-700 dark:text-gray-300">{formatBytes(result.size)}</span>
              </p>
            )}
            {result.pages && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('converter.pages')}: <span className="font-medium text-gray-700 dark:text-gray-300">{result.pages}</span>
              </p>
            )}
            {result.rows && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('converter.rows')}: <span className="font-medium text-gray-700 dark:text-gray-300">{result.rows}</span>
              </p>
            )}
            {result.savings !== undefined && result.savings > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {t('converter.saved')} {result.savings}% ({formatBytes(result.originalSize)} → {formatBytes(result.compressedSize || result.size)})
              </p>
            )}
            {result.width && result.height && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('converter.dimensions')}: <span className="font-medium text-gray-700 dark:text-gray-300">{result.width} × {result.height}px</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary py-2.5 px-5 text-sm"
            >
              <Download size={16} />
              {downloading ? '...' : t('converter.download')}
            </button>
            <button onClick={onReset} className="btn-secondary py-2.5 px-5 text-sm">
              <RefreshCw size={16} />
              {t('converter.convertAnother')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ErrorCard({ error, onDismiss }) {
  const { t } = useTranslation();
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
    >
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-xs">
          {t('converter.dismiss')}
        </button>
      )}
    </motion.div>
  );
}

export function InfoBox({ children }) {
  return (
    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{children}</p>
    </div>
  );
}
