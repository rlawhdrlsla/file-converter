/**
 * stats.js
 * 파일 변환 통계를 JSON 파일에 저장/조회하는 유틸
 * 별도 DB 없이 서버 로컬에 stats.json으로 관리
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATS_FILE = path.join(__dirname, '..', 'stats.json');

const TOOL_LABELS = {
  image_convert:  '이미지 변환',
  image_resize:   '이미지 리사이즈',
  image_compress: '이미지 압축',
  image_crop:     '이미지 자르기',
  image_to_pdf:   '이미지 → PDF',
  pdf_merge:      'PDF 합치기',
  pdf_split:      'PDF 분리',
  pdf_compress:   'PDF 압축',
  csv_to_json:    'CSV → JSON',
  json_to_csv:    'JSON → CSV',
  csv_to_xlsx:    'CSV → XLSX',
  xlsx_to_csv:    'XLSX → CSV',
  json_to_xml:    'JSON → XML',
  zip_create:     'ZIP 만들기',
  zip_extract:    'ZIP 압축해제',
};

function loadStats() {
  if (!fs.existsSync(STATS_FILE)) {
    return createEmpty();
  }
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
  } catch {
    return createEmpty();
  }
}

function createEmpty() {
  const byTool = {};
  for (const key of Object.keys(TOOL_LABELS)) {
    byTool[key] = 0;
  }
  return { total: 0, byTool, daily: {}, visitors: { total: 0, daily: {} } };
}

function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
}

/**
 * 변환 완료 시 호출 — toolKey는 TOOL_LABELS의 key
 */
export function recordConversion(toolKey) {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  stats.total = (stats.total || 0) + 1;
  stats.byTool[toolKey] = (stats.byTool[toolKey] || 0) + 1;

  if (!stats.daily[today]) {
    stats.daily[today] = { total: 0, byTool: {} };
  }
  stats.daily[today].total = (stats.daily[today].total || 0) + 1;
  stats.daily[today].byTool[toolKey] = (stats.daily[today].byTool[toolKey] || 0) + 1;

  // 90일 이전 데이터 정리
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  for (const date of Object.keys(stats.daily)) {
    if (new Date(date) < cutoff) delete stats.daily[date];
  }

  saveStats(stats);
}

/**
 * 방문자 기록 — IP를 해시해서 하루 1회만 카운트
 */
export function recordVisit(ip) {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);

  if (!stats.visitors) stats.visitors = { total: 0, daily: {} };
  if (!stats.visitors.daily[today]) stats.visitors.daily[today] = { count: 0, ips: [] };

  const hash = crypto.createHash('sha256').update(ip || 'unknown').digest('hex').slice(0, 16);
  if (!stats.visitors.daily[today].ips.includes(hash)) {
    stats.visitors.daily[today].ips.push(hash);
    stats.visitors.daily[today].count++;
    stats.visitors.total = (stats.visitors.total || 0) + 1;
  }

  // 90일 이전 데이터 정리
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  for (const date of Object.keys(stats.visitors.daily)) {
    if (new Date(date) < cutoff) delete stats.visitors.daily[date];
  }

  saveStats(stats);
}

/**
 * 통계 조회 — 지난 N일치 daily 포함
 */
export function getStats(days = 30) {
  const stats = loadStats();

  // 지난 N일 날짜 배열 생성
  const dailySeries = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailySeries.push({
      date: key,
      total: stats.daily[key]?.total || 0,
      visitors: stats.visitors?.daily[key]?.count || 0,
    });
  }

  // byTool에 label 붙여서 반환
  const byToolWithLabel = Object.entries(stats.byTool)
    .map(([key, count]) => ({ key, label: TOOL_LABELS[key] || key, count }))
    .sort((a, b) => b.count - a.count);

  // 오늘 통계
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = stats.daily[today] || { total: 0, byTool: {} };
  const todayVisitors = stats.visitors?.daily[today]?.count || 0;

  return {
    total: stats.total || 0,
    todayTotal: todayStats.total || 0,
    byTool: byToolWithLabel,
    daily: dailySeries,
    visitorsTotal: stats.visitors?.total || 0,
    todayVisitors,
  };
}
