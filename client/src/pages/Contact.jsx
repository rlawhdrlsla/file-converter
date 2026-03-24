import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // mailto fallback — replace with a real form backend if needed
    const mailto = `mailto:rlawhdrl3702@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {t('contact.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Mail, title: t('contact.email'), desc: 'rlawhdrl3702@gmail.com', gradient: 'from-blue-500 to-indigo-500' },
            { icon: MessageSquare, title: t('contact.feedback'), desc: t('contact.feedbackDesc'), gradient: 'from-purple-500 to-pink-500' },
            { icon: Clock, title: t('contact.responseTime'), desc: t('contact.responseDesc'), gradient: 'from-green-500 to-teal-500' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card p-5 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.successTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('contact.successDesc')}{' '}
              <a href="mailto:rlawhdrl3702@gmail.com" className="text-blue-500 hover:underline">
                rlawhdrl3702@gmail.com
              </a>
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="mt-5 text-sm text-blue-500 hover:underline"
            >
              {t('contact.sendAnother')}
            </button>
          </motion.div>
        ) : (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{t('contact.formTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('contact.name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t('contact.namePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600
                      bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('contact.email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder={t('contact.emailPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600
                      bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('contact.subject')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.subjectPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600
                    bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('contact.message')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600
                    bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500
                    resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600
                  text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
              >
                {t('contact.send')}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                {t('contact.directEmail')}{' '}
                <a href="mailto:rlawhdrl3702@gmail.com" className="text-blue-500 hover:underline">
                  rlawhdrl3702@gmail.com
                </a>
              </p>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
