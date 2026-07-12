import React, { useEffect } from 'react';
import { Trophy, Medal, Flame, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const baseUsers = [
    { name: 'Arjun', points: 980, level: 'Warrior', streak: 8 },
    { name: 'Meena', points: 850, level: 'Scholar', streak: 5 },
    { name: 'Karthik', points: 720, level: 'Apprentice', streak: 3 },
    { name: 'Priya', points: 650, level: 'Apprentice', streak: 2 },
];

const rankIcons = [Crown, Trophy, Medal];
const rankColors = ['var(--yellow)', '#cbd5e1', 'var(--orange)'];
const rankBgs = [
    'linear-gradient(135deg, var(--primary), var(--blue))',
    'linear-gradient(135deg, var(--orange), var(--red))',
    'linear-gradient(135deg, var(--purple), #ec4899)',
    '#334155', '#334155', '#334155',
];

export default function Leaderboard({ user }) {
    const { xp, getLevel, getStreakCount, userProfile } = useApp();
    const { level, title } = getLevel();
    const streak = getStreakCount();

    useEffect(() => {
        console.log('🏆 Leaderboard: Mounted. User points:', xp, 'Rank Title:', title);
    }, [xp, title]);

    const allUsers = [
        { name: userProfile?.name || 'Dharanyad162005', points: xp, level: title, streak, isUser: true },
        ...baseUsers,
    ].sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));

    return (
        <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="text-center">
                <h1 className="text-white" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <Trophy size={40} className="text-yellow" style={{ filter: 'drop-shadow(0 0 15px rgba(234,179,8,0.5))' }} />
                    Weekly Leaderboard
                </h1>
                <p className="text-muted text-lg">Compete with friends and stay motivated.</p>
            </div>

            <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px', padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <div className="text-center">Rank</div>
                    <div>Student</div>
                    <div className="text-center">Level</div>
                    <div className="text-right" style={{ paddingRight: '1rem' }}>Points</div>
                </div>

                <div className="flex flex-col gap-2">
                    {allUsers.map((u) => {
                        const RankIcon = rankIcons[u.rank - 1];
                        return (
                            <div key={u.rank} style={{
                                display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px', alignItems: 'center',
                                padding: '1rem', borderRadius: '1.5rem', transition: '0.3s',
                                background: u.isUser ? 'rgba(34,197,94,0.1)' : 'transparent',
                                border: u.isUser ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                            }}>
                                <div className="flex justify-center">
                                    {RankIcon ? <RankIcon size={24} style={{ color: rankColors[u.rank - 1], filter: `drop-shadow(0 0 8px ${rankColors[u.rank - 1]})` }} />
                                        : <span className="text-muted font-bold text-xl">{u.rank}</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: rankBgs[u.rank - 1] || '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-bold">{u.name} {u.isUser && <span className="badge" style={{ marginLeft: 8 }}>You</span>}</h3>
                                        <div className="text-orange text-xs flex items-center gap-1 font-bold"><Flame size={12} /> {u.streak} Day Streak</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="badge text-muted" style={{ background: 'rgba(0,0,0,0.3)' }}>{u.level}</span>
                                </div>
                                <div className="text-right" style={{ paddingRight: '1rem' }}>
                                    <span className="text-white" style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{u.points}</span>
                                    <span className="text-muted text-xs font-bold" style={{ marginLeft: '4px', textTransform: 'uppercase' }}>pts</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
