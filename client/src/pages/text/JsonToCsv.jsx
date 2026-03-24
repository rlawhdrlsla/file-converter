import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileJson } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function JsonToCsv() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noJson'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await axios.post('/api/text/json-to-csv', formData);
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
        icon={FileJson}
        title={t('pages.jsonToCsv.title')}
        description={t('pages.jsonToCsv.desc')}
        gradient="from-green-500 to-emerald-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.jsonToCsv.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'application/json': ['.json'], 'text/plain': ['.json'] }}
            label={t('pages.jsonToCsv.dropLabel')}
          />
          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.jsonToCsv.convertBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.jsonToCsv.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
