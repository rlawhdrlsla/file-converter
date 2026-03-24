import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function CsvToJson() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noCsv'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await axios.post('/api/text/csv-to-json', formData);
      setResult(res.data);
      toast.success(t('toast.convertSuccess'));
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
        icon={Database}
        title={t('pages.csvToJson.title')}
        description={t('pages.csvToJson.desc')}
        gradient="from-yellow-500 to-amber-500"
      />

      {result ? (
        <div className="space-y-4">
          <ResultCard result={result} onReset={reset} title={t('pages.csvToJson.resultTitle')} />
          {result.preview && result.preview.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('pages.csvToJson.preview')}</p>
              <div className="overflow-x-auto">
                <pre className="text-xs bg-gray-50 dark:bg-dark-700 p-3 rounded-xl overflow-auto max-h-48 text-gray-700 dark:text-gray-300">
                  {JSON.stringify(result.preview, null, 2)}
                </pre>
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
            accept={{ 'text/csv': ['.csv'], 'text/plain': ['.csv'] }}
            label={t('pages.csvToJson.dropLabel')}
          />
          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.csvToJson.convertBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.csvToJson.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
