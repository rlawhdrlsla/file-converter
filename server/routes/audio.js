import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { upload, outputsPath } from '../middleware/upload.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

// Check if ffmpeg is available
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

// POST /api/audio/convert
router.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { format = 'mp3', bitrate = '192' } = req.body;
  const allowedFormats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];

  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ error: `Unsupported format: ${format}` });
  }

  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(503).json({
      error: 'FFmpeg is not installed on this server.',
      message: 'Audio conversion requires FFmpeg. Please install it: https://ffmpeg.org/download.html',
      installHint: 'brew install ffmpeg (macOS) or sudo apt install ffmpeg (Ubuntu)',
    });
  }

  const outputFilename = `${uuidv4()}.${format}`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    let ffmpegArgs = `-i "${req.file.path}"`;

    if (format === 'mp3') {
      ffmpegArgs += ` -codec:a libmp3lame -b:a ${bitrate}k`;
    } else if (format === 'aac') {
      ffmpegArgs += ` -codec:a aac -b:a ${bitrate}k`;
    } else if (format === 'ogg') {
      ffmpegArgs += ` -codec:a libvorbis -q:a 4`;
    } else if (format === 'flac') {
      ffmpegArgs += ` -codec:a flac`;
    } else if (format === 'wav') {
      ffmpegArgs += ` -codec:a pcm_s16le`;
    } else if (format === 'm4a') {
      ffmpegArgs += ` -codec:a aac -b:a ${bitrate}k`;
    }

    ffmpegArgs += ` -y "${outputPath}"`;
    await execAsync(`ffmpeg ${ffmpegArgs}`);

    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      format,
    });
  } catch (err) {
    console.error('Audio convert error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

export default router;
