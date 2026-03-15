import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Crosshair, Users, ChevronRight, Calendar, Clock, Target, Flame, DollarSign, Group, Plus, ShieldCheck, Zap, BarChart3, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import TournamentCard from '../components/TournamentCard';
import JoinBattleModal from '../components/JoinBattleModal';
import MatchRoomModal from '../components/MatchRoomModal';
import ResultsModal from '../components/ResultsModal';
import DownloadApp from '../components/DownloadApp';
import './Home.css';

const Home = () => {
    const { tournaments, users } = useApp();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matchRoomTournament, setMatchRoomTournament] = useState(null);
    const [resultsTournament, setResultsTournament] = useState(null);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const liveTournaments = tournaments.filter(t => t.status === 'live');
    const upcomingTournaments = tournaments.filter(t => t.status === 'open' || t.status === 'upcoming');
    const completedTournaments = tournaments.filter(t => t.status === 'completed');

    // Stats
    const totalPrizePool = Math.max(5000, tournaments.reduce((acc, t) => {
        const p = String(t.prizePool || t.prize || '0').replace(/[^0-9]/g, '');
        return acc + (Number(p) || 0);
    }, 0));
    const totalPlayers = users.length + 120; // Simulated community size

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-inner">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-text"
                    >
                        <span className="hero-badge">
                            <Flame size={14} /> The Ultimate Battleground
                        </span>
                        <h1 className="hero-title">
                            Play Free Fire Tournaments <br />
                            <span className="text-gradient">& Win Real Cash</span>
                        </h1>
                        <p className="hero-subtitle">
                            Join competitive custom room matches, climb the leaderboard, and earn rewards daily. Professional management for serious players.
                        </p>
                        <div className="hero-btns">
                            <Link to="/tournaments" className="btn btn-primary btn-lg">
                                <Crosshair size={22} /> Join Tournament
                            </Link>
                            <Link to="/leaderboard" className="btn btn-secondary btn-lg">
                                <Trophy size={22} /> View Leaderboard
                            </Link>
                        </div>
                    </motion.div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-value">{upcomingTournaments.length + liveTournaments.length}</span>
                            <span className="stat-label">Active Tournaments</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{totalPlayers}+</span>
                            <span className="stat-label">Total Players</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">₹{totalPrizePool.toLocaleString()}</span>
                            <span className="stat-label">Total Prize Pool</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Matches Section */}
            {liveTournaments.length > 0 && (
                <section className="section live-matches">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="live-dot"></span> LIVE <span className="text-gradient">MATCHES</span>
                            </h2>
                            <p className="section-desc">Battles currently in progress. Approved players can get room details.</p>
                        </div>
                        <div className="tournaments-grid">
                            {liveTournaments.map((t) => (
                                <TournamentCard 
                                    key={t.id} 
                                    t={t} 
                                    onJoin={() => setSelectedTournament(t)}
                                    onDetails={() => navigate(`/tournament/${t.id}`)}
                                    onMatchRoom={() => setMatchRoomTournament(t)}
                                    onResults={() => setResultsTournament(t)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Tournaments */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">FEATURED <span className="text-gradient">TOURNAMENTS</span></h2>
                        <div className="header-actions">
                            <Link to="/tournaments" className="view-all">View All <ChevronRight size={18} /></Link>
                        </div>
                    </div>
                    <div className="tournaments-grid">
                        {upcomingTournaments.length > 0 ? (
                            upcomingTournaments.slice(0, 6).map((t) => (
                                <TournamentCard 
                                    key={t.id} 
                                    t={t} 
                                    onJoin={() => setSelectedTournament(t)}
                                    onDetails={() => navigate(`/tournament/${t.id}`)}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>No tournaments available at the moment. Check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section steps-section">
                <div className="container">
                    <div className="section-header centered">
                        <h2 className="section-title">HOW IT <span className="text-secondary-gradient">WORKS</span></h2>
                        <p className="section-desc">Join the arena in 4 simple steps</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-num">01</div>
                            <h3>Join</h3>
                            <p>Pick a tournament and register with your Free Fire UID.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">02</div>
                            <h3>Payment</h3>
                            <p>Submit your entry fee and provide the transaction UTR ID.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">03</div>
                            <h3>Approval</h3>
                            <p>Wait for admin to verify your payment and approve your entry.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">04</div>
                            <h3>Play</h3>
                            <p>Get room details on match time and dominate the field.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Download App Section */}
            <DownloadApp />

            {/* Creator CTA Section */}
            <section className="section creator-cta-section">
                <div className="container">
                    <div className="creator-card-main glass-panel overflow-hidden">
                        <div className="creator-glow"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 p-8 lg:p-16">
                            <div>
                                <span className="hero-badge mb-6" style={{ background: 'rgba(0, 149, 255, 0.1)', color: '#0095ff' }}>ORGANIZERS ONLY</span>
                                <h2 className="text-4xl lg:text-5xl font-black mb-6">Become a Tournament <span className="text-primary">Creator</span></h2>
                                <p className="text-muted text-lg mb-8 leading-relaxed">
                                    If you are a creator or organizer, you can use our platform to host Free Fire tournaments and manage players easily.
                                </p>
                                <div className="flex gap-4 flex-wrap">
                                    <button 
                                        className="btn btn-primary btn-lg px-8" 
                                        onClick={() => navigate(currentUser ? '/creator' : '/login')}
                                    >
                                        <Plus size={20} className="mr-2" /> Start Creating Tournaments
                                    </button>
                                    <Link to="/how-to-play" className="btn btn-secondary btn-lg px-8">
                                        Learn More
                                    </Link>
                                </div>
                                <p className="mt-8 italic text-sm text-dim">
                                    "Host tournaments. Build your community. Earn from esports."
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: <Rocket size={20} />, title: "Quick Creation", desc: "Create tournaments in seconds" },
                                    { icon: <Users size={20} />, title: "Easy Invites", desc: "Manage player join requests" },
                                    { icon: <ShieldCheck size={20} />, title: "Secure Rooms", desc: "Publish room details safely" },
                                    { icon: <Zap size={20} />, title: "Fast Results", desc: "Upload match results instantly" },
                                    { icon: <BarChart3 size={20} />, title: "Profit Tracking", desc: "Track revenue and profits" },
                                    { icon: <Target size={20} />, title: "Admin Tools", desc: "Manage player approvals easily" }
                                ].map((feature, i) => (
                                    <div key={i} className="feature-mini-card">
                                        <div className="f-icon">{feature.icon}</div>
                                        <div>
                                            <h4 className="text-sm font-bold m-0">{feature.title}</h4>
                                            <span className="text-xs text-muted">{feature.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modals */}
            <AnimatePresence>
                {selectedTournament && (
                    <JoinBattleModal 
                        tournament={selectedTournament} 
                        onClose={() => setSelectedTournament(null)} 
                    />
                )}
                {matchRoomTournament && (
                    <MatchRoomModal 
                        tournament={matchRoomTournament} 
                        onClose={() => setMatchRoomTournament(null)} 
                    />
                )}
                {resultsTournament && (
                    <ResultsModal
                        tournament={resultsTournament}
                        onClose={() => setResultsTournament(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
