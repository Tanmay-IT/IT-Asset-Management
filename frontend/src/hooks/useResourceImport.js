import { useState } from 'react';
import { api } from '../lib/api';

export function useResourceImport(importUrl) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  async function uploadFile(file) {
    setIsUploading(true);
    setError(null);
    setPreview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`${importUrl}/preview`, formData);
      setPreview(data);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function confirmImport(rows, extra = {}) {
    setIsImporting(true);
    try {
      const { data } = await api.post(`${importUrl}/confirm`, { rows, ...extra });
      return data;
    } finally {
      setIsImporting(false);
    }
  }

  return { isUploading, isImporting, preview, error, uploadFile, confirmImport };
}
