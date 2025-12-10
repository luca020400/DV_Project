import * as d3 from 'd3';

class DataRegistry {
    constructor() {
        this.data = {
            casualtyTrendData: this.generateDefaultData(),
            displacementData: this.generateDefaultData(),
            regionalConflictData: this.generateDefaultData(),
            economicIndicatorsData: this.generateDefaultData(),
            timelineData: this.generateDefaultData(),
        };

        // Track loading states
        this.loading = {
            casualtyTrendData: false,
            displacementData: false,
            regionalConflictData: false,
            economicIndicatorsData: false,
            timelineData: false,
        };

        // Track errors
        this.errors = {
            casualtyTrendData: null,
            displacementData: null,
            regionalConflictData: null,
            economicIndicatorsData: null,
            timelineData: null,
        };
    }

    generateDefaultData(length = 200) {
        return d3.ticks(-2, 2, length).map(Math.sin);
    }

    getData(key) {
        return this.data[key];
    }

    isLoading(key) {
        return this.loading[key] || false;
    }

    getError(key) {
        return this.errors[key] || null;
    }

    setData(key, data) {
        if (this.data.hasOwnProperty(key)) {
            this.data[key] = data;
        }
    }

    setLoading(key, isLoading) {
        if (this.loading.hasOwnProperty(key)) {
            this.loading[key] = isLoading;
        }
    }

    setError(key, error) {
        if (this.errors.hasOwnProperty(key)) {
            this.errors[key] = error;
        }
    }

    async fetchData(key, url) {
        this.setLoading(key, true);
        this.setError(key, null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setData(key, data);
            return data;
        } catch (error) {
            this.setError(key, error.message);
            console.error(`Error fetching ${key}:`, error);
            return this.generateDefaultData();
        } finally {
            this.setLoading(key, false);
        }
    }

    // Fetch all data sets
    async fetchAllData(urls = {}) {
        const fetchPromises = Object.entries(urls).map(
            ([key, url]) => this.fetchData(key, url)
        );

        try {
            await Promise.all(fetchPromises);
        } catch (error) {
            console.error('Error fetching all data:', error);
        }
    }
}

// Singleton instance
const dataRegistry = new DataRegistry();

export default dataRegistry;
export { DataRegistry };
