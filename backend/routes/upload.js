const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const speechToTextService = require('../services/speechToText');
const actionExtractor = require('../services/actionExtractor');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow text files and audio files
  const allowedMimes = [
    'text/plain',
    'text/txt',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/ogg',
    'audio/m4a',
    'application/octet-stream' // For some audio files
  ];

  const allowedExts = ['.txt', '.mp3', '.wav', '.flac', '.ogg', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a text file (.txt) or audio file (.mp3, .wav, .flac, .ogg, .m4a)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * POST /api/upload
 * Upload and process a transcript file (text or audio)
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let transcriptText = '';

    // Check if it's an audio file
    const isAudioFile = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'].includes(fileExt);

    if (isAudioFile) {
      // Convert audio to text
      if (!speechToTextService.isServiceAvailable()) {
        // Clean up uploaded file
        await fs.remove(filePath);
        return res.status(503).json({
          error: 'Audio-to-text conversion is not available. Please set up AssemblyAI API key (ASSEMBLYAI_API_KEY).'
        });
      }

      try {
        transcriptText = await speechToTextService.transcribeAudio(filePath);
      } catch (error) {
        // Clean up uploaded file
        await fs.remove(filePath);
        return res.status(500).json({
          error: `Failed to transcribe audio: ${error.message}`
        });
      }
    } else {
      // Read text file
      transcriptText = await fs.readFile(filePath, 'utf-8');
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      await fs.remove(filePath);
      return res.status(400).json({ error: 'File is empty or could not be processed' });
    }

    // Extract actions from transcript
    const actions = actionExtractor.extractActionsEnhanced(transcriptText);

    // Clean up uploaded file after processing
    await fs.remove(filePath);

    res.json({
      success: true,
      transcript: transcriptText,
      actions: actions,
      actionCount: actions.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

