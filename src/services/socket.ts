import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userId });
    }
  }

  sendPlayerMove(roomId: string, position: any, rotation: any) {
    if (this.socket) {
      this.socket.emit('player-move', { roomId, position, rotation });
    }
  }

  sendGameAction(roomId: string, action: string, payload: any) {
    if (this.socket) {
      this.socket.emit('game-action', { roomId, action, payload });
    }
  }

  // WebRTC signaling
  sendOffer(roomId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('offer', { roomId, offer });
    }
  }

  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('answer', { roomId, answer });
    }
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidate) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { roomId, candidate });
    }
  }

  onPlayerJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('player-joined', callback);
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
}

export const socketService = new SocketService();