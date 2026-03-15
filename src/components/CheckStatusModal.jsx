import React, { useEffect } from 'react';
import { X, Clock, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckStatusModal = ({ record, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const statusToLower = (record?.status || '').toLowerCase();
    const isPending = statusToLower === 'pending';
    const isRejected = statusToLower === 'rejected';

    return (
        <div 
            className="modal-overlay" 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
            onClick={handleOutsideClick}
        >
            <motion.div 
                className="modal-content glass-panel text-center"
                style={{ maxWidth: '400px', width: '90%', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(255, 120, 0, 0.1), transparent)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        STATUS CHECK
                    </h2>
                    <button style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '5px' }} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '30px 20px' }}>
                    {isPending && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Clock size={32} color="#eab308" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#eab308', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Pending Approval</h3>
                            <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>
                                Your join request is currently under review by the creator. Please check back later.
                            </p>
                        </div>
                    )}

                    {isRejected && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <ShieldAlert size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Request Rejected</h3>
                            <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>
                                Your application to join this arena was rejected. Ensure your provided UTR/Transaction details are valid.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CheckStatusModal;
