import { useState } from 'react';
import client from '../api/client';

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setStatus('Requesting upload URL...');
    try {
      const { data } = await client.post('/files/upload-url', {
        filename: file.name,
      });

      setStatus('Uploading to S3...');
      // Direct browser -> S3 upload using the presigned URL.
      // The file never passes through our own server, keeping it fast and cheap.
      await fetch(data.uploadUrl, { method: 'PUT', body: file });

      setStatus('Upload complete!');
      setFile(null);
      e.target.reset();
      onUploaded?.();
    } catch (err) {
      setStatus('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
      <button type="submit">Upload</button>
      {status && <p>{status}</p>}
    </form>
  );
}
