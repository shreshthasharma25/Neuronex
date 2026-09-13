import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import { Sparkles, Info, ChevronDown, ChevronUp, BrainCircuit, Brain, Target, Eye, Activity, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sendAIChatMessage } from '../../services/aiChatService';
import { useApp } from '../../context/AppContext';

export default function CognitiveAnalytics() {
  const { patientData } = useApp();
  const rawHistory = patientData?.cognitiveStats?.history || [];
  
  const { 
    currentScores, 
    baselineScores, 
    allTimeScores, 
    domainStats,
    weeklyTrends, 
    dailyActivity,
    hasData, 
    totalSessions,
    latestSession
  } = useMemo(() => {
    const history = rawHistory.map(s => {
      let cat = (s.category || "memory").toLowerCase();
      if (cat === 'sequencing') cat = 'focus';
      
      let ts = s.timestamp;
      if (!ts) {
        if (s.created_at) ts = new Date(s.created_at).getTime();
        else ts = Date.now();
      }
      return { 
        ...s, 
        category: cat, 
        timestamp: ts,
        gameName: s.gameName || s.game_name || "Unknown Game",
        difficulty: s.difficulty || (s.difficultyLevel ? `Level ${s.difficultyLevel}` : "Level 1")
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort newest first

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    let recentSessions = history.filter(s => now - s.timestamp <= oneWeek);
    let baselineSessions = history.filter(s => now - s.timestamp > oneWeek);

    if (baselineSessions.length === 0 && history.length > 1) {
      baselineSessions = history.slice(1);
      recentSessions = [history[0]];
    }

    const calculateDomainStats = (sessList) => {
      const stats = { memory: { acc: 0, count: 0, time: 0 }, recall: { acc: 0, count: 0, time: 0 }, attention: { acc: 0, count: 0, time: 0 }, focus: { acc: 0, count: 0, time: 0 } };
      sessList.forEach(s => {
        if (stats[s.category]) {
          stats[s.category].acc += (s.accuracy != null ? s.accuracy : (s.score || 0));
          stats[s.category].count++;
          if (s.time || s.time_taken) stats[s.category].time += (s.time || s.time_taken || 0);
        }
      });
      return stats;
    };

    const getScores = (stats) => {
      const scores = { memory: null, recall: null, attention: null, focus: null };
      Object.keys(scores).forEach(k => {
        scores[k] = stats[k].count > 0 ? Math.round(stats[k].acc / stats[k].count) : null;
      });
      return scores;
    };

    const allTimeStats = calculateDomainStats(history);
    const aScores = getScores(allTimeStats);
    const cScores = getScores(calculateDomainStats(recentSessions.length > 0 ? recentSessions : history));
    const bScores = getScores(calculateDomainStats(baselineSessions));

    const wTrends = [];
    const dActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const fullDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const startOfDay = new Date(d.setHours(0,0,0,0)).getTime();
      const endOfDay = new Date(d.setHours(23,59,59,999)).getTime();
      
      const daySessions = history.filter(s => s.timestamp >= startOfDay && s.timestamp <= endOfDay);
      const dayScores = getScores(calculateDomainStats(daySessions));
      
      wTrends.push({
        name: dayName,
        Memory: dayScores.memory,
        Recall: dayScores.recall,
        Attention: dayScores.attention,
        Focus: dayScores.focus,
        Overall: (() => {
           let tot = 0, cnt = 0;
           ['memory', 'recall', 'attention', 'focus'].forEach(k => {
             if (dayScores[k] != null) { tot += dayScores[k]; cnt++; }
           });
           return cnt > 0 ? Math.round(tot / cnt) : null;
        })()
      });

      dActivity.push({
        name: dayName,
        fullDate,
        sessionsCount: daySessions.length
      });
    }

    return {
      currentScores: cScores,
      baselineScores: bScores,
      allTimeScores: aScores,
      domainStats: allTimeStats,
      weeklyTrends: wTrends,
      dailyActivity: dActivity,
      hasData: history.length > 0,
      totalSessions: history.length,
      latestSession: history.length > 0 ? history[0] : null
    };
  }, [rawHistory]);

  const [activeTab, setActiveTab] = useState('Overall');
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateRuleBasedSummary = () => {
    if (!hasData) return "Not enough data to generate a reliable weekly trend summary.";
    
    let summary = `The patient completed ${totalSessions} cognitive task${totalSessions !== 1 ? 's' : ''}. `;
    
    if (totalSessions === 1) {
      summary += "This establishes their initial baseline performance. Continued regular engagement will provide consistent trend data.";
      return summary;
    }

    const cs = currentScores;
    const bs = baselineScores;
    
    if (cs.memory && bs.memory) {
      if (cs.memory > bs.memory + 5) summary += "Memory performance improved compared to their previous baseline. ";
      else if (cs.memory < bs.memory - 5) summary += "Memory performance showed a decline. ";
      else summary += "Memory performance remained stable. ";
    }
    if (cs.attention && bs.attention) {
      if (Math.abs(cs.attention - bs.attention) <= 5) summary += "Attention remained relatively stable. ";
      else summary += "There was some variability in attention scores. ";
    }
    
    return summary || "Performance data is actively being monitored across sessions.";
  };

  useEffect(() => {
    let isMounted = true;
    
    async function fetchAiSummary() {
      if (!hasData) {
        setAiSummary("Not enough data to generate a reliable weekly trend summary.");
        return;
      }
      setIsAiLoading(true);
      try {
        const prompt = `As a helpful assistant, generate a concise, 2-sentence caregiver-friendly summary of the patient's cognitive app performance.
Data:
Completed Sessions: ${totalSessions}.
Current Week: Memory ${currentScores.memory || 'N/A'}, Recall ${currentScores.recall || 'N/A'}, Attention ${currentScores.attention || 'N/A'}, Focus ${currentScores.focus || 'N/A'}.
Baseline: Memory ${baselineScores.memory || 'N/A'}, Recall ${baselineScores.recall || 'N/A'}, Attention ${baselineScores.attention || 'N/A'}, Focus ${baselineScores.focus || 'N/A'}.
Rule 1: DO NOT make clinical diagnoses. DO NOT mention dementia, Alzheimer's, or impairment.
Rule 2: ONLY interpret their performance in the app (e.g. "memory performance improved compared to their previous session").
Rule 3: Keep it encouraging and under 30 words.`;
        
        const response = await sendAIChatMessage(prompt, patientData);
        if (isMounted) {
          if (response.success && response.source === 'gemini') {
            setAiSummary(response.reply);
          } else {
            setAiSummary(generateRuleBasedSummary());
          }
        }
      } catch (e) {
        if (isMounted) setAiSummary(generateRuleBasedSummary());
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    }
    
    fetchAiSummary();
    return () => { isMounted = false; };
  }, [hasData, patientData, totalSessions, currentScores, baselineScores]);

  const getTrendLabel = (current, baseline) => {
    if (current == null) return { text: "N/A — not measured in this activity", color: "text-slate-400" };
    if (baseline == null) return { text: "Baseline session", color: "text-slate-500" };
    
    const diff = current - baseline;
    if (diff > 0) return { text: `+${diff}% vs previous session`, color: "text-emerald-600" };
    if (diff < 0) return { text: `${diff}% vs previous session`, color: "text-amber-600" };
    return { text: "Stable", color: "text-[#2F6FED]" };
  };

  const domains = [
    { id: 'memory', label: 'Memory', icon: <Brain className="w-5 h-5" />, color: 'bg-[#2F6FED]', scoreColor: 'text-[#2F6FED]' },
    { id: 'recall', label: 'Recall', icon: <BrainCircuit className="w-5 h-5" />, color: 'bg-emerald-600', scoreColor: 'text-emerald-600' },
    { id: 'attention', label: 'Attention', icon: <Eye className="w-5 h-5" />, color: 'bg-amber-500', scoreColor: 'text-amber-600' },
    { id: 'focus', label: 'Focus', icon: <Target className="w-5 h-5" />, color: 'bg-purple-600', scoreColor: 'text-purple-600' }
  ];

  const overallScore = (() => {
    let total = 0, count = 0;
    domains.forEach(d => {
      const val = allTimeScores?.[d.id];
      if (val != null) { total += val; count++; }
    });
    return count > 0 ? Math.round(total / count) : null;
  })();

  if (!hasData) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-24">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF2FF] border border-[#CFE1FF]">
          <h2 className="text-lg font-extrabold text-[#172B4D]">Cognitive Performance</h2>
          <p className="text-sm text-slate-600 font-medium">Not enough data yet. Complete a cognitive session to establish a baseline.</p>
        </div>
      </div>
    );
  }

  const latestDateFormatted = latestSession?.timestamp 
    ? new Date(latestSession.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Recently";

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="white" className="p-4 md:col-span-2 bg-[#EAF2FF] border border-[#CFE1FF] flex flex-col justify-center">
          <span className="text-[11px] sm:text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Neuronex
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#172B4D] mt-0.5">
            Cognitive Performance Index
          </h2>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-[#2F6FED]">
              {overallScore != null ? overallScore : '--'}
            </span>
            {overallScore != null && <span className="text-sm text-slate-600 font-medium mb-1">avg. score</span>}
          </div>
        </Card>
        
        <Card variant="white" className="p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Sessions Analyzed</span>
          </div>
          <span className="text-2xl font-extrabold text-[#172B4D]">{totalSessions}</span>
          <span className="text-xs text-slate-500 mt-1">Total recorded tasks</span>
        </Card>
        
        <Card variant="white" className="p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Latest Activity</span>
          </div>
          <span className="text-sm font-extrabold text-[#172B4D] truncate">{latestSession?.gameName}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              {latestSession?.difficulty}
            </span>
            <span className="text-[11px] text-slate-400">{latestDateFormatted}</span>
          </div>
        </Card>
      </div>

      {/* Domain Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {domains.map(d => {
          const current = currentScores?.[d.id];
          const baseline = baselineScores?.[d.id];
          const trend = getTrendLabel(current, baseline);
          const stat = domainStats[d.id];

          return (
            <div key={d.id} className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 z-10">
                <div className={`w-8 h-8 rounded-full ${d.color} text-white flex items-center justify-center`}>
                  {d.icon}
                </div>
                <span className="font-extrabold text-[#172B4D] text-sm sm:text-base">{d.label}</span>
              </div>
              
              <div className="z-10 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-extrabold ${current != null ? d.scoreColor : 'text-slate-300'}`}>
                    {current != null ? `${current}%` : 'N/A'}
                  </span>
                </div>
                
                <div className="mt-2 text-[11px] sm:text-xs font-bold flex flex-col gap-1">
                  <span className="text-slate-500">
                    {stat.count > 0 ? `${stat.count} session${stat.count !== 1 ? 's' : ''} analyzed` : 'N/A — not measured in this activity'}
                  </span>
                  <span className={trend.color}>
                    {trend.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Graph (Weekly Line Chart) */}
        <Card variant="white" className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
              Cognitive Performance Trends
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Overall', 'Memory', 'Recall', 'Attention', 'Focus'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${
                    activeTab === tab 
                      ? 'bg-[#172B4D] text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#172B4D', marginBottom: '4px' }}
                />
                
                {activeTab === 'Overall' && (
                  <Line type="monotone" dataKey="Overall" stroke="#172B4D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                )}
                {(activeTab === 'Overall' || activeTab === 'Memory') && (
                  <Line type="monotone" dataKey="Memory" stroke="#2F6FED" strokeWidth={activeTab === 'Memory' ? 3 : 2} opacity={activeTab === 'Overall' ? 0.4 : 1} dot={{ r: activeTab === 'Memory' ? 4 : 0 }} connectNulls />
                )}
                {(activeTab === 'Overall' || activeTab === 'Recall') && (
                  <Line type="monotone" dataKey="Recall" stroke="#059669" strokeWidth={activeTab === 'Recall' ? 3 : 2} opacity={activeTab === 'Overall' ? 0.4 : 1} dot={{ r: activeTab === 'Recall' ? 4 : 0 }} connectNulls />
                )}
                {(activeTab === 'Overall' || activeTab === 'Attention') && (
                  <Line type="monotone" dataKey="Attention" stroke="#F59E0B" strokeWidth={activeTab === 'Attention' ? 3 : 2} opacity={activeTab === 'Overall' ? 0.4 : 1} dot={{ r: activeTab === 'Attention' ? 4 : 0 }} connectNulls />
                )}
                {(activeTab === 'Overall' || activeTab === 'Focus') && (
                  <Line type="monotone" dataKey="Focus" stroke="#9333EA" strokeWidth={activeTab === 'Focus' ? 3 : 2} opacity={activeTab === 'Overall' ? 0.4 : 1} dot={{ r: activeTab === 'Focus' ? 4 : 0 }} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Cognitive Response (Bar Chart) */}
        <Card variant="white" className="p-4 sm:p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
              Daily Cognitive Response
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Number of completed cognitive tasks per day</p>
          </div>

          <div className="h-56 sm:h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#172B4D', marginBottom: '4px' }}
                  formatter={(value) => [value, 'Tasks Completed']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                />
                <Bar dataKey="sessionsCount" fill="#2F6FED" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Summary */}
      <Card variant="white" className="p-4 sm:p-5 bg-gradient-to-r from-[#F0F5FF] to-white border-l-4 border-l-[#2F6FED] mt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2F6FED] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#172B4D] mb-1">AI Cognitive Summary</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Generated from recorded cognitive exercise performance</p>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {isAiLoading ? 'Analyzing recent trends...' : aiSummary}
            </p>
          </div>
        </div>
      </Card>

      {/* Data Transparency / Explanation */}
      <Card variant="white" className="overflow-hidden mt-4">
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">How is this calculated?</span>
          </div>
          {showExplanation ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        {showExplanation && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium leading-relaxed space-y-2">
            <p>
              These indicators are derived from recorded Neuronex cognitive exercises. Metrics use actual responses, task accuracy, completion rates, and other available gameplay measures.
            </p>
            <p>
              Different games naturally measure different cognitive domains. Where data is absent, a domain is appropriately marked as "N/A — not measured in this activity".
            </p>
            <p>
              Performance is primarily compared with the patient's own previous activity to establish a valid personal baseline. The system also normalizes evaluations based on the dynamic adaptive difficulty (Levels 1–10) of the exercises.
            </p>
            <p className="text-amber-600 font-bold bg-amber-50 p-2 rounded-lg mt-2">
              Important: These indicators are intended solely for activity and performance monitoring. They are NOT a clinical dementia diagnosis and do not represent medical advice.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
