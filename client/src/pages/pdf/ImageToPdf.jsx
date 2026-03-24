import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ImageToPdf() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRemove = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConvert = async () => {
    if (files.length === 0) return toast.error(t('toast.needAtLeastOneImage'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post('/api/image/to-pdf', formData);
      setResult(res.data);
      toast.success(t('toast.createSuccess'));
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
        icon={FileText}
        title={t('pages.imageToPdf.title')}
        description={t('pages.imageToPdf.desc')}
        gradient="from-red-500 to-orange-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageToPdf.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
            onRemoveFile={handleRemove}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'] }}
            label={t('pages.imageToPdf.dropLabel')}
            sublabel={t('pages.imageToPdf.dropSublabel')}
            maxFiles={20}
          />

          {files.length > 1 && (
            <p className="text-sm text-blue-500 dark:text-blue-400">
              {t('pages.imageToPdf.imagesSelected', { count: files.length })}
            </p>
          )}

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton
            onClick={handleConvert}
            loading={loading}
            disabled={files.length === 0}
            label={files.length !== 1
              ? t('pages.imageToPdf.createBtnPlural', { count: files.length })
              : t('pages.imageToPdf.createBtn', { count: files.length })}
          />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.imageToPdf.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
