import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket(onReservationCreated, onReservationCancelled) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('lh_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
    });

    socket.on('reservationCreated', (data) => {
      console.log('🛎️ New reservation:', data);
      onReservationCreated?.(data);
    });

    socket.on('reservationCancelled', (data) => {
      console.log('⚠️ Reservation cancelled:', data);
      onReservationCancelled?.(data);
    });

    socket.on('connect_error', (err) => {
      console.warn('WebSocket connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [onReservationCreated, onReservationCancelled]);

  return socketRef;
}
