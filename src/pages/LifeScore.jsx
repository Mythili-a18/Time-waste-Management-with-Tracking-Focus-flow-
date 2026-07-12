import React, { useEffect } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Heart, Brain, Moon, Dumbbell, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = { Study: BookOpen, Exercise: Dumbbell, Sleep: Moon, Reading: Brain, Skills: Heart };
const COLORS = { Study: 'var(--blue)', Exercise: 'var(--orange)', Sleep: '#6366f1', Reading: 'var(--purple)', Skills: 'var(--primary)' };

export default function LifeScore() {
    const { lifeScores, updateLifeScore, getOverallLifeScore, getStreakCount } = useApp();
    const overall = getOverallLifeScore();
    const streak = getStreakCount();
    const multiplier = Math.min(1 + streak * 0.05, 2.0).toFixed(2);

    useEffect(() => {
        console.log('💚 LifeScore: Mounted. Overall:', overall, 'Multiplier:', multiplier);
    }, [overall, multiplier]);

    const getStatusText = () => {
        if (overall > 80) return "Status: Peak Performance 🚀";
        if (overall >= 50) return "Status: Steady Progress 📈";
        return "Status: Needs Focus ⚠️";
    };

    const radarData = Object.entries(lifeScores).map(([subject, A]) => ({ subject, A, fullMark: 100 }));

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title text-white">Life Score System</h1>
                    <p className="page-subtitle text-muted">Track your overall wellbeing, not just your studies.</p>
                </div>
            </div>

            <div className="grid-cols-1-2">
                <div className="glass-panel items-center justify-center flex flex-col relative overflow-hidden text-center" style={{ minHeight: '300px' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 250, height: 250, background: 'rgba(34,197,94,0.1)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <Heart size={48} className="text-red mb-4" style={{ filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.5))' }} />
                    <h2 className="text-muted mb-6 text-sm font-bold" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>Overall Life Score</h2>
                    <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 1.5rem' }}>
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="110" cy="110" r="95" stroke="rgba(0,0,0,0.5)" strokeWidth="12" fill="transparent" />
                            <circle cx="110" cy="110" r="95" stroke={overall > 80 ? 'var(--primary)' : overall >= 50 ? 'var(--yellow)' : 'var(--red)'} strokeWidth="12" fill="transparent" strokeDasharray={596.9} strokeDashoffset={596.9 - (596.9 * overall / 100)} style={{ transition: '1s ease-out', strokeLinecap: 'round', filter: `drop-shadow(0 0 12px ${overall > 80 ? 'var(--primary)' : overall >= 50 ? 'var(--yellow)' : 'var(--red)'})` }} />
                        </svg>
                        <div className="flex items-center justify-center flex-col" style={{ position: 'absolute', inset: 0 }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'white' }}>{overall}<span style={{ fontSize: '2rem', color: 'var(--primary)' }}>%</span></span>
                        </div>
                    </div>
                    <p className="font-bold mb-2" style={{ color: overall > 80 ? 'var(--primary)' : overall >= 50 ? 'var(--yellow)' : 'var(--red)', fontSize: '1.2rem' }}>{getStatusText()}</p>
                    <p className="text-muted text-xs mt-2">Formula: 40% Tasks + 30% Consistency + 30% Focus</p>
                </div>

                <div className="glass-panel">
                    <h3 className="text-xl font-bold text-white mb-6">Balance Analysis</h3>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <h3 className="text-xl font-bold text-white mb-6">Adjust Your Scores</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(lifeScores).map(([category, score]) => {
                        const Icon = ICONS[category] || Heart;
                        const color = COLORS[category] || 'var(--primary)';
                        return (
                            <div key={category} style={{ padding: '1.5rem', borderRadius: '1.5rem', background: 'rgba(30,41,59,0.5)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.3s' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '1rem', color: 'white', marginBottom: '1rem', background: color, boxShadow: `0 0 15px ${color}80` }}>
                                    <Icon size={24} />
                                </div>
                                <h4 className="text-muted font-bold mb-1">{category}</h4>
                                <div className="text-white font-bold text-2xl mb-4">{score}%</div>
                                <input
                                    type="range"
                                    className="range-slider"
                                    min="0" max="100"
                                    value={score}
                                    onChange={(e) => updateLifeScore(category, e.target.value)}
                                    style={{ accentColor: color }}
                                />
                                <div className="progress-bar-bg mt-2" style={{ height: 6 }}>
                                    <div className="progress-bar-fill" style={{ width: `${score}%`, background: color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
