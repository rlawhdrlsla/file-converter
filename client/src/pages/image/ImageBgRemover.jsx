import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ImageBgRemover() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleFiles(newFiles) {
    setFiles(newFiles);
    setResult(null);
    setError(null);
    if (newFiles[0]) {
      setPreview(URL.createObjectURL(newFiles[0]));
    }
  }

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noImage'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await axios.post('/api/image/remove-bg', formData, { timeout: 120000 });
      setResult(res.data);
      toast.success(t('pages.imageBgRemover.success'));
    } catch (err) {
      const msg = err.response?.data?.error || t('converter.error');
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPreview(null); };

  return (
    <div className="page-container max-w-2xl">
      <ConverterHeader
        icon={Eraser}
        title={t('pages.imageBgRemover.title')}
        description={t('pages.imageBgRemover.desc')}
        gradient="from-violet-500 to-purple-600"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageBgRemover.resultTitle')} />
      ) : (
        <div className="space-y-4">
          <div className="card p-6">
            <FileDropzone
              files={files}
              onFilesAccepted={handleFiles}
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              maxFiles={1}
              label={t('pages.imageBgRemover.dropLabel')}
            />
            {preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-48 rounded-xl object-contain border border-gray-200 dark:border-dark-600"
                />
              </div>
            )}
          </div>

          <ConvertButton
            onClick={handleConvert}
            loading={loading}
            disabled={!files[0]}
            label={loading ? t('pages.imageBgRemover.processing') : t('pages.imageBgRemover.removeBtn')}
          />

          {loading && (
            <p className="text-center text-sm text-gray-400">
              {t('pages.imageBgRemover.loadingHint')}
            </p>
          )}

          <InfoBox>{t('pages.imageBgRemover.infoText')}</InfoBox>

          {error && <ErrorCard error={error} />}
        </div>
      )}
    </div>
  );
}
