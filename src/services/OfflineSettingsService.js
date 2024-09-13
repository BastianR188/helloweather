const STORAGE_KEY = 'helloWeatherAppSettings';

export const loadSettings = () => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
        return JSON.parse(savedSettings);
    }
    return {
        darkMode: false,
        coordinates: null,
        cityName: '',
        chartVisibility: {
            temperature: true,
            humidity: true,
            precipProbability: true,
            solarRadiation: true,
            precipitation: true,
            cloudCover: true
        }
    };
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

export const loadChartVisibility = () => {
    const settings = loadSettings();
    return settings.chartVisibility;
};

export const saveChartVisibility = (chartVisibility) => {
    const settings = loadSettings();
    settings.chartVisibility = chartVisibility;
    saveSettings(settings);
};

export const loadMapVisibility = () => {
    const settings = loadSettings();
    return settings.mapVisible ?? true; // Standard ist sichtbar
};

export const saveMapVisibility = (isVisible) => {
    const settings = loadSettings();
    settings.mapVisible = isVisible;
    saveSettings(settings);
};
