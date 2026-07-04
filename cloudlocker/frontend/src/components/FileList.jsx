import { useState } from 'react';
import client from '../api/client';

export default function FileList({ files, onDeleted }) {
  const [busyId, setBusyId] = useState(null);

  async function handleDownload(id) {
    try {
      const { data } = await client.get(`/files/download-url/${id}`);
      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      alert('Could not get download link: ' + (err.response?.data?.error || err.message));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await client.delete(`/files/${id}`);
      onDeleted?.();
    } catch (err) {
      alert('Could not delete file: ' + (err.response?.data?.error || err.message));
    } finally {
      setBusyId(null);
    }
  }

  if (files.length === 0) {
    return <p>No files yet. Upload one above.</p>;
  }

  return (
    <ul className="file-list">
      {files.map((f) => (
        <li key={f.id} className="file-item">
          <span>{f.filename}</span>
          <span className="file-actions">
            <button onClick={() => handleDownload(f.id)}>Download</button>
            <button
              className="danger"
              onClick={() => handleDelete(f.id)}
              disabled={busyId === f.id}
            >
              {busyId === f.id ? 'Deleting...' : 'Delete'}
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
