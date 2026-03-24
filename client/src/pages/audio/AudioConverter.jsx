import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Music, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

const formats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];
const bitrates = ['64', '128', '192', '256', '320'];

export default function AudioConverter() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ffmpegError, setFfmpegError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error('Please upload an audio file first');
    setLoading(true); setError(null); setResult(null); setFfmpegError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('format', format);
    formData.append('bitrate', bitrate);

    try {
      const res = await axios.post('/api/audio/convert', formData);
      setResult(res.data);
      toast.success('Audio converted successfully!');
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

  const showBitrate = ['mp3', 'aac', 'm4a'].includes(format);

  return (
    <div className="page-container">
      <ConverterHeader
        icon={Music}
        title={t('pages.audioConverter.title')}
        description={t('pages.audioConverter.desc')}
        gradient="from-purple-500 to-pink-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.audioConverter.resultTitle')} />
      ) : (
        <div className="space-y-4">
          {ffmpegError && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('pages.audioConverter.ffmpegRequired')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{ffmpegError.message}</p>
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <code className="text-xs text-gray-600 dark:text-gray-400">brew install ffmpeg</code>
                      <span className="text-xs text-gray-400 ml-2">(macOS)</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <code className="text-xs text-gray-600 dark:text-gray-400">sudo apt install ffmpeg</code>
                      <span className="text-xs text-gray-400 ml-2">(Ubuntu)</span>
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
              accept={{ 'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma', '.opus'] }}
              label={t('pages.audioConverter.dropLabel')}
              sublabel={t('pages.audioConverter.dropSublabel')}
            />

            <div>
              <label className="label">{t('pages.audioConverter.outputFormat')}</label>
              <div className="flex flex-wrap gap-2">
                {formats.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                      ${format === f
                        ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                        : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-500'
                      }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {showBitrate && (
              <div>
                <label className="label">{t('pages.audioConverter.bitrate')}</label>
                <div className="flex flex-wrap gap-2">
                  {bitrates.map(b => (
                    <button
                      key={b}
                      onClick={() => setBitrate(b)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                        ${bitrate === b
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-purple-400'
                        }`}
                    >
                      {b} kbps
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ErrorCard error={error} onDismiss={() => setError(null)} />
            <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.audioConverter.convertBtn', { format: format.toUpperCase() })} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.audioConverter.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
