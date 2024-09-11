import React, { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return settings.darkMode;
        }
        return false;
    });

    const [savedCoordinates, setSavedCoordinates] = useState(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return settings.coordinates;
        }
        return null;
    });

    useEffect(() => {
        const settings = {
            darkMode: isDarkMode,
            coordinates: savedCoordinates
        };
        localStorage.setItem('appSettings', JSON.stringify(settings));
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode, savedCoordinates]);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode, savedCoordinates, setSavedCoordinates }}>
            {children}
        </DarkModeContext.Provider>
    );
};

