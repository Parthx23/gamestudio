import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Snake Game
export const SnakeGame = () => {
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 15, y: 15});
  const [direction, setDirection] = useState({x: 1, y: 0});
  const [score, setScore] = useState(0);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setSnake(prev => {
        const newSnake = [...prev];
        const head = {x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y};
        
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 16) {
          return [{x: 10, y: 10}];
        }
        
        newSnake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood({x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 16)});
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    }, 200);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch(e.key) {
        case 'ArrowUp': setDirection({x: 0, y: -1}); break;
        case 'ArrowDown': setDirection({x: 0, y: 1}); break;
        case 'ArrowLeft': setDirection({x: -1, y: 0}); break;
        case 'ArrowRight': setDirection({x: 1, y: 0}); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction, food]);

  return (
    <div className="w-full h-64 bg-black relative border rounded">
      <div className="absolute inset-0 grid grid-cols-20 grid-rows-16">
        {Array.from({length: 320}).map((_, i) => {
          const x = i % 20;
          const y = Math.floor(i / 20);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className={`w-full h-full ${isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : ''}`} />
          );
        })}
      </div>
      <div className="absolute top-2 left-2 text-white text-sm">Snake - Score: {score} - Arrow Keys</div>
    </div>
  );
};

// Pong Game
export const PongGame = () => {
  const [ballPos, setBallPos] = useState({x: 50, y: 50});
  const [ballVel, setBallVel] = useState({x: 2, y: 1});
  const [paddle1, setPaddle1] = useState(40);
  const [paddle2, setPaddle2] = useState(40);
  const [score, setScore] = useState({p1: 0, p2: 0});

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setBallPos(prev => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;
        
        if (newY <= 0 || newY >= 95) {
          setBallVel(v => ({...v, y: -v.y}));
        }
        
        if (newX <= 5 && newY >= paddle1 && newY <= paddle1 + 15) {
          setBallVel(v => ({...v, x: -v.x}));
        }
        
        if (newX >= 90 && newY >= paddle2 && newY <= paddle2 + 15) {
          setBallVel(v => ({...v, x: -v.x}));
        }
        
        if (newX <= 0) {
          setScore(s => ({...s, p2: s.p2 + 1}));
          return {x: 50, y: 50};
        }
        
        if (newX >= 95) {
          setScore(s => ({...s, p1: s.p1 + 1}));
          return {x: 50, y: 50};
        }
        
        return {x: newX, y: newY};
      });
      
      setPaddle2(prev => {
        if (ballPos.y > prev + 7) return Math.min(85, prev + 1);
        if (ballPos.y < prev + 7) return Math.max(0, prev - 1);
        return prev;
      });
    }, 50);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch(e.key) {
        case 'ArrowUp': setPaddle1(p => Math.max(0, p - 5)); break;
        case 'ArrowDown': setPaddle1(p => Math.min(85, p + 5)); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [ballPos, ballVel, paddle1, paddle2]);

  return (
    <div className="w-full h-64 bg-black relative border rounded">
      <div className="absolute left-2 bg-white w-2 h-16" style={{top: `${paddle1}%`}} />
      <div className="absolute right-2 bg-white w-2 h-16" style={{top: `${paddle2}%`}} />
      <div className="absolute bg-white w-3 h-3 rounded-full" style={{left: `${ballPos.x}%`, top: `${ballPos.y}%`}} />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white opacity-50" />
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-sm">
        Pong - {score.p1} : {score.p2} - Arrow Keys
      </div>
    </div>
  );
};

// Flappy Bird Game
export const FlappyGame = () => {
  const [birdY, setBirdY] = useState(50);
  const [pipes, setPipes] = useState([{x: 80, gap: 30, passed: false}]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setPipes(prev => {
        let newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - 3
        })).filter(pipe => pipe.x > -10);
        
        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 50) {
          newPipes.push({x: 100, gap: Math.random() * 30 + 20, passed: false});
        }
        
        // Check scoring
        newPipes.forEach(pipe => {
          if (pipe.x < 20 && !pipe.passed) {
            pipe.passed = true;
            setScore(s => s + 1);
          }
        });
        
        return newPipes;
      });
      
      setBirdY(prev => Math.min(90, prev + 2));
    }, 50);
    
    return () => clearInterval(gameLoop);
  }, []);

  const handleClick = () => {
    setBirdY(prev => Math.max(5, prev - 20));
  };

  return (
    <div className="w-full h-64 bg-blue-300 relative border rounded overflow-hidden cursor-pointer" onClick={handleClick}>
      {/* Bird */}
      <div className="absolute bg-yellow-400 w-6 h-6 rounded-full border-2 border-orange-400" style={{left: '20%', top: `${birdY}%`}} />
      
      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <div key={i}>
          <div className="absolute bg-green-600 w-8" style={{left: `${pipe.x}%`, top: 0, height: `${pipe.gap}%`}} />
          <div className="absolute bg-green-600 w-8" style={{left: `${pipe.x}%`, bottom: 0, height: `${100 - pipe.gap - 25}%`}} />
        </div>
      ))}
      
      <div className="absolute top-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 rounded">
        Flappy Bird - Score: {score} - Click to Flap
      </div>
    </div>
  );
};

