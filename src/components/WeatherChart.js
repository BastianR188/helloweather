import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function WeatherChart({ hourlyData }) {
    if (!hourlyData || !hourlyData.time) {
        return <div>Lade Wetterdaten...</div>;
    }
    const now = new Date();
    const currentHourIndex = hourlyData.time.findIndex(time => {
        const dateTime = new Date(time);
        return dateTime.getHours() === now.getHours() && dateTime.getDate() === now.getDate();
    });

    const next24Hours = (arr) => arr ? arr.slice(currentHourIndex, currentHourIndex + 24) : [];

    const labels = next24Hours(hourlyData.time).map(time => {
        const date = new Date(time);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temperatures = next24Hours(hourlyData.temperature_2m);
    const precipProbabilities = next24Hours(hourlyData.precipitation_probability);
    const solarRadiations = next24Hours(hourlyData.direct_radiation);
    const windDirections = next24Hours(hourlyData.winddirection_10m);
    const precipitations = next24Hours(hourlyData.precipitation);
    const cloudCovers = next24Hours(hourlyData.cloudcover);
    const humidities = next24Hours(hourlyData.relativehumidity_2m);

    const data = {
        labels,
        datasets: [
            {
                type: 'line',
                label: 'Temperatur (°C)',
                data: temperatures,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y-temp',
                order: 1,
                tension: 0.4
            },
            {
                type: 'line',
                label: 'Luftfeuchtigkeit (%)',
                data: humidities,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y-percent',
                order: 2,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                type: 'line',
                label: 'Regenwahrscheinlichkeit (%)',
                data: precipProbabilities,
                borderColor: 'rgba(53, 162, 235, 1)',
                backgroundColor: 'rgba(53, 162, 235, 0.2)',
                yAxisID: 'y-percent',
                order: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                type: 'line',
                label: 'Sonneneinstrahlung (W/m²)',
                data: solarRadiations,
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: true,
                yAxisID: 'y-solar',
                order: 4,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                type: 'bar',
                label: 'Regenmenge (mm)',
                data: precipitations,
                borderColor: 'rgba(0, 0, 255, 1)',
                backgroundColor: 'rgba(0, 0, 255, 0.5)',
                yAxisID: 'y-precip',
                order: 5,
            },
            {
                type: 'line',
                label: 'Wolkenbedeckung (%)',
                data: cloudCovers,
                borderColor: 'rgba(128, 128, 128, 1)',
                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                fill: true,
                yAxisID: 'y-percent',
                order: 6,
                tension: 0.4,
                pointRadius: 0,
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
            tooltip: {
                callbacks: {
                    afterBody: (context) => {
                        const index = context[0].dataIndex;
                        return `Windrichtung: ${windDirections[index]}°`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Uhrzeit'
                }
            },
            'y-temp': {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temperatur (°C)'
                }
            },
            'y-percent': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Prozent (%)'
                },
                min: 0,
                max: 100,
            },
            'y-solar': {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Sonneneinstrahlung (W/m²)'
                },
                min: 0,
                grid: {
                    drawOnChartArea: false,
                },
            },
            'y-precip': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Regenmenge (mm)'
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
