import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConverterHeader, InfoBox } from '../../components/ConverterLayout.jsx';

export default function PdfToWord() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <ConverterHeader
        icon={FileText}
        title={t('pages.pdfToWord.title')}
        description={t('pages.pdfToWord.desc')}
        gradient="from-blue-500 to-indigo-500"
      />

      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('pages.pdfToWord.advancedRequired')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
          {t('pages.pdfToWord.advancedDesc')}
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">1.</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.pdfToWord.step1')}</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">2.</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.pdfToWord.step2')}</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
            <span className="text-blue-500 font-bold text-sm mt-0.5">3.</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.pdfToWord.step3')}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <InfoBox>
          {t('pages.pdfToWord.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
