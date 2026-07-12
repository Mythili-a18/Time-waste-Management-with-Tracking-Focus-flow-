import React, { useEffect } from 'react';
import { Flame, Check, Shield, Swords, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Streaks() {
    const { getStreakCount, getLongestStreak, streakDays, useStreakFreeze, getFreezesRemaining, duelData, startDuel } = useApp();
    const streak = getStreakCount();
    const longest = getLongestStreak();
    const freezesLeft = getFreezesRemaining();

    useEffect(() => {
        console.log('🔥 Streaks: Mounted. Current Streak:', streak, 'Longest:', longest);
    }, [streak, longest]);

    // Build this week's data
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekData = weekDays.map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - mondayOffset + i);
        const key = d.toISOString().slice(0, 10);
        return { day: weekDays[i], active: streakDays.includes(key), isToday: i === mondayOffset };
    });

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title text-white flex items-center gap-3">Streaks & Consistency <Flame className="text-orange" /></h1>
                    <p className="page-subtitle text-muted">Continuous discipline builds success.</p>
                </div>
            </div>

            <div className="grid-cols-1-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <div className="glass-panel items-center justify-center flex flex-col text-center" style={{ padding: '3rem', border: '1px solid rgba(249,115,22,0.3)', background: 'linear-gradient(to bottom right, rgba(15,16,20,0.9), rgba(249,115,22,0.1))' }}>
                    <Flame size={80} className="text-orange" style={{ filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))' }} />
                    <h2 className="text-white" style={{ fontSize: '5rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: '1rem 0 0.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
                        {streak}
                    </h2>
                    <p className="text-orange text-sm font-bold" style={{ letterSpacing: '3px', textTransform: 'uppercase' }}>Day Streak🔥</p>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">This Week's Consistency</h3>
                    <div className="flex justify-between gap-2">
                        {weekData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 w-full">
                                <span className="text-sm font-bold text-muted">{d.day}</span>
                                <div style={{
                                    width: '3.5rem', height: '4.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s',
                                    background: d.active ? 'rgba(249,115,22,0.15)' : 'rgba(0,0,0,0.3)',
                                    color: d.active ? 'var(--orange)' : 'var(--text-muted)',
                                    border: d.active ? '1px solid rgba(249,115,22,0.3)' : d.isToday ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                                    boxShadow: d.active ? '0 0 15px rgba(249,115,22,0.2)' : 'none',
                                    transform: d.isToday ? 'scale(1.1)' : 'scale(1)'
                                }}>
                                    {d.active ? <Check size={28} /> : '-'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 grid-cols-3 text-center" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <div>
                            <p className="text-sm text-muted font-bold mb-2" style={{ textTransform: 'uppercase' }}>Target</p>
                            <h4 className="text-2xl font-bold text-primary font-display">30 Days</h4>
                        </div>
                        <div>
                            <p className="text-sm text-muted font-bold mb-2" style={{ textTransform: 'uppercase' }}>Longest</p>
                            <h4 className="text-2xl font-bold text-white font-display">{longest} Days</h4>
                        </div>
                        <div>
                            <p className="text-sm text-muted font-bold mb-2" style={{ textTransform: 'uppercase' }}>Progress</p>
                            <h4 className="text-2xl font-bold text-orange font-display">{Math.round((streak / 30) * 100)}%</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Freeze + Duel Mode */}
            <div className="grid-cols-2">
                <div className="glass-panel">
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.2)', borderRadius: '1rem', color: 'var(--blue)' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Streak Freeze</h3>
                            <p className="text-muted text-sm">Protect your streak on missed days (max 2/month)</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            {[0, 1].map(i => (
                                <div key={i} style={{ width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < freezesLeft ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${i < freezesLeft ? 'rgba(59,130,246,0.3)' : 'var(--border-light)'}`, color: i < freezesLeft ? 'var(--blue)' : 'var(--text-muted)' }}>
                                    <Shield size={20} />
                                </div>
                            ))}
                        </div>
                        <span className="text-muted text-sm font-bold">{freezesLeft} remaining</span>
                    </div>
                    <button className="btn btn-primary w-full" style={{ justifyContent: 'center', opacity: freezesLeft > 0 ? 1 : 0.5 }} onClick={freezesLeft > 0 ? useStreakFreeze : undefined} disabled={freezesLeft === 0}>
                        <Shield size={16} /> Use Streak Freeze
                    </button>
                </div>

                <div className="duel-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.2)', borderRadius: '1rem', color: 'var(--purple)' }}>
                            <Swords size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Duel Mode</h3>
                            <p className="text-muted text-sm">Compare streaks with friends</p>
                        </div>
                    </div>
                    {duelData.active ? (
                        <div className="flex items-center justify-between" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>
                            <div className="text-center">
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                    <User size={24} color="white" />
                                </div>
                                <p className="text-white font-bold">You</p>
                                <p className="text-3xl font-bold text-primary font-display">{streak}</p>
                            </div>
                            <div className="duel-vs">VS</div>
                            <div className="text-center">
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                    <User size={24} color="white" />
                                </div>
                                <p className="text-white font-bold">{duelData.opponent}</p>
                                <p className="text-3xl font-bold text-purple font-display">{duelData.theirStreak}</p>
                            </div>
                        </div>
                    ) : (
                        <button className="btn btn-outline w-full" onClick={() => startDuel('Arjun')} style={{ justifyContent: 'center', borderColor: 'rgba(168,85,247,0.4)', color: 'var(--purple)' }}>
                            <Swords size={16} /> Start a Duel
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
