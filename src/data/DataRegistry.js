import * as d3 from 'd3';

class DataRegistry {
    constructor() {
        this.data = {
            casualtyTrendData: this.generateDefaultData(),
            displacementData: this.generateDisplacementData(),
            regionalConflictData: this.generateDefaultData(),
            economicIndicatorsData: this.generateDefaultData(),
            timelineData: this.generateDefaultData(),
        };

        // URLs for fetching data
        this.urls = {
            casualtyTrendData: undefined,
            displacementData: undefined,
            regionalConflictData: undefined,
            economicIndicatorsData: undefined,
            timelineData: undefined,
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

    generateDisplacementData(length = 200) {
        return d3.ticks(0, 1000000, length).map(d => Math.random() * d);
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
        if (Object.hasOwn(this.data, key)) {
            this.data[key] = data;
        }
    }

    setLoading(key, isLoading) {
        if (Object.hasOwn(this.loading, key)) {
            this.loading[key] = isLoading;
        }
    }

    setError(key, error) {
        if (Object.hasOwn(this.errors, key)) {
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
        } finally {
            this.setLoading(key, false);
        }
    }

    // Fetch all data sets
    async fetchAllData() {
        const urls = Object.entries(this.urls).filter(([, url]) => url !== undefined);

        const fetchPromises = urls.map(
            ([key, url]) => this.fetchData(key, url)
        );

        const results = await Promise.allSettled(fetchPromises);

        const failedFetches = results.filter(result => result.status === 'rejected');
        if (failedFetches.length > 0) {
            console.error(`${failedFetches.length} fetch(es) failed`);
        }

        return results;
    }
}

// Singleton instance
const dataRegistry = new DataRegistry();

export default dataRegistry;
export { DataRegistry };
