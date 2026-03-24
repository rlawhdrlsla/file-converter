import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function PdfCompressor() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompress = async () => {
    if (!files[0]) return toast.error(t('toast.noPdf'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await axios.post('/api/pdf/compress', formData);
      setResult(res.data);
      toast.success(t('toast.compressSuccess'));
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
        title={t('pages.pdfCompressor.title')}
        description={t('pages.pdfCompressor.desc')}
        gradient="from-violet-500 to-purple-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.pdfCompressor.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'application/pdf': ['.pdf'] }}
            label={t('pages.pdfCompressor.dropLabel')}
          />

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleCompress} loading={loading} disabled={!files[0]} label={t('pages.pdfCompressor.compressBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.pdfCompressor.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
