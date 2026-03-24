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
        desc={t('pages.imageBgRemover.desc')}
        gradient="from-violet-500 to-purple-600"
      />

      {!result ? (
        <>
          <div className="card p-6 mb-4">
            <FileDropzone
              files={files}
              onFiles={handleFiles}
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
            <p className="text-center text-sm text-gray-400 mt-3">
              {t('pages.imageBgRemover.loadingHint')}
            </p>
          )}

          <InfoBox text={t('pages.imageBgRemover.infoText')} />
          {error && <ErrorCard message={error} />}
        </>
      ) : (
        <div className="space-y-4">
          <ResultCard
            title={t('pages.imageBgRemover.resultTitle')}
            downloadUrl={result.downloadUrl}
            filename={result.filename}
            meta={[
              { label: t('converter.size'), value: `${(result.size / 1024).toFixed(1)} KB` },
              { label: t('converter.resolution'), value: `${result.width} × ${result.height}` },
              { label: t('converter.format'), value: 'PNG (투명)' },
            ]}
          />
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
            {t('converter.reset')}
          </button>
        </div>
      )}
    </div>
  );
}
