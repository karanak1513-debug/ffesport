import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, Crown, Medal, ArrowUpRight, Flame, BarChart3, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './Leaderboard.css';

// Animated Counter Component
const AnimatedNumber = ({ value }) => {
    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={value}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {value.toLocaleString()}
        </motion.span>
    );
};

const PlayerAvatar = ({ src, name, size = "mini" }) => {
    const initials = name?.substring(0, 2).toUpperCase() || 'P';
    if (!src) {
        return <div className={`initial-avatar ${size}`}>{initials}</div>;
    }
    return <img src={src} alt={name} className={`pfp-${size}`} />;
};

const Leaderboard = () => {
    const { users, tournaments, tournamentPlayers } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const leaderboardData = useMemo(() => {
        const scores = {};

        // 1. Initialize all users found in the system
        users.forEach(u => {
            const id = u.uid || u.id;
            scores[id] = {
                id,
                name: u.username || 'Anonymous',
                ffuid: u.freeFireUID || u.ffuid || 'N/A',
                avatar: u.profilePhoto,
                wins: 0,
                kills: 0,
                points: 0
            };
        });

        // 2. Process tournament results for Wins and champion stats
        tournaments.filter(t => t.status === 'completed').forEach(t => {
            if (t.winners) {
                const winnerName = t.winners.first;
                const winnerKills = Number(t.winners.kills || 0);
                const winnerBonus = Number(t.winners.points || 0);

                // Find user by name (since we store name in winners)
                const user = users.find(u => u.username === winnerName);
                if (user) {
                    const id = user.uid || user.id;
                    if (scores[id]) {
                        scores[id].wins += 1;
                        scores[id].kills += winnerKills;
                        // Score Logic: Booyah (10) + Kills (1) + Bonus from Admin
                        scores[id].points += (10) + (winnerKills * 1) + winnerBonus;
                    }
                }
            }
        });

        // 3. Optional: Add points for participation or other player achievements if data exists
        // (Placeholder for future expansion to per-player kill tracking)

        return Object.values(scores)
            .sort((a, b) => b.points - a.points || b.wins - a.wins || b.kills - a.kills)
            .map((p, i) => ({ ...p, rank: i + 1 }));
    }, [users, tournaments]);

    const filteredPlayers = leaderboardData.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.ffuid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const top1 = leaderboardData[0];
    const top2 = leaderboardData[1];
    const top3 = leaderboardData[2];

    return (
        <div className="leaderboard-page">
            <header className="lb-hero">
                <div className="container">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block"
                    >
                        <div className="live-badge">
                            <span className="live-dot animate-pulse"></span>
                            LIVE UPDATING
                        </div>
                    </motion.div>
                    <h1 className="hero-title">HALL OF <span className="text-primary-gradient">LEGENDS</span></h1>
                    <p className="text-muted max-w-xl mx-auto font-medium">
                        The elite battlefield tiers. Compete in tournaments to climb the global rankings.
                    </p>
                </div>
            </header>

            <div className="container podium-section">
                {leaderboardData.length >= 3 ? (
                    <div className="podium-container">
                        {/* Rank 2 */}
                        <motion.div 
                            className="podium-card rank-2"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Medal size={40} className="crown-icon text-gray-400" />
                            <div className="podium-avatar-wrapper">
                                <PlayerAvatar src={top2.avatar} name={top2.name} size="avatar" />
                                <div className="podium-rank-badge">RANK 2</div>
                            </div>
                            <h3 className="player-name">{top2.name}</h3>
                            <span className="player-id">ID: {top2.ffuid}</span>
                            <div className="point-stats">
                                <span className="anim-points"><AnimatedNumber value={top2.points} /></span>
                                <span className="text-xs font-bold text-muted uppercase tracking-widest">Global Points</span>
                            </div>
                        </motion.div>

                        {/* Rank 1 */}
                        <motion.div 
                            className="podium-card rank-1"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Crown size={60} className="crown-icon text-yellow-400 drop-shadow-glow" />
                            <div className="podium-glow"></div>
                            <div className="podium-avatar-wrapper">
                                <PlayerAvatar src={top1.avatar} name={top1.name} size="avatar" />
                                <div className="podium-rank-badge">CHAMPION</div>
                            </div>
                            <h3 className="player-name">{top1.name}</h3>
                            <span className="player-id">ID: {top1.ffuid}</span>
                            <div className="point-stats">
                                <span className="anim-points text-yellow-500"><AnimatedNumber value={top1.points} /></span>
                                <span className="text-xs font-bold text-muted uppercase tracking-widest">Global Points</span>
                            </div>
                        </motion.div>

                        {/* Rank 3 */}
                        <motion.div 
                            className="podium-card rank-3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Medal size={40} className="crown-icon text-amber-700" />
                            <div className="podium-avatar-wrapper">
                                <PlayerAvatar src={top3.avatar} name={top3.name} size="avatar" />
                                <div className="podium-rank-badge">RANK 3</div>
                            </div>
                            <h3 className="player-name">{top3.name}</h3>
                            <span className="player-id">ID: {top3.ffuid}</span>
                            <div className="point-stats">
                                <span className="anim-points text-amber-600"><AnimatedNumber value={top3.points} /></span>
                                <span className="text-xs font-bold text-muted uppercase tracking-widest">Global Points</span>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="text-center py-20 glass-panel">
                        <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold">Waiting for Legends...</h3>
                        <p className="text-muted">Start competing to see the podium fill up!</p>
                    </div>
                )}
            </div>

            <div className="container">
                <div className="lb-controls">
                    <div className="lb-search">
                        <Search size={20} className="text-muted" />
                        <input 
                            type="text" 
                            placeholder="Find player by name or Fire Free ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="lb-table-container">
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>FF UID</th>
                                <th>Wins</th>
                                <th>Kills</th>
                                <th>Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredPlayers.length > 0 ? (
                                    filteredPlayers.map((p) => (
                                        <motion.tr 
                                            key={p.id} 
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="lb-row"
                                        >
                                            <td className="rank-text">#{p.rank}</td>
                                            <td>
                                                <div className="player-cell-pro">
                                                    <PlayerAvatar src={p.avatar} name={p.name} />
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-white">{p.name}</span>
                                                        <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">Verified Player</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary font-bold text-sm">{p.ffuid}</td>
                                            <td className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Star size={14} className="text-yellow-500" />
                                                    {p.wins}
                                                </div>
                                            </td>
                                            <td className="font-bold">{p.kills}</td>
                                            <td className="font-black text-primary">
                                                <AnimatedNumber value={p.points} /> PTS
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-muted">
                                            {searchTerm ? 'No players found matching your search.' : 'No leaderboard data yet. Play matches to earn points.'}
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
