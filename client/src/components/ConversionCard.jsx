import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ConversionCard({ icon: Icon, title, description, path, color, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={path}
        className="block card p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${gradient}`}>
          <Icon size={22} className="text-white" strokeWidth={2} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        <div className="flex items-center gap-1 mt-3 text-blue-500 text-xs font-medium">
          Convert now <ArrowRight size={12} />
        </div>
      </Link>
    </motion.div>
  );
}
