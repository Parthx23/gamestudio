import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PongGameProps {
  gameConfig: any;
}

export const PongGame = ({ gameConfig }: PongGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  const gameState = useRef({
    ball: { x: 400, y: 300, dx: 4, dy: 3 },
    paddle1: { y: 250 },
    paddle2: { y: 250 }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#fff';
      ctx.fillRect(20, gameState.current.paddle1.y, 10, 100);
      ctx.fillRect(canvas.width - 30, gameState.current.paddle2.y, 10, 100);

      // Draw ball
      ctx.beginPath();
      ctx.arc(gameState.current.ball.x, gameState.current.ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw scores
      ctx.font = '48px Arial';
      ctx.fillText(score.player1.toString(), canvas.width / 4, 60);
      ctx.fillText(score.player2.toString(), (3 * canvas.width) / 4, 60);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [score]);

  useEffect(() => {
    if (!gameStarted || winner) return;

    const updateLoop = setInterval(() => {
      const { ball, paddle1, paddle2 } = gameState.current;

      // Move paddles
      if (keysPressed.current.has('w')) paddle1.y = Math.max(0, paddle1.y - 5);
      if (keysPressed.current.has('s')) paddle1.y = Math.min(500, paddle1.y + 5);
      if (keysPressed.current.has('arrowup')) paddle2.y = Math.max(0, paddle2.y - 5);
      if (keysPressed.current.has('arrowdown')) paddle2.y = Math.min(500, paddle2.y + 5);

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with top/bottom
      if (ball.y <= 8 || ball.y >= 592) ball.dy = -ball.dy;

      // Ball collision with paddles
      if (ball.x <= 38 && ball.y >= paddle1.y && ball.y <= paddle1.y + 100) ball.dx = -ball.dx;
      if (ball.x >= 762 && ball.y >= paddle2.y && ball.y <= paddle2.y + 100) ball.dx = -ball.dx;

      // Score
      if (ball.x < 0) {
        setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
        ball.x = 400; ball.y = 300; ball.dx = 4; ball.dy = 3;
      }
      if (ball.x > 800) {
        setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
        ball.x = 400; ball.y = 300; ball.dx = -4; ball.dy = 3;
      }


    }, 16);

    return () => clearInterval(updateLoop);
  }, [gameStarted, winner, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setWinner(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setWinner(null);
    setScore({ player1: 0, player2: 0 });
    gameState.current = {
      ball: { x: 400, y: 300, dx: 4, dy: 3 },
      paddle1: { y: 250 },
      paddle2: { y: 250 }
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={800} height={600} className="border border-border rounded-lg bg-gray-900" />
      
      <div className="flex gap-4 items-center">
        {!gameStarted && !winner && (
          <Button onClick={startGame} variant="gaming">Start Pong</Button>
        )}
        
        {winner && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-2">🏆 {winner} Wins!</h3>
            <Button onClick={resetGame} variant="gaming">Play Again</Button>
          </div>
        )}
        
        {gameStarted && (
          <p className="text-sm text-muted-foreground">Player 1: W/S | Player 2: ↑/↓</p>
        )}
      </div>
    </div>
  );
};