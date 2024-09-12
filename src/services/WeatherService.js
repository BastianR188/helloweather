export const getWeatherData = async (latitude, longitude) => {
    try {
        const baseUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto`;
        const hourlyParams = 'hourly=temperature_2m,precipitation_probability,precipitation,cloudcover,windspeed_10m,winddirection_10m,relativehumidity_2m,direct_radiation';        const dailyParams = 'daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,precipitation_probability_mean,windspeed_10m_max,winddirection_10m_dominant,cloudcover_mean';
        const response = await fetch(`${baseUrl}&${hourlyParams}&${dailyParams}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Wetterdaten:', error);
        throw error;
    }
};

