export const getWeatherIcon = (cloudCover, precipProb, temp, precipAmount, weatherCode, snowfall) => {
    // Gewitter basierend auf weatherCode
    if (weatherCode >= 95 && weatherCode <= 99) {
        if (weatherCode === 99) return '⛈️'; // Gewitter mit schwerem Hagel
        if (weatherCode === 96 || weatherCode === 97) return '🌩️'; // Gewitter mit Hagel
        return '🌨️'; // Leichtes oder mäßiges Gewitter
    }

    // Schnee
    if ((weatherCode >= 71 && weatherCode <= 77) || (temp <= 2 && precipProb > 50) || snowfall > 0) {
        if (snowfall > 5) return '🌨️'; // Starker Schneefall
        if (snowfall > 1) return '🌨'; // Mäßiger Schneefall
        return '❄️'; // Leichter Schneefall
    }

    // Regen
    if (weatherCode >= 61 && weatherCode <= 67 || precipProb > 33) {
        if (precipAmount > 10) return '🌧️';  // Starker Regen
        if (cloudCover > 80) return '🌦️';  // Mäßiger Regen
        return '🌂';  // Leichter Regen oder Schauer
    }

    // Bewölkung
    if (cloudCover < 25) return '☀️';
    if (cloudCover < 50) return '🌤️';
    if (cloudCover < 75) return '⛅';
    return '☁️';
};
