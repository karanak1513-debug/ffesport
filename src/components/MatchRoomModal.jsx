import React, { useState, useEffect } from 'react';
import { Copy, X, CheckCircle, ShieldAlert, Smartphone, Clock, Shield, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from './CountdownTimer';
import './MatchRoomModal.css';

const MatchRoomModal = ({ tournament, onClose }) => {
    const [copiedId, setCopiedId] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Normalized fields
    const tournamentDate = tournament.date;
    const tournamentTime = tournament.exactTime || tournament.time;
    
    let matchTime = Date.now() + 3600000;
    try {
        if (tournamentDate && tournamentTime) {
            matchTime = new Date(`${tournamentDate} ${tournamentTime}`).getTime();
        }
    } catch (e) {
        console.warn("Date parse error", e);
    }
    
    const releaseTime = matchTime - (10 * 60 * 1000);
    // Released if time has come OR if credentials are already provided by admin
    const isReleased = currentTime >= releaseTime || (tournament.roomId && tournament.roomPassword);

    const copyToClipboard = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'id') {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        } else {
            setCopiedPass(true);
            setTimeout(() => setCopiedPass(false), 2000);
        }
    };

    return (
        <motion.div 
            className="match-room-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 ring-offset-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={onClose} />
            
            <motion.div 
                className="match-room-content"
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className="modal-accent-line" />
                
                <div className="modal-body">
                    <div className="modal-header-pro">
                        <div className="modal-title-pro">
                            <h2>BATTLE <span className="text-primary">ACCESS</span></h2>
                            <span className="modal-subtitle-pro">{tournament.name}</span>
                        </div>
                        <button onClick={onClose} className="close-modal-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="match-status-container">
                        <CountdownTimer 
                            dateStr={tournamentDate} 
                            timeStr={tournamentTime} 
                            status={tournament.status} 
                        />
                    </div>

                    {tournament.status === 'completed' || tournament.status === 'closed' || tournament.status === 'cancelled' ? (
                        <div className="locked-state-premium">
                            <div className="locked-icon-pro" style={{ color: tournament.status === 'completed' ? '#facc15' : '#94a3b8', background: 'rgba(255,255,255,0.05)' }}>
                                {tournament.status === 'completed' ? <Trophy size={36} /> : <Shield size={36} />}
                            </div>
                            <h3 className="locked-title">
                                {tournament.status === 'completed' ? 'BATTLE FINISHED' : 'MATCH CLOSED'}
                            </h3>
                            <p className="locked-desc">
                                {tournament.status === 'completed' 
                                    ? "This battle has reached its conclusion. Check the Hall of Fame for the champions!"
                                    : "This battleground is no longer accessible. Access has been revoked."}
                            </p>
                            <button onClick={onClose} className="action-button secondary w-100 py-3">
                                RETURN TO LOBBY
                            </button>
                        </div>
                    ) : !isReleased ? (
                        <div className="locked-state-premium">
                            <div className="locked-icon-pro">
                                <ShieldAlert size={36} />
                            </div>
                            <h3 className="locked-title">Arena Encrypted</h3>
                            <p className="locked-desc">
                                Match credentials unlock <span className="text-primary" style={{fontWeight: 900}}>10 MINS</span> before the jump. 
                                Gear up and prepare!
                            </p>
                            <div className="time-badge-pro">
                                <Clock size={16} className="text-primary" />
                                <span>{tournamentTime}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="creds-container">
                            <div className="cred-field-pro">
                                <label className="cred-label-pro">ROOM IDENTIFIER</label>
                                <div className="cred-input-wrap">
                                    <div className="cred-value">
                                        {tournament.roomId || "SCANNING..."}
                                    </div>
                                    {tournament.roomId && (
                                        <button 
                                            onClick={() => copyToClipboard(tournament.roomId, 'id')}
                                            className={`copy-btn-pro ${copiedId ? 'success' : ''}`}
                                        >
                                            {copiedId ? <CheckCircle size={20} /> : <Copy size={20} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="cred-field-pro">
                                <label className="cred-label-pro">SECURITY KEY</label>
                                <div className="cred-input-wrap">
                                    <div className="cred-value">
                                        {tournament.roomPassword || "DECRYPTING..."}
                                    </div>
                                    {tournament.roomPassword && (
                                        <button 
                                            onClick={() => copyToClipboard(tournament.roomPassword, 'pass')}
                                            className={`copy-btn-pro ${copiedPass ? 'success' : ''}`}
                                        >
                                            {copiedPass ? <CheckCircle size={20} /> : <Copy size={20} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="warning-box-pro">
                                <ShieldAlert size={18} className="text-primary" style={{ flexShrink: 0 }} />
                                <div className="warning-text-pro">
                                    <strong>STRICT RULES:</strong> Unauthorized players found in the lobby will be kicked and blacklisted from future matches.
                                </div>
                            </div>

                            <a 
                                href="intent://freefire.mobile#Intent;scheme=android-app;package=com.dts.freefireth;end;" 
                                className="deploy-btn-pro"
                            >
                                <Smartphone size={20} /> 
                                DEPLOY TO FREE FIRE
                            </a>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MatchRoomModal;
