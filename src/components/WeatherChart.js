import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { DarkModeContext } from '../darkMode/DarkModeContext';
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
import { loadChartVisibility, saveChartVisibility } from '../services/OfflineSettingsService';
import { DateTime } from 'luxon';

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

function WeatherChart({ hourlyData, timezone, selectedDay }) {
    const [isTooltipEnabled, setIsTooltipEnabled] = useState(window.innerWidth > 640);
    const { isDarkMode } = useContext(DarkModeContext);
    const chartRef = useRef(null);

    function getWindDirectionText(degrees) {
        if (degrees === undefined) return '';

        const directions = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwest', 'West', 'Nordwest'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }

    function getWeatherForecastText(selectedDay, timezone) {
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const today = new Date();

        let forecastText;

        if (selectedDay === null) {
            forecastText = 'die nächsten 24 Stunden';
        } else if (selectedDay === 0) {
            forecastText = 'Heute';
        } else {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + selectedDay);
            forecastText = days[futureDate.getDay()];
        }

        return `Wetter Vorhersage für ${forecastText} (${timezone})`;
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

        const now = DateTime.now().setZone(timezone);
        const targetDate = now.plus({ days: selectedDay }).startOf('day');
        const currentHourIndex = hourlyData.time.findIndex(time => {
            const dateTime = DateTime.fromISO(time).setZone(timezone);
            if (selectedDay == null) {
                return dateTime >= now;
            }
            else return dateTime >= targetDate;
        });

        const next24Hours = (arr) => {
            if (!arr) return [];
            const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
            return arr.slice(startIndex, startIndex + 24);
        };

        const times = next24Hours(hourlyData.time);
        const labels = times.map((time, index) => {
            const date = DateTime.fromISO(time).setZone(timezone);
            if (index === 0 || date.hour === 0) {
                return date.toFormat('dd.MM HH:mm');
            } else {
                return date.toFormat('HH:mm');
            }
        });







        const temperatures = next24Hours(hourlyData.temperature_2m);
        const precipProbabilities = next24Hours(hourlyData.precipitation_probability);
        // const solarRadiations = next24Hours(hourlyData.direct_radiation);
        const windDirections = next24Hours(hourlyData.winddirection_10m);
        const precipitations = next24Hours(hourlyData.precipitation);
        const cloudCovers = next24Hours(hourlyData.cloudcover);
        const humidities = next24Hours(hourlyData.relativehumidity_2m);
        const windSpeeds = next24Hours(hourlyData.windspeed_10m);

        // const maxSolarRadiations = Math.max(...solarRadiations);
        const maxPrecipProbability = Math.max(...precipProbabilities);
        const maxPrecipitation = Math.max(...precipitations);
        const scaledMaxPrecipitation = maxPrecipitation * (100 / maxPrecipProbability);

        return {
            labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Temperatur (°C)',
                    data: temperatures,
                    borderColor: (context) => {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        return value < 0 ? 'rgb(0, 0, 255)' : 'rgb(255, 99, 132)';
                    },
                    backgroundColor: (context) => {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        return value < 0 ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 99, 132, 0.5)';
                    },
                    segment: {
                        borderColor: (context) => {
                            const prev = context.p0.parsed.y;
                            const next = context.p1.parsed.y;
                            return (prev < 0 || next < 0) ? 'rgb(0, 0, 255)' : 'rgb(255, 99, 132)';
                        },
                        backgroundColor: (context) => {
                            const prev = context.p0.parsed.y;
                            const next = context.p1.parsed.y;
                            return (prev < 0 || next < 0) ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 99, 132, 0.5)';
                        }
                    },
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
                // {
                //     type: 'line',
                //     label: 'Sonneneinstrahlung (W/m²)',
                //     data: solarRadiations,
                //     borderColor: 'rgba(255, 206, 86, 1)',
                //     backgroundColor: 'rgba(255, 206, 86, 0.2)',
                //     fill: true,
                //     yAxisID: 'y-solar',
                //     order: 4,
                //     tension: 0.4,
                //     pointRadius: 0,
                // },
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
            windDirections,
            windSpeeds,
            scaledMaxPrecipitation,
            // maxSolarRadiations
        };

    }, [hourlyData, timezone, selectedDay]);

    useEffect(() => {
        const chart = chartRef.current;
        if (chart && chartData) {
            chart.data = chartData;
            chart.update();
        }
    }, [selectedDay, chartData]);

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
                text: `${getWeatherForecastText(selectedDay, timezone)}`,
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
                    generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        const temperatures = datasets.find(d => d.label === 'Temperatur (°C)')?.data || [];
                        return datasets.map(dataset => ({
                            text: dataset.label,
                            fillStyle: dataset.label === 'Temperatur (°C)' ?
                                (temperatures.some(t => t < 0) ? 'rgb(0, 0, 255)' : 'rgb(255, 99, 132)') :
                                dataset.backgroundColor,
                            hidden: !chart.isDatasetVisible(datasets.indexOf(dataset)),
                            lineCap: dataset.borderCapStyle,
                            lineDash: dataset.borderDash,
                            lineDashOffset: dataset.borderDashOffset,
                            lineJoin: dataset.borderJoinStyle,
                            lineWidth: dataset.borderWidth,
                            strokeStyle: dataset.borderColor,
                            pointStyle: dataset.pointStyle,
                            datasetIndex: datasets.indexOf(dataset)
                        }));
                    }
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
            // 'y-solar': {
            //     type: 'linear',
            //     display: true,
            //     position: 'left',
            //     title: {
            //         display: true,
            //         text: 'Sonneneinstrahlung (W/m²)',
            //         color: isDarkMode ? '#ffffff' : '#333333',
            //     },
            //     ticks: {
            //         color: isDarkMode ? '#ffffff' : '#333333',
            //     },
            //     grid: {
            //         drawOnChartArea: false,
            //         color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            //     },
            //     afterDataLimits: (scale) => {
            //         console.log("afterDataLimits wird aufgerufen");
            //         scale.min = 0;
            //         if (chartData.maxSolarRadiations > 800) {
            //             scale.max = Math.ceil(chartData.maxSolarRadiations * 1.1);
            //         } else {
            //             scale.max = 800;
            //         }
            //     }
            // },
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
    }), [isDarkMode, chartData, isTooltipEnabled, selectedDay, timezone]);

    if (!chartData) {
        return <div>Render Wetterdaten...</div>;
    }

    return <ReactChart ref={chartRef} type='bar' data={chartData} options={options} />;
}

export default WeatherChart;
