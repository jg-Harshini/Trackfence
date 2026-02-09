import api from './api';

export const alertService = {
    async getPatientAlerts(patientId) {
        const response = await api.get(`/alerts/patient/${patientId}`);
        return response.data;
    },

    async getUnacknowledgedAlerts(patientId) {
        const response = await api.get(`/alerts/patient/${patientId}/unacknowledged`);
        return response.data;
    },

    async acknowledgeAlert(alertId, caretakerId) {
        const response = await api.put(`/alerts/${alertId}/acknowledge`, null, {
            params: { caretakerId }
        });
        return response.data;
    }
};
