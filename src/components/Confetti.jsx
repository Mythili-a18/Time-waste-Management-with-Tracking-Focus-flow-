import React, { useEffect, useState } from 'react';
import './Confetti.css';

export default function Confetti({ active }) {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        if (active) {
            const newPieces = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100 + '%',
                animationDuration: Math.random() * 3 + 2 + 's',
                animationDelay: Math.random() * 2 + 's',
                backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#eab308'][Math.floor(Math.random() * 5)]
            }));
            setPieces(newPieces);
            const timer = setTimeout(() => setPieces([]), 5000);
            return () => clearTimeout(timer);
        } else {
            setPieces([]);
        }
    }, [active]);

    if (!active) return null;

    return (
        <div className="confetti-container">
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, backgroundColor: p.backgroundColor }} />
            ))}
        </div>
    );
}
