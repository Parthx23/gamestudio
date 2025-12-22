import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Video, VideoOff, Mic, MicOff, Copy, Check, Send, MessageCircle } from 'lucide-react';
import { socketService } from '@/services/socket';
import { webRTCService } from '@/services/webrtc';
import { apiService } from '@/services/api';
import { GameEngine } from '@/services/gameEngine';
import { ParticleSystem } from '@/components/creative/ParticleSystem';
import { soundManager } from '@/components/creative/SoundManager';
import { CarRacingGame } from './CarRacingGame';
import { PongGame } from './PongGame';
import { SnakeGame } from './SnakeGame';
import { FlappyGame } from './FlappyGame';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatMessage {
  message: string;
  userName: string;
  socketId: string;
  timestamp: number;
}

export const GameRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const [room, setRoom] = useState<any>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!roomId || !user) return;

    const initRoom = async () => {
      try {
        await soundManager.preloadGameSounds();
        
        const response = await apiService.getRoomInfo(roomId);
        setRoom(response.room);

        if (!['racing', 'pong', 'snake', 'flappy'].includes(response.room.gameId.config.type) && canvasRef.current && !gameEngineRef.current) {
          gameEngineRef.current = new GameEngine(canvasRef.current);
          gameEngineRef.current.loadGameConfig(response.room.gameId.config);
          gameEngineRef.current.animate();
        }

        webRTCService.setCallbacks(
          (stream, peerId) => handleRemoteStream(stream, peerId),
          (state, peerId) => handleConnectionStateChange(state, peerId)
        );

        const socket = socketService.connect();
        socketService.joinRoom(roomId, user.id, user.name);

        socketService.onPlayerJoined((data) => {
          toast.success(`${data.userName} joined`);
          soundManager.playSound('collect', 0.2);
        });

        socketService.onChatMessage((data) => {
          setChatMessages(prev => [...prev, data]);
          soundManager.playSound('collect', 0.1);
        });

        socketService.onGameStarted(() => {
          setGameStarted(true);
          soundManager.playSound('win', 0.4);
        });

      } catch (error) {
        toast.error('Failed to load room');
      }
    };

    initRoom();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
      gameEngineRef.current?.dispose();
      webRTCService.cleanup();
    };
  }, [roomId, user]);

  const handleRemoteStream = (stream: MediaStream, peerId: string) => {
    setConnectedPeers(prev => new Set([...prev, peerId]));
  };

  const handleConnectionStateChange = (state: string, peerId: string) => {
    if (state === 'disconnected' || state === 'failed') {
      setConnectedPeers(prev => {
        const newSet = new Set(prev);
        newSet.delete(peerId);
        return newSet;
      });
    }
  };

  const toggleVideo = async () => {
    if (!videoEnabled) {
      try {
        const stream = await webRTCService.initializeLocalStream(true, audioEnabled);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setVideoEnabled(true);
      } catch (error) {
        toast.error('Failed to access camera');
      }
    } else {
      webRTCService.toggleVideo(false);
      setVideoEnabled(false);
    }
  };

  const toggleAudio = () => {
    webRTCService.toggleAudio(!audioEnabled);
    setAudioEnabled(!audioEnabled);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Room link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && user) {
      socketService.sendChatMessage(roomId!, chatInput, user.name);
      setChatMessages(prev => [...prev, {
        message: chatInput,
        userName: user.name,
        socketId: 'self',
        timestamp: Date.now()
      }]);
      setChatInput('');
    }
  };

  const startGame = () => {
    socketService.startGame(roomId!);
    setGameStarted(true);
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      <ParticleSystem width={window.innerWidth} height={window.innerHeight} particleCount={30} />
      
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-xl font-gaming font-bold">{room.gameId.title}</h1>
          <p className="text-sm text-muted-foreground">Room: {roomId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyRoomLink}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleVideo}>
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleAudio}>
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowChat(!showChat)}>
            <MessageCircle className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <Users className="h-5 w-5" />
            <span>{room.players.length}/{room.maxPlayers}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex relative">
        <div className="flex-1 flex items-center justify-center relative">
          {room.gameId.config.type === 'racing' && (
            <CarRacingGame gameConfig={room.gameId.config} />
          )}
          {room.gameId.config.type === 'pong' && (
            <PongGame gameConfig={room.gameId.config} />
          )}
          {room.gameId.config.type === 'snake' && (
            <SnakeGame gameConfig={room.gameId.config} />
          )}
          {room.gameId.config.type === 'flappy' && (
            <FlappyGame gameConfig={room.gameId.config} />
          )}
          {!['racing', 'pong', 'snake', 'flappy'].includes(room.gameId.config.type) && (
            <div ref={canvasRef} className="w-full h-full" />
          )}
          
          {!gameStarted && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
                <Button onClick={startGame} size="lg" variant="gaming">
                  Start Game
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-64 border-l border-border bg-background/80 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-2">Video Chat</h3>
            {videoEnabled && (
              <div className="relative w-full h-24 bg-gray-800 rounded overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 text-xs bg-black/50 px-1 rounded">
                  You
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-2">Players ({room.players.length})</h3>
            <div className="space-y-2">
              {room.players.map((player: any) => (
                <div key={player.userId._id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs">
                    {player.userId.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{player.userId.name}</p>
                    <p className="text-xs text-muted-foreground">Score: {player.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {showChat && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-2">Chat</h3>
                <div className="space-y-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-primary">{msg.userName}:</span>
                      <span className="ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button size="sm" onClick={sendChatMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};