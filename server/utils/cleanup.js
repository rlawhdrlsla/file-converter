import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputsDir = path.join(__dirname, '..', 'outputs');

const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  const now = Date.now();
  let cleaned = 0;

  for (const file of files) {
    if (file === '.gitkeep') continue;
    const filePath = path.join(dirPath, file);
    try {
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      if (age > MAX_AGE_MS) {
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        cleaned++;
      }
    } catch (err) {
      console.error(`Cleanup error for ${filePath}:`, err.message);
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} file(s) from ${path.basename(dirPath)}`);
  }
}

export function cleanupOldFiles() {
  cleanDirectory(uploadsDir);
  cleanDirectory(outputsDir);
}

export function startCleanup() {
  // Run immediately on start
  cleanupOldFiles();
  // Then every 30 minutes
  setInterval(cleanupOldFiles, 30 * 60 * 1000);
  console.log('File cleanup scheduler started (every 30 minutes)');
}
