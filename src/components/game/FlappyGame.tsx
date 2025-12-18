import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FlappyGameProps {
  gameConfig: any;
}

export const FlappyGame = ({ gameConfig }: FlappyGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    bird: { y: 300, velocity: 0 },
    pipes: [{ x: 800, gap: 200 }]
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bird
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(100, gameState.current.bird.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw pipes
      ctx.fillStyle = '#00ff00';
      gameState.current.pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.gap);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gap + 150, 50, canvas.height - pipe.gap - 150);
      });

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = '32px Arial';
      ctx.fillText(`Score: ${score}`, 20, 50);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [score]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const updateLoop = setInterval(() => {
      const { bird, pipes } = gameState.current;
      
      // Update bird
      bird.velocity += 0.5; // gravity
      bird.y += bird.velocity;
      
      // Check ground/ceiling collision
      if (bird.y <= 15 || bird.y >= 585) {
        setGameOver(true);
        setGameStarted(false);
        return;
      }
      
      // Update pipes
      pipes.forEach(pipe => {
        pipe.x -= 3;
        
        // Check pipe collision
        if (pipe.x < 115 && pipe.x > 85) {
          if (bird.y < pipe.gap || bird.y > pipe.gap + 150) {
            setGameOver(true);
            setGameStarted(false);
            return;
          }
        }
        
        // Score when passing pipe
        if (pipe.x === 85) {
          setScore(prev => prev + 1);
        }
      });
      
      // Remove old pipes and add new ones
      gameState.current.pipes = pipes.filter(pipe => pipe.x > -50);
      if (pipes[pipes.length - 1].x < 600) {
        pipes.push({ x: 800, gap: Math.random() * 300 + 50 });
      }
    }, 16);

    return () => clearInterval(updateLoop);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      if (e.code === 'Space') {
        e.preventDefault();
        gameState.current.bird.velocity = -8;
      }
    };

    const handleClick = () => {
      if (gameStarted) {
        gameState.current.bird.velocity = -8;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    gameState.current = {
      bird: { y: 300, velocity: 0 },
      pipes: [{ x: 800, gap: 200 }]
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={800} height={600} className="border border-border rounded-lg" />
      
      <div className="flex gap-4 items-center">
        {!gameStarted && !gameOver && (
          <Button onClick={startGame} variant="gaming">Start Flappy</Button>
        )}
        
        {gameOver && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-2">Game Over! Score: {score}</h3>
            <Button onClick={resetGame} variant="gaming">Play Again</Button>
          </div>
        )}
        
        {gameStarted && (
          <p className="text-sm text-muted-foreground">Press SPACE or Click to Flap</p>
        )}
      </div>
    </div>
  );
};