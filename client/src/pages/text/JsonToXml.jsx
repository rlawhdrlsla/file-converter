import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function JsonToXml() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [rootElement, setRootElement] = useState('root');
  const [itemElement, setItemElement] = useState('item');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noJson'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('rootElement', rootElement || 'root');
    formData.append('itemElement', itemElement || 'item');

    try {
      const res = await axios.post('/api/text/json-to-xml', formData);
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
        icon={Code2}
        title={t('pages.jsonToXml.title')}
        description={t('pages.jsonToXml.desc')}
        gradient="from-orange-500 to-red-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.jsonToXml.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'application/json': ['.json'], 'text/plain': ['.json'] }}
            label={t('pages.jsonToXml.dropLabel')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('pages.jsonToXml.rootElementName')}</label>
              <input
                type="text"
                value={rootElement}
                onChange={e => setRootElement(e.target.value)}
                className="input-field"
                placeholder="root"
              />
            </div>
            <div>
              <label className="label">{t('pages.jsonToXml.arrayItemElement')}</label>
              <input
                type="text"
                value={itemElement}
                onChange={e => setItemElement(e.target.value)}
                className="input-field"
                placeholder="item"
              />
            </div>
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.jsonToXml.convertBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.jsonToXml.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
