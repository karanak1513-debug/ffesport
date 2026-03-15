import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Calendar, Users, Coins } from 'lucide-react';
import './ResultsModal.css';

const ResultsModal = ({ tournament, onClose }) => {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!tournament) return null;
    const { winners, name, date, mode, prize } = tournament;

    const podium = [
        { key: 'second', medal: '🥈', label: '2nd Place', color: '#C0C0C0', glow: 'rgba(192,192,192,0.25)', height: '110px', delay: 0.3 },
        { key: 'first',  medal: '🥇', label: 'GRAND CHAMPION', color: '#FFD700', glow: 'rgba(255,215,0,0.4)',   height: '150px', delay: 0.1 },
        { key: 'third',  medal: '🥉', label: '3rd Place', color: '#CD7F32', glow: 'rgba(205,127,50,0.25)', height: '80px',  delay: 0.5 },
    ];

    return (
        <motion.div
            className="results-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="results-modal"
                initial={{ scale: 0.85, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 40 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            >
                {/* Close */}
                <button className="results-close" onClick={onClose}><X size={20} /></button>

                {/* Header */}
                <div className="results-header">
                    <motion.div
                        className="results-trophy-icon"
                        animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                    >
                        <Trophy size={42} />
                    </motion.div>
                    <h2 className="results-title">BATTLE <span>RESULTS</span></h2>
                    <p className="results-tourney-name">{name}</p>
                    <div className="results-meta">
                        <span><Calendar size={13} /> {date}</span>
                        <span><Users size={13} /> {mode}</span>
                        {prize && <span><Coins size={13} /> Prize Pool: <strong>{prize}</strong></span>}
                    </div>
                </div>

                {/* Confetti dots */}
                <div className="results-confetti" aria-hidden="true">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <motion.span
                            key={i}
                            className="confetti-dot"
                            style={{
                                left: `${Math.random() * 100}%`,
                                background: ['#FFD700','#ff6b6b','#6366f1','#22c55e','#38bdf8'][i % 5],
                                width: `${5 + Math.random() * 7}px`,
                                height: `${5 + Math.random() * 7}px`,
                            }}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: [0, 320], opacity: [1, 0] }}
                            transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 1.5, repeat: Infinity, repeatDelay: Math.random() * 3 }}
                        />
                    ))}
                </div>

                {/* Podium */}
                <div className="results-podium">
                    {podium.map(({ key, medal, label, color, glow, height, delay }) => {
                        const name = winners?.[key];
                        if (!name && key !== 'first') return (
                            <div key={key} className="podium-slot empty" />
                        );
                        return (
                            <motion.div
                                key={key}
                                className={`podium-slot ${key}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay, type: 'spring', stiffness: 200 }}
                            >
                                <motion.div
                                    className="podium-medal"
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 1.8, delay: delay + 0.4, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    {medal}
                                </motion.div>
                                <div className="podium-name" style={{ color }}>
                                    {name || '—'}
                                </div>
                                <div className="podium-label" style={{ color: `${color}99` }}>{label}</div>
                                <div
                                    className="podium-block"
                                    style={{ height, background: `linear-gradient(180deg, ${color}22, ${color}08)`, borderTop: `2px solid ${color}44`, boxShadow: `0 -8px 30px ${glow}` }}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* No winners fallback */}
                {!winners?.first && (
                    <div className="results-no-winners">
                        <Trophy size={40} className="opacity-20 mx-auto mb-3" />
                        <p>Results will be announced shortly.</p>
                    </div>
                )}

                <button className="results-close-btn" onClick={onClose}>
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
};

export default ResultsModal;
