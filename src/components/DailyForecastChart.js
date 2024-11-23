import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { DateTime } from 'luxon';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController
} from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';
import { DarkModeContext } from '../darkMode/DarkModeContext';
import { loadChartVisibility, saveChartVisibility } from '../services/OfflineSettingsService';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    BarController
);

function DailyForecastChart({ selectedDay = 0, hourlyData, timezone }) {
    const [isTooltipEnabled, setIsTooltipEnabled] = useState(window.innerWidth > 640);
    const { isDarkMode } = useContext(DarkModeContext);
    const chartRef = useRef(null);
    

    function getWindDirectionText(degrees) {
        if (degrees === undefined) return '';

        const directions = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwest', 'West', 'Nordwest'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }
    useEffect(() => {
        const handleResize = () => {
            setIsTooltipEnabled(window.innerWidth > 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const chart = chartRef.current;
        if (chart) {
            const chartVisibility = loadChartVisibility();
            chart.data.datasets.forEach((dataset, index) => {
                const isVisible = chartVisibility[dataset.label] !== false;
                chart.setDatasetVisibility(index, isVisible);
            });
            chart.update();
        }
    }, []);

    const chartData = useMemo(() => {
        if (!hourlyData || !hourlyData.time) {
            return null;
        }

        // Berechne das Datum für den ausgewählten Tag
        const now = DateTime.now().setZone(timezone);
        const targetDate = now.plus({ days: selectedDay }).startOf('day');
        
        // Finde den Index für den Beginn des ausgewählten Tages
        const startIndex = hourlyData.time.findIndex(time => {
            const dateTime = DateTime.fromISO(time).setZone(timezone);
            return dateTime >= targetDate;
        });

        const next24Hours = (arr) => {
            if (!arr) return [];
            return arr.slice(startIndex, startIndex + 24);
        };

        const times = next24Hours(hourlyData.time);
        const labels = times.map(time => {
            const date = DateTime.fromISO(time).setZone(timezone);
            return date.toFormat('HH:mm');
        });

        // Extrahiere die Daten für die nächsten 24 Stunden ab dem ausgewählten Tag
        const temperatures = next24Hours(hourlyData.temperature_2m);
        const precipProbabilities = next24Hours(hourlyData.precipitation_probability);
        const solarRadiations = next24Hours(hourlyData.direct_radiation);
        const windDirections = next24Hours(hourlyData.winddirection_10m);
        const precipitations = next24Hours(hourlyData.precipitation);
        const cloudCovers = next24Hours(hourlyData.cloudcover);
        const humidities = next24Hours(hourlyData.relativehumidity_2m);
        const windSpeeds = next24Hours(hourlyData.windspeed_10m);

        return {
            labels,
            datasets: [
                {
                  type: 'line',
                  label: 'Temperatur (°C)',
                  data: temperatures,
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  yAxisID: 'y-temp',
                },
              ],
              
            windDirections,
            windSpeeds,
        };
    }, [hourlyData, timezone, selectedDay]);

    const options = useMemo(() => ({
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: `Wetter Vorhersage für die nächsten 24 Stunden (${timezone})`,
                color: isDarkMode ? '#ffffff' : '#333333',
            },
            legend: {
                onClick: (evt, item, legend) => {
                    const chart = legend.chart;
                    const index = item.datasetIndex;
                    const isVisible = chart.isDatasetVisible(index);
                    chart.setDatasetVisibility(index, !isVisible);
                    chart.update();

                    const chartVisibility = loadChartVisibility();
                    chartVisibility[item.text] = !isVisible;
                    saveChartVisibility(chartVisibility);
                },
                labels: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
            },
            tooltip: {
                enabled: isTooltipEnabled,
                callbacks: {
                    afterBody: (context) => {
                        const index = context[0].dataIndex;
                        const windDirection = chartData?.windDirections[index];
                        const windDirectionText = getWindDirectionText(windDirection);
                        return `    Windrichtung: ${windDirection}° ${windDirectionText}
    Windstärke: ${chartData?.windSpeeds[index]} m/s`;
                    }
                },
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Uhrzeit',
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }
            },
            'y-temp': {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temperatur (°C)',
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                    callback: function (value, index, values) {
                        if (this.chart.config.type === 'line' && this.chart.config.data.datasets[0].label === 'Temperatur') {
                            return Math.round(value); // Runde auf ganze Zahlen für Temperatur
                        }
                        return value;
                    }
                },
                afterDataLimits: (scale) => {
                    const dataMax = scale.max;
                    const dataMin = scale.min;
                    const range = dataMax - dataMin;
                    scale.max = Math.ceil(dataMax + range * 0.1); // 10% mehr Platz oben
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }
            },
            'y-percent': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Prozent (%)',
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
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
                    text: 'Sonneneinstrahlung (W/m²)',
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                grid: {
                    drawOnChartArea: false,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                afterDataLimits: (scale) => {
                    scale.min = 0;
                    if (chartData.maxSolarRadiations > 800) {
                        scale.max = Math.ceil(chartData.maxSolarRadiations * 1.1);
                    } else {
                        scale.max = 800;
                    }
                }
            },
            'y-precip': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Regenmenge (mm)',
                    color: isDarkMode ? '#ffffff' : '#333333',
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333',
                    callback: function (value) {
                        return value.toFixed(1) + ' mm';
                    }
                },
                grid: {
                    drawOnChartArea: false,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                afterDataLimits: (scale) => {
                    scale.min = 0;
                    if (chartData && chartData.scaledMaxPrecipitation > 10) {
                        scale.max = Math.ceil(chartData.scaledMaxPrecipitation);
                    } else {
                        scale.max = 10;
                    }
                }
            },
        },
    }), [isDarkMode, chartData, isTooltipEnabled, timezone]);

    if (!chartData) {
        return <div>Render Wetterdaten...</div>;
    }

    // Hier implementieren Sie die Logik zur Erstellung des Charts
    // basierend auf den Daten für den ausgewählten Tag

    return (
        <div className="weather-chart">
            <h2>Wettervorhersage für {selectedDay === 0 ? 'Heute' : `Tag ${selectedDay}`}</h2>
            {<ReactChart ref={chartRef} type='line' data={chartData} options={options} />
        }
        </div>
    );
}

export default DailyForecastChart;
