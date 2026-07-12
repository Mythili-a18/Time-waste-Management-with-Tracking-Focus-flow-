import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckSquare, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Planner() {
    const { getTasksForDate, addTask, toggleTask, deleteTask, tasks, smartSortTasks } = useApp();
    const [newTodo, setNewTodo] = useState('');
    const [newPriority, setNewPriority] = useState('Medium');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const todayDate = new Date().getDate();
    const todayMonth = new Date().getMonth();
    const todayYear = new Date().getFullYear();
    const [selectedDay, setSelectedDay] = useState(todayDate);

    useEffect(() => {
        console.log('📅 Planner: Page mounted. Today:', new Date().toISOString().slice(0, 10));
        console.log('📊 Planner: Total days with tasks:', Object.keys(tasks).length);
    }, []);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const currentTodos = getTasksForDate(dateKey);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
        setSelectedDay(1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
        setSelectedDay(1);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (newTodo.trim()) {
            console.log('➕ Planner: Add button clicked for:', dateKey);
            addTask(dateKey, { text: newTodo.trim(), priority: newPriority });
            setNewTodo('');
            setNewPriority('Medium');
        }
    };

    const handleDateSelect = (day) => {
        console.log('📅 Planner: Date selected:', day);
        setSelectedDay(day);
    };

    const hasTasksOnDay = (day) => {
        const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return (tasks[key] || []).length > 0;
    };

    const isToday = (day) => day === todayDate && currentMonth === todayMonth && currentYear === todayYear;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title text-white">Planner & Tasks</h1>
                    <p className="page-subtitle text-muted">Organize your days and track your to-dos smoothly.</p>
                </div>
            </div>

            <div className="grid-cols-2">
                <div className="glass-panel">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="text-blue" size={24} />
                            <h2 className="text-xl text-white">{monthNames[currentMonth]} {currentYear}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
                            <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <div className="calendar-grid">
                        {dayHeaders.map(d => <div key={d} className="cal-head">{d}</div>)}
                        {blanks.map(i => <div key={`b-${i}`} />)}
                        {dates.map(date => (
                            <div key={date}
                                className={`cal-day ${date === selectedDay ? 'active' : ''} ${isToday(date) && date !== selectedDay ? '' : ''}`}
                                style={isToday(date) && date !== selectedDay ? { border: '1px solid var(--primary)', color: 'var(--primary)' } : {}}
                                onClick={() => handleDateSelect(date)}>
                                {date}
                                {hasTasksOnDay(date) && <span className="task-dot" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="text-primary" size={24} />
                            <h2 className="text-xl text-white">Tasks for {monthNames[currentMonth]} {selectedDay}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="btn btn-sm btn-outline" onClick={() => smartSortTasks(dateKey)}>
                                🧠 Smart Sort
                            </button>
                            <span className="badge">{currentTodos.length} tasks</span>
                        </div>
                    </div>

                    <form className="flex gap-2 mb-4" onSubmit={handleAdd}>
                        <input type="text" className="todo-input flex-1" placeholder="What needs to be done?" value={newTodo} onChange={e => setNewTodo(e.target.value)} />
                        <select className="todo-input" style={{ width: '110px' }} value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                            <option value="High">High 🔥</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <button className="btn btn-primary" type="submit"><Plus size={20} /></button>
                    </form>

                    <div className="todo-list">
                        {currentTodos.map(todo => (
                            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                                <div className="flex items-center gap-3 w-full">
                                    <input type="checkbox" className="todo-checkbox" checked={todo.completed} onChange={() => toggleTask(dateKey, todo.id)} />
                                    <span className="text-white" style={{ flex: 1 }}>
                                        {todo.text}
                                        {todo.priority && <span className="ml-2 text-xs" style={{ 
                                            color: todo.priority === 'High' ? 'var(--red)' : todo.priority === 'Low' ? 'var(--text-muted)' : 'var(--yellow)' 
                                        }}>({todo.priority})</span>}
                                    </span>
                                    <button className="icon-btn" onClick={() => deleteTask(dateKey, todo.id)}><Trash2 size={18} className="text-red" /></button>
                                </div>
                            </div>
                        ))}
                        {currentTodos.length === 0 && <p className="text-muted text-center mt-4">No tasks for this day! 🎉</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
