import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConverterHeader, InfoBox } from '../../components/ConverterLayout.jsx';

export default function WordToPdf() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <ConverterHeader
        icon={FileText}
        title={t('pages.wordToPdf.title')}
        description={t('pages.wordToPdf.desc')}
        gradient="from-blue-600 to-blue-400"
      />

      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('pages.wordToPdf.libreRequired')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
          {t('pages.wordToPdf.libreDesc')}
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">macOS</span>
            <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">brew install libreoffice</code>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">Ubuntu</span>
            <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">sudo apt install libreoffice</code>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">cmd</span>
            <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">libreoffice --headless --convert-to pdf file.docx</code>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <InfoBox>
          {t('pages.wordToPdf.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
