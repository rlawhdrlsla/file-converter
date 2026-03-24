import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Shield, TrendingUp, Activity, RefreshCw, LogOut, Lock, Users } from 'lucide-react';

const API = '/api/admin';

// ── 로그인 화면 ──────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/verify`, {
        method: 'POST',
        headers: { 'X-Admin-Key': key },
      });
      if (res.ok) {
        sessionStorage.setItem('adminKey', key);
        onLogin(key);
      } else {
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="card p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gray-800 dark:bg-gray-700 flex items-center justify-center mb-3">
              <Lock size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">관리자 로그인</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">FileConvert 관리자 전용</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="관리자 비밀번호"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600
                bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white
                font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── 숫자 포맷 ─────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color = 'bg-blue-600' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={17} className="text-white" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value?.toLocaleString() ?? '—'}
      </div>
    </div>
  );
}

// ── 대시보드 ─────────────────────────────────────────────────────
function Dashboard({ adminKey, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stats?days=${days}`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [adminKey, days, onLogout]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // 도구별 차트 데이터 — 상위 8개만
  const toolChartData = stats?.byTool?.slice(0, 8).map(t => ({
    name: t.label,
    횟수: t.count,
  })) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      {/* 헤더 */}
      <div className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-gray-700 dark:text-gray-300" />
            <span className="font-bold text-gray-900 dark:text-white">FileConvert 관리자</span>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-700
                text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              새로고침
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-700
                text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
            >
              <LogOut size={13} />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="전체 방문자" value={stats?.visitorsTotal} icon={Users} color="bg-purple-600" />
          <StatCard title="오늘 방문자" value={stats?.todayVisitors} icon={Users} color="bg-pink-500" />
          <StatCard title="전체 변환 횟수" value={stats?.total} icon={Activity} color="bg-blue-600" />
          <StatCard title="오늘 변환 횟수" value={stats?.todayTotal} icon={TrendingUp} color="bg-green-600" />
        </div>

        {/* 기간 선택 + 일별 차트 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">일별 방문자 / 변환 추이</h2>
            <div className="flex gap-1">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                    ${days === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  {d}일
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              불러오는 중...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.daily ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip labelFormatter={l => `날짜: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="visitors" name="방문자" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="변환" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 도구별 변환 횟수 */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">도구별 변환 횟수 (상위 8개)</h2>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              불러오는 중...
            </div>
          ) : toolChartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              아직 변환 기록이 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={toolChartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => [v, '변환 횟수']} />
                <Bar dataKey="횟수" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 전체 도구 목록 표 */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">전체 도구 변환 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">도구</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">변환 횟수</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">비율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {(stats?.byTool ?? []).map((tool, i) => (
                  <tr key={tool.key} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-3 text-gray-400 dark:text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                      {tool.label}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 dark:text-white font-mono">
                      {tool.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500 dark:text-gray-400">
                      {stats.total > 0
                        ? `${((tool.count / stats.total) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function Admin() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem('adminKey') || null
  );

  function handleLogin(key) {
    setAdminKey(key);
  }

  function handleLogout() {
    sessionStorage.removeItem('adminKey');
    setAdminKey(null);
  }

  if (!adminKey) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard adminKey={adminKey} onLogout={handleLogout} />;
}
