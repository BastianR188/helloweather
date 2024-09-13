import React from 'react';
import './WeeklyForecast.css'; // Stellen Sie sicher, dass Sie diese CSS-Datei erstellen
import { getWeatherIcon } from '../services/getWeatherIcon';

function WeeklyForecast({ dailyData }) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    const getWindDirection = (degrees) => {
        const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
    };

    if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
        return <p>Keine Datensätze gefunden</p>;
    }

    const dataLength = dailyData.time.length;

    const getPercentageStyle = (percentage, direction, color) => ({
        background: `linear-gradient(${direction}, ${color} ${percentage}%, transparent ${percentage}%)`,
        borderRadius: '4px',
    });

    const getPercent = (preipitation) => {
        if (preipitation <= 10) { return preipitation * 10 }
        else { return 100 }
     }

    return (
        <table className="weekly-forecast">
            <thead>
                <tr>
                    <th>Tag</th>
                    {dailyData.time.map((time, index) => {
                        const date = new Date(time);
                        return <th key={index}>{index === 0 ? 'Heute' : days[date.getDay()]}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Wetter</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>
                            {getWeatherIcon(
                                dailyData.cloudcover_mean?.[index] || 0,
                                dailyData.precipitation_probability_mean?.[index] || 0,
                                dailyData.temperature_2m_mean?.[index] || 0,
                                dailyData.precipitation_sum?.[index] || 0
                            )}
                        </td>
                    ))}
                </tr>

                <tr>
                    <th>Temperatur</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>{(dailyData.temperature_2m_mean?.[index] || 0).toFixed(1)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Hoch</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>{(dailyData.temperature_2m_max?.[index] || 0).toFixed(1)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Niedrig</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>{(dailyData.temperature_2m_min?.[index] || 0).toFixed(1)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Bewölkung</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} style={getPercentageStyle(dailyData.cloudcover_mean?.[index] || 0, 'to right', 'rgba(128, 128, 128, 0.5)')}>
                            {(dailyData.cloudcover_mean?.[index] || 0).toFixed(0)}%
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Regenwahrscheinlichkeit</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} style={getPercentageStyle(dailyData.precipitation_probability_mean?.[index] || 0, 'to right', 'rgba(53, 162, 235, 0.2)')}>
                            {dailyData.precipitation_probability_mean?.[index] || 0}%
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Regenmenge</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} style={getPercentageStyle(getPercent(dailyData.precipitation_sum?.[index] || 0), 'to top', 'rgba(0, 0, 255, 0.5)')}>
                            {(dailyData.precipitation_sum?.[index] || 0).toFixed(1)} mm
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Windstärke</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>{(dailyData.windspeed_10m_max?.[index] || 0).toFixed(1)} m/s</td>
                    ))}
                </tr>
                <tr>
                    <th>Windrichtung</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index}>{getWindDirection(dailyData.winddirection_10m_dominant?.[index] || 0)}</td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}

export default WeeklyForecast;
