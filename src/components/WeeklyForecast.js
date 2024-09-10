import React from 'react';

function WeeklyForecast({ dailyData }) {
    console.log('WeeklyForecast dailyData:', dailyData);

    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    const getWeatherIcon = (cloudCover) => {
        if (cloudCover < 25) return '☀️';
        if (cloudCover < 50) return '🌤️';
        if (cloudCover < 75) return '⛅';
        return '☁️';
    };

    const getWindDirection = (degrees) => {
        const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
    };

    if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
        return <p>Keine Datensätze gefunden</p>;
    }

    const dataLength = dailyData.time.length;

    return (
        <table className="weekly-forecast">
            <thead>
                <tr>
                    {dailyData.time.map((time, index) => {
                        const date = new Date(time);
                        return <th key={index}>{index === 0 ? 'Heute' : days[date.getDay()]}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>
                            <div>{getWeatherIcon(dailyData.cloudcover_mean?.[index] || 0)}</div>
                            <div>{(dailyData.temperature_2m_mean?.[index] || 0).toFixed(1)}°C</div>
                            <div>H: {(dailyData.temperature_2m_max?.[index] || 0).toFixed(1)}°C</div>
                            <div>L: {(dailyData.temperature_2m_min?.[index] || 0).toFixed(1)}°C</div>
                            <div>Regen: {dailyData.precipitation_probability_mean?.[index] || 0}%</div>
                            <div>Menge: {(dailyData.precipitation_sum?.[index] || 0).toFixed(1)} mm</div>
                            <div>Wind: {(dailyData.windspeed_10m_max?.[index] || 0).toFixed(1)} m/s</div>
                            <div>Richtung: {getWindDirection(dailyData.winddirection_10m_dominant?.[index] || 0)}</div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}

export default WeeklyForecast;
