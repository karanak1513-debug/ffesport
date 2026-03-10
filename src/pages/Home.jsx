import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Crosshair, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Home.css';

const Home = () => {
    const { tournaments } = useApp();
    const liveMatches = tournaments.filter(t => t.status === 'live');
    const upcomingMatches = tournaments.filter(t => t.status === 'upcoming');
    const completedMatches = tournaments.filter(t => t.status === 'completed');

    const TournamentCard = ({ t }) => (
        <div key={t.id} className="tournament-card glass-panel">
            <div className="card-header">
                <span className={`status-badge ${t.status}`}>
                    {t.status === 'live' && <span className="live-dot"></span>}
                    {t.status === 'live' ? 'Live Now' : t.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
                <span className="mode-badge">{t.mode}</span>
            </div>
            <div className="card-body">
                <h3 className="tournament-name">{t.name}</h3>
                <div className="tournament-schedule text-sm text-muted mb-3">
                    <p>📅 {t.date} | ⏰ {t.exactTime || t.time}</p>
                </div>
                <div className="tournament-meta">
                    <div className="meta-item">
                        <span className="meta-label">Prize Pool</span>
                        <span className="meta-value text-gradient">{t.prize}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Entry Fee</span>
                        <span className="meta-value">{t.entry}</span>
                    </div>
                </div>
                <div className="progress-container">
                    <div className="progress-labels">
                        <span>Players Joined</span>
                        <span>{t.players} / {t.maxPlayers}</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(t.players / t.maxPlayers) * 100}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="card-footer">
                {t.status === 'completed' ? (
                    <Link to={`/tournament/${t.id}/results`} className="btn btn-outline w-100">
                        View Results
                    </Link>
                ) : (
                    <Link to={`/tournament/${t.id}`} className="btn btn-primary w-100">
                        Join Match
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <div className="hero-badge glass-panel">🔥 Pro Esports Platform</div>
                    <h1 className="hero-title">
                        Dominate The <span className="text-gradient">Battleground</span>
                    </h1>
                    <p className="hero-subtitle">
                        Join premium Free Fire tournaments, compete with the best players, and win massive cash prizes daily.
                    </p>
                    <div className="hero-actions">
                        <Link to="/tournaments" className="btn btn-primary btn-lg">
                            <Crosshair size={20} /> Join Tournament
                        </Link>
                        <Link to="/how-to-play" className="btn btn-outline btn-lg">
                            <Users size={20} /> How It Works
                        </Link>
                    </div>

                    <div className="hero-stats glass-panel">
                        <div className="stat-item">
                            <h4>10K+</h4>
                            <p>Active Players</p>
                        </div>
                        <div className="stat-item">
                            <h4>₹50L+</h4>
                            <p>Prizes Won</p>
                        </div>
                        <div className="stat-item">
                            <h4>500+</h4>
                            <p>Daily Matches</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Matches */}
            <section className="section tournaments-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">🔴 LIVE <span className="text-gradient">MATCHES</span></h2>
                            <p className="text-muted">Matches currently in progress. Watch and learn!</p>
                        </div>
                    </div>
                    <div className="tournaments-grid">
                        {liveMatches.length === 0 ? (
                            <div className="text-center p-4 glass-panel w-100" style={{ gridColumn: '1 / -1' }}>
                                <p className="text-muted">No live matches at the moment.</p>
                            </div>
                        ) : (
                            liveMatches.map(t => <TournamentCard key={t.id} t={t} />)
                        )}
                    </div>
                </div>
            </section>

            {/* Upcoming Matches */}
            <section className="section tournaments-section bg-darker">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">📅 UPCOMING <span className="text-gradient">MATCHES</span></h2>
                            <p className="text-muted">Register now before slots are full!</p>
                        </div>
                        <Link to="/tournaments" className="btn btn-outline view-all-btn">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="tournaments-grid">
                        {upcomingMatches.length === 0 ? (
                            <div className="text-center p-4 glass-panel w-100" style={{ gridColumn: '1 / -1' }}>
                                <p className="text-muted">No upcoming tournaments. Stay tuned!</p>
                            </div>
                        ) : (
                            upcomingMatches.map(t => <TournamentCard key={t.id} t={t} />)
                        )}
                    </div>
                </div>
            </section>

            {/* Completed Matches */}
            <section className="section tournaments-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">🏆 COMPLETED <span className="text-gradient">MATCHES</span></h2>
                            <p className="text-muted">Browse past winners and results.</p>
                        </div>
                    </div>
                    <div className="tournaments-grid">
                        {completedMatches.length === 0 ? (
                            <div className="text-center p-4 glass-panel w-100" style={{ gridColumn: '1 / -1' }}>
                                <p className="text-muted">No matches completed yet.</p>
                            </div>
                        ) : (
                            completedMatches.slice(0, 3).map(t => <TournamentCard key={t.id} t={t} />)
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section bg-darker">
                <div className="container">
                    <h2 className="section-title text-center mb-5">Why Play on <span className="text-gradient">FireBattle</span></h2>
                    <div className="features-grid">
                        <div className="feature-card glass-panel text-center">
                            <div className="feature-icon mb-4">
                                <Trophy size={40} className="text-warning" />
                            </div>
                            <h3>Instant Withdrawals</h3>
                            <p className="text-muted mt-2">Win a match and withdraw your earnings instantly via UPI or Paytm.</p>
                        </div>
                        <div className="feature-card glass-panel text-center">
                            <div className="feature-icon mb-4">
                                <Crosshair size={40} className="text-primary" />
                            </div>
                            <h3>Anti-Cheat System</h3>
                            <p className="text-muted mt-2">Strict rules and monitoring to ensure fair play for every participant.</p>
                        </div>
                        <div className="feature-card glass-panel text-center">
                            <div className="feature-icon mb-4">
                                <Users size={40} className="text-secondary" />
                            </div>
                            <h3>24/7 Support</h3>
                            <p className="text-muted mt-2">Our dedicated team is always available to resolve your queries.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
