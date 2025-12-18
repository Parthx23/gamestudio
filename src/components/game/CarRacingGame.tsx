import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Car {
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  id: string;
}

interface CarRacingGameProps {
  gameConfig: any;
  onGameEnd?: (winner: string) => void;
}

export const CarRacingGame = ({ gameConfig, onGameEnd }: CarRacingGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Initialize cars
    const initialCars: Car[] = [
      { x: 100, y: 200, angle: 0, speed: 0, color: '#ff0000', id: 'car1' },
      { x: 100, y: 400, angle: 0, speed: 0, color: '#0000ff', id: 'car2' }
    ];
    
    setCars(initialCars);
  }, [gameConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw track
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
      
      // Draw finish line
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(canvas.width - 100, 50, 8, canvas.height - 100);
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText('FINISH', canvas.width - 95, 35);

      // Draw cars
      cars.forEach((car, index) => {
        // Car body
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x - 20, car.y - 10, 40, 20);
        
        // Car outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(car.x - 20, car.y - 10, 40, 20);
        
        // Player label
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`P${index + 1}`, car.x - 8, car.y - 20);
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [cars]);

  useEffect(() => {
    if (!gameStarted || winner) return;

    const updateLoop = setInterval(() => {
      setCars(prevCars => {
        return prevCars.map((car, index) => {
          let newCar = { ...car };

          // Player 1 controls (WASD)
          if (index === 0) {
            if (keysPressed.current.has('w')) newCar.y -= 3;
            if (keysPressed.current.has('s')) newCar.y += 3;
            if (keysPressed.current.has('a')) newCar.x -= 3;
            if (keysPressed.current.has('d')) newCar.x += 3;
          }

          // Player 2 controls (Arrow keys)
          if (index === 1) {
            if (keysPressed.current.has('arrowup')) newCar.y -= 3;
            if (keysPressed.current.has('arrowdown')) newCar.y += 3;
            if (keysPressed.current.has('arrowleft')) newCar.x -= 3;
            if (keysPressed.current.has('arrowright')) newCar.x += 3;
          }

          // Keep cars in bounds
          newCar.x = Math.max(70, Math.min(750, newCar.x));
          newCar.y = Math.max(70, Math.min(530, newCar.y));

          // Check finish line (only once)
          if (newCar.x >= 680 && !winner && gameStarted) {
            setWinner(`Player ${index + 1}`);
            setGameStarted(false);
          }

          return newCar;
        });
      });
    }, 16);

    return () => clearInterval(updateLoop);
  }, [gameStarted, winner, onGameEnd]);

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
    setWinner(null);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setWinner(null);
    setCars([
      { x: 100, y: 200, angle: 0, speed: 0, color: '#ff0000', id: 'car1' },
      { x: 100, y: 400, angle: 0, speed: 0, color: '#0000ff', id: 'car2' }
    ]);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-border rounded-lg bg-gray-900"
      />
      
      <div className="flex gap-4 items-center">
        {!gameStarted && !winner && (
          <Button onClick={startGame} variant="gaming">
            Start Race
          </Button>
        )}
        
        {winner && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-2">🏆 {winner} Wins!</h3>
            <Button onClick={() => {
              resetGame();
              setTimeout(() => setGameStarted(true), 100);
            }} variant="gaming">
              Race Again
            </Button>
          </div>
        )}
        
        {gameStarted && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Player 1: WASD | Player 2: Arrow Keys
            </p>
          </div>
        )}
      </div>
    </div>
  );
};