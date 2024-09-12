export const getWeatherIcon = (cloudCover, precipProb, temp, precipAmount) => {
    // Gewitter (vereinfachte Annahme: hohe Niederschlagswahrscheinlichkeit und -menge)
    if (precipProb > 80 && precipAmount > 10) return '🌩️';

    // Schnee (wenn Temperatur unter oder nahe 0°C und Niederschlagswahrscheinlichkeit hoch)
    if (temp <= 2 && precipProb > 50) return '❄️';

    // Regen
    if (precipProb > 50) {
        if (cloudCover > 80) return '🌧️';  // starker Regen
        return '🌦️';  // leichter Regen oder Schauer
    }

    // Bewölkung (wie zuvor)
    if (cloudCover < 25) return '☀️';
    if (cloudCover < 50) return '🌤️';
    if (cloudCover < 75) return '⛅';
    return '☁️';
};
