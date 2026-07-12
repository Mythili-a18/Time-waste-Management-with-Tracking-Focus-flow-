import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, ChevronRight, AlertCircle, Plus, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentMode() {
    const { assignments, exams, addAssignment, completeAssignment, addExam, deleteExam } = useApp();
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', subject: '', due: '' });
    const [examForm, setExamForm] = useState({ title: '', subject: '', date: '' });

    useEffect(() => {
        console.log('📚 StudentMode: Mounted. Assignments:', assignments.length, 'Exams:', exams.length);
    }, [assignments.length, exams.length]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (taskForm.title) {
            addAssignment({ title: taskForm.title, subject: taskForm.subject || 'General', due: taskForm.due || 'Soon', status: 'pending' });
            setTaskForm({ title: '', subject: '', due: '' });
            setShowTaskModal(false);
        }
    };

    const handleAddExam = (e) => {
        e.preventDefault();
        if (examForm.title && examForm.date) {
            addExam({ title: examForm.title, subject: examForm.subject || 'General', date: examForm.date });
            setExamForm({ title: '', subject: '', date: '' });
            setShowExamModal(false);
        }
    };

    const getDaysLeft = (date) => {
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const subjectProgress = {};
    assignments.forEach(a => { subjectProgress[a.subject] = (subjectProgress[a.subject] || 0) + 1; });

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title text-white">Student Hub</h1>
                    <p className="page-subtitle text-muted">Manage assignments and track exam countdowns.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}><Plus size={18} /> Add Task</button>
            </div>

            {/* Add Task Modal */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="modal-title" style={{ margin: 0 }}>New Assignment</h3>
                            <button className="icon-btn" onClick={() => setShowTaskModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                            <input className="todo-input" placeholder="Assignment title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                            <input className="todo-input" placeholder="Subject (e.g. Mathematics)" value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })} />
                            <input className="todo-input" placeholder="Due (e.g. Tomorrow, In 3 days)" value={taskForm.due} onChange={e => setTaskForm({ ...taskForm, due: e.target.value })} />
                            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Add Assignment</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Exam Modal */}
            {showExamModal && (
                <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="modal-title" style={{ margin: 0 }}>New Exam</h3>
                            <button className="icon-btn" onClick={() => setShowExamModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddExam} className="flex flex-col gap-4">
                            <input className="todo-input" placeholder="Exam title" value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} required />
                            <input className="todo-input" placeholder="Subject" value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })} />
                            <input className="todo-input" type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} required />
                            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Add Exam</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid-cols-1-2">
                <div className="flex flex-col gap-6">
                    <div className="glass-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Active Assignments</h3>
                            <span className="badge">{assignments.length} Pending</span>
                        </div>
                        <div className="todo-list">
                            {assignments.map(task => (
                                <div key={task.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1rem' }}>
                                    <div className="flex items-center gap-4">
                                        <button className="icon-btn" onClick={() => completeAssignment(task.id)} title="Mark Done">
                                            <CheckCircle2 size={24} className="text-muted" />
                                        </button>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{task.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-muted">
                                                <span className="flex items-center gap-1"><BookOpen size={14} />{task.subject}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} />{task.due}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {task.status === 'urgent' && (
                                        <span className="badge" style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <AlertCircle size={12} /> Urgent
                                        </span>
                                    )}
                                </div>
                            ))}
                            {assignments.length === 0 && <p className="text-muted text-center py-4">All caught up! 🎉</p>}
                        </div>
                    </div>

                    <div className="grid-cols-2">
                        {Object.entries(subjectProgress).slice(0, 2).map(([subject, count], i) => (
                            <div key={subject} className="glass-panel" style={{ background: `linear-gradient(to bottom right, rgba(30,41,59,0.5), ${i === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)'})` }}>
                                <h4 className="text-muted mb-2">Subject Progress</h4>
                                <div className="text-2xl font-bold text-white mb-4">{subject}</div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, 100 - count * 25)}%`, background: i === 0 ? 'var(--blue)' : 'var(--primary)' }} />
                                </div>
                                <p className="mt-2 text-right text-sm" style={{ color: i === 0 ? 'var(--blue)' : 'var(--primary)' }}>{count} task{count > 1 ? 's' : ''} pending</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel relative overflow-hidden">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, background: 'rgba(168,85,247,0.15)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-purple" /> Exam Countdown</h3>
                    </div>
                    <div className="flex flex-col gap-4 relative z-10">
                        {exams.sort((a, b) => getDaysLeft(a.date) - getDaysLeft(b.date)).map(exam => (
                            <div key={exam.id} style={{ padding: '1.25rem', background: 'rgba(30,41,59,0.5)', borderRadius: '1rem', border: '1px solid var(--border-light)' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-white font-bold">{exam.title}</h4>
                                        <p className="text-sm text-purple">{exam.subject}</p>
                                    </div>
                                    <button className="icon-btn" onClick={() => deleteExam(exam.id)}><Trash2 size={16} className="text-red" /></button>
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white font-display">{getDaysLeft(exam.date)}</span>
                                    <span className="text-muted font-bold text-sm mb-1" style={{ textTransform: 'uppercase' }}>Days Left</span>
                                </div>
                                <p className="text-xs text-muted">Date: {exam.date}</p>
                            </div>
                        ))}
                        {exams.length === 0 && <p className="text-muted text-center py-4">No exams coming up!</p>}
                    </div>
                    <button className="btn btn-outline mt-6 w-full" onClick={() => setShowExamModal(true)} style={{ justifyContent: 'center', borderColor: 'rgba(168,85,247,0.4)', color: 'var(--purple)' }}>
                        <Plus size={18} /> Add Exam
                    </button>
                </div>
            </div>
        </>
    );
}
