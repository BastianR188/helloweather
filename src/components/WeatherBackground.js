// WeatherBackground.js
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import './WeatherBackground.css';


const WeatherBackground = ({ weatherIcon, cloudCover, precipAmount, solarRadiation, windSpeed, windDirection, timezone }) => {
    const [currentTime, setCurrentTime] = useState(DateTime.now().setZone(timezone));
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const now = DateTime.now().setZone(timezone);
            setCurrentTime(now);
            setIsNight(now.hour < 6 || now.hour >= 18);
        };

        updateTime();
        const timer = setInterval(updateTime, 60000);

        return () => clearInterval(timer);
    }, [timezone, weatherIcon]);

    useEffect(() => {
        setCurrentTime(DateTime.now().setZone(timezone));
        const timer = setInterval(() => {
            setCurrentTime(DateTime.now().setZone(timezone));
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [timezone]);

    const getBackgroundClass = () => {
        const hour = currentTime.hour;
        if (hour >= 6 && hour < 18) return 'day';
        return 'night light-night';
    };

    const getCelestialBodyPosition = () => {
        const hour = currentTime.hour;
        let position;
        if (hour >= 6 && hour < 18) {
            // Day time
            position = (hour - 6) / 12 * 100;
        } else {
            // Night time
            position = ((hour < 6 ? hour + 24 : hour) - 18) / 12 * 100;
        }
        return `${position}%`;
    };

    const isSunVisible = () => {
        const hour = currentTime.hour;
        return hour >= 6 && hour < 18;
    };

    const getSolarPulseIntensity = () => {
        // Annahme: solarRadiation ist in W/m²
        // Wir können die Intensität basierend auf verschiedenen Schwellenwerten anpassen
        if (solarRadiation > 800) return 'high';
        if (solarRadiation > 400) return 'medium';
        if (solarRadiation > 200) return 'low';
        return 'none';
    };

    const getCloudCover = () => {
        if (cloudCover < 25) return 'clear';
        if (cloudCover < 50) return 'partly-cloudy';
        if (cloudCover < 75) return 'mostly-cloudy';
        return 'overcast';
    };

    const getRainIntensity = () => {
        if (precipAmount === 0) return 'none';
        if (precipAmount < 0.1) return 'light';
        if (precipAmount < 3.5) return 'moderate';
        if (precipAmount < 7.6) return 'heavy';
        return 'extreme';
    };

    const getRainAngle = () => {
        const maxAngle = 30;
        const angle = (windSpeed / 10) * maxAngle; // 10 m/s wind speed = max angle
        return windDirection > 180 ? -angle : angle; // Negative angle if wind is coming from left
    };

    const getRainSpeed = () => {
        return Math.max(2, Math.min(0.5, 10 / windSpeed)); // Inverse relationship with wind speed
    };

    const getWindClass = () => {
        if (windSpeed < 5) return 'light';
        if (windSpeed < 10) return 'moderate';
        return 'strong';
    };

    return (
        <div>
        <div 
            className={`celestial-body ${isSunVisible() ? 'sun' : 'moon'} solar-pulse-${getSolarPulseIntensity()}`}
            style={{ left: getCelestialBodyPosition(), top: '10%' }}
        ></div>
            {getRainIntensity() !== 'none' && (
                <div 
                    className={`rain ${getRainIntensity()}`} 
                    style={{ 
                        '--rain-angle': `${getRainAngle()}deg`,
                        '--rain-speed': `${getRainSpeed()}s`
                    }}
                >
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className="raindrop" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `var(--rain-speed)`
                        }}></div>
                    ))}
                </div>
            )}
            {weatherIcon === '🌩️' && <div className="lightning"></div>}
        </div>
    );
};

export default WeatherBackground;
