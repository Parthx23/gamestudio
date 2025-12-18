import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SnakeGameProps {
  gameConfig: any;
}

export const SnakeGame = ({ gameConfig }: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    snake: [{ x: 200, y: 200 }],
    food: { x: 300, y: 300 },
    direction: { x: 20, y: 0 }
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

      // Draw snake
      ctx.fillStyle = '#00ff00';
      gameState.current.snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, 18, 18);
      });

      // Draw food
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(gameState.current.food.x, gameState.current.food.y, 18, 18);

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${score}`, 20, 40);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [score]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const updateLoop = setInterval(() => {
      const { snake, food, direction } = gameState.current;
      
      // Move snake
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      
      // Check wall collision
      if (head.x < 0 || head.x >= 800 || head.y < 0 || head.y >= 600) {
        setGameOver(true);
        setGameStarted(false);
        return;
      }
      
      // Check self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameStarted(false);
        return;
      }
      
      snake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        // Generate new food
        food.x = Math.floor(Math.random() * 40) * 20;
        food.y = Math.floor(Math.random() * 30) * 20;
      } else {
        snake.pop();
      }
    }, 150);

    return () => clearInterval(updateLoop);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      const { direction } = gameState.current;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) gameState.current.direction = { x: 0, y: -20 };
          break;
        case 'ArrowDown':
          if (direction.y === 0) gameState.current.direction = { x: 0, y: 20 };
          break;
        case 'ArrowLeft':
          if (direction.x === 0) gameState.current.direction = { x: -20, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x === 0) gameState.current.direction = { x: 20, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      snake: [{ x: 200, y: 200 }],
      food: { x: 300, y: 300 },
      direction: { x: 20, y: 0 }
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={800} height={600} className="border border-border rounded-lg bg-gray-900" />
      
      <div className="flex gap-4 items-center">
        {!gameStarted && !gameOver && (
          <Button onClick={startGame} variant="gaming">Start Snake</Button>
        )}
        
        {gameOver && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-2">Game Over! Score: {score}</h3>
            <Button onClick={resetGame} variant="gaming">Play Again</Button>
          </div>
        )}
        
        {gameStarted && (
          <p className="text-sm text-muted-foreground">Use Arrow Keys to Move</p>
        )}
      </div>
    </div>
  );
};