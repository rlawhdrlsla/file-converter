import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    [t('footer.tools')]: [
      { label: t('tools.image.convert.label'), path: '/image/convert' },
      { label: t('tools.pdf.merge.label'), path: '/pdf/merge' },
      { label: t('tools.audio.convert.label'), path: '/audio/convert' },
      { label: t('tools.video.convert.label'), path: '/video/convert' },
      { label: t('tools.data.csvToJson.label'), path: '/text/csv-to-json' },
    ],
    [t('footer.company')]: [
      { label: t('footer.about'), path: '/about' },
      { label: t('footer.contact'), path: '/contact' },
      { label: t('footer.privacy'), path: '/privacy' },
      { label: t('footer.terms'), path: '/terms' },
    ],
  };

  return (
    <footer className="border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">FileConvert</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Formats */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{t('footer.formats')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('footer.formatsDesc')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Heart size={13} className="text-red-500 fill-red-500" /> {t('footer.madeWith')}
            &copy; {new Date().getFullYear()} FileConvert
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('footer.autoDelete')}
          </p>
        </div>
      </div>
    </footer>
  );
}
