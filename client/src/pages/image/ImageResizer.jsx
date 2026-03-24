import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function ImageResizer() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('pixels'); // 'pixels' | 'percentage'
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [percentage, setPercentage] = useState('50');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error(t('toast.noImage'));
    if (mode === 'pixels' && !width && !height) return toast.error(t('toast.enterSize'));
    setLoading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    if (mode === 'pixels') {
      if (width) formData.append('width', width);
      if (height) formData.append('height', height);
    } else {
      formData.append('percentage', percentage);
    }
    formData.append('maintainAspect', String(maintainAspect));

    try {
      const res = await axios.post('/api/image/resize', formData);
      setResult(res.data);
      toast.success(t('toast.resizeSuccess'));
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
        icon={Maximize2}
        title={t('pages.imageResizer.title')}
        description={t('pages.imageResizer.desc')}
        gradient="from-indigo-500 to-blue-500"
      />

      {result ? (
        <ResultCard result={result} onReset={reset} title={t('pages.imageResizer.resultTitle')} />
      ) : (
        <div className="card p-6 space-y-6">
          <FileDropzone
            files={files}
            onFilesAccepted={setFiles}
            onRemoveFile={() => setFiles([])}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.gif'] }}
            label={t('pages.imageResizer.dropLabel')}
          />

          {/* Mode */}
          <div>
            <label className="label">{t('pages.imageResizer.resizeMode')}</label>
            <div className="flex gap-2">
              {['pixels', 'percentage'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${mode === m ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-blue-400'}`}
                >
                  {m === 'pixels' ? t('pages.imageResizer.byPixels') : t('pages.imageResizer.byPercent')}
                </button>
              ))}
            </div>
          </div>

          {mode === 'pixels' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('pages.imageResizer.widthPx')}</label>
                <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 1920" className="input-field" min="1" />
              </div>
              <div>
                <label className="label">{t('pages.imageResizer.heightPx')}</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 1080" className="input-field" min="1" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aspect"
                  checked={maintainAspect}
                  onChange={e => setMaintainAspect(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 accent-blue-500"
                />
                <label htmlFor="aspect" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  {t('pages.imageResizer.maintainAspect')}
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="label">{t('pages.imageResizer.scalePercent')}: <span className="text-blue-500 font-bold">{percentage}%</span></label>
              <input
                type="range"
                min="1"
                max="200"
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                className="w-full h-2 accent-blue-500 rounded-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span><span>100%</span><span>200%</span>
              </div>
            </div>
          )}

          <ErrorCard error={error} onDismiss={() => setError(null)} />
          <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.imageResizer.resizeBtn')} />
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.imageResizer.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
