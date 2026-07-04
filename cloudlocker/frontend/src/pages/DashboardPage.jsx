import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import ProfileMenu from '../components/ProfileMenu';

export default function DashboardPage() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      const { data } = await client.get('/files');
      setFiles(data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <h1>CloudLocker</h1>
        <ProfileMenu />
      </div>

      <h2>Upload a File</h2>
      <UploadForm onUploaded={fetchFiles} />

      <h2>Your Files</h2>
      <FileList files={files} onDeleted={fetchFiles} />
    </div>
  );
}

