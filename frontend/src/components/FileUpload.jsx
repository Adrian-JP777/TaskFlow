import { useState, useRef } from 'react';
import api from '../services/api';

function FileUpload({ issueId, onUploaded, onError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      await api.post(`/issues/${issueId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onUploaded && onUploaded();
    } catch (err) {
      console.error(err);
      onError && onError();
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition ${
          dragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-slate-200 bg-slate-50/50 hover:border-orange-300'
        }`}
      >
        <p className="mb-2 text-center text-sm text-slate-500">
          {file ? (
            <span className="font-medium text-slate-700">{file.name}</span>
          ) : (
            'Arrastra un archivo aquí o selecciónalo'
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          aria-label="Seleccionar documento para adjuntar"
          className="max-w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-red-600 file:to-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-sm hover:file:from-red-700 hover:file:to-orange-600"
        />
      </div>
      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:from-red-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Subiendo…
          </span>
        ) : (
          'Subir archivo'
        )}
      </button>
    </form>
  );
}

export default FileUpload;