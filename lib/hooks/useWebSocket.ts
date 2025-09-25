'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketProps {
  taskId: string;
  onMessage?: (event: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({ 
  taskId, 
  onMessage, 
  onConnect, 
  onDisconnect, 
  onError 
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      // Mock WebSocket for development
      // In production, this would be: new WebSocket(`ws://localhost:3001/api/ws/tasks/${taskId}`)
      const mockSocket = {
        readyState: 1, // OPEN
        send: (data: string) => console.log('Mock WebSocket send:', data),
        close: () => console.log('Mock WebSocket close'),
        addEventListener: (event: string, callback: Function) => {
          console.log('Mock WebSocket addEventListener:', event);
          if (event === 'open') {
            setTimeout(() => callback(), 100);
          }
        },
        removeEventListener: () => console.log('Mock WebSocket removeEventListener')
      } as any;

      setSocket(mockSocket);
      setIsConnected(true);
      setReconnectAttempts(0);
      onConnect?.();

      // Mock message handling
      const handleMessage = (event: any) => {
        setLastMessage(event);
        onMessage?.(event);
      };

      const handleOpen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
      };

      const handleClose = () => {
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      const handleError = (error: Event) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      mockSocket.addEventListener('message', handleMessage);
      mockSocket.addEventListener('open', handleOpen);
      mockSocket.addEventListener('close', handleClose);
      mockSocket.addEventListener('error', handleError);

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError?.(error as Event);
    }
  }, [taskId, onMessage, onConnect, onDisconnect, onError, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const subscribe = useCallback((eventType: string, callback: Function) => {
    // Mock subscription for development
    console.log('Subscribing to:', eventType);
    setSubscriptions(prev => new Set([...prev, eventType]));
    
    // In production, this would send a subscription message to the WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        event: eventType,
        taskId
      }));
    }
  }, [socket, taskId]);

  const unsubscribe = useCallback((eventType: string) => {
    console.log('Unsubscribing from:', eventType);
    setSubscriptions(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventType);
      return newSet;
    });
    
    // In production, this would send an unsubscription message to the WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        event: eventType,
        taskId
      }));
    }
  }, [socket, taskId]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    reconnectAttempts,
    lastMessage,
    subscriptions,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage
  };
};