// Racing Game
export const RacingGame = () => {
  const [carPos, setCarPos] = useState(50);
  const [obstacles, setObstacles] = useState([{x: 30, y: -20}, {x: 70, y: -60}]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setObstacles(prev => {
        let newObs = prev.map(obs => ({...obs, y: obs.y + 3})).filter(obs => obs.y < 100);
        
        if (Math.random() < 0.02) {
          newObs.push({x: Math.random() * 80 + 10, y: -10});
        }
        
        newObs.forEach(obs => {
          if (obs.y > 80 && obs.y < 85 && Math.abs(obs.x - carPos) < 8) {
            setScore(s => s + 1);
          }
        });
        
        return newObs;
      });
    }, 100);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch(e.key) {
        case 'a': case 'ArrowLeft': setCarPos(p => Math.max(10, p - 5)); break;
        case 'd': case 'ArrowRight': setCarPos(p => Math.min(85, p + 5)); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [carPos]);

  return (
    <div className="w-full h-64 bg-gray-600 relative border rounded overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 opacity-50" />
      </div>
      <div className="absolute bg-red-500 w-6 h-10 rounded" style={{left: `${carPos}%`, bottom: '10%'}} />
      {obstacles.map((obs, i) => (
        <div key={i} className="absolute bg-blue-500 w-6 h-10 rounded" style={{left: `${obs.x}%`, top: `${obs.y}%`}} />
      ))}
      <div className="absolute top-2 left-2 text-white text-sm">
        Racing - Score: {score} - A/D Keys
      </div>
    </div>
  );
};

// Puzzle Game
export const PuzzleGame = () => {
  const [grid, setGrid] = useState([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
  const [moves, setMoves] = useState(0);

  const shuffle = () => {
    const newGrid = [...grid];
    for (let i = 0; i < 100; i++) {
      const emptyIndex = newGrid.indexOf(16);
      const neighbors = [];
      if (emptyIndex % 4 !== 0) neighbors.push(emptyIndex - 1);
      if (emptyIndex % 4 !== 3) neighbors.push(emptyIndex + 1);
      if (emptyIndex >= 4) neighbors.push(emptyIndex - 4);
      if (emptyIndex < 12) neighbors.push(emptyIndex + 4);
      
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [newGrid[emptyIndex], newGrid[randomNeighbor]] = [newGrid[randomNeighbor], newGrid[emptyIndex]];
    }
    setGrid(newGrid);
    setMoves(0);
  };

  const handleClick = (index: number) => {
    const emptyIndex = grid.indexOf(16);
    const canMove = (
      (Math.abs(index - emptyIndex) === 1 && Math.floor(index / 4) === Math.floor(emptyIndex / 4)) ||
      Math.abs(index - emptyIndex) === 4
    );
    
    if (canMove) {
      const newGrid = [...grid];
      [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
      setGrid(newGrid);
      setMoves(m => m + 1);
    }
  };

  return (
    <div className="w-full h-64 bg-white relative border rounded p-4">
      <div className="grid grid-cols-4 gap-1 h-48">
        {grid.map((num, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-center text-lg font-bold border-2 rounded ${num === 16 ? 'bg-gray-200' : 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600'}`}
            onClick={() => handleClick(i)}
          >
            {num === 16 ? '' : num}
          </div>
        ))}
      </div>
      <div className="absolute top-2 right-2 text-sm">Moves: {moves}</div>
      <Button onClick={shuffle} className="absolute bottom-2 right-2" size="sm">Shuffle</Button>
    </div>
  );
};

// Shooter Game
export const ShooterGame = () => {
  const [playerX, setPlayerX] = useState(50);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([{x: 20, y: 10, id: 1}, {x: 60, y: 20, id: 2}, {x: 80, y: 15, id: 3}]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setBullets(prev => prev.map(b => ({...b, y: b.y - 5})).filter(b => b.y > 0));
      
      setEnemies(prev => {
        let newEnemies = prev.map(e => ({...e, y: e.y + 1})).filter(e => e.y < 90);
        
        if (Math.random() < 0.03) {
          newEnemies.push({x: Math.random() * 90, y: 0, id: Date.now()});
        }
        
        bullets.forEach(bullet => {
          newEnemies = newEnemies.filter(enemy => {
            if (Math.abs(bullet.x - enemy.x) < 5 && Math.abs(bullet.y - enemy.y) < 5) {
              setScore(s => s + 1);
              return false;
            }
            return true;
          });
        });
        
        return newEnemies;
      });
    }, 100);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch(e.key) {
        case 'a': case 'ArrowLeft': setPlayerX(p => Math.max(0, p - 5)); break;
        case 'd': case 'ArrowRight': setPlayerX(p => Math.min(90, p + 5)); break;
        case ' ': setBullets(prev => [...prev, {x: playerX, y: 85, id: Date.now()}]); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [playerX, bullets]);

  return (
    <div className="w-full h-64 bg-black relative border rounded">
      <div className="absolute bg-green-500 w-6 h-6" style={{left: `${playerX}%`, bottom: '5%'}} />
      {enemies.map((enemy) => (
        <div key={enemy.id} className="absolute bg-red-500 w-4 h-4" style={{left: `${enemy.x}%`, top: `${enemy.y}%`}} />
      ))}
      {bullets.map((bullet) => (
        <div key={bullet.id} className="absolute bg-yellow-400 w-1 h-3" style={{left: `${bullet.x}%`, top: `${bullet.y}%`}} />
      ))}
      <div className="absolute top-2 left-2 text-white text-sm">
        Shooter - Score: {score} - A/D/Space
      </div>
    </div>
  );
};

export const MiniGameSelector = ({ gameType }: { gameType: string }) => {
  const games = {
    snake: SnakeGame,
    pong: PongGame,
    flappy: FlappyGame,
    racing: RacingGame,
    puzzle: PuzzleGame,
    shooter: ShooterGame
  };

  const GameComponent = games[gameType as keyof typeof games] || SnakeGame;

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 flex-wrap">
        {Object.keys(games).map(type => (
          <Button key={type} variant="outline" size="sm" className="capitalize">
            {type}
          </Button>
        ))}
      </div>
      <GameComponent />
    </div>
  );
};