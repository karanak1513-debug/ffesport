import React from 'react';
import { motion } from 'framer-motion';

const TournamentCard = ({ 
    t, 
    onJoin,
    onDetails,
    onMatchRoom,
    onResults
}) => {
    const isFull = (t.players || 0) >= (t.maxPlayers || 48);
    const slotsLeft = Math.max(0, (t.maxPlayers || 48) - (t.players || 0));
    const progress = Math.min(100, ((t.players || 0) / (t.maxPlayers || 48)) * 100);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return <span className="minimal-status open">OPEN</span>;
            case 'live': return <span className="minimal-status live">LIVE</span>;
            case 'completed': return <span className="minimal-status completed">COMPLETED</span>;
            default: return <span className="minimal-status open">OPEN</span>;
        }
    };

    return (
        <motion.div 
            className="tournament-card-minimal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="card-top">
                <h3 className="minimal-title">{t.name}</h3>
                <div className="minimal-meta">
                    {getStatusBadge(t.status)}
                    <span className="separator">•</span>
                    <span className="minimal-mode">{t.mode || 'SOLO'}</span>
                </div>
            </div>

            <div className="card-info">
                <div className="info-item">
                    <span className="info-label">Prize Pool:</span>
                    <span className="info-value">₹{t.prizePool || t.prize || '0'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Entry Fee:</span>
                    <span className="info-value">₹{t.entryFee || t.entry || 'Free'}</span>
                </div>
                <div className="info-item mt-2">
                    <span className="info-label">Match Time:</span>
                    <span className="info-value text-white">Today • {t.matchTime || t.exactTime || 'TBA'}</span>
                </div>
            </div>

            <div className="card-slots">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-dim">Players Joined: {t.players || 0} / {t.maxPlayers || 48}</span>
                    <span className="text-dim">Slots Remaining: {slotsLeft}</span>
                </div>
                <div className="minimal-progress-bar">
                    <div className="minimal-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="card-actions">
                {t.status === 'completed' ? (
                    <button onClick={onResults} className="btn-minimal secondary w-full">View Results</button>
                ) : t.status === 'live' ? (
                    <button onClick={onMatchRoom} className="btn-minimal primary w-full">Enter Match Room</button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={onJoin} 
                            className="btn-minimal primary flex-1" 
                            disabled={isFull}
                        >
                            {isFull ? 'Full' : 'Join Tournament'}
                        </button>
                        <button onClick={onDetails} className="btn-minimal outline">Details</button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TournamentCard;
