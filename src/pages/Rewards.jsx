import React, { useEffect } from 'react';
import { Gift, Lock, Unlock, Star, Zap, Crown, TrendingUp, Palette, Coins, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const REWARD_TIERS = [
    { level: 1, title: 'Beginner', xpRequired: 0, icon: Star, color: 'var(--text-muted)' },
    { level: 5, title: 'Focus Warrior', xpRequired: 400, icon: Zap, color: 'var(--orange)' },
    { level: 10, title: 'Productivity Master', xpRequired: 1000, icon: Crown, color: 'var(--yellow)' },
    { level: 20, title: 'Time Lord', xpRequired: 2000, icon: Gift, color: 'var(--purple)' },
];

export default function Rewards() {
    const { xp, getLevel, focusCoins, purchaseTheme, applyTheme, unlockedThemes, activeTheme, badges } = useApp();
    const { level, title, next } = getLevel();
    const prevThreshold = REWARD_TIERS.find(t => t.level === level)?.xpRequired || 0;
    const progressPercent = next === Infinity ? 100 : Math.min(100, ((xp - prevThreshold) / (next - prevThreshold)) * 100);

    useEffect(() => {
        console.log('🎁 Rewards: Mounted. Level:', level, 'Title:', title, 'XP:', xp);
    }, [level, title, xp]);

    return (
        <>
            <div className="page-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title text-white">Rewards System 🎁</h1>
                    <p className="page-subtitle text-muted">Complete tasks and Pomodoros to earn XP and level up.</p>
                </div>
                <div className="glass-panel flex items-center gap-3" style={{ padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.05)' }}>
                    <div style={{ background: 'rgba(234,179,8,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Coins className="text-yellow" size={24} />
                    </div>
                    <div>
                        <p className="text-muted text-xs font-bold uppercase tracking-wider">Focus Coins</p>
                        <p className="text-yellow font-bold text-2xl" style={{ lineHeight: 1 }}>{focusCoins || 0}</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.1), rgba(59,130,246,0.1))', padding: '2.5rem', borderRadius: '2rem', marginBottom: '1rem' }}>
                <div className="flex justify-between items-center w-full" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-6">
                        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(15,16,20,0.8)', border: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
                            <span className="text-white font-bold text-2xl font-display">Lvl {level}</span>
                        </div>
                        <div>
                            <p className="text-muted font-bold mb-1">Current Status</p>
                            <h2 className="text-white font-bold font-display" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>{title}</h2>
                            <p className="text-primary text-sm font-bold">
                                <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                {xp} / {next === Infinity ? '∞' : next} XP {next !== Infinity ? `to Level ${REWARD_TIERS.find(t => t.xpRequired === next)?.level || level + 1}` : '(Max!)'}
                            </p>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                        <div className="flex justify-between text-xs text-muted font-bold mb-2">
                            <span>Level {level}</span>
                            <span>{next === Infinity ? 'MAX' : `Level ${REWARD_TIERS.find(t => t.xpRequired === next)?.level || ''}`}</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(to right, var(--primary), var(--blue))', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-cols-4">
                {REWARD_TIERS.map((reward) => {
                    const unlocked = xp >= reward.xpRequired;
                    return (
                        <div key={reward.level} className="glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '2rem', transition: '0.3s', opacity: unlocked ? 1 : 0.5, borderColor: unlocked ? 'rgba(34,197,94,0.3)' : 'var(--border-light)' }}>
                            <div style={{ position: 'absolute', right: -40, top: -40, width: 120, height: 120, borderRadius: '50%', background: unlocked ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', filter: 'blur(30px)' }} />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div style={{ padding: '1rem', borderRadius: '1rem', background: unlocked ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.3)', color: unlocked ? reward.color : 'var(--text-muted)' }}>
                                    <reward.icon size={32} />
                                </div>
                                {unlocked ? <Unlock size={20} className="text-primary" /> : <Lock size={20} className="text-muted" />}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-1">{reward.title}</h3>
                                <p className="text-sm text-muted">Level {reward.level} • {reward.xpRequired} XP</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <h3 className="text-xl font-bold text-white mt-12 mb-6 flex items-center gap-2"><Star className="text-yellow" /> Earned Badges</h3>
            <div className="grid-cols-3">
                {[
                    { id: 'Early Bird', icon: Zap, desc: 'Complete a task before 9 AM', color: 'var(--yellow)' },
                    { id: 'Focus Master', icon: Crown, desc: 'Complete 3 Pomodoro sessions', color: 'var(--orange)' },
                    { id: 'Streak Warrior', icon: TrendingUp, desc: 'Maintain a 14-day streak', color: 'var(--primary)' },
                ].map(badge => {
                    const isUnlocked = badges?.includes(badge.id);
                    return (
                        <div key={badge.id} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', opacity: isUnlocked ? 1 : 0.4, transition: '0.3s', filter: isUnlocked ? 'none' : 'grayscale(100%)', border: isUnlocked ? `1px solid ${badge.color}` : '1px solid var(--border-light)' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: isUnlocked ? `${badge.color}20` : 'rgba(0,0,0,0.3)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isUnlocked ? badge.color : 'var(--text-muted)', boxShadow: isUnlocked ? `0 0 15px ${badge.color}40` : 'none' }}>
                                <badge.icon size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">{badge.id}</h4>
                            <p className="text-sm text-muted mb-3">{badge.desc}</p>
                            {isUnlocked ? <span className="badge" style={{ background: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}` }}><Unlock size={12} style={{ display: 'inline', marginRight: 4 }} /> Unlocked</span> : <span className="badge bg-dark"><Lock size={12} style={{ display: 'inline', marginRight: 4 }} /> Locked</span>}
                        </div>
                    );
                })}
            </div>

            <h3 className="text-xl font-bold text-white mt-12 mb-6 flex items-center gap-2"><Palette className="text-purple" /> Theme Shop</h3>
            <div className="grid-cols-2">
                {[
                    { id: 'neon-emerald', name: 'Neon Emerald', cost: 100, desc: 'A vibrant green hacker theme.', color: '#22c55e' },
                    { id: 'deep-ocean', name: 'Deep Ocean', cost: 200, desc: 'A calming deep blue aesthetic.', color: '#3b82f6' }
                ].map(theme => {
                    const isUnlocked = unlockedThemes?.includes(theme.id);
                    const isActive = activeTheme === theme.id;
                    return (
                        <div key={theme.id} className="glass-panel flex flex-col justify-between" style={{ padding: '1.5rem', border: isActive ? `2px solid ${theme.color}` : '1px solid var(--border-light)' }}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: theme.color, display: 'inline-block' }} />
                                        {theme.name}
                                    </h4>
                                    {!isUnlocked && <span className="badge flex items-center gap-1" style={{ color: 'var(--yellow)', border: '1px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.1)' }}><Coins size={12}/> {theme.cost}</span>}
                                </div>
                                <p className="text-sm text-muted mb-6">{theme.desc}</p>
                            </div>
                            {isUnlocked ? (
                                <button className={`btn w-full ${isActive ? 'btn-outline' : 'btn-primary'}`} onClick={() => applyTheme(theme.id)} disabled={isActive}>
                                    {isActive ? <><CheckCircle2 size={16}/> Applied</> : 'Apply Theme'}
                                </button>
                            ) : (
                                <button className="btn w-full btn-primary" onClick={() => purchaseTheme(theme.id, theme.cost)} disabled={(focusCoins || 0) < theme.cost}>
                                    Unlock for {theme.cost} Coins
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
