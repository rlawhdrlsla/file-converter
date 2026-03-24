import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Image, FileText, Database,
  ChevronDown, Menu, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function getNavMenus(t) {
  return [
    {
      label: t('nav.imageTools'),
      icon: Image,
      color: 'text-blue-500',
      items: [
        { label: t('tools.image.convert.label'), path: '/image/convert', desc: t('tools.image.convert.desc') },
        { label: t('tools.image.resize.label'), path: '/image/resize', desc: t('tools.image.resize.desc') },
        { label: t('tools.image.compress.label'), path: '/image/compress', desc: t('tools.image.compress.desc') },
        { label: t('tools.image.toPdf.label'), path: '/image/to-pdf', desc: t('tools.image.toPdf.desc') },
      ],
    },
    {
      label: t('nav.pdfTools'),
      icon: FileText,
      color: 'text-red-500',
      items: [
        { label: t('tools.pdf.merge.label'), path: '/pdf/merge', desc: t('tools.pdf.merge.desc') },
        { label: t('tools.pdf.split.label'), path: '/pdf/split', desc: t('tools.pdf.split.desc') },
        { label: t('tools.pdf.compress.label'), path: '/pdf/compress', desc: t('tools.pdf.compress.desc') },
        { label: t('tools.image.toPdf.label'), path: '/image/to-pdf', desc: t('tools.image.toPdf.desc') },
      ],
    },
    {
      label: t('nav.dataTools'),
      icon: Database,
      color: 'text-green-500',
      items: [
        { label: t('tools.data.csvToJson.label'), path: '/text/csv-to-json', desc: t('tools.data.csvToJson.desc') },
        { label: t('tools.data.jsonToCsv.label'), path: '/text/json-to-csv', desc: t('tools.data.jsonToCsv.desc') },
        { label: t('tools.data.csvToXlsx.label'), path: '/text/csv-to-xlsx', desc: t('tools.data.csvToXlsx.desc') },
        { label: t('tools.data.jsonToXml.label'), path: '/text/json-to-xml', desc: t('tools.data.jsonToXml.desc') },
        { label: t('tools.data.xlsvToCsv.label'), path: '/text/xlsx-to-csv', desc: t('tools.data.xlsvToCsv.desc') },
        { label: t('tools.archive.zipCreator.label'), path: '/archive/zip-creator', desc: t('tools.archive.zipCreator.desc') },
        { label: t('tools.archive.zipExtractor.label'), path: '/archive/zip-extractor', desc: t('tools.archive.zipExtractor.desc') },
      ],
    },
  ];
}

function DropdownMenu({ menu, isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 left-0 w-64 rounded-2xl shadow-2xl z-50
            bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-2"
        >
          {menu.items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700
                transition-colors duration-150 group"
            >
              <span className="font-medium text-sm text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {item.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</span>
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState(null);
  const location = useLocation();
  const navRef = useRef(null);

  const navMenus = getNavMenus(t);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-200 dark:border-dark-700" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              FileConvert
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navMenus.map((menu) => {
              const Icon = menu.icon;
              const isOpen = openMenu === menu.label;
              return (
                <div key={menu.label} className="relative">
                  <button
                    onClick={() => setOpenMenu(isOpen ? null : menu.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                      transition-colors duration-150
                      ${isOpen
                        ? 'bg-gray-100 dark:bg-dark-700 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <Icon size={15} className={menu.color} />
                    {menu.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <DropdownMenu
                    menu={menu}
                    isOpen={isOpen}
                    onClose={() => setOpenMenu(null)}
                  />
                </div>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center
                bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navMenus.map((menu) => {
                const Icon = menu.icon;
                const isExpanded = expandedMobile === menu.label;
                return (
                  <div key={menu.label}>
                    <button
                      onClick={() => setExpandedMobile(isExpanded ? null : menu.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                        text-sm font-medium text-gray-700 dark:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} className={menu.color} />
                        {menu.label}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-1 space-y-0.5 overflow-hidden"
                        >
                          {menu.items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400
                                hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-blue-600 dark:hover:text-blue-400
                                transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
