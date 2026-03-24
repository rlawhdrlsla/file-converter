import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ZipExtractor() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExtract = async () => {
    if (!files[0]) return toast.error(t('toast.noZip'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await axios.post('/api/archive/extract-zip', formData);
      setResult(res.data);
      toast.success(t('toast.extractSuccess'));
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
        icon={PackageOpen}
        title={t('pages.zipExtractor.title')}
        description={t('pages.zipExtractor.desc')}
        gradient="from-violet-500 to-indigo-500"
      />

      {result ? (
        <div className="space-y-4">
          <ResultCard result={result} onReset={reset} title={t('pages.zipExtractor.resultTitle')} />
          {result.extractedFiles && result.extractedFiles.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('pages.zipExtractor.extractedFiles', { count: result.fileCount })}
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.extractedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-dark-700">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    {file.size > 0 && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatBytes(file.size)}</span>
                    )}
                  </div>
                ))}
                {result.fileCount > result.extractedFiles.length && (
                  <p className="text-xs text-gray-400 px-2 pt-1">
                    {t('pages.zipExtractor.andMore', { count: result.fileCount - result.extractedFiles.length })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }}
            label={t('pages.zipExtractor.dropLabel')}
          />
          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleExtract} loading={loading} disabled={!files[0]} label={t('pages.zipExtractor.extractBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.zipExtractor.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
