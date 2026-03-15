import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, ShieldAlert, Timer, CheckCircle, Smartphone, Lock, Trophy, Medal, ArrowLeft, Ghost, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './MatchRoom.css';

const MatchRoom = () => {
    const { id: matchId } = useParams();
    const { tournaments, tournamentPlayers } = useApp();
    const { currentUser } = useAuth();
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [copiedId, setCopiedId] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);

    const tournament = tournaments?.find(t => String(t?.id) === String(matchId));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!tournament) return <div className="match-room-page"><div className="container py-20 text-center"><h2>Arena Not Found</h2></div></div>;

    const myPlayerRecord = tournamentPlayers?.find(p => 
        String(p.tournamentId) === String(matchId) && 
        String(p.userId) === String(currentUser?.uid)
    );

    const isApproved = myPlayerRecord?.status === 'approved';
    const isCompleted = tournament.status === 'completed';
    const tournamentDate = tournament.date || new Date().toDateString();
    const tournamentTime = tournament.matchTime || tournament.exactTime || "00:00";
    
    let matchTime = Date.now() + 3600000;
    try {
        matchTime = new Date(`${tournamentDate} ${tournamentTime}`).getTime();
    } catch (e) { console.warn("Date parse error", e); }
    
    const releaseTime = matchTime - (10 * 60 * 1000);
    const isReleased = currentTime >= releaseTime || (tournament.roomId && tournament.roomPassword);
    const timeLeft = Math.max(0, Math.floor((matchTime - currentTime) / 1000));

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }
        else { setCopiedPass(true); setTimeout(() => setCopiedPass(false), 2000); }
    };

    if (!myPlayerRecord || !isApproved) {
        return (
            <div className="match-room-page">
                <div className="container py-20 text-center">
                    <Lock size={64} className="text-primary mb-6" />
                    <h2>Restricted Access</h2>
                    <p className="text-muted mt-4">Only approved players can enter the room details area.</p>
                    <Link to="/" className="btn btn-secondary mt-8">Go Back Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="match-room-page">
            <div className="room-header border-b border-white/5 py-16 bg-card-glow">
                <div className="container">
                    <div className="flex justify-between items-center mb-4">
                        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Arena</Link>
                        <span className={`badge badge-${tournament.status?.toLowerCase()}`}>{tournament.status}</span>
                    </div>
                    <h1 className="tournament-title">{tournament.name}</h1>
                    <div className="flex gap-4 mt-6">
                        <div className="info-chip">Mode: {tournament.mode || 'Squad'}</div>
                        <div className="info-chip">Map: {tournament.map || 'Bermuda'}</div>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                {isCompleted ? (
                    <div className="completed-view text-center py-20 glass-panel">
                        <Trophy size={80} className="text-primary mb-6 mx-auto" />
                        <h2 className="text-3xl font-black">Match Completed</h2>
                        <p className="text-muted mt-4">The battle has ended. Check the results below.</p>
                        
                        <div className="winners-row mt-12">
                            <div className="winner-cell gold">
                                <Crown size={32} />
                                <h3>{tournament.winners?.first || 'N/A'}</h3>
                                <span>Champion</span>
                            </div>
                        </div>
                        <Link to="/leaderboard" className="btn btn-primary mt-12">View Leaderboard</Link>
                    </div>
                ) : (
                    <div className="room-grid">
                        <div className="room-main">
                            <div className="intel-box card p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3>Room Credentials</h3>
                                    {isReleased ? (
                                        <span className="text-success flex items-center gap-2">
                                            <CheckCircle size={16} /> Credentials Released
                                        </span>
                                    ) : (
                                        <span className="text-warning flex items-center gap-2">
                                            <Timer size={16} /> Releasing in {formatTime(Math.max(0, Math.floor((releaseTime - currentTime) / 1000)))}
                                        </span>
                                    )}
                                </div>

                                {isReleased ? (
                                    <div className="credentials-list">
                                        <div className="cred-item">
                                            <div className="cred-info">
                                                <label>Room ID</label>
                                                <div className="cred-value">{tournament.roomId || 'Wait...'}</div>
                                            </div>
                                            <button className="copy-btn" onClick={() => copyToClipboard(tournament.roomId, 'id')}>
                                                {copiedId ? 'Copied!' : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <div className="cred-item">
                                            <div className="cred-info">
                                                <label>Password</label>
                                                <div className="cred-value">{tournament.roomPassword || 'Wait...'}</div>
                                            </div>
                                            <button className="copy-btn" onClick={() => copyToClipboard(tournament.roomPassword, 'pass')}>
                                                {copiedPass ? 'Copied!' : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <a href="intent://freefire.mobile#Intent;scheme=android-app;package=com.dts.freefireth;end;" className="btn btn-primary w-100 py-4 mt-8 flex items-center justify-center gap-2">
                                            <Smartphone size={20} /> Open Free Fire
                                        </a>
                                    </div>
                                ) : (
                                    <div className="locked-view py-12 text-center">
                                        <Lock size={48} className="text-muted mb-4 mx-auto" />
                                        <p className="text-muted">Intel will be revealed 10 minutes before match start.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="room-sidebar">
                            <div className="protocol-box card p-6">
                                <h4 className="flex items-center gap-2 mb-4"><ShieldAlert size={18} className="text-primary" /> Protocols</h4>
                                <ul className="protocol-list">
                                    <li>Don't share Room ID/Pass. sharing = Permanent Ban.</li>
                                    <li>Join within 5 minutes of release.</li>
                                    <li>Keep your assigned slot.</li>
                                    <li>Teaming up is not allowed.</li>
                                </ul>
                            </div>
                            
                            <div className="support-box card mt-6 p-6">
                                <h4>Need Support?</h4>
                                <p className="text-xs text-muted mt-2">If you face any issues, contact admin via Instagram.</p>
                                <a href="https://www.instagram.com/its_sun_official_ok/" className="btn btn-secondary w-100 mt-4 flex items-center justify-center gap-2" target="_blank">
                                    <ExternalLink size={16} /> Admin Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchRoom;
