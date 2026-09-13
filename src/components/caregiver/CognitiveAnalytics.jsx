import React, { useState } from 'react';
import Card from '../common/Card';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Target,
  RotateCcw,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Play
} from 'lucide-react';
import { TeaLeafSprig, RegionalTextileBorder, TribalGeometricDivider } from '../common/CulturalMotifs';
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
  const { patientData, setActiveGame } = useApp();
  const { cognitiveStats = {}, profile = {} } = patientData || {};
  const preferredName = profile?.preferredName || profile?.fullName || 'Patient';

  const history = cognitiveStats?.history || [];

  // Active domain filter: 'all' | 'memory' | 'recall' | 'attention' | 'focus'
  const [selectedDomain, setSelectedDomain] = useState('all');

  // Interactive tooltip state for Trends graph
  const [activeTrendPoint, setActiveTrendPoint] = useState(null);

  // Interactive tooltip state for Daily Response chart
  const [activeDailyBar, setActiveDailyBar] = useState(null);

  // Expandable "How is this calculated?"
  const [showExplanation, setShowExplanation] = useState(false);

  // Dynamic calculations via engine
  const domainStats = calculateDomainStats(history);
  const overallIndex = calculateOverallPerformanceIndex(domainStats, history);
  const trendPoints = getPerformanceTrends(history, selectedDomain);
  const dailyResponse = getDailyCognitiveResponse(history, 7);
  const aiSummary = generateAICognitiveSummary(domainStats, history);

  const patientStatus = calculatePatientStatus(patientData);
  const cognitiveScore = getPatientCognitiveScore(patientData);

  // Quick launch helper for games when domain has no data
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
  const svgWidth = 680;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Build SVG path for trend points
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

  // Filtered recent activities for list display
  const filteredActivities = selectedDomain === 'all'
    ? history
    : history.filter(h => (h.cognitiveDomain || h.domain || h.category || '').toLowerCase().includes(selectedDomain));

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* 1. HIMALAYAN COGNITIVE SANCTUARY HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl sm:rounded-4xl bg-gradient-to-r from-[#1E5E3A] via-[#164E30] to-[#0F3520] text-white border-2 border-[#D98A1E]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#E5C158] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border border-white/20 backdrop-blur-xs">
              <TeaLeafSprig className="w-3.5 h-3.5" color="#E5C158" />
              <span>Cognitive Observational Monitoring</span>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold border bg-white/95 shadow-xs ${patientStatus.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${patientStatus.dotClass}`} />
              <span>Status: {patientStatus.label} ({cognitiveScore}%)</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-white">
            Cognitive Analytics & Performance Trajectory
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-xl">
            Gentle behavioral observations, domain accuracy, and longitudinal wellness trends for {preferredName}
          </p>
        </div>

        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center text-2xl sm:text-3xl shadow-md flex-shrink-0 self-start sm:self-auto backdrop-blur-xs">
          🧠
        </div>
      </div>

      {/* 2. OVERALL COGNITIVE PERFORMANCE INDEX KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E5E3A]" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Overall Cognitive Index
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E5E3A] font-serif">
              {overallIndex.sessionsAnalyzed > 0 ? `${overallIndex.score}%` : '--'}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 block mt-1">
            {overallIndex.activeDomainsCount} of 4 domains active
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Sessions Analyzed
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832] font-serif">
            {overallIndex.sessionsAnalyzed}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 block mt-1">
            {overallIndex.sessionsAnalyzed > 0 ? 'Consistent adherence' : 'Awaiting sessions'}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D98A1E]" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Latest Activity
          </span>
          <span className="text-sm sm:text-base font-extrabold text-[#162832] truncate block mt-1.5">
            {overallIndex.sessionsAnalyzed > 0 ? overallIndex.latestActivity.split(' (')[0] : '--'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#D98A1E] block mt-1 truncate">
            {overallIndex.latestActivityDate}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E6B52]" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Cognitive Trajectory
          </span>
          <div className="inline-flex items-center justify-center gap-1 mt-1">
            <span className="text-base sm:text-lg">
              {overallIndex.trajectory === 'improving' ? '📈' : overallIndex.trajectory === 'fluctuating' ? '📊' : '🟢'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#162832] capitalize">
              {overallIndex.trajectory === 'improving' ? 'Improving' : overallIndex.trajectory === 'fluctuating' ? 'Fluctuating' : 'Stable'}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block mt-1">
            Longitudinal trend
          </span>
        </div>
      </div>

      {/* 3. AI COGNITIVE SUMMARY CARD */}
      <Card variant="white" className="p-4 sm:p-5 bg-gradient-to-br from-[#F5FAF6] via-white to-[#FFFBF0] border border-[#C3E2CD]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#1E5E3A]" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E5E3A]">
                AI Cognitive Trajectory Synthesis
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#C3E2CD] text-slate-500">
                Observational Insight
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </Card>

      {/* 4. INTERACTIVE DOMAIN FILTER TABS */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all touch-target flex items-center gap-1.5 ${
            selectedDomain === 'all'
              ? 'bg-[#1E5E3A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🌐</span>
          <span>Overall ({history.length})</span>
        </button>

        {Object.values(domainStats).map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all touch-target flex items-center gap-1.5 ${
              selectedDomain === d.id
                ? 'bg-[#1E5E3A] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{d.icon}</span>
            <span>{d.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedDomain === d.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {d.hasData ? `${d.score}%` : '0'}
            </span>
          </button>
        ))}
      </div>

      {/* 5. 4 DYNAMIC COGNITIVE SUMMARY CARDS (MEMORY, RECALL, ATTENTION, FOCUS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.values(domainStats).map(domain => (
          <div
            key={domain.id}
            className={`p-4 rounded-3xl bg-white border transition-all flex flex-col justify-between ${
              selectedDomain === domain.id ? 'border-2 border-[#1E5E3A] shadow-md' : 'border-slate-200 shadow-xs'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">{domain.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#162832]">
                      {domain.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {domain.description.split(',')[0]}
                    </span>
                  </div>
                </div>

                {domain.hasData ? (
                  <span className="text-lg sm:text-xl font-extrabold text-[#1E5E3A] font-serif">
                    {domain.score}%
                  </span>
                ) : null}
              </div>

              {/* Progress bar or Empty state */}
              {domain.hasData ? (
                <div className="space-y-2 mt-3">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${domain.barClass}`}
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{domain.sessionsCount} session{domain.sessionsCount > 1 ? 's' : ''} analyzed</span>
                    <span className="text-emerald-700 font-bold">Active</span>
                  </div>

                  {domain.activitiesMeasured.length > 0 && (
                    <div className="pt-1 text-[10px] text-slate-400 font-medium">
                      <span className="font-bold text-slate-600">Tasks: </span>
                      {domain.activitiesMeasured.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>No recent data</span>
                  </div>
                  <p className="text-[10px] leading-tight text-amber-800/90">
                    {domain.prompt}
                  </p>
                  <button
                    onClick={() => handleLaunchDomainTask(domain.id)}
                    className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1E5E3A] text-white text-[10px] font-extrabold hover:bg-[#164E30] transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Start {domain.name} Task</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 6. COGNITIVE PERFORMANCE TRENDS GRAPH (SVG) */}
      <Card variant="white" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#162832]">
                Cognitive Performance Trends
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD]">
                {selectedDomain === 'all' ? 'All Domains' : COGNITIVE_DOMAINS[selectedDomain]?.name}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Score (%) over dates across historical sessions ({trendPoints.length} points plotted)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 self-start sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E5E3A]" />
              <span>Score Curve</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-slate-300" />
              <span>Baseline (80%)</span>
            </span>
          </div>
        </div>

        {/* SVG Curve Canvas */}
        {trendPoints.length > 0 ? (
          <div className="relative">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-56 select-none"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E5E3A" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1E5E3A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Guidelines at 100%, 80%, 60%, 40%, 20% */}
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

                {/* Area Gradient */}
                {areaPath && (
                  <path d={areaPath} fill="url(#curveGradient)" />
                )}

                {/* Curve Line */}
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

                {/* Data Points */}
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
                      {/* Pulse ring for active */}
                      {isHovered && (
                        <circle
                          cx={x}
                          y={y}
                          r="9"
                          fill="#1E5E3A"
                          fillOpacity="0.2"
                        />
                      )}
                      <circle
                        cx={x}
                        y={y}
                        r={isHovered ? '6' : '4.5'}
                        fill={isHovered ? '#D98A1E' : '#1E5E3A'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="transition-all"
                      />
                      {/* X-axis date label */}
                      <text
                        x={x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-500 font-semibold"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {activeTrendPoint && (
              <div className="p-3 rounded-2xl bg-[#162832] text-white shadow-xl text-xs space-y-1 max-w-xs mt-2 border border-slate-700 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-amber-400">
                    {activeTrendPoint.gameName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px]">
                    {activeTrendPoint.score}% Score
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between gap-2">
                  <span>Domain: <strong>{activeTrendPoint.domainConfig?.name || activeTrendPoint.domain}</strong></span>
                  <span>⏱️ {activeTrendPoint.timeTaken}</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  📅 {activeTrendPoint.fullDate} • {activeTrendPoint.difficulty}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              No sessions plotted for this domain yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Complete any {selectedDomain === 'all' ? 'cognitive' : selectedDomain} activity to begin plotting a longitudinal performance curve.
            </p>
          </div>
        )}
      </Card>

      {/* 7. DAILY COGNITIVE RESPONSE CHART (SVG) */}
      <Card variant="white" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#162832]">
              Daily Cognitive Response
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Completed cognitive tasks per day & engagement consistency (Past 7 Days)
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>Interactive Daily Tooltip</span>
          </div>
        </div>

        {/* 7-Day Bar Chart Visual */}
        <div className="grid grid-cols-7 gap-2 pt-4 pb-2 border-b border-slate-100">
          {dailyResponse.map((dayObj, i) => {
            const isHovered = activeDailyBar?.date === dayObj.date;
            // Scale bar height: 0 tasks = 8px baseline, 1 task = 40px, 2 = 70px, 3+ = 96px
            const barHeight = dayObj.tasksCompleted === 0
              ? 8
              : Math.min(100, 30 + dayObj.tasksCompleted * 24);

            return (
              <div
                key={i}
                className="flex flex-col items-center cursor-pointer group"
                onMouseEnter={() => setActiveDailyBar(dayObj)}
                onMouseLeave={() => setActiveDailyBar(null)}
                onClick={() => setActiveDailyBar(dayObj)}
              >
                {/* Task count pill */}
                <span className={`text-[10px] font-bold mb-1.5 transition-colors ${
                  dayObj.tasksCompleted > 0 ? 'text-[#1E5E3A]' : 'text-slate-400'
                }`}>
                  {dayObj.tasksCompleted > 0 ? `${dayObj.tasksCompleted} task${dayObj.tasksCompleted > 1 ? 's' : ''}` : '-'}
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
                  dayObj.isToday ? 'text-[#1E5E3A] underline font-black' : 'text-slate-600'
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

        {/* Daily Response Tooltip */}
        {activeDailyBar && (
          <div className="mt-3 p-3 rounded-2xl bg-[#162832] text-white text-xs flex items-center justify-between gap-4 animate-in fade-in duration-150">
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
      </Card>

      {/* 8. RECENT COGNITIVE ACTIVITIES (TASK HISTORY) */}
      <Card variant="white" className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#162832]">
              Recent Cognitive Activities
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Detailed task performance breakdown ({filteredActivities.length} recorded)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Filtered by: {selectedDomain === 'all' ? 'All Domains' : COGNITIVE_DOMAINS[selectedDomain]?.name}
          </span>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="space-y-2.5 max-h-84 overflow-y-auto pr-1">
            {filteredActivities.map((h, i) => {
              const rawDom = h.cognitiveDomain || h.domain || h.category;
              const domKey = (rawDom || 'memory').toLowerCase();
              const domConfig = COGNITIVE_DOMAINS[domKey] || COGNITIVE_DOMAINS.memory;
              const score = h.score ?? h.accuracy ?? 80;

              return (
                <div
                  key={h.id || i}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#F5FAF6] border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
                      {domConfig.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-[#162832]">
                          {h.gameName}
                        </h4>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold border ${domConfig.badgeBg}`}>
                          {domConfig.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {h.date} • {h.difficulty || `Level ${h.difficultyLevel || 1}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-extrabold text-[#1E5E3A] block">
                        {score}% Score
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        ⏱️ {h.timeTaken || `${h.time || h.responseTime || 5}s`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
            No activities recorded in this domain yet.
          </div>
        )}
      </Card>

      {/* 9. TRANSPARENT SCORING EXPLANATION ACCORDION */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#1E5E3A]" />
            <span className="text-xs sm:text-sm font-extrabold text-[#162832]">
              How are cognitive domain scores and trajectories calculated?
            </span>
          </div>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showExplanation && (
          <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3">
            <p className="leading-relaxed">
              Cognitive domain scores are calculated from task accuracy, completion consistency, and response time across recent exercises. Scores are observational and designed to support cognitive wellness tracking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-[#162832] block mb-0.5">🧠 Memory & Recall Domains</span>
                <span className="text-[11px] text-slate-500">
                  Derived from paired object matching, shopping basket recollection, and cherished family name recall.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-[#162832] block mb-0.5">🎯 Attention & Focus Domains</span>
                <span className="text-[11px] text-slate-500">
                  Derived from visual odd-one-out discrimination, sequential color/pattern tracking, and sustained response pace.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 10. ETHICAL NON-DIAGNOSTIC CLINICAL DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-[#F5FAF6] border border-[#C3E2CD] text-center">
        <p className="text-xs text-[#1E5E3A] font-medium leading-relaxed max-w-2xl mx-auto">
          ⚠️ <strong>Observational Wellness Record:</strong> This section tracks daily exercise engagement and interaction ease. It uses neutral, non-diagnostic observations and does <strong>not</strong> provide clinical dementia diagnoses or cognitive impairment evaluations.
        </p>
      </div>
    </div>
  );
}
