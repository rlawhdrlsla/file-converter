import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function PdfMerger() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRemove = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleMerge = async () => {
    if (files.length < 2) return toast.error(t('toast.needAtLeast2Pdf'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post('/api/pdf/merge', formData);
      setResult(res.data);
      toast.success(t('toast.mergeSuccess'));
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
        icon={Layers}
        title={t('pages.pdfMerger.title')}
        description={t('pages.pdfMerger.desc')}
        gradient="from-red-500 to-rose-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.pdfMerger.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
            onRemoveFile={handleRemove}
            accept={{ 'application/pdf': ['.pdf'] }}
            label={t('pages.pdfMerger.dropLabel')}
            sublabel={t('pages.pdfMerger.dropSublabel')}
            maxFiles={20}
          />

          {files.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {files.length !== 1
                ? t('pages.pdfMerger.pdfSelectedPlural', { count: files.length })
                : t('pages.pdfMerger.pdfSelected', { count: files.length })}
            </p>
          )}

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleMerge} loading={loading} disabled={files.length < 2} label={t('pages.pdfMerger.mergeBtn', { count: files.length })} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.pdfMerger.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
