import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Play, RotateCcw } from 'lucide-react';
import { Game3DGenerator } from '@/services/game3DGenerator';
import { toast } from 'sonner';

const examplePrompts = [
  "Create a forest platformer with jumping cubes and collectible gems",
  "Make a space shooter with enemy spheres and pyramid obstacles",
  "Build a desert racing game with platforms and speed boosts",
  "Generate a horror city with dark cubes and floating enemies",
  "Create a colorful cartoon world with bouncing balls and coins"
];

export const Game3DGeneratorComponent = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameGenerated, setGameGenerated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatorRef = useRef<Game3DGenerator | null>(null);

  useEffect(() => {
    return () => {
      if (generatorRef.current) {
        generatorRef.current.dispose();
        generatorRef.current = null;
      }
    };
  }, []);

  const generateGame = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a game description');
      return;
    }

    if (!containerRef.current) return;

    setIsGenerating(true);
    try {
      // Clean up previous game
      if (generatorRef.current) {
        generatorRef.current.dispose();
      }

      // Clear container safely
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      // Create new generator
      generatorRef.current = new Game3DGenerator(containerRef.current);
      
      // Generate game with delay for better UX
      setTimeout(() => {
        generatorRef.current?.generateGame(prompt);
        setGameGenerated(true);
        setIsGenerating(false);
        toast.success('3D game generated successfully!');
      }, 1000);

    } catch (error) {
      console.error('Game generation error:', error);
      toast.error('Failed to generate game');
      setIsGenerating(false);
    }
  };

  const resetGame = () => {
    if (generatorRef.current) {
      generatorRef.current.dispose();
      generatorRef.current = null;
    }
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
    setGameGenerated(false);
    setPrompt('');
  };

  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            3D Game Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your 3D game:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a forest platformer with jumping cubes and collectible gems..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateGame} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate 3D Game
                </>
              )}
            </Button>
            
            {gameGenerated && (
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="grid grid-cols-1 gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExamplePrompt(example)}
                  className="text-left text-xs p-2 rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={containerRef}
            className="w-full h-[500px] bg-black rounded-lg overflow-hidden relative"
          >
            {!gameGenerated && !isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your 3D game will appear here</p>
                  <p className="text-sm mt-2">Use WASD or arrow keys to move, Space to jump</p>
                </div>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p>Generating your 3D world...</p>
                  <p className="text-sm mt-2 opacity-75">This may take a moment</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {gameGenerated && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Controls</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><kbd className="px-2 py-1 bg-muted rounded">WASD</kbd> Move camera</p>
                  <p><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> Jump (platformer)</p>
                </div>
                <div>
                  <p><kbd className="px-2 py-1 bg-muted rounded">Arrow Keys</kbd> Alternative movement</p>
                  <p>Objects animate automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};