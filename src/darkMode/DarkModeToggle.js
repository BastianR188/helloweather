import React, { useContext } from 'react';
import { DarkModeContext } from './DarkModeContext';

const DarkModeToggle = () => {
    const { isDarkMode, setIsDarkMode } = useContext(DarkModeContext);

    return (
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
    );
};

export default DarkModeToggle;
