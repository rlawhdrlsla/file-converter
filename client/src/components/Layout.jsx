import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AdBanner from './AdBanner.jsx';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0f0f]">
      <Navbar />
      <main className="flex-1">
        {location.pathname !== '/' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
            <AdBanner slot="top" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        {location.pathname !== '/' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
            <AdBanner slot="bottom" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
