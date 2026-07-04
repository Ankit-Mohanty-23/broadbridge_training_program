const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getUploadUrl, listMyFiles, getDownloadUrl, removeFile } = require('../controllers/fileController');

const router = express.Router();

// All file routes require a valid login
router.use(authMiddleware);

router.post('/upload-url', getUploadUrl);
router.get('/', listMyFiles);
router.get('/download-url/:id', getDownloadUrl);
router.delete('/:id', removeFile);

module.exports = router;
