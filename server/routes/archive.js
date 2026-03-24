import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import unzipper from 'unzipper';
import { upload, outputsPath } from '../middleware/upload.js';
import { checkFileSecurity } from '../middleware/fileSecurity.js';
import { recordConversion } from '../utils/stats.js';

const router = express.Router();

// POST /api/archive/create-zip
router.post('/create-zip', upload.array('files', 50), checkFileSecurity, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const outputFilename = `${uuidv4()}.zip`;
  const outputPath = path.join(outputsPath, outputFilename);

  try {
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);

      for (const file of req.files) {
        archive.file(file.path, { name: file.originalname });
      }

      archive.finalize();
    });

    for (const file of req.files) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const stats = fs.statSync(outputPath);
    recordConversion('zip_create');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      fileCount: req.files.length,
    });
  } catch (err) {
    console.error('ZIP create error:', err);
    for (const file of req.files) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    res.status(500).json({ error: `ZIP creation failed: ${err.message}` });
  }
});

// ZIP 보안 상수
const ZIP_MAX_UNCOMPRESSED = 500 * 1024 * 1024; // 압축 해제 후 최대 500MB
const ZIP_MAX_RATIO = 100;                        // 최대 압축률 100:1 (zip bomb 감지)
const ZIP_MAX_FILES = 500;                        // ZIP 내 최대 파일 수

// POST /api/archive/extract-zip
router.post('/extract-zip', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const compressedSize = req.file.size;
  const extractDir = path.join(outputsPath, uuidv4());
  fs.mkdirSync(extractDir, { recursive: true });

  try {
    const extractedFiles = [];
    let totalUncompressed = 0;
    let fileCount = 0;
    let abortReason = null;

    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (abortReason) { entry.autodrain(); return; }

        const fileName = entry.path;
        const type = entry.type;
        const uncompressedSize = entry.vars.uncompressedSize || 0;

        // ZIP Bomb 검사 1: 파일 수 초과
        if (type === 'File') {
          fileCount++;
          if (fileCount > ZIP_MAX_FILES) {
            abortReason = `ZIP 내 파일이 너무 많습니다. (최대 ${ZIP_MAX_FILES}개)`;
            entry.autodrain(); return;
          }

          // ZIP Bomb 검사 2: 개별 파일 압축률 (압축 크기 대비)
          const entryCompressedSize = entry.vars.compressedSize || 1;
          if (uncompressedSize > 0 && uncompressedSize / entryCompressedSize > ZIP_MAX_RATIO) {
            abortReason = 'ZIP Bomb 의심 파일이 감지되었습니다.';
            entry.autodrain(); return;
          }

          // ZIP Bomb 검사 3: 총 압축 해제 크기
          totalUncompressed += uncompressedSize;
          if (totalUncompressed > ZIP_MAX_UNCOMPRESSED) {
            abortReason = `압축 해제 크기가 너무 큽니다. (최대 ${ZIP_MAX_UNCOMPRESSED / 1024 / 1024}MB)`;
            entry.autodrain(); return;
          }

          // Path Traversal 방어: 파일명에서 경로 성분 제거 + 안전한 경로 검증
          const safeName = path.basename(fileName).replace(/[<>:"|?*\x00-\x1f]/g, '_');
          if (!safeName || safeName === '.' || safeName === '..') {
            entry.autodrain(); return;
          }
          const outputFilePath = path.join(extractDir, safeName);
          // 절대 경로가 extractDir 밖으로 벗어나는지 확인
          if (!outputFilePath.startsWith(extractDir + path.sep) && outputFilePath !== extractDir) {
            entry.autodrain(); return;
          }

          extractedFiles.push({ name: fileName, size: uncompressedSize });
          entry.pipe(fs.createWriteStream(outputFilePath));
        } else {
          entry.autodrain();
        }
      })
      .promise();

    if (abortReason) {
      fs.unlinkSync(req.file.path);
      fs.rmSync(extractDir, { recursive: true, force: true });
      return res.status(400).json({ error: `보안 검사 실패: ${abortReason}` });
    }

    fs.unlinkSync(req.file.path);

    // Create a ZIP of extracted files for download
    const outputFilename = `${uuidv4()}_extracted.zip`;
    const outputPath = path.join(outputsPath, outputFilename);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(extractDir, false);
      archive.finalize();
    });

    fs.rmSync(extractDir, { recursive: true, force: true });

    const stats = fs.statSync(outputPath);
    recordConversion('zip_extract');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      extractedFiles: extractedFiles.slice(0, 50),
      fileCount: extractedFiles.length,
    });
  } catch (err) {
    console.error('ZIP extract error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    res.status(500).json({ error: `Extraction failed: ${err.message}` });
  }
});

export default router;
