import React from 'react';
import { Target, Search, CreditCard, Trophy, ShieldCheck, Zap, Smartphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HowToPlay = () => {
    const steps = [
        {
            icon: <Search className="text-primary" />,
            title: "1. Choose Your Battle",
            desc: "Browse through our daily tournaments. Select a match that fits your skill level and schedule (Solo, Duo, or Squad)."
        },
        {
            icon: <CreditCard className="text-secondary" />,
            title: "2. Register & Pay",
            desc: "Pay the small entry fee via QR or UPI. Standard verification takes less than 2 minutes via our automated system."
        },
        {
            icon: <Zap className="text-warning" />,
            title: "3. Get Credentials",
            desc: "Custom Room ID and Password are released in the Match Room 10-15 minutes before the match start time."
        },
        {
            icon: <Trophy className="text-success" />,
            title: "4. Dominate & Earn",
            desc: "Compete against real players. Your winnings are calculated per kill and per rank, then sent to your UPI within 24 hours."
        }
    ];

    return (
        <div className="how-to-play-page" style={{ background: 'var(--bg-deep)', minHeight: '100vh', padding: '120px 0 80px' }}>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="hero-title">Start Your <span className="text-primary">Legacy</span></h1>
                    <p className="text-muted mt-4 max-w-2xl mx-auto">Master the arena with these simple steps. No hidden fees, no bots, just pure competitive gaming.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-8 text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 font-black text-white/5 text-4xl">{i + 1}</div>
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                {React.cloneElement(step.icon, { size: 32 })}
                            </div>
                            <h3 className="mb-4 font-bold">{step.title}</h3>
                            <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-10 border-primary/20"
                    >
                        <h2 className="flex items-center gap-4 mb-8">
                            <ShieldCheck size={32} className="text-primary" /> 
                            Fair Play Protocol
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="text-primary font-bold">01</div>
                                <p className="text-muted">Anti-cheat systems actively monitor every custom room for suspicious activity.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-primary font-bold">02</div>
                                <p className="text-muted">Teaming up or intentional griefing will result in a permanent hardware ban.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-primary font-bold">03</div>
                                <p className="text-muted">Prize money is only disbursed after match replay verification by admins.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card p-10 rounded-3xl border border-white/5"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Smartphone size={32} className="text-secondary" />
                            <h2 className="m-0">Ready to Play?</h2>
                        </div>
                        <p className="text-muted mb-8 leading-relaxed">
                            Join thousands of Indian gamers competing daily. Whether you're a seasoned pro or a rising star, there's a place for you in the arena.
                        </p>
                        <button className="btn btn-primary w-100 py-4 flex items-center justify-center gap-3">
                            Join Next Tournament <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HowToPlay;
