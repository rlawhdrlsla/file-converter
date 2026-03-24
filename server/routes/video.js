import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { upload, outputsPath } from '../middleware/upload.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

const ffmpegNotAvailableResponse = (res) => {
  return res.status(503).json({
    error: 'FFmpeg is not installed on this server.',
    message: 'Video conversion requires FFmpeg. Please install it: https://ffmpeg.org/download.html',
    installHint: 'brew install ffmpeg (macOS) or sudo apt install ffmpeg (Ubuntu)',
  });
};

// POST /api/video/convert
router.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { format = 'mp4', quality = 'medium' } = req.body;
  const allowedFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'];

  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ error: `Unsupported format: ${format}` });
  }

  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return ffmpegNotAvailableResponse(res);
  }

  const outputFilename = `${uuidv4()}.${format}`;
  const outputPath = path.join(outputsPath, outputFilename);

  const crfMap = { high: '18', medium: '23', low: '28' };
  const crf = crfMap[quality] || '23';

  try {
    let command;
    if (format === 'webm') {
      command = `ffmpeg -i "${req.file.path}" -codec:v libvpx-vp9 -crf ${crf} -b:v 0 -codec:a libopus -y "${outputPath}"`;
    } else if (format === 'avi') {
      command = `ffmpeg -i "${req.file.path}" -codec:v mpeg4 -q:v 5 -codec:a mp3 -y "${outputPath}"`;
    } else {
      command = `ffmpeg -i "${req.file.path}" -codec:v libx264 -crf ${crf} -preset medium -codec:a aac -b:a 128k -y "${outputPath}"`;
    }

    await execAsync(command, { timeout: 300000 });
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
    console.error('Video convert error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/video/to-gif
router.post('/to-gif', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const {
    startTime = '0',
    duration = '5',
    fps = '10',
    width = '480',
  } = req.body;

  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return ffmpegNotAvailableResponse(res);
  }

  const outputFilename = `${uuidv4()}.gif`;
  const outputPath = path.join(outputsPath, outputFilename);
  const palettePath = path.join(outputsPath, `${uuidv4()}_palette.png`);

  try {
    // Generate palette for better quality GIF
    const paletteCmd = `ffmpeg -ss ${startTime} -t ${duration} -i "${req.file.path}" -vf "fps=${fps},scale=${width}:-1:flags=lanczos,palettegen" -y "${palettePath}"`;
    await execAsync(paletteCmd, { timeout: 120000 });

    const gifCmd = `ffmpeg -ss ${startTime} -t ${duration} -i "${req.file.path}" -i "${palettePath}" -filter_complex "fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse" -y "${outputPath}"`;
    await execAsync(gifCmd, { timeout: 120000 });

    fs.unlinkSync(req.file.path);
    if (fs.existsSync(palettePath)) fs.unlinkSync(palettePath);

    const stats = fs.statSync(outputPath);
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
    });
  } catch (err) {
    console.error('Video to GIF error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(palettePath)) fs.unlinkSync(palettePath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/video/compress
router.post('/compress', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { quality = 'medium' } = req.body;

  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return ffmpegNotAvailableResponse(res);
  }

  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'mp4';
  const outputFilename = `${uuidv4()}.${ext}`;
  const outputPath = path.join(outputsPath, outputFilename);

  const crfMap = { high: '20', medium: '28', low: '35' };
  const crf = crfMap[quality] || '28';

  try {
    const command = `ffmpeg -i "${req.file.path}" -codec:v libx264 -crf ${crf} -preset slow -codec:a aac -b:a 96k -y "${outputPath}"`;
    await execAsync(command, { timeout: 600000 });

    const inputStats = fs.statSync(req.file.path);
    fs.unlinkSync(req.file.path);
    const outputStats = fs.statSync(outputPath);

    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      originalSize: inputStats.size,
      compressedSize: outputStats.size,
      savings: Math.max(0, Math.round((1 - outputStats.size / inputStats.size) * 100)),
    });
  } catch (err) {
    console.error('Video compress error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: `Compression failed: ${err.message}` });
  }
});

export default router;
