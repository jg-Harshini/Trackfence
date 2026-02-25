import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    connect(onConnected) {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const socket = new SockJS(`${backendUrl}/ws`);

        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('WebSocket Connected');
            this.connected = true;
            if (onConnected) onConnected();
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
    }

    subscribeToLocation(patientId, callback) {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        return this.client.subscribe(`/topic/location/${patientId}`, (message) => {
            const location = JSON.parse(message.body);
            callback(location);
        });
    }

    subscribeToAlerts(patientId, callback) {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        return this.client.subscribe(`/topic/alerts/${patientId}`, (message) => {
            const alert = JSON.parse(message.body);
            callback(alert);
        });
    }
}

export default new WebSocketService();
