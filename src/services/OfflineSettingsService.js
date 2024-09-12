const STORAGE_KEY = 'helloWeatherAppSettings';

export const loadSettings = () => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
        return JSON.parse(savedSettings);
    }
    return { darkMode: false, coordinates: null, cityName: '' };
};

export const saveSettings = (settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const loadDarkMode = () => {
    const settings = loadSettings();
    return settings.darkMode;
};

export const saveDarkMode = (isDarkMode) => {
    const settings = loadSettings();
    settings.darkMode = isDarkMode;
    saveSettings(settings);
};

export const loadCoordinates = () => {
    const settings = loadSettings();
    return settings.coordinates;
};

export const saveCoordinates = (coordinates) => {
    const settings = loadSettings();
    settings.coordinates = coordinates;
    saveSettings(settings);
};

export const loadCityName = () => {
    const settings = loadSettings();
    return settings.cityName;
};

export const saveCityName = (cityName) => {
    const settings = loadSettings();
    settings.cityName = cityName;
    saveSettings(settings);
};