import express from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { upload, outputsPath } from '../middleware/upload.js';
import { checkFileSecurity } from '../middleware/fileSecurity.js';
import { recordConversion } from '../utils/stats.js';

const router = express.Router();

// POST /api/image/convert
router.post('/convert', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { format = 'jpeg' } = req.body;
  const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'gif', 'avif'];
  const outputFormat = format === 'jpg' ? 'jpeg' : format;

  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ error: `Unsupported format: ${format}` });
  }

  const outputExt = format === 'jpeg' ? 'jpg' : format;
  const outputFilename = `${uuidv4()}.${outputExt}`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    await sharp(req.file.path)
      .toFormat(outputFormat)
      .toFile(outputPath);

    // Clean up input file
    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    recordConversion('image_convert');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      format: outputExt,
    });
  } catch (err) {
    console.error('Image convert error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/image/resize
router.post('/resize', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const {
    width,
    height,
    percentage,
    maintainAspect = 'true',
    format,
  } = req.body;

  const outputExt = format || path.extname(req.file.originalname).replace('.', '') || 'jpg';
  const sharpFormat = outputExt === 'jpg' ? 'jpeg' : outputExt;
  const outputFilename = `${uuidv4()}.${outputExt}`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    let image = sharp(req.file.path);
    const metadata = await image.metadata();

    let targetWidth, targetHeight;

    if (percentage) {
      const pct = parseFloat(percentage) / 100;
      targetWidth = Math.round(metadata.width * pct);
      targetHeight = Math.round(metadata.height * pct);
    } else {
      targetWidth = width ? parseInt(width) : undefined;
      targetHeight = height ? parseInt(height) : undefined;
    }

    const resizeOptions = {
      width: targetWidth,
      height: targetHeight,
      fit: maintainAspect === 'true' ? 'inside' : 'fill',
      withoutEnlargement: false,
    };

    await image.resize(resizeOptions).toFormat(sharpFormat).toFile(outputPath);

    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    const outMeta = await sharp(outputPath).metadata();

    recordConversion('image_resize');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      width: outMeta.width,
      height: outMeta.height,
    });
  } catch (err) {
    console.error('Image resize error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Resize failed: ${err.message}` });
  }
});

// POST /api/image/compress
router.post('/compress', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { quality = '80' } = req.body;
  const q = Math.max(1, Math.min(100, parseInt(quality)));

  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  const outputExt = ext === 'jpg' ? 'jpeg' : ext;
  const fileExt = ext === 'jpeg' ? 'jpg' : ext;
  const outputFilename = `${uuidv4()}.${fileExt}`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    let image = sharp(req.file.path);

    if (outputExt === 'jpeg' || outputExt === 'jpg') {
      image = image.jpeg({ quality: q, mozjpeg: true });
    } else if (outputExt === 'png') {
      const compressionLevel = Math.round((100 - q) / 11);
      image = image.png({ compressionLevel, adaptiveFiltering: true });
    } else if (outputExt === 'webp') {
      image = image.webp({ quality: q });
    } else if (outputExt === 'avif') {
      image = image.avif({ quality: q });
    } else {
      image = image.toFormat(outputExt === 'jpg' ? 'jpeg' : outputExt);
    }

    await image.toFile(outputPath);

    const inputStats = fs.statSync(req.file.path);
    fs.unlinkSync(req.file.path);
    const outputStats = fs.statSync(outputPath);

    recordConversion('image_compress');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      originalSize: inputStats.size,
      compressedSize: outputStats.size,
      savings: Math.round((1 - outputStats.size / inputStats.size) * 100),
    });
  } catch (err) {
    console.error('Image compress error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Compression failed: ${err.message}` });
  }
});

// POST /api/image/to-pdf
router.post('/to-pdf', upload.array('files', 20), checkFileSecurity, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const outputFilename = `${uuidv4()}.pdf`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      const imageBuffer = fs.readFileSync(file.path);
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

      // Convert to PNG or JPEG using sharp for embed
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();
      const embeddedImage = await pdfDoc.embedPng(pngBuffer);

      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });

      fs.unlinkSync(file.path);
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    const stats = fs.statSync(outputPath);
    recordConversion('image_to_pdf');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      pages: req.files.length,
    });
  } catch (err) {
    console.error('Image to PDF error:', err);
    for (const file of req.files) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/image/crop
router.post('/crop', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { left = '0', top = '0', width, height } = req.body;

  if (!width || !height) {
    return res.status(400).json({ error: 'Width and height are required' });
  }

  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'jpg';
  const sharpFormat = ext === 'jpg' ? 'jpeg' : ext;
  const outputFilename = `${uuidv4()}.${ext}`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    await sharp(req.file.path)
      .extract({
        left: parseInt(left),
        top: parseInt(top),
        width: parseInt(width),
        height: parseInt(height),
      })
      .toFormat(sharpFormat)
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    const meta = await sharp(outputPath).metadata();

    recordConversion('image_crop');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      width: meta.width,
      height: meta.height,
    });
  } catch (err) {
    console.error('Image crop error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Crop failed: ${err.message}` });
  }
});

// POST /api/image/remove-bg
router.post('/remove-bg', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const outputFilename = `${uuidv4()}.png`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    const { removeBackground } = await import('@imgly/background-removal-node');
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkgDir = path.dirname(require.resolve('@imgly/background-removal-node/package.json'));
    const publicPath = `file://${pkgDir}/dist/`;

    const resultBlob = await removeBackground(req.file.path, { publicPath, model: 'small' });
    const arrayBuffer = await resultBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);

    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    const meta = await sharp(outputPath).metadata();

    recordConversion('image_bg_remove');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      width: meta.width,
      height: meta.height,
    });
  } catch (err) {
    console.error('BG remove error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Background removal failed: ${err.message}` });
  }
});

export default router;
