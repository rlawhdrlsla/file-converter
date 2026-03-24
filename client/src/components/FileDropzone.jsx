import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FilePreview({ file, onRemove }) {
  const [preview, setPreview] = useState(null);
  const isImage = file.type.startsWith('image/');

  React.useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700
        border border-gray-200 dark:border-dark-600 group"
    >
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <File size={18} className="text-blue-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-600
            hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500
            flex items-center justify-center text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}

export default function FileDropzone({
  onFilesAccepted,
  accept,
  maxFiles = 1,
  maxSize = 100 * 1024 * 1024,
  files = [],
  onRemoveFile,
  label,
  sublabel,
  disabled = false,
}) {
  const { t } = useTranslation();

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      onFilesAccepted(accepted);
    }
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: maxFiles > 1,
  });

  const hasFiles = files.length > 0;
  const dropLabel = label || t('converter.dropzone');

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
          ${isDragActive && !isDragReject
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]'
            : isDragReject
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
            : disabled
            ? 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 cursor-not-allowed opacity-60'
            : 'border-gray-300 dark:border-dark-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-dark-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/5'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
              ${isDragActive
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-gray-100 dark:bg-dark-700'
              }`}
          >
            <Upload
              size={28}
              className={isDragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}
            />
          </motion.div>

          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {isDragActive ? t('converter.releaseToUpload') : dropLabel}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sublabel || t('converter.dragOrClick')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('converter.maxSizeLabel')}: {formatBytes(maxSize)}
            {maxFiles > 1 && ` · ${t('converter.upToFiles', { count: maxFiles })}`}
          </p>
        </div>
      </div>

      {/* File rejection errors */}
      {fileRejections.length > 0 && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">{file.name}:</span>{' '}
              {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* File previews */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {files.map((file, idx) => (
              <FilePreview
                key={`${file.name}-${idx}`}
                file={file}
                onRemove={onRemoveFile ? () => onRemoveFile(idx) : null}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
