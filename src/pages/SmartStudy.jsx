import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee, Moon, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PRESETS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

export default function SmartStudy() {
    const { addFocusSession, focusSessions, deepWorkActive, toggleDeepWork, wasteStats, timeEntries, getOverallLifeScore, lifeScores } = useApp();
    const { wastedMinutes } = wasteStats || { wastedMinutes: 0 };
    const manualWasted = timeEntries.filter(e => e.category === 'wasted').reduce((a, e) => a + e.minutes, 0);
    const unaccounted = Math.max(0, wastedMinutes - manualWasted);
    
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(PRESETS.focus);
    const [isActive, setIsActive] = useState(false);
    const [recap, setRecap] = useState(null);

    const lowSkill = lifeScores?.Skills < 50;
    const lowReading = lifeScores?.Reading < 50;

    useEffect(() => {
        console.log('🧠 SmartStudy: Mounted. Total Sessions:', focusSessions, 'Deep Work:', deepWorkActive);
    }, [focusSessions, deepWorkActive]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;
        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [isActive]);

    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (mode === 'focus') {
                const lifeScore = getOverallLifeScore();
                const multiplier = lifeScore > 80 ? 1.5 : 1;
                const earnedXP = Math.round(20 * multiplier);
                const earnedCoins = Math.round(10 * multiplier);
                addFocusSession(PRESETS.focus / 60);
                setRecap({ xp: earnedXP, coins: earnedCoins });
                setTimeout(() => setRecap(null), 5000);
            }
            // Auto-switch
            if (mode === 'focus') { setMode('short'); setTimeLeft(PRESETS.short); }
            else { setMode('focus'); setTimeLeft(PRESETS.focus); }
        }
    }, [timeLeft, isActive]);

    const switchMode = (m) => { setMode(m); setTimeLeft(PRESETS[m]); setIsActive(false); };
    const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const progress = ((PRESETS[mode] - timeLeft) / PRESETS[mode]) * 100;
    const color = mode === 'focus' ? 'var(--primary)' : mode === 'short' ? 'var(--blue)' : 'var(--purple)';

    return (
        <>
            <div className="page-header justify-center text-center flex-col">
                <h1 className="page-title text-white">Smart Study Mode</h1>
                <p className="page-subtitle text-muted">Maximize your focus with the Pomodoro technique.</p>
            </div>

            {unaccounted > 180 && (
                <div className="flex justify-center w-full" style={{ marginTop: '1rem', marginBottom: '-0.5rem' }}>
                    <div style={{ maxWidth: '28rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <AlertCircle size={24} className="text-red flex-shrink-0" />
                        <p className="text-sm text-red" style={{ textAlign: 'left', lineHeight: '1.4' }}>Detected a productivity dip. We suggest moving your High Priority tasks to tomorrow morning when your focus is higher.</p>
                    </div>
                </div>
            )}

            {(lowSkill || lowReading) && (
                <div className="flex justify-center w-full" style={{ marginTop: '1rem', marginBottom: '-0.5rem' }}>
                    <div style={{ maxWidth: '28rem', padding: '1rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Brain size={24} className="text-purple flex-shrink-0" />
                        <p className="text-sm text-purple" style={{ textAlign: 'left', lineHeight: '1.4' }}>
                            <strong>Smart Suggestion:</strong> Your {lowReading ? 'Reading' : 'Skills'} score is low ({lifeScores[lowReading ? 'Reading' : 'Skills']}%). Consider dedicating this Pomodoro to it!
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-center w-full" style={{ marginTop: '1rem' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '28rem', textAlign: 'center' }}>
                    <div className="flex justify-between items-center mb-4">
                        <button className={`btn btn-sm ${deepWorkActive ? 'btn-primary' : 'btn-outline'}`} onClick={toggleDeepWork}>
                            {deepWorkActive ? <ShieldOff size={14} /> : <Shield size={14} />} {deepWorkActive ? 'Exit Deep Work' : 'Deep Work'}
                        </button>
                        <span className="badge" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>{focusSessions} sessions</span>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        {[['focus', 'Pomodoro', Brain], ['short', 'Short Break', Coffee], ['long', 'Long Break', Moon]].map(([key, label, Icon]) => (
                            <button key={key} className="btn btn-sm" onClick={() => switchMode(key)}
                                style={{ background: mode === key ? `${color}20` : 'transparent', color: mode === key ? color : 'var(--text-muted)' }}>
                                <Icon size={14} /> {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center items-center mb-8" style={{ position: 'relative', width: 250, height: 250, margin: '0 auto' }}>
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="125" cy="125" r="115" stroke="rgba(0,0,0,0.5)" strokeWidth="8" fill="transparent" />
                            <circle cx="125" cy="125" r="115" stroke={color} strokeWidth="8" fill="transparent"
                                style={{ transition: '1s linear', strokeDasharray: 722.56, strokeDashoffset: 722.56 - (722.56 * progress) / 100, strokeLinecap: 'round' }} />
                        </svg>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'white' }}>{fmt(timeLeft)}</h2>
                            <p style={{ marginTop: '0.5rem', fontWeight: 600, textTransform: 'uppercase', color, letterSpacing: '2px' }}>
                                {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Relax' : 'Rest'}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-6">
                        <button onClick={() => setIsActive(!isActive)}
                            style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', background: isActive ? 'rgba(0,0,0,0.5)' : color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 8px 25px ${color}40` }}>
                            {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 6 }} />}
                        </button>
                        <button onClick={() => { setIsActive(false); setTimeLeft(PRESETS[mode]); }}
                            className="icon-btn" style={{ width: 56, height: 56, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)' }}>
                            <RotateCcw size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <div className="glass-panel items-center flex gap-4" style={{ padding: '1rem 2rem', borderRadius: '2rem' }}>
                    <span className="text-muted text-sm">Today's Focus:</span>
                    <div className="flex gap-2">
                        {[...Array(Math.max(4, focusSessions))].map((_, i) => (
                            <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < focusSessions ? 'var(--primary)' : 'rgba(0,0,0,0.4)', boxShadow: i < focusSessions ? '0 0 10px rgba(34,197,94,0.8)' : 'none' }} />
                        ))}
                    </div>
                    <span className="text-primary font-bold text-sm">{focusSessions * 25}min</span>
                </div>
            </div>
            {recap && (
                <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-dark)', border: '1px solid var(--primary)', padding: '1rem 2rem', borderRadius: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideUp 0.3s ease-out' }}>
                    <div style={{ background: 'rgba(34,197,94,0.2)', padding: '0.5rem', borderRadius: '50%' }}><Play className="text-primary" size={20} /></div>
                    <div>
                        <p className="text-white font-bold mb-1">Session Recap</p>
                        <p className="text-sm text-muted">You earned <span className="text-yellow font-bold">{recap.coins} Coins</span> and improved your Focus Efficiency by 2%!</p>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
            `}</style>
        </>
    );
}
