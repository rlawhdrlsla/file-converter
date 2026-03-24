import express from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { upload, outputsPath } from '../middleware/upload.js';
import { checkFileSecurity } from '../middleware/fileSecurity.js';
import { recordConversion } from '../utils/stats.js';

const router = express.Router();

// POST /api/pdf/merge
router.post('/merge', upload.array('files', 20), checkFileSecurity, async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
  }

  const outputFilename = `${uuidv4()}.pdf`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
      fs.unlinkSync(file.path);
    }

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    const stats = fs.statSync(outputPath);
    recordConversion('pdf_merge');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      pages: mergedPdf.getPageCount(),
    });
  } catch (err) {
    console.error('PDF merge error:', err);
    for (const file of req.files) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: `Merge failed: ${err.message}` });
  }
});

// POST /api/pdf/split
router.post('/split', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { startPage, endPage } = req.body;

  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    const start = startPage ? Math.max(0, parseInt(startPage) - 1) : 0;
    const end = endPage ? Math.min(totalPages - 1, parseInt(endPage) - 1) : totalPages - 1;

    if (start > end) {
      return res.status(400).json({ error: 'Start page must be less than or equal to end page' });
    }

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    const outputFilename = `${uuidv4()}.pdf`;
    const outputPath = path.join(outputsPath, outputFilename);
    fs.writeFileSync(outputPath, newPdfBytes);

    fs.unlinkSync(req.file.path);

    const stats = fs.statSync(outputPath);
    recordConversion('pdf_split');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      pages: newPdf.getPageCount(),
      totalOriginalPages: totalPages,
    });
  } catch (err) {
    console.error('PDF split error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Split failed: ${err.message}` });
  }
});

// POST /api/pdf/compress
// Note: pdf-lib doesn't do true compression, but we re-save which can reduce size slightly
// A production implementation would use Ghostscript or similar
router.post('/compress', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const outputFilename = `${uuidv4()}.pdf`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Re-save with object compression enabled
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    fs.writeFileSync(outputPath, compressedBytes);

    const inputStats = fs.statSync(req.file.path);
    fs.unlinkSync(req.file.path);
    const outputStats = fs.statSync(outputPath);

    recordConversion('pdf_compress');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      originalSize: inputStats.size,
      compressedSize: outputStats.size,
      savings: Math.max(0, Math.round((1 - outputStats.size / inputStats.size) * 100)),
      pages: pdfDoc.getPageCount(),
    });
  } catch (err) {
    console.error('PDF compress error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Compression failed: ${err.message}` });
  }
});

// POST /api/pdf/info
router.post('/info', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    const info = {
      pages: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || null,
      author: pdfDoc.getAuthor() || null,
      creator: pdfDoc.getCreator() || null,
      creationDate: pdfDoc.getCreationDate() || null,
    };

    fs.unlinkSync(req.file.path);
    res.json({ success: true, info });
  } catch (err) {
    console.error('PDF info error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Failed to read PDF info: ${err.message}` });
  }
});

export default router;
