import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ImageCompressor() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getQualityLabel = (q) => {
    if (q >= 85) return { label: t('pages.imageCompressor.highQuality'), color: 'text-green-500' };
    if (q >= 60) return { label: t('pages.imageCompressor.goodQuality'), color: 'text-blue-500' };
    if (q >= 40) return { label: t('pages.imageCompressor.mediumQuality'), color: 'text-yellow-500' };
    return { label: t('pages.imageCompressor.lowQuality'), color: 'text-red-500' };
  };

  const { label: qualLabel, color: qualColor } = getQualityLabel(quality);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noImage'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('quality', quality);

    try {
      const res = await axios.post('/api/image/compress', formData);
      setResult(res.data);
      toast.success(t('toast.compressSuccess'));
    } catch (err) {
      const msg = err.response?.data?.error || t('converter.error');
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); };

  return (
    <div className="page-container">
      <ConverterHeader
        icon={Minimize2}
        title={t('pages.imageCompressor.title')}
        description={t('pages.imageCompressor.desc')}
        gradient="from-orange-500 to-pink-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageCompressor.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif'] }}
            label={t('pages.imageCompressor.dropLabel')}
            sublabel={t('pages.imageCompressor.dropSublabel')}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">{t('pages.imageCompressor.quality')}</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{quality}</span>
                <span className={`text-xs font-medium ${qualColor}`}>{qualLabel}</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full h-2 accent-blue-500 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{t('pages.imageCompressor.smallest')}</span>
              <span>{t('pages.imageCompressor.best')}</span>
            </div>
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.imageCompressor.compressBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.imageCompressor.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
