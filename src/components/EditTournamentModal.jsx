import React, { useState } from 'react';
import { X, Trophy, Calendar, Clock, Coins, Wallet, Users, CreditCard, Upload, CheckCircle, ChevronRight, ChevronLeft, Zap, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './CreateTournamentModal.css'; // reuse same styles

const steps = [
    { id: 1, label: 'Basics',   icon: <Trophy size={16} /> },
    { id: 2, label: 'Prizes',   icon: <Coins size={16} /> },
    { id: 3, label: 'Schedule', icon: <Calendar size={16} /> },
    { id: 4, label: 'Payment',  icon: <CreditCard size={16} /> },
];

const EditTournamentModal = ({ tournament, onClose }) => {
    const { updateTournament } = useApp();
    const [step, setStep]               = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone]               = useState(false);

    // Pre-fill with existing tournament data
    const [formData, setFormData] = useState({
        name:          tournament.name || '',
        game:          tournament.game || 'Free Fire',
        mode:          tournament.mode || 'Squad',
        entry:         tournament.entry || tournament.entryFee || '₹50',
        prize:         tournament.prize || tournament.prizePool || '₹5000',
        prize1:        tournament.prize1 || (tournament.prizes?.[0]?.amount) || '₹2500',
        prize2:        tournament.prize2 || (tournament.prizes?.[1]?.amount) || '₹1000',
        prize3:        tournament.prize3 || (tournament.prizes?.[2]?.amount) || '₹500',
        prizeKill:     tournament.prizeKill || (tournament.prizes?.find(p => p.rank === 'Per Kill')?.amount) || '₹10',
        maxPlayers:    tournament.maxPlayers || 48,
        date:          tournament.date || new Date().toISOString().split('T')[0],
        exactTime:     tournament.exactTime || tournament.time || tournament.matchTime || '20:00',
        regCloseTime:  tournament.regCloseTime || '19:30',
        rules:         tournament.rules || 'Standard Free Fire esports rules apply.',
        paymentMethod: tournament.paymentMethod || 'UPI',
        paymentId:     tournament.paymentId || 'firebattle@upi',
        qrCodeImage:   tournament.qrCodeImage || null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, [name]: reader.result }));
            if (file) reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const customPrizes = [
                { rank: '1st Prize', amount: formData.prize1 },
                { rank: '2nd Prize', amount: formData.prize2 },
                { rank: '3rd Prize', amount: formData.prize3 },
                ...(formData.prizeKill ? [{ rank: 'Per Kill', amount: formData.prizeKill }] : [])
            ];
            const res = await updateTournament(tournament.id, {
                ...formData,
                entryFee:  formData.entry,
                matchTime: formData.exactTime,
                prizes:    customPrizes,
            });
            if (res?.success === false) {
                alert('❌ ' + (res.error || 'Failed to update tournament.'));
                return;
            }
            setDone(true);
            setTimeout(() => onClose(), 1800);
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = 'modal-input';
    const labelClass = 'modal-label';

    return (
        <div className="ct-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                className="ct-modal"
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Header */}
                <div className="ct-header">
                    <div className="ct-header-left">
                        <div className="ct-header-icon" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                            <Edit3 size={22} />
                        </div>
                        <div>
                            <h2>Edit Tournament</h2>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                {tournament.name}
                            </p>
                        </div>
                    </div>
                    <button className="ct-close" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Step Progress */}
                <div className="ct-steps">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.id}>
                            <div
                                className={`ct-step ${step >= s.id ? 'active' : ''} ${step === s.id ? 'current' : ''}`}
                                onClick={() => step > s.id && setStep(s.id)}
                                style={{ cursor: step > s.id ? 'pointer' : 'default' }}
                            >
                                <div className="ct-step-icon">{step > s.id ? <CheckCircle size={14} /> : s.icon}</div>
                                <span>{s.label}</span>
                            </div>
                            {i < steps.length - 1 && <div className={`ct-step-line ${step > s.id ? 'done' : ''}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div className="ct-body">
                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div
                                key="done"
                                className="ct-success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="ct-success-icon"><CheckCircle size={48} /></div>
                                <h3>Tournament Updated!</h3>
                                <p>Changes have been saved successfully.</p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key={step}
                                onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="ct-form"
                            >
                                {/* STEP 1: Basics */}
                                {step === 1 && (
                                    <div className="ct-step-content">
                                        <h3 className="ct-step-title"><Trophy size={18} /> Tournament Basics</h3>

                                        <div className="ct-field">
                                            <label className={labelClass}>Tournament Name *</label>
                                            <input className={inputClass} type="text" name="name" required placeholder="e.g. FireBattle Pro League S1" value={formData.name} onChange={handleChange} />
                                        </div>

                                        <div className="ct-row">
                                            <div className="ct-field">
                                                <label className={labelClass}>Game Mode</label>
                                                <select className={inputClass} name="mode" value={formData.mode} onChange={handleChange}>
                                                    <option value="Solo">Solo</option>
                                                    <option value="Duo">Duo</option>
                                                    <option value="Squad">Squad</option>
                                                </select>
                                            </div>
                                            <div className="ct-field">
                                                <label className={labelClass}>Max Players *</label>
                                                <input className={inputClass} type="number" name="maxPlayers" required value={formData.maxPlayers} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="ct-field">
                                            <label className={labelClass}>Tournament Rules</label>
                                            <textarea className={inputClass} name="rules" rows="4" value={formData.rules} onChange={handleChange} />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: Prizes */}
                                {step === 2 && (
                                    <div className="ct-step-content">
                                        <h3 className="ct-step-title"><Coins size={18} /> Prize Distribution</h3>

                                        <div className="ct-row">
                                            <div className="ct-field">
                                                <label className={labelClass}>Entry Fee *</label>
                                                <input className={inputClass} type="text" name="entry" required placeholder="₹50" value={formData.entry} onChange={handleChange} />
                                            </div>
                                            <div className="ct-field">
                                                <label className={labelClass}>Total Prize Pool *</label>
                                                <input className={inputClass} type="text" name="prize" required placeholder="₹5000" value={formData.prize} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="ct-prize-grid">
                                            <div className="ct-prize-card gold">
                                                <span className="prize-rank">🥇 1st Place</span>
                                                <input className={inputClass} type="text" name="prize1" placeholder="₹2500" value={formData.prize1} onChange={handleChange} />
                                            </div>
                                            <div className="ct-prize-card silver">
                                                <span className="prize-rank">🥈 2nd Place</span>
                                                <input className={inputClass} type="text" name="prize2" placeholder="₹1000" value={formData.prize2} onChange={handleChange} />
                                            </div>
                                            <div className="ct-prize-card bronze">
                                                <span className="prize-rank">🥉 3rd Place</span>
                                                <input className={inputClass} type="text" name="prize3" placeholder="₹500" value={formData.prize3} onChange={handleChange} />
                                            </div>
                                            <div className="ct-prize-card kill">
                                                <span className="prize-rank">💀 Per Kill</span>
                                                <input className={inputClass} type="text" name="prizeKill" placeholder="₹10" value={formData.prizeKill} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Schedule */}
                                {step === 3 && (
                                    <div className="ct-step-content">
                                        <h3 className="ct-step-title"><Calendar size={18} /> Match Schedule</h3>

                                        <div className="ct-row">
                                            <div className="ct-field">
                                                <label className={labelClass}>Match Date *</label>
                                                <input className={inputClass} type="text" name="date" required placeholder="2024-12-25" value={formData.date} onChange={handleChange} />
                                            </div>
                                            <div className="ct-field">
                                                <label className={labelClass}>Match Time *</label>
                                                <input className={inputClass} type="text" name="exactTime" required placeholder="08:30 PM" value={formData.exactTime} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="ct-field">
                                            <label className={labelClass}>Registration Closes At</label>
                                            <input className={inputClass} type="text" name="regCloseTime" placeholder="08:00 PM" value={formData.regCloseTime} onChange={handleChange} />
                                        </div>

                                        <div className="ct-info-box">
                                            <Clock size={16} />
                                            <span>Room credentials will be visible to players 10 minutes before match time.</span>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: Payment */}
                                {step === 4 && (
                                    <div className="ct-step-content">
                                        <h3 className="ct-step-title"><CreditCard size={18} /> Payment Details</h3>

                                        <div className="ct-row">
                                            <div className="ct-field">
                                                <label className={labelClass}>Payment Method</label>
                                                <select className={inputClass} name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                                                    <option value="UPI">UPI</option>
                                                    <option value="Paytm">Paytm</option>
                                                    <option value="PhonePe">PhonePe</option>
                                                    <option value="Google Pay">Google Pay</option>
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                </select>
                                            </div>
                                            <div className="ct-field">
                                                <label className={labelClass}>UPI ID / Phone *</label>
                                                <input className={inputClass} type="text" name="paymentId" required placeholder="9876543210@upi" value={formData.paymentId} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="ct-field">
                                            <label className={labelClass}>Upload QR Code (Optional)</label>
                                            <div className="ct-file-upload">
                                                <Upload size={20} className="text-muted" />
                                                <span>Click to upload / replace QR image</span>
                                                <input type="file" name="qrCodeImage" accept="image/*" onChange={handleChange} />
                                            </div>
                                            {formData.qrCodeImage && (
                                                <div className="ct-qr-preview">
                                                    <img src={formData.qrCodeImage} alt="QR Preview" />
                                                    <span className="text-success">✓ QR ready</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                {!done && (
                    <div className="ct-footer">
                        <button
                            type="button"
                            className="ct-btn-back"
                            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        >
                            <ChevronLeft size={18} /> {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        <div className="ct-step-dots">
                            {steps.map(s => (
                                <div key={s.id} className={`ct-dot ${step >= s.id ? 'active' : ''}`} />
                            ))}
                        </div>

                        {step < 4 ? (
                            <button
                                type="button"
                                className="ct-btn-next"
                                onClick={() => setStep(s => s + 1)}
                                disabled={step === 1 && !formData.name}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="ct-btn-next ct-btn-submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                {isSubmitting ? (
                                    <><span className="ct-spinner" /> Saving...</>
                                ) : (
                                    <><Edit3 size={16} /> Save Changes</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EditTournamentModal;
