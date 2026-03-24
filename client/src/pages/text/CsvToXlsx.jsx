import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Table } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function CsvToXlsx() {
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
      const res = await axios.post('/api/text/csv-to-xlsx', formData);
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
        icon={Table}
        title={t('pages.csvToXlsx.title')}
        description={t('pages.csvToXlsx.desc')}
        gradient="from-green-600 to-green-400"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.csvToXlsx.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'text/csv': ['.csv'], 'text/plain': ['.csv'] }}
            label={t('pages.csvToXlsx.dropLabel')}
          />
          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.csvToXlsx.convertBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.csvToXlsx.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
