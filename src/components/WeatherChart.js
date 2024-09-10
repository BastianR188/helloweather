import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function WeatherChart({ hourlyData }) {
    // Finde den Index der aktuellen Stunde
    const now = new Date();
    const currentHourIndex = hourlyData.time.findIndex(time => {
        const dateTime = new Date(time);
        return dateTime.getHours() === now.getHours() && dateTime.getDate() === now.getDate();
    });

    // Extrahiere die nächsten 24 Stunden Daten
    const next24Hours = (arr) => arr.slice(currentHourIndex, currentHourIndex + 24);

    const labels = next24Hours(hourlyData.time).map(time => {
        const date = new Date(time);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const data = {
        labels,
        datasets: [
            {
                type: 'line',
                label: 'Temperatur (°C)',
                data: next24Hours(hourlyData.temperature_2m),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
                order: 1
            },
            {
                type: 'bar',
                label: 'Regenwahrscheinlichkeit (%)',
                data: next24Hours(hourlyData.precipitation_probability),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                yAxisID: 'y1',
                order: 2
            },
            {
                type: 'line',
                label: 'Sonneneinstrahlung (W/m²)',
                data: next24Hours(hourlyData.direct_radiation),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: true,
                yAxisID: 'y2',
                order: 0
            }
        ],
    };

    const options = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Wetter Vorhersage für die nächsten 24 Stunden',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Uhrzeit'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temperatur (°C)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Regenwahrscheinlichkeit (%)'
                },
                min: 0,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                },
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Sonneneinstrahlung (W/m²)'
                },
                min: 0,
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return <Chart type='bar' data={data} options={options} />;
}

export default WeatherChart;
