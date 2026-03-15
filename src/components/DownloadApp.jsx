import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Info, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './DownloadApp.css';

const DownloadApp = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [platform, setPlatform] = useState('unknown');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Detect Platform
        const ua = navigator.userAgent.toLowerCase();
        if (/android/.test(ua)) setPlatform('android');
        else if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
        else setPlatform('desktop');

        // Handle PWA Install Prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        });

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If no prompt, try to show instructions or alert
            if (platform === 'ios') {
                alert("To install on iOS: Tap the 'Share' button and select 'Add to Home Screen'.");
            } else {
                alert("Installation is available through your browser's menu (Add to Home Screen).");
            }
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleApkDownload = () => {
        // Points to public/FireBattle.apk
        window.open('/FireBattle.apk', '_blank');
    };

    return (
        <section className="download-section">
            <div className="container">
                <div className="download-card glass-panel">
                    <div className="download-content">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="download-text"
                        >
                            <span className="section-badge">
                                <Smartphone size={14} /> MOBILE EXPERIENCE
                            </span>
                            <h2 className="section-title">Take the Arena <span className="text-secondary-gradient">Anywhere</span></h2>
                            <p className="text-muted text-lg mb-8">
                                Download our official app or install the Web Pro version for the fastest tournament access and real-time match notifications.
                            </p>

                            <div className="platform-info mb-8">
                                {platform === 'android' ? (
                                    <div className="info-box android">
                                        <Smartphone className="text-success" />
                                        <div>
                                            <strong>Android User</strong>
                                            <p>Install the APK for the best performance or Add to Home Screen.</p>
                                        </div>
                                    </div>
                                ) : platform === 'ios' ? (
                                    <div className="info-box ios">
                                        <Smartphone className="text-primary" />
                                        <div>
                                            <strong>iOS User</strong>
                                            <p>Tap 'Share' and 'Add to Home Screen' to install as an app.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="info-box desktop">
                                        <Monitor className="text-cyan" />
                                        <div>
                                            <strong>Desktop User</strong>
                                            <p>Use the professional web app for full management and hosting.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="download-btns">
                                <button 
                                    className={`btn btn-primary btn-lg ${!deferredPrompt ? 'pulse-light' : ''}`}
                                    onClick={handleInstallClick}
                                >
                                    <Smartphone className="mr-2" size={20} /> Install Web App
                                </button>
                                <button 
                                    className="btn btn-secondary btn-lg"
                                    onClick={handleApkDownload}
                                >
                                    <Package className="mr-2" size={20} /> Download APK
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="install-success mt-6"
                                    >
                                        <CheckCircle size={18} className="text-success" />
                                        <span>Successfully installed! Open from your home screen.</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="download-visual"
                        >
                            <div className="phone-mockup">
                                <div className="phone-screen">
                                    <div className="screen-content">
                                        <div className="screen-header"></div>
                                        <div className="screen-body">
                                            <div className="dummy-card"></div>
                                            <div className="dummy-card"></div>
                                            <div className="dummy-card"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="glow-effect"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DownloadApp;
