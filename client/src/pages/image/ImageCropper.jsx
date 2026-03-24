import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crop } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ImageCropper() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [left, setLeft] = useState('0');
  const [top, setTop] = useState('0');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noImage'));
    if (!width || !height) return toast.error(t('toast.enterCropSize'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('left', left || '0');
    formData.append('top', top || '0');
    formData.append('width', width);
    formData.append('height', height);

    try {
      const res = await axios.post('/api/image/crop', formData);
      setResult(res.data);
      toast.success(t('toast.cropSuccess'));
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
        icon={Crop}
        title={t('pages.imageCropper.title')}
        description={t('pages.imageCropper.desc')}
        gradient="from-teal-500 to-green-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageCropper.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'] }}
            label={t('pages.imageCropper.dropLabel')}
          />

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">{t('pages.imageCropper.cropRegion')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('pages.imageCropper.leftOffset')}</label>
                <input type="number" value={left} onChange={e => setLeft(e.target.value)} className="input-field" min="0" placeholder="0" />
              </div>
              <div>
                <label className="label">{t('pages.imageCropper.topOffset')}</label>
                <input type="number" value={top} onChange={e => setTop(e.target.value)} className="input-field" min="0" placeholder="0" />
              </div>
              <div>
                <label className="label">{t('pages.imageCropper.widthRequired')}</label>
                <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="input-field" min="1" placeholder="e.g. 800" />
              </div>
              <div>
                <label className="label">{t('pages.imageCropper.heightRequired')}</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="input-field" min="1" placeholder="e.g. 600" />
              </div>
            </div>
          </div>

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.imageCropper.cropBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.imageCropper.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
