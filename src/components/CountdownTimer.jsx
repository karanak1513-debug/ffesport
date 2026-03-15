import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ dateStr, timeStr, status }) => {
    const parseDateTime = () => {
        try {
            let parsedDate = null;

            // standard YYYY-MM-DD and HH:mm
            if (dateStr && dateStr.includes('-')) {
                const timePart = timeStr ? (timeStr.includes('PM') || timeStr.includes('AM') ? timeStr : `${timeStr}:00`) : '00:00:00';
                parsedDate = new Date(`${dateStr}T${timePart.replace(' AM', '').replace(' PM', '')}`);
                if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
            }

            let finalDateStr = dateStr;
            if (dateStr && dateStr.toLowerCase() === 'today') {
                const today = new Date();
                finalDateStr = today.toDateString();
            }

            const targetDate = new Date(`${finalDateStr} ${timeStr || '00:00'}`);
            if (isNaN(targetDate.getTime())) {
                return null;
            }
            return targetDate.getTime();
        } catch {
            return null;
        }
    };

    const targetTime = parseDateTime();

    const [timeLeft, setTimeLeft] = useState(() => {
        if (!targetTime) return null;
        const diff = targetTime - new Date().getTime();
        if (diff < 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
    });

    useEffect(() => {
        if (!targetTime) {
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference < 0) {
                clearInterval(interval);
                setTimeLeft(null);
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    const isTerminal = status === 'completed' || status === 'closed' || status === 'cancelled';

    if (!targetTime || !timeLeft || isTerminal) {
        let message = "Match Started / Ended";
        if (status === 'live') message = "🔥 Match is LIVE NOW!";
        if (status === 'completed') message = "🏆 Tournament Completed";
        if (status === 'closed') message = "🔒 Registration Closed";
        if (status === 'cancelled') message = "🚫 Match Cancelled";
        if (status === 'open' && !timeLeft) message = "⚔️ Battle Opening...";

        return (
            <div className={`countdown-timer expired ${status === 'live' ? 'text-success' : 'text-warning'} font-bold px-4 py-2 bg-white/5 rounded-xl border border-white/10`} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                {message}
            </div>
        );
    }

    const formatNum = (num) => String(num).padStart(2, '0');

    return (
        <div className="countdown-timer d-flex align-items-center" style={{ gap: '8px', background: 'rgba(255, 69, 0, 0.1)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255, 69, 0, 0.3)' }}>
            <span className="text-warning font-bold">Starts In:</span>
            <div className="d-flex" style={{ gap: '5px' }}>
                <span className="time-block"><strong>{formatNum(timeLeft.days)}</strong>d</span><span className="text-muted">:</span>
                <span className="time-block"><strong>{formatNum(timeLeft.hours)}</strong>h</span><span className="text-muted">:</span>
                <span className="time-block"><strong>{formatNum(timeLeft.minutes)}</strong>m</span><span className="text-muted">:</span>
                <span className="time-block"><strong>{formatNum(timeLeft.seconds)}</strong>s</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
