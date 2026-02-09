import api from './api';

export const locationService = {
    async updateLocation(patientId, latitude, longitude) {
        const response = await api.post('/locations', {
            patientId,
            latitude,
            longitude
        });
        return response.data;
    },

    async updateLocationFromShipday(patientId, trackingId) {
        const response = await api.post('/locations/shipday', {
            patientId,
            trackingId
        });
        return response.data;
    },

    async getCurrentLocation(patientId) {
        const response = await api.get(`/locations/patient/${patientId}/current`);
        return response.data;
    },

    async getLocationHistory(patientId) {
        const response = await api.get(`/locations/patient/${patientId}/history`);
        return response.data;
    },

    async getLocationHistoryRange(patientId, start, end) {
        const response = await api.get(`/locations/patient/${patientId}/history/range`, {
            params: { start, end }
        });
        return response.data;
    }
};
