import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();

  const sectionKeys = ['0', '1', '2', '3', '4', '5', '6', '7'];

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('privacy.title')}</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {t('privacy.updated')}
        </p>

        <div className="card p-6 mb-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('privacy.intro')} <strong className="text-gray-800 dark:text-gray-200">{t('privacy.introHighlight')}</strong>
          </p>
        </div>

        <div className="space-y-6">
          {sectionKeys.map((key) => (
            <div key={key} className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t(`privacy.sections.${key}.title`)}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {t(`privacy.sections.${key}.content`)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
