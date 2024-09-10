export const getWeatherData = async (latitude, longitude) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,direct_radiation,windspeed_10m,winddirection_10m,precipitation&timezone=auto`);
        if (!response.ok) {
            throw new Error('Wetterdaten konnten nicht abgerufen werden');
        }
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Wetterdaten:', error);
        throw error;
    }
}
