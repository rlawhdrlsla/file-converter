/**
 * admin.js
 * 관리자 전용 API
 * 모든 엔드포인트는 X-Admin-Key 헤더로 인증
 */

import express from 'express';
import { getStats } from '../utils/stats.js';

const router = express.Router();

// 관리자 인증 미들웨어
function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: 'Admin access not configured. Set ADMIN_KEY in .env' });
  }
  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== adminKey) {
    return res.status(401).json({ error: '인증 실패: 관리자 키가 올바르지 않습니다.' });
  }
  next();
}

// POST /api/admin/verify — 키 유효성 확인
router.post('/verify', adminAuth, (req, res) => {
  res.json({ ok: true });
});

// GET /api/admin/stats — 변환 통계
router.get('/stats', adminAuth, (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const stats = getStats(days);
  res.json(stats);
});

export default router;
