import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Clock, AlertTriangle, ArrowDown, CheckCircle2, Plus, Shield, ShieldOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = { productive: '#22c55e', wasted: '#ef4444' };
const PIE_COLORS = ['#22c55e', '#ec4899', '#ef4444', '#a855f7', '#f97316', '#3b82f6', '#eab308'];

export default function TimeAnalyzer() {
    const { timeEntries, blockerEnabled, toggleBlocker, wasteStats, addDistraction, distractionData } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [platform, setPlatform] = useState('youtube');
    const [formMin, setFormMin] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        console.log('⏱️ TimeAnalyzer: Mounted. Entries:', timeEntries.length, 'Blocker:', blockerEnabled);
    }, [timeEntries.length, blockerEnabled]);

    const handleLog = (e) => {
        e.preventDefault();
        if (platform && formMin) {
            addDistraction(platform, formMin);
            setFormMin(''); setShowForm(false);
            showToast('Distraction logged!');
        }
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // Aggregate by name for pie chart
    const pieData = [];
    let colorIndex = 0;
    
    if (distractionData) {
        Object.entries(distractionData).forEach(([plat, mins]) => {
            if (mins > 0) {
                pieData.push({ name: plat.charAt(0).toUpperCase() + plat.slice(1), value: mins, color: PIE_COLORS[colorIndex % PIE_COLORS.length] });
                colorIndex++;
            }
        });
    }

    const { wastedMinutes, manualDistractions } = wasteStats || { wastedMinutes: 0, manualDistractions: 0 };
    const unaccounted = Math.max(0, wastedMinutes - (manualDistractions || 0));
    if (unaccounted > 0) {
        pieData.push({ name: 'Unaccounted Idle', value: unaccounted, color: 'var(--border-light)' });
    }

    // Weekly mock data enhanced with logged entries
    const weeklyData = [
        { name: 'Mon', productive: 4, wasted: 3 }, { name: 'Tue', productive: 5, wasted: 2 },
        { name: 'Wed', productive: 3, wasted: 4 }, { name: 'Thu', productive: 6, wasted: 1.5 },
        { name: 'Fri', productive: 4.5, wasted: 3 }, { name: 'Sat', productive: 2, wasted: 5 },
        { name: 'Sun', productive: 7, wasted: 1 },
    ];

    const totalWasted = (manualDistractions || 0) + unaccounted;
    const topWastedPlatform = distractionData ? Object.entries(distractionData).sort((a, b) => b[1] - a[1])[0] : null;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title text-white">Time Waste Analyzer</h1>
                    <p className="page-subtitle text-muted">Track and visualize where your time goes each day.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Log Distraction</button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Log Time Entry</h3>
                        <form onSubmit={handleLog} className="flex flex-col gap-4">
                            <select className="todo-input" value={platform} onChange={e => setPlatform(e.target.value)} style={{ cursor: 'pointer' }}>
                                <option value="youtube">YouTube</option>
                                <option value="instagram">Instagram</option>
                                <option value="gaming">Gaming</option>
                                <option value="other">Other</option>
                            </select>
                            <input className="todo-input" type="number" placeholder="Minutes" value={formMin} onChange={e => setFormMin(e.target.value)} required min="1" />
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Entry</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid-cols-3">
                <div className="glass-panel flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-6 w-full text-left">Distractions Today</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} formatter={(v) => [`${Math.floor(v / 60)}h ${v % 60}m`, 'Time']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full flex flex-col gap-3 mt-4">
                        {pieData.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                                    <span className="text-muted">{item.name}</span>
                                </div>
                                <span className="text-white font-bold">{Math.floor(item.value / 60)}h {item.value % 60}m</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: 'var(--red)', borderRadius: '1rem' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI Feedback</h3>
                            <p className="text-muted text-sm">Actionable insights from your usage</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        {topWastedPlatform && topWastedPlatform[1] > 0 ? (
                            <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', borderRadius: '0.5rem' }}>
                                    <ArrowDown size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">High {topWastedPlatform[0].charAt(0).toUpperCase() + topWastedPlatform[0].slice(1)} Usage</h4>
                                    <p className="text-muted text-sm">You spent {Math.floor(topWastedPlatform[1] / 60)}h {topWastedPlatform[1] % 60}m on {topWastedPlatform[0]}. Total wasted: {Math.floor(totalWasted / 60)}h {totalWasted % 60}m.</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '1rem', display: 'flex', gap: '1rem' }}>
                                <CheckCircle2 size={20} className="text-primary" />
                                <p className="text-muted text-sm">Great focus today! Keep it up.</p>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button className="btn" onClick={() => { toggleBlocker(); showToast(blockerEnabled ? 'Blocker disabled' : 'Blocker enabled!'); }}
                            style={{ background: blockerEnabled ? 'rgba(34,197,94,0.2)' : 'var(--red)', color: blockerEnabled ? 'var(--primary)' : 'white' }}>
                            {blockerEnabled ? <ShieldOff size={18} /> : <Shield size={18} />} {blockerEnabled ? 'Disable Blocker' : 'Enable Blocker'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <h3 className="text-xl font-bold text-white mb-6">Productive vs Wasted (Weekly)</h3>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                            <Legend />
                            <Bar dataKey="productive" name="Productive (hrs)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="wasted" name="Wasted (hrs)" fill="var(--red)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {toast && <div className="toast">{toast}</div>}
        </>
    );
}
