import React, { useState, useEffect, createContext } from 'react';
import { loadDarkMode, saveDarkMode } from '../services/OfflineSettingsService'

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => loadDarkMode());

    useEffect(() => {
        saveDarkMode(isDarkMode);
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    return (
        <DarkModeContext.Provider value={{ 
            isDarkMode, 
            setIsDarkMode
        }}>
            {children}
        </DarkModeContext.Provider>
    );
};
