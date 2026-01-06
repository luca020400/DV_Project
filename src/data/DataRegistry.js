import * as d3 from 'd3';

import casualties_data_url from './casualties_data.json?url';
import displacement_data_url from './displacement_data.json?url';
import conflict_data_url from './conflict_data.json?url';
import economic_data_url from './economic_data.json?url';

import geojson_url from './geo/syria.json?url';

class DataRegistry {
    constructor() {
        this.listeners = [];

        this.urls = {
            casualtyTrendData: casualties_data_url,
            displacementData: displacement_data_url,
            regionalConflictData: {
                data: conflict_data_url,
                geoJson: geojson_url,
            },
            economicIndicatorsData: economic_data_url,
            timelineData: undefined,
        };

        this.data = {
            casualtyTrendData: null,
            displacementData: null,
            regionalConflictData: null,
            economicIndicatorsData: null,
            timelineData: this.urls.timelineData ? null : this.generateDefaultData(),
        };

        this.loading = {
            casualtyTrendData: true,
            displacementData: true,
            regionalConflictData: true,
            economicIndicatorsData: true,
            timelineData: this.urls.timelineData ? true : false,
        };

        this.errors = {
            casualtyTrendData: null,
            displacementData: null,
            regionalConflictData: null,
            economicIndicatorsData: null,
            timelineData: null,
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener());
    }

    generateDefaultData(length = 200) {
        return d3.ticks(-2, 2, length).map(Math.sin);
    }

    generateDisplacementData(length = 200) {
        return d3.ticks(0, 1000000, length).map(d => Math.random() * d);
    }

    setData(key, data) {
        this.data[key] = data;
        this.notify();
    }

    setLoading(key, isLoading) {
        this.loading[key] = isLoading;
        this.notify();
    }

    setError(key, error) {
        this.errors[key] = error;
        this.notify();
    }

    async fetchData(key, urlsObj) {
        this.setLoading(key, true);
        this.setError(key, null);

        try {
            if (typeof urlsObj === 'string') {
                const response = await fetch(urlsObj);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.setData(key, data);
                return data;
            } else {
                const fetchPromises = Object.entries(urlsObj).map(async ([name, url]) => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return [name, data];
                });

                const fetchResults = await Promise.all(fetchPromises);
                const results = Object.fromEntries(fetchResults);
                this.setData(key, results);
                return results;
            }
        } catch (error) {
            this.setError(key, error.message);
            console.error(`Error fetching ${key}:`, error);
        } finally {
            this.setLoading(key, false);
        }
    }

    // Fetch all data sets
    async fetchAllData() {
        const urls = Object.entries(this.urls).filter(([, urlsObj]) => urlsObj !== undefined);

        const fetchPromises = urls.map(
            ([key, urlsObj]) => this.fetchData(key, urlsObj)
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
