import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import imageRoutes from './routes/image.js';
import pdfRoutes from './routes/pdf.js';
import audioRoutes from './routes/audio.js';
import videoRoutes from './routes/video.js';
import textRoutes from './routes/text.js';
import archiveRoutes from './routes/archive.js';
import adminRoutes from './routes/admin.js';
import { startCleanup } from './utils/cleanup.js';
import { recordVisit } from './utils/stats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// 보안 헤더 (XSS, Clickjacking, MIME 스니핑 방어)
app.use(helmet({
  contentSecurityPolicy: false, // React SPA와 충돌 방지
  crossOriginEmbedderPolicy: false,
}));

// CORS: dev 환경에서만 허용 (prod는 같은 origin이므로 불필요)
if (!isProd) {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
  }));
}

// 레이트 리미팅 — IP당 15분에 60회 업로드 제한 (DoS 방어)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 60,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 관리자 API — IP당 15분에 20회 제한 (브루트포스 방어)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '관리자 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from outputs directory (force download, not inline)
app.use('/outputs', express.static(path.join(__dirname, 'outputs'), {
  setHeaders(res, filePath) {
    const filename = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  },
}));

// API Routes (레이트 리미팅 적용)
app.use('/api/image', uploadLimiter, imageRoutes);
app.use('/api/pdf', uploadLimiter, pdfRoutes);
app.use('/api/audio', uploadLimiter, audioRoutes);
app.use('/api/video', uploadLimiter, videoRoutes);
app.use('/api/text', uploadLimiter, textRoutes);
app.use('/api/archive', uploadLimiter, archiveRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 방문자 기록 (공개 엔드포인트)
app.post('/api/visit', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
  recordVisit(ip);
  res.json({ ok: true });
});

// Production: React 빌드 파일 서빙
if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  // React Router SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: isProd ? undefined : err.stack,
  });
});

// 404 handler (dev only — prod는 위 SPA fallback이 처리)
if (!isProd) {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start file cleanup job (runs every 30 minutes)
  startCleanup();
});

export default app;
