const BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const getCoordinates = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`);
        if (!response.ok) {
            throw new Error('Koordinaten konnten nicht abgerufen werden');
        }
        const data = await response.json();
        if (data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        } else {
            throw new Error('Ort nicht gefunden');
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Koordinaten:', error);
        throw error;
    }
};
