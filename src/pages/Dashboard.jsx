import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, Zap, Clock, TrendingUp, Trophy, Sparkles, Play, Pause, RotateCcw, Brain, Coffee, Moon, Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const productivityData = [
    { name: 'Mon', score: 65, tasks: 4 }, { name: 'Tue', score: 80, tasks: 6 },
    { name: 'Wed', score: 75, tasks: 5 }, { name: 'Thu', score: 90, tasks: 8 },
    { name: 'Fri', score: 85, tasks: 7 }, { name: 'Sat', score: 40, tasks: 2 },
    { name: 'Sun', score: 95, tasks: 9 },
];

const TIMER_PRESETS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

export default function Dashboard({ user }) {
    const { xp, focusSessions, getTotalCompletedTasks, getTotalTasks, getOverallLifeScore, getLevel, addFocusSession, toggleDeepWork, deepWorkActive, streakDays, getMostProductiveDay, timeEntries, wasteStats } = useApp();

    useEffect(() => {
        console.log('🏠 Dashboard: Mounted for user:', user?.name || 'Unknown');
        console.log('📊 Dashboard Stats:', { xp, focusSessions, completedTasks: getTotalCompletedTasks(), totalTasks: getTotalTasks(), lifeScore: getOverallLifeScore() });
    }, []);

    // Embedded Pomodoro
    const [timerMode, setTimerMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return;
        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [isRunning]);

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            if (timerMode === 'focus') addFocusSession(25);
        }
    }, [timeLeft, isRunning]);

    const switchMode = (mode) => { setTimerMode(mode); setTimeLeft(TIMER_PRESETS[mode]); setIsRunning(false); };
    const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const progress = ((TIMER_PRESETS[timerMode] - timeLeft) / TIMER_PRESETS[timerMode]) * 100;
    const timerColor = timerMode === 'focus' ? 'var(--primary)' : timerMode === 'short' ? 'var(--blue)' : 'var(--purple)';

    // Heatmap
    const heatmapData = (() => {
        const cells = [];
        const today = new Date();
        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const active = streakDays.includes(key);
            const level = active ? Math.min(Math.floor(Math.random() * 3) + 2, 4) : (Math.random() > 0.7 ? 1 : 0);
            cells.push({ date: key, level: active ? level : (streakDays.includes(key) ? 2 : level) });
        }
        return cells;
    })();

    const lifeScore = getOverallLifeScore();
    const levelInfo = getLevel();
    const completed = getTotalCompletedTasks();
    const total = getTotalTasks();
    const mostProductiveDay = getMostProductiveDay();

    const wastedEntries = timeEntries.filter(e => e.category === 'wasted');
    const topWasted = wastedEntries.sort((a, b) => b.minutes - a.minutes);

    const insights = [
        `Your most productive day is ${mostProductiveDay}! Schedule tough tasks then.`,
        `You've completed ${focusSessions} Pomodoro sessions. Keep building that streak!`,
        `${completed}/${total || 1} tasks completed. Stay consistent!`,
        `You're Level ${levelInfo.level}: ${levelInfo.title} with ${xp} XP!`,
    ];
    
    const { wastedMinutes, activeMinutes, elapsedMinutes } = wasteStats || { wastedMinutes: 0, activeMinutes: 0, elapsedMinutes: 0 };
    const showWasteAlert = wastedMinutes > 120;
    const [aiText, setAiText] = useState('Analyzing...');
    const nudgeSetRef = React.useRef(false);
    
    useEffect(() => { 
        if (showWasteAlert && !nudgeSetRef.current) {
            setAiText("Detecting a focus slump. Recommended: 10min Break or a 25min Pomodoro.");
            nudgeSetRef.current = true;
        } else if (!showWasteAlert && aiText === 'Analyzing...') {
            setAiText(insights[Math.floor(Math.random() * insights.length)]); 
        }
    }, [showWasteAlert]);

    return (
        <>
            <div className="welcome-banner">
                <div>
                    <h1 className="text-white" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back, {user?.name || 'Student'}! 👋</h1>
                    <p className="text-muted">Your focus is impeccable today. Let's build that streak.</p>
                    <div className="glass-panel" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(34,197,94,0.1)', padding: '0.5rem', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-primary" style={{ marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>AI Suggestion <span className="badge">Smart Mode</span></h3>
                            <p className="text-sm text-muted">{aiText}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="48" cy="48" r="36" stroke="rgba(0,0,0,0.5)" strokeWidth="8" fill="transparent" />
                            <circle cx="48" cy="48" r="36" stroke="var(--primary)" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * lifeScore) / 100} style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="text-white font-bold text-2xl">{lifeScore}</span>
                            <span className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Score</span>
                        </div>
                    </div>
                    <div>
                        <div className="mb-4">
                            <p className="text-muted text-sm mb-1">Total XP</p>
                            <span className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--yellow)' }}>{xp.toLocaleString()} <Trophy size={20} /></span>
                        </div>
                        <div>
                            <p className="text-muted text-sm mb-1">Reward Rank</p>
                            <span className="badge" style={{ color: 'var(--purple)', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.1)' }}>Level {levelInfo.level}: {levelInfo.title}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-cols-4">
                <StatCard icon={<Target size={24} className="text-blue" />} label="Tasks Completed" value={`${completed}/${total || 0}`} trend={`${focusSessions} sessions today`} />
                <StatCard icon={<Clock size={24} className="text-red" />} label={<span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>Time Wasted {showWasteAlert && <AlertTriangle size={14} color="var(--red)" />}</span>} value={`${Math.floor(wastedMinutes / 60)}h ${wastedMinutes % 60}m`} trend={`${elapsedMinutes}m elapsed - ${activeMinutes}m active`} trendColor="var(--red)" />
                <StatCard icon={<Zap size={24} className="text-yellow" />} label="Focus Sessions" value={focusSessions} trend={`${focusSessions * 25}min total focus`} />
                <StatCard icon={<TrendingUp size={24} className="text-purple" />} label="Life Score" value={`${lifeScore}%`} trend={`Most productive: ${mostProductiveDay}`} />
            </div>

            {/* Embedded Pomodoro */}
            <div className="grid-cols-2">
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-xl">Quick Pomodoro</h3>
                        <button className={`btn btn-sm ${deepWorkActive ? 'btn-primary' : 'btn-outline'}`} onClick={toggleDeepWork}>
                            <Shield size={14} /> {deepWorkActive ? 'Deep Work ON' : 'Deep Work'}
                        </button>
                    </div>
                    <div className="flex justify-center gap-2 mb-6">
                        {[['focus', 'Focus', Brain], ['short', 'Short', Coffee], ['long', 'Long', Moon]].map(([key, label, Icon]) => (
                            <button key={key} className="btn btn-sm" onClick={() => switchMode(key)}
                                style={{ background: timerMode === key ? `${timerColor}20` : 'transparent', color: timerMode === key ? timerColor : 'var(--text-muted)' }}>
                                <Icon size={14} /> {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 1.5rem' }}>
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r="80" stroke="rgba(0,0,0,0.5)" strokeWidth="6" fill="transparent" />
                            <circle cx="90" cy="90" r="80" stroke={timerColor} strokeWidth="6" fill="transparent" strokeDasharray={502.65} strokeDashoffset={502.65 - (502.65 * progress / 100)} style={{ transition: '1s linear', strokeLinecap: 'round' }} />
                        </svg>
                        <div className="flex items-center justify-center" style={{ position: 'absolute', inset: 0 }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'white' }}>{fmt(timeLeft)}</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setIsRunning(!isRunning); }} style={{ width: 56, height: 56, borderRadius: '50%', border: 'none', background: isRunning ? 'rgba(0,0,0,0.5)' : timerColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 15px ${timerColor}40` }}>
                            {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
                        </button>
                        <button onClick={() => { setIsRunning(false); setTimeLeft(TIMER_PRESETS[timerMode]); }} className="icon-btn" style={{ width: 44, height: 44, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)' }}>
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>

                {/* Consistency Heatmap */}
                <div className="glass-panel">
                    <h3 className="text-white font-bold text-xl mb-2">Consistency Heatmap</h3>
                    <p className="text-muted text-sm mb-4">Last 12 weeks of activity</p>
                    <div className="heatmap-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
                        {heatmapData.map((cell, i) => (
                            <div key={i} className={`heatmap-cell level-${cell.level}`} title={`${cell.date}: Level ${cell.level}`} />
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted">Less</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(l => <div key={l} className={`heatmap-cell level-${l}`} style={{ width: 12, height: 12 }} />)}
                        </div>
                        <span className="text-xs text-muted">More</span>
                    </div>
                    <div className="mt-4" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <p className="text-sm text-muted">📊 Most productive day: <span className="text-primary font-bold">{mostProductiveDay}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid-cols-1-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="glass-panel">
                    <h3 className="text-xl font-bold text-white mb-6">Productivity Trend</h3>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={productivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={4} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-panel">
                    <h3 className="text-xl font-bold text-red mb-6" style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))' }}>Distractions Today</h3>
                    <div className="flex flex-col gap-4">
                        {topWasted.slice(0, 4).map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white font-medium">{item.name}</span>
                                    <span className="text-muted font-bold">{Math.floor(item.minutes / 60)}h {item.minutes % 60}m</span>
                                </div>
                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.min((item.minutes / 180) * 100, 100)}%`, background: 'var(--red)' }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({ icon, label, value, trend, trendColor = "var(--text-muted)" }) {
    return (
        <div className="glass-panel stat-card">
            <div className="stat-icon">{icon}</div>
            <p className="text-muted font-medium text-sm mb-1">{label}</p>
            <h2 className="text-white" style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>{value}</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: trendColor }}>{trend}</p>
        </div>
    );
}
