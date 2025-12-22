import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (!this.socket) {
      const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userId, userName });
    }
  }

  sendPlayerMove(roomId: string, position: any, rotation: any, velocity?: any) {
    if (this.socket) {
      this.socket.emit('player-move', { roomId, position, rotation, velocity });
    }
  }

  sendGameAction(roomId: string, action: string, payload: any) {
    if (this.socket) {
      this.socket.emit('game-action', { roomId, action, payload });
    }
  }

  sendChatMessage(roomId: string, message: string, userName: string) {
    if (this.socket) {
      this.socket.emit('chat-message', { roomId, message, userName });
    }
  }

  startGame(roomId: string) {
    if (this.socket) {
      this.socket.emit('game-start', { roomId });
    }
  }

  // Enhanced WebRTC signaling
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit, targetId?: string) {
    if (this.socket) {
      this.socket.emit('offer', { roomId, offer, targetId });
    }
  }

  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit, targetId?: string) {
    if (this.socket) {
      this.socket.emit('answer', { roomId, answer, targetId });
    }
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidate, targetId?: string) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { roomId, candidate, targetId });
    }
  }

  // Event listeners
  onPlayerJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('player-joined', callback);
    }
  }

  onPlayerLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('player-left', callback);
    }
  }

  onPlayerMoved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('player-moved', callback);
    }
  }

  onGameAction(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('game-action', callback);
    }
  }

  onChatMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onGameStarted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('game-started', callback);
    }
  }

  onRoomJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('room-joined', callback);
    }
  }

  onOffer(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('offer', callback);
    }
  }

  onAnswer(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('answer', callback);
    }
  }

  onIceCandidate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ice-candidate', callback);
    }
  }

  onError(callback: (error: string) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();