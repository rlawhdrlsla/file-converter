import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Code2, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Zap,
      title: t('about.values.speed.title'),
      desc: t('about.values.speed.desc'),
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Shield,
      title: t('about.values.privacy.title'),
      desc: t('about.values.privacy.desc'),
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Code2,
      title: t('about.values.open.title'),
      desc: t('about.values.open.desc'),
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: Heart,
      title: t('about.values.free.title'),
      desc: t('about.values.free.desc'),
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-5">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.title')}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('about.storyTitle')}</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <p>{t('about.story1')}</p>
            <p>{t('about.story2')}</p>
            <p>{t('about.story3')}</p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('about.valuesTitle')}</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {values.map((v) => {
            const VIcon = v.icon;
            return (
              <div key={v.title} className="card p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-3`}>
                  <VIcon size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('about.techTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'React', desc: 'Frontend UI' },
              { name: 'Vite', desc: 'Build tool' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Framer Motion', desc: 'Animations' },
              { name: 'Node.js + Express', desc: 'Backend server' },
              { name: 'Sharp', desc: 'Image processing' },
              { name: 'pdf-lib', desc: 'PDF manipulation' },
              { name: 'XLSX.js', desc: 'Spreadsheets' },
              { name: 'FFmpeg', desc: 'Audio & Video' },
              { name: 'Archiver', desc: 'ZIP creation' },
              { name: 'fast-xml-parser', desc: 'XML parsing' },
              { name: 'Multer', desc: 'File uploads' },
            ].map((tech) => (
              <div key={tech.name} className="px-3 py-2.5 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{tech.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
