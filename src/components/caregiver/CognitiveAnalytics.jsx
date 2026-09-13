import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  TrendingUp,
  Activity
} from 'lucide-react';
import { calculatePatientStatus, getPatientCognitiveScore } from '../../utils/patientStatusEngine';
import {
  COGNITIVE_DOMAINS,
  calculateDomainStats,
  calculateOverallPerformanceIndex,
  getPerformanceTrends,
  getDailyCognitiveResponse,
  generateAICognitiveSummary
} from '../../utils/cognitiveAnalyticsEngine';

export default function CognitiveAnalytics() {
  const { patientData, setActiveGame, setCaregiverTab } = useApp();
  const { cognitiveStats = {}, profile = {} } = patientData || {};
  const preferredName = profile?.preferredName || profile?.fullName || 'Patient';

  const history = cognitiveStats?.history || [];

  // Filter States
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | 'month'

  // Interactive Hover Tooltip States
  const [activeTrendPoint, setActiveTrendPoint] = useState(null);
  const [activeDailyBar, setActiveDailyBar] = useState(null);

  // Expandable "How is this calculated?"
  const [showExplanation, setShowExplanation] = useState(false);

  // Dynamic Engine Computations
  const domainStats = calculateDomainStats(history);
  const overallIndex = calculateOverallPerformanceIndex(domainStats, history);
  const trendPoints = getPerformanceTrends(history, selectedDomain, timeRange);
  const dailyResponse = getDailyCognitiveResponse(history, 7);
  const aiSummary = generateAICognitiveSummary(domainStats, history);

  const patientStatus = calculatePatientStatus(patientData);
  const currentScore = getPatientCognitiveScore(patientData);

  // Launch Game Helper
  const handleLaunchDomainTask = (domainId) => {
    if (!setActiveGame) return;
    const taskMap = {
      memory: 'memory-twin',
      recall: 'memory-basket',
      attention: 'odd-one-out',
      focus: 'pattern-memory'
    };
    setActiveGame(taskMap[domainId] || 'memory-twin');
  };

  // SVG Chart Geometry Constants
  const svgWidth = 660;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Build SVG Path Coordinates
  const getTrendCoords = () => {
    if (trendPoints.length === 0) return [];
    return trendPoints.map((pt, idx) => {
      const x = trendPoints.length === 1
        ? padLeft + plotWidth / 2
        : padLeft + (idx / (trendPoints.length - 1)) * plotWidth;
      const y = padTop + plotHeight - (pt.score / 100) * plotHeight;
      return { x, y, pt };
    });
  };

  const coords = getTrendCoords();

  const linePath = coords.length > 1
    ? coords.reduce((acc, curr, i, arr) => {
        if (i === 0) return `M ${curr.x},${curr.y}`;
        const prev = arr[i - 1];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
      }, '')
    : coords.length === 1
      ? `M ${padLeft},${coords[0].y} L ${svgWidth - padRight},${coords[0].y}`
      : '';

  const areaPath = coords.length > 1
    ? `${linePath} L ${coords[coords.length - 1].x},${padTop + plotHeight} L ${coords[0].x},${padTop + plotHeight} Z`
    : '';

  // Filtered Recent Activities
  const filteredActivities = selectedDomain === 'all'
    ? history
    : history.filter(h => (h.cognitiveDomain || h.domain || h.category || '').toLowerCase().includes(selectedDomain));

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      {/* ── HEADER ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            onClick={() => setCaregiverTab ? setCaregiverTab('overview') : window.history.back()}
            className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors touch-target flex-shrink-0"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-[#162832] tracking-tight">
              Cognitive Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Patient: <strong className="text-[#1E5E3A]">{preferredName}</strong>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500 font-medium pl-10 sm:pl-0">
          <span>Last updated: </span>
          <strong className="text-slate-700">{overallIndex.lastUpdated}</strong>
        </div>
      </div>

      {/* ── SECTION 1: OVERALL PERFORMANCE ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Overall Cognitive Score */}
          <div className="text-center sm:text-left sm:pr-4">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Overall Cognitive Score
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1E5E3A] font-serif">
                {overallIndex.sessionsAnalyzed > 0 ? `${overallIndex.score}%` : `${currentScore}%`}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${patientStatus.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${patientStatus.dotClass}`} />
                <span>{patientStatus.label}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Average across all active domains
            </span>
          </div>

          {/* Sessions Completed */}
          <div className="pt-3 sm:pt-0 sm:px-4 text-center sm:text-left">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Sessions Completed
            </span>
            <div className="mt-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#162832] font-serif">
                {overallIndex.sessionsCompleted}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              {overallIndex.sessionsCompleted > 0 ? 'Recorded activity sessions' : 'Awaiting first completed session'}
            </span>
          </div>

          {/* Latest Activity */}
          <div className="pt-3 sm:pt-0 sm:pl-4 text-center sm:text-left">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Latest Activity
            </span>
            <div className="mt-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-[#162832] truncate block">
                {overallIndex.latestActivityName || 'None'}
              </span>
            </div>
            <span className="text-[11px] text-[#1E5E3A] font-bold block mt-1">
              {overallIndex.latestActivityDate !== 'N/A' ? overallIndex.latestActivityDate : 'No activity logged yet'}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: COGNITIVE AREAS (4 SIMPLE CARDS) ── */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <h2 className="text-base sm:text-lg font-extrabold text-[#162832]">
            Cognitive Areas
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            4 Core Domains Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.values(domainStats).map(domain => (
            <div
              key={domain.id}
              className={`p-4 rounded-2xl sm:rounded-3xl bg-white border transition-all flex flex-col justify-between ${
                selectedDomain === domain.id ? 'border-2 border-[#1E5E3A] shadow-md' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{domain.icon}</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#162832]">
                      {domain.name}
                    </h3>
                  </div>
                  {domain.hasData && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${domain.statusBadge}`}>
                      {domain.status}
                    </span>
                  )}
                </div>

                {domain.hasData ? (
                  <div className="space-y-2 mt-2">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1E5E3A] font-serif">
                      {domain.score}%
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {domain.sessionsCount} {domain.sessionsCount === 1 ? 'session' : 'sessions'}
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${domain.barClass}`}
                        style={{ width: `${domain.score}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-600 block">
                      No recent data
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {domain.prompt}
                    </p>
                    <button
                      onClick={() => handleLaunchDomainTask(domain.id)}
                      className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E5E3A] text-white text-[10px] font-bold hover:bg-[#164E30] transition-colors touch-target"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Start Activity</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3 & 4: PERFORMANCE TREND & DOMAIN FILTERS ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Header with Title and Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#162832]">
              Performance Trend
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Performance score (%) plotted over historical dates
            </p>
          </div>

          {/* Time Filter Select */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-semibold">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#162832] rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#1E5E3A] cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Cognitive Domain Filter Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all touch-target ${
              selectedDomain === 'all'
                ? 'bg-[#1E5E3A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Overall
          </button>
          {['memory', 'recall', 'attention', 'focus'].map(dKey => {
            const cfg = COGNITIVE_DOMAINS[dKey];
            return (
              <button
                key={dKey}
                onClick={() => setSelectedDomain(dKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all touch-target flex items-center gap-1 ${
                  selectedDomain === dKey
                    ? 'bg-[#1E5E3A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Line Chart (SVG) */}
        {trendPoints.length > 0 ? (
          <div className="pt-2">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-56 select-none"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E5E3A" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1E5E3A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Guidelines: 100%, 80%, 60%, 40%, 20% */}
                {[100, 80, 60, 40, 20].map(val => {
                  const y = padTop + plotHeight - (val / 100) * plotHeight;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke={val === 80 ? '#C3E2CD' : '#E2E8F0'}
                        strokeWidth={val === 80 ? '1.5' : '1'}
                        strokeDasharray={val === 80 ? '4 3' : '2 2'}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-semibold"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Area Under Curve */}
                {areaPath && (
                  <path d={areaPath} fill="url(#trendGradient)" />
                )}

                {/* Primary Trend Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#1E5E3A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Individual Data Points */}
                {coords.map(({ x, y, pt }, idx) => {
                  const isHovered = activeTrendPoint?.id === pt.id;
                  return (
                    <g
                      key={pt.id || idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveTrendPoint(pt)}
                      onMouseLeave={() => setActiveTrendPoint(null)}
                      onClick={() => setActiveTrendPoint(pt)}
                    >
                      {isHovered && (
                        <circle
                          cx={x}
                          y={y}
                          r="8"
                          fill="#1E5E3A"
                          fillOpacity="0.25"
                        />
                      )}
                      <circle
                        cx={x}
                        y={y}
                        r={isHovered ? '6' : '4.5'}
                        fill={isHovered ? '#D98A1E' : '#1E5E3A'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* X-Axis Date Label */}
                      {pt.showLabel && (
                        <text
                          x={x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-500 font-semibold"
                        >
                          {pt.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Tooltip Card */}
            {activeTrendPoint && (
              <div className="mt-2 p-3 rounded-2xl bg-[#162832] text-white text-xs flex items-center justify-between gap-4 animate-in fade-in duration-150 shadow-md">
                <div>
                  <span className="font-extrabold text-amber-400 block text-xs">
                    {activeTrendPoint.gameName}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Domain: <strong>{activeTrendPoint.domainConfig?.name || activeTrendPoint.domain}</strong> • ⏱️ {activeTrendPoint.timeTaken}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {activeTrendPoint.fullDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-400 block">
                    {activeTrendPoint.score}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeTrendPoint.difficulty}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              No sessions found for this selection
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Complete any {selectedDomain === 'all' ? 'cognitive' : selectedDomain} activity to begin plotting your performance curve.
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 5: DAILY ACTIVITY ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#162832]">
            Daily Cognitive Activity
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Completed cognitive tasks per day (Last 7 Days)
          </p>
        </div>

        {/* 7-Day Visual Bars */}
        <div className="grid grid-cols-7 gap-2 pt-3 pb-2 border-b border-slate-100">
          {dailyResponse.map((dayObj, i) => {
            const isHovered = activeDailyBar?.date === dayObj.date;
            // Bar height: 0 tasks = 8px baseline, otherwise scaled proportionally
            const barHeight = dayObj.tasksCompleted === 0
              ? 8
              : Math.min(100, 24 + dayObj.tasksCompleted * 24);

            return (
              <div
                key={i}
                className="flex flex-col items-center cursor-pointer group"
                onMouseEnter={() => setActiveDailyBar(dayObj)}
                onMouseLeave={() => setActiveDailyBar(null)}
                onClick={() => setActiveDailyBar(dayObj)}
              >
                {/* Task Count Pill */}
                <span className={`text-[11px] font-black mb-1.5 transition-colors ${
                  dayObj.tasksCompleted > 0 ? 'text-[#1E5E3A]' : 'text-slate-300'
                }`}>
                  {dayObj.tasksCompleted > 0 ? dayObj.tasksCompleted : '0'}
                </span>

                {/* Visual Bar Slot */}
                <div className={`w-8 sm:w-12 h-28 rounded-2xl flex items-end justify-center p-1 transition-all ${
                  isHovered ? 'bg-[#EBF5EE] ring-2 ring-[#1E5E3A]' : 'bg-slate-100'
                }`}>
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      dayObj.tasksCompleted > 0
                        ? isHovered ? 'bg-[#D98A1E]' : 'bg-[#1E5E3A]'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  />
                </div>

                {/* Day Label */}
                <span className={`text-xs font-extrabold mt-2 ${
                  dayObj.isToday ? 'text-[#1E5E3A] font-black underline' : 'text-slate-600'
                }`}>
                  {dayObj.day}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold">
                  {dayObj.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Daily Activity Tooltip */}
        {activeDailyBar && (
          <div className="p-3 rounded-2xl bg-[#162832] text-white text-xs flex items-center justify-between gap-4 animate-in fade-in duration-150">
            <div>
              <span className="font-extrabold text-amber-400 block text-xs">
                {activeDailyBar.fullDate} {activeDailyBar.isToday ? '(Today)' : ''}
              </span>
              <span className="text-slate-300 text-[11px]">
                Tasks completed: <strong>{activeDailyBar.tasksCompleted}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-emerald-400 block">
                {activeDailyBar.tasksCompleted > 0 ? `${activeDailyBar.averageScore}% Avg Score` : 'No tasks logged'}
              </span>
              {activeDailyBar.averageResponseSecs > 0 && (
                <span className="text-[10px] text-slate-400">
                  Avg response: {activeDailyBar.averageResponseSecs}s
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 6: RECENT COGNITIVE ACTIVITIES ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base sm:text-lg font-extrabold text-[#162832]">
            Recent Activities
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'task' : 'tasks'} recorded
          </span>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Activity</th>
                  <th className="py-2.5 px-2">Domain</th>
                  <th className="py-2.5 px-2 text-center">Score</th>
                  <th className="py-2.5 px-2 text-center">Time Taken</th>
                  <th className="py-2.5 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.map((session, idx) => {
                  const domKey = (session.cognitiveDomain || session.domain || session.category || 'memory').toLowerCase();
                  const domCfg = COGNITIVE_DOMAINS[domKey] || COGNITIVE_DOMAINS.memory;
                  const score = session.score ?? session.accuracy ?? 80;

                  return (
                    <tr key={session.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-[#162832]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{domCfg.icon}</span>
                          <span>{session.gameName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${domCfg.badgeBg}`}>
                          {domCfg.name}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-extrabold text-[#1E5E3A]">
                        {score}%
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500 font-medium">
                        {session.timeTaken || `${session.time || session.responseTime || 5}s`}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-500 font-medium">
                        {session.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-100">
            No recent activities recorded for this area.
          </div>
        )}
      </div>

      {/* ── SECTION 7: AI COGNITIVE SUMMARY ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#1E5E3A]" />
          </div>
          <div className="space-y-1.5 min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-extrabold text-[#162832]">
              AI Cognitive Summary
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 8: HOW IS THIS CALCULATED? (EXPANDABLE) ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#162832]">
              How is this calculated?
            </span>
          </div>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showExplanation && (
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <p className="leading-relaxed">
              Cognitive scores are calculated from performance in NEURO-NEX activities using factors such as accuracy, completion score, response time and task difficulty.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed bg-[#F5FAF6] p-3 rounded-xl border border-[#C3E2CD]">
              ⚠️ <strong>Important Notice:</strong> These scores are intended for cognitive support and progress monitoring. They are not a medical diagnosis or a clinically validated dementia assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
