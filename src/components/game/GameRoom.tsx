import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Video, VideoOff, Mic, MicOff, Copy, Check } from 'lucide-react';
import { socketService } from '@/services/socket';
import { apiService } from '@/services/api';
import { GameEngine } from '@/services/gameEngine';
import { CarRacingGame } from './CarRacingGame';
import { PongGame } from './PongGame';
import { SnakeGame } from './SnakeGame';
import { FlappyGame } from './FlappyGame';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const GameRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const initRoom = async () => {
      try {
        const response = await apiService.getRoomInfo(roomId);
        setRoom(response.room);

        // Use 2D racing game for racing type, 3D engine for others
        if (response.room.gameId.config.type !== 'racing' && canvasRef.current && !gameEngineRef.current) {
          gameEngineRef.current = new GameEngine(canvasRef.current);
          gameEngineRef.current.loadGameConfig(response.room.gameId.config);
          gameEngineRef.current.animate();
        }

        const socket = socketService.connect();
        socketService.joinRoom(roomId, user.id);

        socketService.onPlayerJoined((data) => {
          toast.success('Player joined the room');
        });

        socketService.onPlayerMoved((data) => {
          if (gameEngineRef.current) {
            gameEngineRef.current.updatePlayerPosition(
              data.socketId,
              data.position,
              data.rotation
            );
          }
        });

        socketService.onOffer(async (data) => {
          await handleOffer(data.offer, data.from);
        });

        socketService.onAnswer(async (data) => {
          const pc = peerConnections.current.get(data.from);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });

        socketService.onIceCandidate((data) => {
          const pc = peerConnections.current.get(data.from);
          if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        });
      } catch (error) {
        toast.error('Failed to load room');
      }
    };

    initRoom();

    return () => {
      socketService.disconnect();
      gameEngineRef.current?.dispose();
      localStream.current?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, user]);

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketService.sendAnswer(roomId!, answer);
  };

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(roomId!, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      // Handle remote stream
      const remoteVideo = document.getElementById(`video-${peerId}`) as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
      });
    }

    peerConnections.current.set(peerId, pc);
    return pc;
  };

  const toggleVideo = async () => {
    if (!videoEnabled) {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: audioEnabled 
        });
        setVideoEnabled(true);
      } catch (error) {
        toast.error('Failed to access camera');
      }
    } else {
      localStream.current?.getVideoTracks().forEach(track => track.stop());
      setVideoEnabled(false);
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
    setAudioEnabled(!audioEnabled);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Room link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return <div className="flex items-center justify-center h-screen">Loading room...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
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
          <div className="flex items-center gap-2 ml-4">
            <Users className="h-5 w-5" />
            <span>{room.players.length}/{room.maxPlayers}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center">
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
        </div>
        
        <div className="w-64 border-l border-border p-4">
          <h3 className="font-semibold mb-4">Players</h3>
          <div className="space-y-2">
            {room.players.map((player: any) => (
              <div key={player.userId._id} className="flex items-center gap-2 p-2 rounded bg-muted">
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
      </div>
    </div>
  );
};