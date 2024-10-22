import React, { useState } from 'react';
import { useMemo } from 'react';
import './WeeklyForecast.css'; // Stellen Sie sicher, dass Sie diese CSS-Datei erstellen
import { getWeatherIcon } from '../services/getWeatherIcon';
import ForecastSelectionService from '../services/ForecastSelectionService';

function WeeklyForecast({ dailyData }) {
    const [, setSelectedDay] = useState(null);
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const dataLength = dailyData.time.length;

    const maxPrecipitation = useMemo(() => {
        if (!dailyData.precipitation_sum) return 10;
        const maxValue = Math.max(...dailyData.precipitation_sum);
        return Math.max(maxValue, 10);
    }, [dailyData.precipitation_sum]);

    const getPercentageStyle = (percentage, direction, color) => ({
        background: `linear-gradient(${direction}, ${color} ${percentage}%, transparent ${percentage}%)`,
        borderRadius: '4px',
    });

    const getPercent = (precipitation) => {
        return (precipitation / maxPrecipitation) * 100;
    };

    const WindArrow = ({ direction }) => {
        const setDirection = direction - 90
        return (
            <span
                style={{
                    display: 'inline-block',
                    fontSize: '20px',
                    transform: `rotate(${setDirection}deg)`,
                    transition: 'transform 0.3s ease'
                }}
            >
                ➤
            </span>
        );
    };

    const handleMouseEnter = (columnIndex) => {
        handleMouseLeave(); // Entfernt zuerst alle vorherigen Hervorhebungen
        const cells = document.querySelectorAll(`.weekly-forecast [data-column="${columnIndex}"]`);
        cells.forEach(cell => cell.classList.add('highlight'));
    };

    const handleMouseLeave = () => {
        const cells = document.querySelectorAll('.weekly-forecast .highlight');
        cells.forEach(cell => cell.classList.remove('highlight'));
    };

    const handleDayClick = (index) => {
        setSelectedDay(index);
        ForecastSelectionService.setSelectedForecast(index);
    };



    return (
        <div className="weekly-forecast-container">
        <table className="weekly-forecast">
            <thead>
                <tr>
                    <th>Tag</th>
                    {dailyData.time.map((time, index) => {
                        const date = new Date(time);
                        return <th key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>{index === 0 ? 'Heute' : days[date.getDay()]}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Wetter</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>
                            {getWeatherIcon(
                                dailyData.cloudcover_mean?.[index] || 0,
                                dailyData.precipitation_probability_mean?.[index] || 0,
                                dailyData.temperature_2m_mean?.[index] || 0,
                                dailyData.precipitation_sum?.[index] || 0,
                                dailyData.weathercode?.[index] || 0
                            )}
                        </td>
                    ))}
                </tr>

                <tr>
                    <th>Temperatur</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>{Math.round(dailyData.temperature_2m_mean?.[index] || 0)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Hoch</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>{Math.round(dailyData.temperature_2m_max?.[index] || 0)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Niedrig</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>{Math.round(dailyData.temperature_2m_min?.[index] || 0)}°C</td>
                    ))}
                </tr>
                <tr>
                    <th>Bewölkung</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)} style={getPercentageStyle(dailyData.cloudcover_mean?.[index] || 0, 'to right', 'rgba(236, 240, 241, 0.6)')}>
                            {(dailyData.cloudcover_mean?.[index] || 0).toFixed(0)}%
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Regenwahrscheinlichkeit</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)} style={getPercentageStyle(dailyData.precipitation_probability_mean?.[index] || 0, 'to right', 'rgba(0, 123, 255, 0.6)')}>
                            {dailyData.precipitation_probability_mean?.[index] || 0}%
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Regenmenge</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)} style={getPercentageStyle(getPercent(dailyData.precipitation_sum?.[index] || 0), 'to top', 'rgba(0, 0, 255, 0.5)')}>
                            {(dailyData.precipitation_sum?.[index] || 0).toFixed(1)} mm
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Windstärke</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>{(dailyData.windspeed_10m_max?.[index] || 0).toFixed(1)} m/s</td>
                    ))}
                </tr>
                <tr>
                    <th>Windrichtung</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)}>
                            <WindArrow direction={dailyData.winddirection_10m_dominant?.[index] || 0} />
                        </td>
                    ))}
                </tr>
                <tr>
                    <th>Schneefall</th>
                    {Array.from({ length: dataLength }, (_, index) => (
                        <td key={index} data-column={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} onClick={() => handleDayClick(index)} style={getPercentageStyle(getPercent(dailyData.snowfall_sum?.[index] || 0), 'to top', 'rgba(240, 240, 240, 0.95)')}>
                            {dailyData.snowfall_sum?.[index] !== undefined ? `${dailyData.snowfall_sum[index]} cm` : 'N/A'}
                        </td>
                    ))}
                </tr>


            </tbody>
        </table>
    </div>
    
    );
}

export default WeeklyForecast;
