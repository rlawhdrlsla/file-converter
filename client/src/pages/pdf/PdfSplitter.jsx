import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Scissors } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function PdfSplitter() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [startPage, setStartPage] = useState('1');
  const [endPage, setEndPage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSplit = async () => {
    if (!files[0]) return toast.error(t('toast.noPdf'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('startPage', startPage);
    if (endPage) formData.append('endPage', endPage);

    try {
      const res = await axios.post('/api/pdf/split', formData);
      setResult(res.data);
      toast.success(t('toast.splitSuccess'));
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
        icon={Scissors}
        title={t('pages.pdfSplitter.title')}
        description={t('pages.pdfSplitter.desc')}
        gradient="from-orange-500 to-yellow-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.pdfSplitter.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'application/pdf': ['.pdf'] }}
            label={t('pages.pdfSplitter.dropLabel')}
          />

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">{t('pages.pdfSplitter.pageRange')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('pages.pdfSplitter.startPage')}</label>
                <input
                  type="number"
                  value={startPage}
                  onChange={e => setStartPage(e.target.value)}
                  className="input-field"
                  min="1"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="label">{t('pages.pdfSplitter.endPage')}</label>
                <input
                  type="number"
                  value={endPage}
                  onChange={e => setEndPage(e.target.value)}
                  className="input-field"
                  min="1"
                  placeholder={t('pages.pdfSplitter.endPagePlaceholder')}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('pages.pdfSplitter.endPageHint')}
            </p>
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleSplit} loading={loading} disabled={!files[0]} label={t('pages.pdfSplitter.splitBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.pdfSplitter.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
