import * as signalR from '@microsoft/signalr';
import { store } from '@/store';
import { addNotification } from '@/features/notifications/notificationSlice';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private url: string;

    constructor() {
        // Determine hub URL based on environment or rootApi base
        this.url = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7143/api').replace('/api', '') + '/notificationHub';
    }

    async startConnection() {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.url, {
                accessTokenFactory: () => localStorage.getItem('token') || '',
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.on('ReceiveNotification', (title: string, message: string, type: any) => {
            console.log('SignalR Notification Received:', { title, message, type });
            store.dispatch(addNotification({
                title,
                message,
                type: this.mapType(type),
            }));
        });

        try {
            await this.connection.start();
            console.log('SignalR Connected.');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            // Retry logic is handled by withAutomaticReconnect
        }
    }

    private mapType(type: any): 'info' | 'success' | 'warning' | 'error' {
        if (typeof type === 'string') {
            const t = type.toLowerCase();
            if (['info', 'success', 'warning', 'error'].includes(t)) return t as any;
        }
        return 'info';
    }

    stopConnection() {
        if (this.connection) {
            this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService();
