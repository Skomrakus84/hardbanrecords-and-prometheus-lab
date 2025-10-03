import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface WebSocketMessage {
  topic: string;
  data: any;
}

export const usePrometheusWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        toast.success('Connected to Prometheus monitoring');
        
        // Subscribe to metrics
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          topics: ['metrics']
        }));
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        toast.warn('Disconnected from Prometheus monitoring');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Error in Prometheus monitoring connection');
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.topic) {
            case 'metrics':
              setMetrics(message.data);
              break;
            default:
              console.log('Unknown message topic:', message.topic);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const subscribe = (topics: string[]) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        topics
      }));
    }
  };

  const unsubscribe = (topics: string[]) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'unsubscribe',
        topics
      }));
    }
  };

  return {
    isConnected,
    metrics,
    subscribe,
    unsubscribe
  };
};