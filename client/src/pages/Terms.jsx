import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();

  const sectionKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('terms.title')}</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {t('terms.updated')}
        </p>

        <div className="card p-6 mb-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {t('terms.intro')}
          </p>
        </div>

        <div className="space-y-4">
          {sectionKeys.map((key) => (
            <div key={key} className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {t(`terms.sections.${key}.title`)}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {t(`terms.sections.${key}.content`)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
