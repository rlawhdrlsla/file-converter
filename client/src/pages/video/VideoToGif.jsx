import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clapperboard, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone.jsx';
import {
  ConverterHeader, ConvertButton, ResultCard, ErrorCard, InfoBox
} from '../../components/ConverterLayout.jsx';

export default function VideoToGif() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [startTime, setStartTime] = useState('0');
  const [duration, setDuration] = useState('5');
  const [fps, setFps] = useState('10');
  const [width, setWidth] = useState('480');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ffmpegError, setFfmpegError] = useState(null);

  const handleConvert = async () => {
    if (!files[0]) return toast.error('Please upload a video file');
    setLoading(true); setError(null); setResult(null); setFfmpegError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('startTime', startTime);
    formData.append('duration', Math.min(30, Number(duration)).toString());
    formData.append('fps', fps);
    formData.append('width', width);

    try {
      const res = await axios.post('/api/video/to-gif', formData, { timeout: 180000 });
      setResult(res.data);
      toast.success('GIF created successfully!');
    } catch (err) {
      if (err.response?.status === 503) {
        setFfmpegError(err.response.data);
      } else {
        const msg = err.response?.data?.error || t('converter.error');
        setError(msg); toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setFfmpegError(null); };

  return (
    <div className="page-container">
      <ConverterHeader
        icon={Clapperboard}
        title={t('pages.videoToGif.title')}
        description={t('pages.videoToGif.desc')}
        gradient="from-pink-500 to-rose-500"
      />

      {result ? (
        <div className="space-y-4">
          <ResultCard result={result} onReset={reset} title={t('pages.videoToGif.resultTitle')} />
          {result.downloadUrl && (
            <div className="card p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pages.videoToGif.preview')}</p>
              <img
                src={`http://localhost:3001${result.downloadUrl}`}
                alt="Generated GIF"
                className="rounded-xl max-h-64 object-contain mx-auto"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {ffmpegError && (
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('pages.videoToGif.ffmpegRequired')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ffmpegError.installHint}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6 space-y-6">
            <FileDropzone
              files={files}
              onFilesAccepted={setFiles}
              onRemoveFile={() => setFiles([])}
              accept={{ 'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'] }}
              label={t('pages.videoToGif.dropLabel')}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('pages.videoToGif.startTime')}</label>
                <input type="number" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" min="0" step="0.5" />
              </div>
              <div>
                <label className="label">{t('pages.videoToGif.duration')}</label>
                <input type="number" value={duration} onChange={e => setDuration(Math.min(30, Number(e.target.value)).toString())} className="input-field" min="1" max="30" />
              </div>
              <div>
                <label className="label">{t('pages.videoToGif.fps')}</label>
                <select value={fps} onChange={e => setFps(e.target.value)} className="select-field">
                  {['5', '8', '10', '15', '20', '24'].map(f => (
                    <option key={f} value={f}>{f} fps</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('pages.videoToGif.widthPixels')}</label>
                <select value={width} onChange={e => setWidth(e.target.value)} className="select-field">
                  {['240', '320', '480', '640', '800'].map(w => (
                    <option key={w} value={w}>{w}px</option>
                  ))}
                </select>
              </div>
            </div>

            <ErrorCard error={error} onDismiss={() => setError(null)} />
            <ConvertButton onClick={handleConvert} loading={loading} disabled={!files[0]} label={t('pages.videoToGif.createBtn')} />
          </div>
        </div>
      )}

      <div className="mt-6">
        <InfoBox>
          {t('pages.videoToGif.infoText')}
        </InfoBox>
      </div>
    </div>
  );
}
