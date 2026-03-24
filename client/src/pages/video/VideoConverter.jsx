import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Video, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

const formats = ['mp4', 'avi', 'mov', 'mkv', 'webm'];

export default function VideoConverter() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ffmpegError, setFfmpegError] = useState(null);

  const qualities = [
    { value: 'high', label: t('pages.videoConverter.highQuality'), desc: t('pages.videoConverter.highQualityDesc') },
    { value: 'medium', label: t('pages.videoConverter.medium'), desc: t('pages.videoConverter.mediumDesc') },
    { value: 'low', label: t('pages.videoConverter.lowQuality'), desc: t('pages.videoConverter.lowQualityDesc') },
  ];

  const handleConvert = async () => {
    if (!files[0]) return toast.error('Please upload a video file');
    setLoading(true); setError(null); setResult(null); setFfmpegError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('format', format);
    formData.append('quality', quality);

    try {
      const res = await axios.post('/api/video/convert', formData, { timeout: 600000 });
      setResult(res.data);
      toast.success('Video converted successfully!');
    } catch (err) {
      if (err.response?.status === 503) {
        setFfmpegError(err.response.data);
      } else {
        const msg = err.response?.data?.error || t('converter.error');
        setError(msg); toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setFfmpegError(null); };

  return (
    <div className="page-container">
      <ConverterHeader
        icon={Video}
        title={t('pages.videoConverter.title')}
        description={t('pages.videoConverter.desc')}
        gradient="from-green-500 to-teal-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.videoConverter.resultTitle')} />
      ) : (
        <div className="space-y-4">
          {ffmpegError && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('pages.videoConverter.ffmpegRequired')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{ffmpegError.message}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">macOS</p>
                      <code className="text-xs text-gray-700 dark:text-gray-300">brew install ffmpeg</code>
                    </div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Ubuntu/Debian</p>
                      <code className="text-xs text-gray-700 dark:text-gray-300">sudo apt install ffmpeg</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6 space-y-6">
            <FileDropzone
              files={files}
              onFilesAccepted={setFiles}
              onRemoveFile={() => setFiles([])}
              accept={{ 'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v'] }}
              label={t('pages.videoConverter.dropLabel')}
              sublabel={t('pages.videoConverter.dropSublabel')}
              maxSize={100 * 1024 * 1024}
            />

            <div>
              <label className="label">{t('pages.videoConverter.outputFormat')}</label>
              <div className="flex flex-wrap gap-2">
                {formats.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                      ${format === f
                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                        : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-green-400'
                      }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">{t('pages.videoConverter.quality')}</label>
              <div className="grid grid-cols-3 gap-3">
                {qualities.map(q => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    className={`p-3 rounded-xl text-left border transition-all
                      ${quality === q.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-green-400'
                      }`}
                  >
                    <p className={`text-sm font-medium ${quality === q.value ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {q.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <ErrorCard error={error} onDismiss={() => setError(null)} />
            <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.videoConverter.convertBtn', { format: format.toUpperCase() })} />

            {loading && (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                {t('pages.videoConverter.processingNote')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.videoConverter.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
