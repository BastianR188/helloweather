const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const getWeatherData = async (latitude, longitude) => {
    try {
        const response = await fetch(`${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        if (!response.ok) {
            throw new Error('Wetterdaten konnten nicht abgerufen werden');
        }
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Wetterdaten:', error);
        throw error;
    }
};
