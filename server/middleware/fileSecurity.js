/**
 * fileSecurity.js
 * 업로드된 파일의 위험성을 검사하는 미들웨어
 *
 * 3단계 검사:
 * 1. 이중 확장자 차단 (e.g. photo.jpg.exe)
 * 2. 위험 확장자 차단 (exe, bat, sh, ps1 등 실행 가능 파일)
 * 3. Magic Bytes 검사 (실제 파일 내용이 확장자와 일치하는지 확인)
 */

import fs from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';

// 절대 허용하지 않는 위험 확장자 목록
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.scr',
  '.pif', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  '.ps1', '.ps2', '.psc1', '.psc2',
  '.sh', '.bash', '.zsh', '.csh', '.fish',
  '.app', '.deb', '.rpm', '.dmg', '.pkg',
  '.jar', '.class', '.pyc',
  '.htaccess', '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl',
  '.reg', '.inf', '.ini',
  // SVG: Sharp의 librsvg가 외부 URL 요청을 할 수 있어 SSRF 위험
  '.svg', '.svgz',
]);

// 파일명 보안 검사 — null byte, 경로 조작, 길이
function checkFilename(originalName) {
  // Null byte 인젝션 (../etc/passwd%00.jpg 등)
  if (originalName.includes('\0')) {
    return 'null byte가 포함된 파일명은 허용되지 않습니다.';
  }
  // 경로 순회 패턴 (../, ..\, 절대 경로)
  if (/(?:^|[\\/])\.\.(?:[\\/]|$)/.test(originalName)) {
    return '경로 순회 패턴이 포함된 파일명은 허용되지 않습니다.';
  }
  // 파일명 길이 제한 (255자 초과 시 파일시스템 오류 가능)
  const basename = path.basename(originalName);
  if (basename.length > 255) {
    return '파일명이 너무 깁니다. (최대 255자)';
  }
  // 슬래시/백슬래시로만 구성된 파일명
  if (!basename || basename === '.' || basename === '..') {
    return '유효하지 않은 파일명입니다.';
  }
  return null; // 통과
}

// 파일 유형별 허용 MIME 목록
// 이 목록에 없는 MIME 타입이 감지되면 업로드를 거부
const ALLOWED_MIMES_BY_CATEGORY = {
  image: new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/tiff', 'image/avif', 'image/heic', 'image/heif',
  ]),
  pdf: new Set([
    'application/pdf',
  ]),
  data: new Set([
    'text/plain', 'text/csv', 'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/xml', 'text/xml',
  ]),
  archive: new Set([
    'application/zip', 'application/x-zip-compressed',
    'application/x-zip', 'application/octet-stream',
  ]),
};

// 모든 허용 MIME 타입 합집합
const ALL_ALLOWED_MIMES = new Set([
  ...ALLOWED_MIMES_BY_CATEGORY.image,
  ...ALLOWED_MIMES_BY_CATEGORY.pdf,
  ...ALLOWED_MIMES_BY_CATEGORY.data,
  ...ALLOWED_MIMES_BY_CATEGORY.archive,
]);

/**
 * 업로드된 파일을 보안 검사하는 미들웨어
 * multer 이후에 사용 (req.file 또는 req.files 필요)
 */
export async function checkFileSecurity(req, res, next) {
  const files = req.files
    ? Object.values(req.files).flat()
    : req.file
    ? [req.file]
    : [];

  if (files.length === 0) return next();

  try {
    for (const file of files) {
      const originalName = file.originalname || '';
      const filePath = file.path;

      // 0단계: 파일명 자체 유효성 검사
      const nameError = checkFilename(originalName);
      if (nameError) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: `보안 검사 실패: ${nameError}` });
      }

      // 1단계: 이중 확장자 차단 (e.g., image.jpg.exe)
      const nameParts = originalName.split('.');
      if (nameParts.length > 2) {
        // 두 번째 확장자부터 위험 확장자인지 확인
        for (let i = 1; i < nameParts.length - 1; i++) {
          if (BLOCKED_EXTENSIONS.has(`.${nameParts[i].toLowerCase()}`)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: '보안 검사 실패: 허용되지 않는 파일 형식입니다. (이중 확장자)',
            });
          }
        }
      }

      // 2단계: 위험 확장자 차단
      const ext = path.extname(originalName).toLowerCase();
      if (BLOCKED_EXTENSIONS.has(ext)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: `보안 검사 실패: "${ext}" 파일은 업로드할 수 없습니다.`,
        });
      }

      // 3단계: Magic Bytes 검사 (실제 파일 내용 확인)
      // CSV, JSON, XML은 텍스트 파일이라 file-type이 감지 못하므로 건너뜀
      const textExts = new Set(['.csv', '.json', '.xml', '.txt']);
      if (!textExts.has(ext)) {
        const detected = await fileTypeFromFile(filePath);

        if (detected) {
          // 감지된 MIME이 허용 목록에 없으면 차단
          if (!ALL_ALLOWED_MIMES.has(detected.mime)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: `보안 검사 실패: 실제 파일 형식(${detected.mime})이 허용되지 않습니다.`,
            });
          }

          // 확장자와 실제 내용이 완전히 다를 때 차단
          // (예: .jpg 확장자인데 실제 내용이 ZIP인 경우)
          const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.tif', '.avif', '.heic', '.heif']);
          const pdfExts = new Set(['.pdf']);
          const archiveExts = new Set(['.zip']);

          if (imageExts.has(ext) && !detected.mime.startsWith('image/')) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: '보안 검사 실패: 파일 내용이 이미지가 아닙니다.',
            });
          }
          if (pdfExts.has(ext) && detected.mime !== 'application/pdf') {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: '보안 검사 실패: 파일 내용이 PDF가 아닙니다.',
            });
          }
          if (archiveExts.has(ext) && !['application/zip', 'application/x-zip-compressed', 'application/x-zip'].includes(detected.mime)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: '보안 검사 실패: 파일 내용이 ZIP이 아닙니다.',
            });
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error('File security check error:', err);
    // 검사 중 오류가 나도 파일은 삭제
    for (const file of files) {
      try { fs.unlinkSync(file.path); } catch {}
    }
    return res.status(500).json({ error: '파일 보안 검사 중 오류가 발생했습니다.' });
  }
}
