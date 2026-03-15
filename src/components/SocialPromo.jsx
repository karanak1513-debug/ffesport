import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X, ArrowRight } from 'lucide-react';
import './SocialPromo.css';

const SocialPromo = () => {
    const [showTopBar, setShowTopBar] = React.useState(true);
    const instaUrl = "https://www.instagram.com/its_sun_official_ok/?__pwa=1#";

    return (
        <>
            {/* Top Announcement Bar */}
            <AnimatePresence>
                {showTopBar && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="insta-top-bar"
                    >
                        <div className="container flex items-center justify-center gap-4 py-2">
                             <Instagram size={16} className="text-white" />
                             <p className="text-xs lg:text-sm font-bold tracking-wide">
                                FOLLOW US ON INSTAGRAM FOR MATCH UPDATES & GIVEAWAYS!
                             </p>
                             <a 
                                href={instaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="insta-btn-mini"
                             >
                                Follow Now <ArrowRight size={14} />
                             </a>
                             <button className="close-top-bar" onClick={() => setShowTopBar(false)}>
                                <X size={16} />
                             </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Social Button */}
            <motion.a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="floating-insta-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <div className="insta-pulse"></div>
                <Instagram size={24} />
                <span className="tooltip">Follow Us!</span>
            </motion.a>
        </>
    );
};

export default SocialPromo;
