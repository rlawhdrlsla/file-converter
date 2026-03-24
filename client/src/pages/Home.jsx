import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Image, FileText, Database, Archive,
  ArrowRight, Shield, Cpu, Search, Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdBanner from '../components/AdBanner.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const toolCategories = [
    {
      id: 'image',
      label: t('categories.imageTools'),
      icon: Image,
      iconBg: 'bg-blue-600',
      bg: 'bg-white dark:bg-dark-800',
      border: 'border-gray-200 dark:border-dark-700',
      tools: [
        { label: t('tools.image.convert.label'), path: '/image/convert', desc: t('tools.image.convert.desc') },
        { label: t('tools.image.resize.label'), path: '/image/resize', desc: t('tools.image.resize.desc') },
        { label: t('tools.image.compress.label'), path: '/image/compress', desc: t('tools.image.compress.desc') },
        { label: t('tools.image.toPdf.label'), path: '/image/to-pdf', desc: t('tools.image.toPdf.desc') },
      ],
    },
    {
      id: 'pdf',
      label: t('categories.pdfTools'),
      icon: FileText,
      iconBg: 'bg-red-500',
      bg: 'bg-white dark:bg-dark-800',
      border: 'border-gray-200 dark:border-dark-700',
      tools: [
        { label: t('tools.pdf.merge.label'), path: '/pdf/merge', desc: t('tools.pdf.merge.desc') },
        { label: t('tools.pdf.split.label'), path: '/pdf/split', desc: t('tools.pdf.split.desc') },
        { label: t('tools.pdf.compress.label'), path: '/pdf/compress', desc: t('tools.pdf.compress.desc') },
        { label: t('tools.image.toPdf.label'), path: '/image/to-pdf', desc: t('tools.image.toPdf.desc') },
      ],
    },
    {
      id: 'data',
      label: t('categories.dataTools'),
      icon: Database,
      iconBg: 'bg-amber-500',
      bg: 'bg-white dark:bg-dark-800',
      border: 'border-gray-200 dark:border-dark-700',
      tools: [
        { label: t('tools.data.csvToJson.label'), path: '/text/csv-to-json', desc: t('tools.data.csvToJson.desc') },
        { label: t('tools.data.jsonToCsv.label'), path: '/text/json-to-csv', desc: t('tools.data.jsonToCsv.desc') },
        { label: t('tools.data.csvToXlsx.label'), path: '/text/csv-to-xlsx', desc: t('tools.data.csvToXlsx.desc') },
        { label: t('tools.data.jsonToXml.label'), path: '/text/json-to-xml', desc: t('tools.data.jsonToXml.desc') },
        { label: t('tools.data.xlsvToCsv.label'), path: '/text/xlsx-to-csv', desc: t('tools.data.xlsvToCsv.desc') },
      ],
    },
    {
      id: 'archive',
      label: t('categories.archiveTools'),
      icon: Archive,
      iconBg: 'bg-slate-600',
      bg: 'bg-white dark:bg-dark-800',
      border: 'border-gray-200 dark:border-dark-700',
      tools: [
        { label: t('tools.archive.zipCreator.label'), path: '/archive/zip-creator', desc: t('tools.archive.zipCreator.desc') },
        { label: t('tools.archive.zipExtractor.label'), path: '/archive/zip-extractor', desc: t('tools.archive.zipExtractor.desc') },
      ],
    },
  ];

  const features = [
    { icon: Shield, title: t('home.features.secure.title'), desc: t('home.features.secure.desc') },
    { icon: Zap, title: t('home.features.fast.title'), desc: t('home.features.fast.desc') },
    { icon: Lock, title: t('home.features.noSignup.title'), desc: t('home.features.noSignup.desc') },
    { icon: Cpu, title: t('home.features.quality.title'), desc: t('home.features.quality.desc') },
  ];

  const allTools = toolCategories.flatMap(cat =>
    cat.tools.map(tool => ({ ...tool, category: cat.label }))
  );

  const filteredTools = search.trim()
    ? allTools.filter(tool =>
        tool.label.toLowerCase().includes(search.toLowerCase()) ||
        tool.desc.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-white dark:bg-[#0f0f0f] pt-14 pb-16 px-4 border-b border-gray-100 dark:border-dark-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-5 border border-blue-100 dark:border-blue-800">
              <Zap size={12} strokeWidth={2.5} />
              {t('home.badge')}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {t('home.title1')}{' '}
              <span className="text-blue-600 dark:text-blue-400">{t('home.title2')}</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative max-w-xl mx-auto mb-12"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-gray-200 dark:border-dark-600
                  bg-white dark:bg-dark-800 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>
            {search && filteredTools.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-10 overflow-hidden">
                {filteredTools.slice(0, 6).map(tool => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setSearch('')}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border-b border-gray-100 dark:border-dark-700 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{tool.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tool.category}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
            {search && filteredTools.length === 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-700 z-10 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {t('home.noResults')} "{search}"
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 text-center"
          >
            {[
              { value: '20+', label: t('home.stats.tools') },
              { value: '50+', label: t('home.stats.formats') },
              { value: '100MB', label: t('home.stats.maxSize') },
              { value: '100%', label: t('home.stats.free') },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
        <AdBanner slot="hero" />
      </div>

      {/* Tool Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {toolCategories.map((category) => {
            const CatIcon = category.icon;
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg ${category.iconBg} flex items-center justify-center`}>
                    <CatIcon size={18} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.label}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.tools.map((tool) => (
                    <motion.div
                      key={tool.path}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Link
                        to={tool.path}
                        className={`block p-4 rounded-2xl border ${category.bg} ${category.border}
                          hover:shadow-md transition-all duration-200 group`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tool.desc}</p>
                        <div className="flex items-center gap-1 mt-2.5 text-xs font-medium text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open tool <ArrowRight size={11} />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-dark-800/50 border-y border-gray-200 dark:border-dark-700 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('home.whyTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('home.whySubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const FIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="card p-5 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                    <FIcon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Ad Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AdBanner slot="bottom" />
      </div>
    </div>
  );
}
