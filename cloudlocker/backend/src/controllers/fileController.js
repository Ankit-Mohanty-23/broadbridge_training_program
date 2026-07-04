const crypto = require('crypto');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/awsClients');
const { createFile, getFileById, getFilesByOwner, deleteFile } = require('../models/fileModel');

const BUCKET = process.env.S3_BUCKET;
const URL_EXPIRY_SECONDS = 300; // 5 minutes

// Step 1 of upload flow: client asks us for a presigned PUT url,
// we also record the metadata row up front.
async function getUploadUrl(req, res) {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'filename is required' });
    }

    const id = crypto.randomUUID();
    const s3Key = `${id}-${filename}`;

    const command = new PutObjectCommand({ Bucket: BUCKET, Key: s3Key });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: URL_EXPIRY_SECONDS });

    const file = await createFile({
      id,
      filename,
      s3Key,
      uploader: req.user.username,
      createdAt: Date.now(),
    });

    return res.json({ uploadUrl, file });
  } catch (err) {
    console.error('getUploadUrl error:', err);
    return res.status(500).json({ error: 'Could not create upload URL' });
  }
}

// List the current user's own files only.
async function listMyFiles(req, res) {
  try {
    const items = await getFilesByOwner(req.user.username);
    items.sort((a, b) => b.createdAt - a.createdAt);
    return res.json(items);
  } catch (err) {
    console.error('listMyFiles error:', err);
    return res.status(500).json({ error: 'Could not fetch files' });
  }
}

// Client asks for a presigned GET url for a specific file id.
async function getDownloadUrl(req, res) {
  try {
    const { id } = req.params;
    const file = await getFileById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.uploader !== req.user.username) {
      return res.status(403).json({ error: 'You do not have access to this file' });
    }

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: file.s3Key });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: URL_EXPIRY_SECONDS });

    return res.json({ downloadUrl, filename: file.filename });
  } catch (err) {
    console.error('getDownloadUrl error:', err);
    return res.status(500).json({ error: 'Could not create download URL' });
  }
}

// Deletes both the S3 object and its DynamoDB metadata row.
async function removeFile(req, res) {
  try {
    const { id } = req.params;
    const file = await getFileById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (file.uploader !== req.user.username) {
      return res.status(403).json({ error: 'You do not have access to this file' });
    }

    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: file.s3Key }));
    await deleteFile(id);

    return res.json({ ok: true });
  } catch (err) {
    console.error('removeFile error:', err);
    return res.status(500).json({ error: 'Could not delete file' });
  }
}

module.exports = { getUploadUrl, listMyFiles, getDownloadUrl, removeFile };
