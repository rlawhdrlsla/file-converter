import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ZipCreator() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRemove = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    if (files.length === 0) return toast.error(t('toast.needAtLeastOneFile'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post('/api/archive/create-zip', formData);
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
        icon={Archive}
        title={t('pages.zipCreator.title')}
        description={t('pages.zipCreator.desc')}
        gradient="from-indigo-500 to-blue-500"
      />

      {result ? (
        <div className="space-y-4">
          <ResultCard result={result} onReset={reset} title={t('pages.zipCreator.resultTitle')} />
          {result.fileCount && (
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pages.zipCreator.archiveContains', { count: result.fileCount })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
            onRemoveFile={handleRemove}
            label={t('pages.zipCreator.dropLabel')}
            sublabel={t('pages.zipCreator.dropSublabel')}
            maxFiles={50}
          />

          {files.length > 0 && (
            <p className="text-sm text-blue-500 dark:text-blue-400">
              {files.length !== 1
                ? t('pages.zipCreator.filesSelectedPlural', { count: files.length })
                : t('pages.zipCreator.filesSelected', { count: files.length })}
            </p>
          )}

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleCreate} loading={loading} disabled={files.length === 0} label={t('pages.zipCreator.createBtn', { count: files.length })} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.zipCreator.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
