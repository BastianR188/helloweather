

class ForecastSelectionService {
    selectedForecast = null;

    setSelectedForecast(index) {
        this.selectedForecast = index;
    }

    getSelectedForecast() {
        return this.selectedForecast;
    }
}

export default new ForecastSelectionService();