import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Video, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function VideoCompressor() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ffmpegError, setFfmpegError] = useState(null);

  const qualities = [
    { value: 'high', label: t('pages.videoCompressor.highQuality'), desc: t('pages.videoCompressor.highQualityDesc'), crf: '20' },
    { value: 'medium', label: t('pages.videoCompressor.medium'), desc: t('pages.videoCompressor.mediumDesc'), crf: '28' },
    { value: 'low', label: t('pages.videoCompressor.maxCompression'), desc: t('pages.videoCompressor.maxCompressionDesc'), crf: '35' },
  ];

  const handleCompress = async () => {
    if (!files[0]) return toast.error('Please upload a video file');
    setLoading(true); setError(null); setResult(null); setFfmpegError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('quality', quality);

    try {
      const res = await axios.post('/api/video/compress', formData, { timeout: 600000 });
      setResult(res.data);
      toast.success('Video compressed!');
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
        title={t('pages.videoCompressor.title')}
        description={t('pages.videoCompressor.desc')}
        gradient="from-emerald-500 to-green-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.videoCompressor.resultTitle')} />
      ) : (
        <div className="space-y-4">
          {ffmpegError && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('pages.videoCompressor.ffmpegRequired')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ffmpegError.installHint}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6 space-y-6">
            <FileDropzone
              files={files}
              onFilesAccepted={setFiles}
              onRemoveFile={() => setFiles([])}
              accept={{ 'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'] }}
              label={t('pages.videoCompressor.dropLabel')}
            />

            <div>
              <label className="label">{t('pages.videoCompressor.compressionLevel')}</label>
              <div className="space-y-2">
                {qualities.map(q => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all
                      ${quality === q.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-emerald-400'
                      }`}
                  >
                    <div>
                      <p className={`font-medium text-sm ${quality === q.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {q.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{q.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${quality === q.value ? 'border-emerald-500' : 'border-gray-300 dark:border-dark-500'}`}>
                      {quality === q.value && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <ErrorCard error={error} onDismiss={() => setError(null)} />
            <ConvertButton onClick={handleCompress} loading={loading} disabled={!files[0]} label={t('pages.videoCompressor.compressBtn')} />

            {loading && (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                {t('pages.videoCompressor.processingNote')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.videoCompressor.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
