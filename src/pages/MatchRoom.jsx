import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, ShieldAlert, Timer, CheckCircle, Smartphone, Lock, Trophy, Medal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './MatchRoom.css';

const MatchRoom = () => {
    const { id } = useParams();
    const { tournaments, entries } = useApp();

    const [copiedId, setCopiedId] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Find real tournament
    const tournament = tournaments.find(t => String(t.id) === String(id));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!tournament) {
        return <div className="container p-5 text-center"><h2>Match Not Found</h2></div>;
    }

    // Security Check
    const isPlayerJoined = entries.some(e => String(e.tournamentId) === String(id));

    // Release Timer Logic
    const matchTime = new Date(`${tournament.date} ${tournament.exactTime || tournament.time}`).getTime();
    const releaseTime = matchTime - (10 * 60 * 1000);
    const isReleased = currentTime >= releaseTime;
    const isStarted = currentTime >= matchTime;
    const isCompleted = tournament.status === 'completed';

    const timeLeftToStarts = Math.max(0, Math.floor((matchTime - currentTime) / 1000));
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = (text, type) => {
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
        <div className="match-room-page">
            <div className="container match-room-container">
                <div className="text-center mb-5">
                    <div className="status-indicator">
                        <span className={`live-dot-large ${isCompleted ? 'completed' : isStarted ? 'live' : 'waiting'}`}></span>
                        {isCompleted ? 'Match Completed' : isStarted ? 'Match Started' : 'Waiting for Players'}
                    </div>
                    <h1 className="room-title">{tournament.name} <span className="text-gradient">Room</span></h1>
                    <p className="text-muted text-lg mt-2">{tournament.gameMode} • {tournament.map || 'Bermuda'}</p>
                </div>

                {!isPlayerJoined ? (
                    <div className="glass-panel text-center p-5 mb-5">
                        <Lock size={48} className="text-danger mb-3 mx-auto" />
                        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                        <p className="text-muted mb-4">You must join this tournament to see the Room ID and Password.</p>
                        <Link to={`/tournament/${id}`} className="btn btn-primary">Join Tournament</Link>
                    </div>
                ) : isCompleted ? (
                    <div className="winners-announcement glass-panel p-5 text-center fade-in">
                        <Trophy size={64} className="text-warning mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Official Results Out!</h2>
                        <p className="text-muted mb-5">Congratulations to all the warriors who participated.</p>

                        <div className="winners-podium d-flex justify-center gap-4 flex-wrap">
                            <div className="podium-card gold glass-panel p-4">
                                <Medal size={40} className="text-warning mb-2 mx-auto" />
                                <h4 className="rank">1st Place</h4>
                                <h3 className="winner-name text-gradient">{tournament.winners?.first || "TBD"}</h3>
                            </div>
                            {tournament.winners?.second && (
                                <div className="podium-card silver glass-panel p-4">
                                    <Medal size={40} className="text-muted mb-2 mx-auto" />
                                    <h4 className="rank">2nd Place</h4>
                                    <h3 className="winner-name">{tournament.winners.second}</h3>
                                </div>
                            )}
                            {tournament.winners?.third && (
                                <div className="podium-card bronze glass-panel p-4">
                                    <Medal size={40} className="text-secondary mb-2 mx-auto" />
                                    <h4 className="rank">3rd Place</h4>
                                    <h3 className="winner-name">{tournament.winners.third}</h3>
                                </div>
                            )}
                        </div>
                        <div className="mt-5">
                            <Link to="/" className="btn btn-primary">Back to Home</Link>
                        </div>
                    </div>
                ) : (
                    <div className="room-grid">
                        <div className="glass-panel room-card credentials-card">
                            <div className="card-header text-center border-bottom pb-4 mb-4">
                                <Timer size={40} className="text-primary mx-auto mb-3" />
                                <h3 className="countdown-text glow-text">
                                    {isStarted ? "00:00" : formatTime(timeLeftToStarts)}
                                </h3>
                                <p className="text-muted">
                                    {isStarted ? "Match has started!" : "Time until match start"}
                                </p>
                            </div>

                            {!isReleased ? (
                                <div className="credentials-box text-center p-4">
                                    <Lock size={32} className="text-warning mb-3 mx-auto" />
                                    <h4 className="text-warning mb-2">Locked</h4>
                                    <p className="text-sm text-muted">Room details will be available 10 minutes before match.</p>
                                </div>
                            ) : (
                                <div className="credentials-box">
                                    <h4 className="text-success mb-4 text-center">
                                        {isStarted ? "Match Started – Join Room Now" : "Room Details Revealed!"}
                                    </h4>

                                    <div className="cred-row">
                                        <div className="cred-info">
                                            <span className="cred-label">Custom Room ID</span>
                                            <span className="cred-value text-gradient font-mono">
                                                {tournament.roomId || 'PENDING'}
                                            </span>
                                        </div>
                                        {tournament.roomId && (
                                            <button className="btn btn-outline btn-sm copy-btn" onClick={() => copyToClipboard(tournament.roomId, 'id')}>
                                                {copiedId ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                                                {copiedId ? 'Copied' : 'Copy'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="cred-row mt-3">
                                        <div className="cred-info">
                                            <span className="cred-label">Room Password</span>
                                            <span className="cred-value text-gradient font-mono">
                                                {tournament.roomPassword || 'PENDING'}
                                            </span>
                                        </div>
                                        {tournament.roomPassword && (
                                            <button className="btn btn-outline btn-sm copy-btn" onClick={() => copyToClipboard(tournament.roomPassword, 'pass')}>
                                                {copiedPass ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                                                {copiedPass ? 'Copied' : 'Copy'}
                                            </button>
                                        )}
                                    </div>

                                    <a href="intent://freefire.mobile#Intent;scheme=android-app;package=com.dts.freefireth;end;" className="btn btn-primary w-100 btn-lg mt-4 d-flex justify-center flex-col align-center">
                                        <span className="d-flex align-center"><Smartphone size={20} className="mr-2" /> Open Free Fire</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Instructions Card */}
                        <div className="glass-panel room-card instructions-card">
                            <h3 className="card-title mb-4 flex align-center"><ShieldAlert size={24} className="mr-2 text-warning" /> Instructions</h3>
                            <div className="instruction-step">
                                <div className="step-number">1</div>
                                <div className="step-details">
                                    <h4>Copy Room ID</h4>
                                    <p className="text-muted text-sm">Copy the ID and paste it in Free Fire Custom Game search.</p>
                                </div>
                            </div>
                            <div className="instruction-step">
                                <div className="step-number">2</div>
                                <div className="step-details">
                                    <h4>Enter Password</h4>
                                    <p className="text-muted text-sm">Enter the password exactly as shown to enter the room.</p>
                                </div>
                            </div>
                            <div className="instruction-step">
                                <div className="step-number">3</div>
                                <div className="step-details">
                                    <h4>Ready Up</h4>
                                    <p className="text-muted text-sm">Join your assigned slot and wait for the host to start.</p>
                                </div>
                            </div>
                            <div className="warning-box mt-4">
                                <strong>WARNING:</strong> sharing room details with unregistered players will result in a permanent ban.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchRoom;
