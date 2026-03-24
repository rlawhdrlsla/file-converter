import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function XlsxToCsv() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noExcel'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    if (sheetName) formData.append('sheet', sheetName);

    try {
      const res = await axios.post('/api/text/xlsx-to-csv', formData);
      setResult(res.data);
      toast.success(t('toast.convertSuccess'));
    } catch (err) {
      const msg = err.response?.data?.error || t('converter.error');
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setSheetName(''); };

  return (
    <div className="page-container">
      <ConverterHeader
        icon={FileSpreadsheet}
        title={t('pages.xlsxToCsv.title')}
        description={t('pages.xlsxToCsv.desc')}
        gradient="from-emerald-600 to-teal-500"
      />

      {result ? (
        <div className="space-y-4">
          <ResultCard result={result} onReset={reset} title={t('pages.xlsxToCsv.resultTitle')} />
          {result.sheets && result.sheets.length > 1 && (
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pages.xlsxToCsv.availableSheets', { sheets: result.sheets.join(', ') })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-excel': ['.xls'],
            }}
            label={t('pages.xlsxToCsv.dropLabel')}
            sublabel={t('pages.xlsxToCsv.dropSublabel')}
          />

          <div>
            <label className="label">{t('pages.xlsxToCsv.sheetName')}</label>
            <input
              type="text"
              value={sheetName}
              onChange={e => setSheetName(e.target.value)}
              className="input-field"
              placeholder={t('pages.xlsxToCsv.sheetNamePlaceholder')}
            />
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.xlsxToCsv.convertBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.xlsxToCsv.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
