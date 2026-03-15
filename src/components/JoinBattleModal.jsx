import React, { useState, useEffect } from 'react';
import { X, User, Hash, Users, Send, QrCode, ShieldCheck, CreditCard, Loader2, CheckCircle2, AlertCircle, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const JoinBattleModal = ({ tournament, onClose }) => {
    const { currentUser } = useAuth();
    const { joinTournament } = useApp();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const [formData, setFormData] = useState({
        playerName: currentUser?.displayName || currentUser?.username || '',
        ffuid: '',
        teamName: '',
        winningUpi: '',
        utrNumber: '',
        transactionId: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!formData.utrNumber && !formData.transactionId) {
            setError('Please enter at least one transaction reference (UTR or Trans ID)');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await joinTournament(tournament.id, {
                ...formData,
                userId: currentUser.uid
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => onClose(), 4000);
            } else {
                setError(result.error || 'Submission failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Join Tournament' },
        { id: 2, title: 'Player Settings' },
        { id: 3, title: 'Payment Info' },
        { id: 4, title: 'Verify' },
    ];

    return (
        <div className="modal-overlay">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-card"
            >
                <div className="modal-header">
                    <div>
                        <span className="step-indicator">Step {step} of 4</span>
                        <h3>{steps[step-1].title}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body py-6">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="success-icon"><CheckCircle2 size={60} /></div>
                                <h2 className="mt-6 mb-2">Request Submitted!</h2>
                                <p className="text-muted">Wait for admin to verify your payment. You'll see your status in the match room once approved.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {step === 1 && (
                                    <div className="step-content">
                                        <div className="tournament-info-summary">
                                            <div className="summary-item">
                                                <span>Tournament</span>
                                                <strong>{tournament.name}</strong>
                                            </div>
                                            <div className="summary-item">
                                                <span>Entry Fee</span>
                                                <strong className="text-primary">₹{tournament.entryFee || tournament.entry || 'Free'}</strong>
                                            </div>
                                        </div>
                                        <div className="checklist mt-6">
                                            <div className="check-item"><ShieldCheck size={16} /> Fair play monitored</div>
                                            <div className="check-item"><ShieldCheck size={16} /> Zero tolerance for hacks</div>
                                            <div className="check-item"><ShieldCheck size={16} /> Prizes paid within 24 hours</div>
                                        </div>
                                        <button className="btn btn-primary w-100 mt-8" onClick={nextStep}>
                                            Get Started <ArrowRight size={18} />
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="step-content">
                                        <div className="form-group mb-5">
                                            <label>FREE FIRE UID *</label>
                                            <div className="input-with-icon">
                                                <Hash size={18} />
                                                <input 
                                                    type="text" 
                                                    name="ffuid"
                                                    placeholder="Enter your game UID"
                                                    value={formData.ffuid}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mb-5">
                                            <label>TEAM NAME *</label>
                                            <div className="input-with-icon">
                                                <Users size={18} />
                                                <input 
                                                    type="text" 
                                                    name="teamName"
                                                    placeholder="Enter Team or Clan Name"
                                                    value={formData.teamName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="btn-group mt-8">
                                            <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={18} /></button>
                                            <button className="btn btn-primary flex-1" onClick={nextStep} disabled={!formData.ffuid || !formData.teamName}>
                                                Next Step <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="step-content">
                                        <div className="payment-box">
                                            <div className="payment-qr text-center">
                                                <img src={tournament.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=firebattle@upi'} alt="QR" />
                                                <p className="qr-desc">Scan & Pay Entry Fee</p>
                                            </div>
                                            <div className="upi-copy mt-4">
                                                <p className="upi-label">UPI ID</p>
                                                <div className="upi-field">
                                                    <span>{tournament.paymentId || 'firebattle@upi'}</span>
                                                    <button onClick={() => {
                                                        navigator.clipboard.writeText(tournament.paymentId || 'firebattle@upi');
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }} className="copy-btn">{copied ? 'Copied' : 'Copy'}</button>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary w-100 mt-6" onClick={nextStep}>
                                            I have paid <ArrowRight size={18} />
                                        </button>
                                        <button className="btn btn-secondary w-100 mt-3" onClick={prevStep}>Go Back</button>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="step-content">
                                        <div className="form-group mb-5">
                                            <label>UTR NUMBER / TRANSACTION ID *</label>
                                            <input 
                                                className="simple-input"
                                                type="text" 
                                                name="utrNumber"
                                                placeholder="Enter 12-digit UTR or Trans ID"
                                                value={formData.utrNumber}
                                                onChange={handleChange}
                                            />
                                            <p className="input-tip">Mandatory for verification</p>
                                        </div>
                                        <div className="form-group mb-5">
                                            <label>YOUR WINNING UPI ID *</label>
                                            <input 
                                                className="simple-input"
                                                type="text" 
                                                name="winningUpi"
                                                placeholder="Where you want to receive cashprize"
                                                value={formData.winningUpi}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {error && <div className="error-alert"><AlertCircle size={16} /> {error}</div>}
                                        <div className="btn-group mt-8">
                                            <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={18} /></button>
                                            <button 
                                                className="btn btn-primary flex-1" 
                                                onClick={handleSubmit} 
                                                disabled={isSubmitting || !formData.winningUpi}
                                            >
                                                {isSubmitting ? 'Verifying...' : 'Submit Join Request'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                        padding: 20px;
                    }

                    .modal-card {
                        background: var(--bg-card);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        width: 100%;
                        max-width: 480px;
                        border-radius: var(--radius-lg);
                        overflow: hidden;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }

                    .modal-header {
                        padding: 24px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.02);
                    }

                    .step-indicator {
                        font-size: 0.75rem;
                        font-weight: 800;
                        color: var(--primary);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .modal-header h3 {
                        margin-top: 4px;
                        font-size: 1.25rem;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        color: var(--text-dim);
                        cursor: pointer;
                        padding: 8px;
                    }

                    .modal-body {
                        padding: 30px;
                    }

                    .tournament-info-summary {
                        background: rgba(255, 255, 255, 0.03);
                        padding: 20px;
                        border-radius: var(--radius-md);
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .summary-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .summary-item span {
                        color: var(--text-dim);
                        font-size: 0.9rem;
                    }

                    .checklist {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .check-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: var(--text-muted);
                        font-size: 0.9rem;
                        font-weight: 600;
                    }

                    .form-group label {
                        display: block;
                        font-size: 0.75rem;
                        font-weight: 800;
                        color: var(--text-dim);
                        margin-bottom: 10px;
                        letter-spacing: 0.5px;
                    }

                    .input-with-icon {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }

                    .input-with-icon svg {
                        position: absolute;
                        left: 16px;
                        color: var(--text-dim);
                    }

                    .input-with-icon input {
                        width: 100%;
                        background: rgba(0, 0, 0, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        padding: 14px 14px 14px 48px;
                        border-radius: 10px;
                        color: white;
                        font-size: 1rem;
                        outline: none;
                    }

                    .input-with-icon input:focus {
                        border-color: var(--primary);
                    }

                    .simple-input {
                        width: 100%;
                        background: rgba(0, 0, 0, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        padding: 14px;
                        border-radius: 10px;
                        color: white;
                        font-size: 1rem;
                        outline: none;
                    }

                    .simple-input:focus {
                        border-color: var(--primary);
                    }

                    .btn-group {
                        display: flex;
                        gap: 12px;
                    }

                    .flex-1 { flex: 1; }

                    .payment-box {
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        padding: 24px;
                        border-radius: var(--radius-lg);
                    }

                    .payment-qr img {
                        width: 180px;
                        height: 180px;
                        padding: 10px;
                        background: white;
                        border-radius: 12px;
                    }

                    .qr-desc {
                        font-size: 0.85rem;
                        margin-top: 12px;
                        color: var(--text-dim);
                        font-weight: 600;
                    }

                    .upi-field {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(0, 0, 0, 0.3);
                        padding: 10px 16px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        margin-top: 6px;
                    }

                    .upi-label {
                        font-size: 0.7rem;
                        font-weight: 700;
                        color: var(--text-dim);
                    }

                    .copy-btn {
                        background: var(--primary);
                        border: none;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 700;
                        cursor: pointer;
                    }

                    .error-alert {
                        background: rgba(239, 68, 68, 0.1);
                        color: var(--danger);
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 0.85rem;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 20px;
                    }

                    .success-icon {
                        color: var(--success);
                        filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default JoinBattleModal;
