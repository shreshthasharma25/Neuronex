import React from 'react';
import Card from '../common/Card';
import { useApp } from '../../context/AppContext';
import { Brain, Target, RotateCcw, Puzzle, TrendingUp, Clock, CheckCircle2, AlertCircle, Info, Calendar, Sparkles, Layers } from 'lucide-react';
import { TeaLeafSprig, RegionalTextileBorder } from '../common/CulturalMotifs';
import { calculatePatientStatus, getPatientCognitiveScore } from '../../utils/patientStatusEngine';

export default function CognitiveAnalytics() {
  const { patientData } = useApp();
  const { cognitiveStats, profile } = patientData;
  const preferredName = profile?.preferredName || profile?.fullName || 'Patient';

  const history = cognitiveStats?.history || [];
  const hasData = (cognitiveStats?.gamesCompleted || 0) > 0 || history.length > 0;

  // Category difficulty levels
  const categoryLevels = cognitiveStats?.categoryLevels || {
    memory: cognitiveStats?.currentLevel || 1,
    recall: cognitiveStats?.currentLevel || 1,
    attention: cognitiveStats?.currentLevel || 1,
    sequencing: cognitiveStats?.currentLevel || 1
  };

  // Detect noticeable change in performance (e.g., drop of >= 20% compared to average)
  const recentSessions = history.slice(0, 3);
  const recentAvg = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / recentSessions.length)
    : 0;

  const baselineAvg = cognitiveStats?.averageAccuracy || 0;
  const hasSignificantChange = hasData && recentSessions.length >= 2 && Math.abs(recentAvg - baselineAvg) >= 20;

  // Compute 7-day trends dynamically
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trends = (cognitiveStats?.weeklyTrends && cognitiveStats.weeklyTrends.length > 0)
    ? cognitiveStats.weeklyTrends
    : daysOfWeek.map((day, idx) => {
        const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
        return {
          day,
          accuracy: isToday && hasData ? (cognitiveStats.averageAccuracy || 80) : 0
        };
      });

  const categories = [
    {
      id: 'memory',
      label: 'Memory',
      icon: '🧠',
      score: cognitiveStats?.categories?.memory || 0,
      level: categoryLevels.memory || 1,
      color: 'bg-[#1E5E3A]',
      description: 'Face & relationship recognition, personal history'
    },
    {
      id: 'recall',
      label: 'Recall',
      icon: '🔄',
      score: cognitiveStats?.categories?.recall || 0,
      level: categoryLevels.recall || 1,
      color: 'bg-emerald-600',
      description: 'Everyday shopping list & familiar item recall'
    },
    {
      id: 'attention',
      label: 'Attention & Focus',
      icon: '🎯',
      score: cognitiveStats?.categories?.attention || 0,
      level: categoryLevels.attention || 1,
      color: 'bg-[#D98A1E]',
      description: 'Visual scene observation & detail discrimination'
    },
    {
      id: 'sequencing',
      label: 'Sequencing',
      icon: '🧩',
      score: cognitiveStats?.categories?.sequencing || 0,
      level: categoryLevels.sequencing || 1,
      color: 'bg-[#2E6B52]',
      description: 'Circadian routine ordering & step-by-step logic'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Himalayan Cognitive Sanctuary Header */}
      <div className="p-5 sm:p-6 rounded-3xl sm:rounded-4xl bg-gradient-to-r from-[#1E5E3A] via-[#164E30] to-[#0F3520] text-white border-2 border-[#D98A1E]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#E5C158] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border border-white/20 backdrop-blur-xs">
              <TeaLeafSprig className="w-3.5 h-3.5" color="#E5C158" />
              <span>Caregiver Observational Monitoring</span>
            </div>
            {(() => {
              const statusObj = calculatePatientStatus(patientData);
              const score = getPatientCognitiveScore(patientData);
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold border bg-white/95 shadow-xs ${statusObj.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${statusObj.dotClass}`} />
                  <span>Status: {statusObj.label} ({score}%)</span>
                </span>
              );
            })()}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-white">
            Cognitive Elevation & Performance Trends
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-lg">
            Gentle behavioral observations, waypoint accuracy, and adaptive cognitive trends for {preferredName}
          </p>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center text-2xl sm:text-3xl shadow-md flex-shrink-0 self-start sm:self-auto backdrop-blur-xs">
          📊
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Games Completed
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#162832]">
            {cognitiveStats?.gamesCompleted || 0}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 block mt-1 truncate">
            {hasData ? 'Active engagement' : 'No attempts yet'}
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Recent Accuracy
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1E5E3A]">
            {hasData ? `${cognitiveStats?.averageAccuracy || 0}%` : '--'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#1E5E3A] block mt-1 truncate">
            {hasData ? 'Average across attempts' : 'Awaiting data'}
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Avg. Response Time
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {hasData ? `${cognitiveStats?.averageResponseSecs || 5.2}s` : '--'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block mt-1 truncate">
            Calm, unhurried pace
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-1">
            Overall Difficulty
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            Level {cognitiveStats?.currentLevel || 1}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 block mt-1 truncate">
            Adaptive 1–5 scaling
          </span>
        </div>
      </div>

      {/* RECENT PERFORMANCE SUMMARY CARD */}
      {history.length > 0 && (
        <Card variant="white" className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-white">
          <h3 className="text-sm sm:text-base font-extrabold text-[#162832] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1E5E3A]" />
            <span>Recent Game Performance</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {history.slice(0, 3).map((s, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-sm text-[#162832]">
                    {s.gameName}
                  </span>
                  <span className="text-xs font-black text-[#1E5E3A]">
                    {s.accuracy}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mt-1">
                  <span>{s.difficulty || `Level ${s.difficultyLevel || 1}`}</span>
                  <span>⏱️ {s.timeTaken || `${s.responseTime || 5}s`}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ADAPTIVE CATEGORY DIFFICULTY */}
      <Card variant="white" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#162832]">
              Personalized Game Difficulty & Progress
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Independent adaptive difficulty levels (Level 1–5) and engagement by domain
            </p>
          </div>
          <span className="text-xs font-bold text-[#1E5E3A] bg-[#EBF5EE] border border-[#D8E2D9] px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
            <Layers className="w-3 h-3" />
            <span>Multi-Level Adaptive</span>
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{cat.icon}</span>
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-[#162832] block">
                      {cat.label}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      {cat.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center sm:block gap-2 justify-between sm:text-right pt-1 sm:pt-0">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-[#EBF5EE] text-[#1E5E3A] border border-[#D8E2D9] text-[10px] sm:text-xs font-black">
                    Level {cat.level}
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-slate-600 block sm:mt-0.5">
                    {cat.score}% Accuracy
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* WEEKLY ENGAGEMENT CHART */}
      <Card variant="white" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#162832]">
              Weekly Engagement & Accuracy
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              7-day activity adherence curve
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5" />
            <span>Past 7 Days</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="flex items-end justify-between h-36 pt-6 px-1 sm:px-2 border-b border-slate-100">
          {trends.map((trend, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mb-1">
                {trend.accuracy > 0 ? `${trend.accuracy}%` : '-'}
              </span>
              <div className="w-6 sm:w-10 bg-[#EBF5EE] rounded-t-xl h-24 relative flex items-end justify-center overflow-hidden">
                <div
                  className="w-full bg-[#1E5E3A] rounded-t-xl transition-all duration-500"
                  style={{ height: `${trend.accuracy}%` }}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 mt-2">
                {trend.day}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* REAL GAME SESSIONS LOG */}
      {history.length > 0 && (
        <Card variant="white" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#162832]">
              Game Session History
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {history.length} attempts recorded
            </span>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div key={h.id || i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#162832]">
                    {h.gameName}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {h.date} • {h.difficulty || `Level ${h.difficultyLevel || 1}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#1E5E3A] block">
                    {h.accuracy}% Accuracy
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    ⏱️ {h.timeTaken || `${h.responseTime || 5}s`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* OBSERVATIONAL TREND ALERT IF SIGNIFICANT CHANGE DETECTED */}
      {hasSignificantChange && (
        <div className="p-4 rounded-2xl bg-[#FFF8E1] border-2 border-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#854D0E] space-y-1">
            <p className="font-extrabold text-sm text-[#854D0E]">
              Observational Performance Notice
            </p>
            <p className="font-medium leading-relaxed">
              A change in recent game performance has been observed. Consider discussing significant changes with a healthcare professional.
            </p>
          </div>
        </div>
      )}

      {/* MANDATORY ETHICAL NON-DIAGNOSTIC MEDICAL ASSESSMENT DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
          ⚠️ <strong>Observational Record:</strong> This section tracks daily exercise engagement and interaction ease. It uses neutral, non-diagnostic observations and does <strong>not</strong> provide clinical dementia diagnoses or cognitive impairment evaluations.
        </p>
      </div>
    </div>
  );
}
