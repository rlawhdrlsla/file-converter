import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

const formats = ['jpg', 'png', 'webp', 'tiff', 'gif', 'avif'];

export default function ImageConverter() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('webp');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noImage'));
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('format', format);

    try {
      const res = await axios.post('/api/image/convert', formData);
      setResult(res.data);
      toast.success(t('toast.convertSuccess'));
    } catch (err) {
      const msg = err.response?.data?.error || t('converter.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); };

  return (
    <div className="page-container">
      <ConverterHeader
        icon={Image}
        title={t('pages.imageConverter.title')}
        description={t('pages.imageConverter.desc')}
        gradient="from-blue-500 to-cyan-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageConverter.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.gif', '.avif'] }}
            label={t('pages.imageConverter.dropLabel')}
            sublabel={t('pages.imageConverter.dropSublabel')}
          />

          <div>
            <label className="label">{t('pages.imageConverter.convertTo')}</label>
            <div className="flex flex-wrap gap-2">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                    ${format === f
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500'
                    }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.imageConverter.convertBtn', { format: format.toUpperCase() })} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.imageConverter.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
