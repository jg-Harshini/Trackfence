import api from './api';

export const safeZoneService = {
    async createSafeZone(safeZoneData) {
        const response = await api.post('/safezones', safeZoneData);
        return response.data;
    },

    async getPatientSafeZones(patientId) {
        const response = await api.get(`/safezones/patient/${patientId}`);
        return response.data;
    },

    async getActiveSafeZones(patientId) {
        const response = await api.get(`/safezones/patient/${patientId}/active`);
        return response.data;
    },

    async updateSafeZone(zoneId, safeZoneData) {
        const response = await api.put(`/safezones/${zoneId}`, safeZoneData);
        return response.data;
    },

    async deleteSafeZone(zoneId) {
        const response = await api.delete(`/safezones/${zoneId}`);
        return response.data;
    }
};
