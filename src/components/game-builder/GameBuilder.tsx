import { useState } from "react";
import { 
  Play, 
  Square, 
  Circle, 
  Triangle,
  MousePointer,
  Move,
  Trash2,
  Save,
  RotateCcw,
  Layers,
  Settings2,
  Palette,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { toast } from "sonner";

type Tool = "select" | "move" | "car" | "track" | "obstacle" | "powerup" | "platform" | "enemy" | "weapon" | "flag";
type GameObject = {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  gameType?: string;
};

const getToolsForGameType = (gameType: string) => {
  const baseTools = [
    { id: "select" as Tool, icon: MousePointer, label: "Select" },
    { id: "move" as Tool, icon: Move, label: "Move" },
  ];

  switch (gameType) {
    case "racing":
      return [...baseTools,
        { id: "car" as Tool, icon: Square, label: "Car" },
        { id: "track" as Tool, icon: Circle, label: "Track" },
        { id: "obstacle" as Tool, icon: Triangle, label: "Obstacle" },
        { id: "powerup" as Tool, icon: Sparkles, label: "Power-up" },
      ];
    case "kart-smash":
      return [...baseTools,
        { id: "car" as Tool, icon: Square, label: "Kart" },
        { id: "obstacle" as Tool, icon: Triangle, label: "Barrier" },
        { id: "powerup" as Tool, icon: Sparkles, label: "Weapon" },
      ];
    case "shooting":
      return [...baseTools,
        { id: "platform" as Tool, icon: Square, label: "Platform" },
        { id: "weapon" as Tool, icon: Triangle, label: "Weapon" },
        { id: "enemy" as Tool, icon: Circle, label: "Spawn Point" },
      ];
    case "capture-flag":
      return [...baseTools,
        { id: "platform" as Tool, icon: Square, label: "Platform" },
        { id: "flag" as Tool, icon: Triangle, label: "Flag" },
        { id: "obstacle" as Tool, icon: Circle, label: "Cover" },
      ];
    default:
      return [...baseTools,
        { id: "platform" as Tool, icon: Square, label: "Platform" },
        { id: "obstacle" as Tool, icon: Circle, label: "Object" },
        { id: "powerup" as Tool, icon: Triangle, label: "Item" },
      ];
  }
};

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--stormy-teal))",
  "hsl(var(--yale-blue))",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#8b5cf6",
];

interface GameBuilderProps {
  gameType?: string;
}

const GameBuilder = ({ gameType = "default" }: GameBuilderProps) => {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const tools = getToolsForGameType(gameType);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "select" || activeTool === "move") return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newObject: GameObject = {
      id: crypto.randomUUID(),
      type: activeTool,
      x: x - 25,
      y: y - 25,
      width: activeTool === "car" ? 80 : activeTool === "track" ? 200 : 50,
      height: activeTool === "car" ? 40 : activeTool === "track" ? 200 : 50,
      color: activeColor,
      gameType,
    };

    setObjects([...objects, newObject]);
  };

  const handleObjectClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeTool === "select") {
      setSelectedObject(id === selectedObject ? null : id);
    }
  };

  const deleteSelected = () => {
    if (selectedObject) {
      setObjects(objects.filter(obj => obj.id !== selectedObject));
      setSelectedObject(null);
    }
  };

  const [aiPrompt, setAiPrompt] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clearCanvas = () => {
    setObjects([]);
    setSelectedObject(null);
  };

  const generateAIGame = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a game description");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateAIGame(aiPrompt);
      const game = response.game;
      
      const newObjects = game.config.objects?.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        x: (obj.position?.x || 0) * 10 + 200,
        y: (obj.position?.z || 0) * 10 + 200,
        width: obj.type === 'car' ? 80 : obj.type === 'track' ? 200 : (obj.scale?.x || 1) * 50,
        height: obj.type === 'car' ? 40 : obj.type === 'track' ? 200 : (obj.scale?.z || 1) * 50,
        color: obj.properties?.color || activeColor,
        gameType: game.config.type
      })) || [];
      
      setObjects(newObjects);
      setGameTitle(game.title);
      setGameDescription(game.description);
      toast.success("AI game generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate game");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGame = async () => {
    if (!gameTitle.trim()) {
      toast.error("Please enter a game title");
      return;
    }

    setIsSaving(true);
    try {
      const gameConfig = {
        type: "platformer",
        maxPlayers: 4,
        objects: objects.map(obj => ({
          id: obj.id,
          type: obj.type === 'rectangle' ? 'block' : obj.type === 'circle' ? 'platform' : 'block',
          position: { x: (obj.x - 200) / 10, y: 0, z: (obj.y - 200) / 10 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: obj.width / 50, y: 1, z: obj.height / 50 },
          properties: { color: obj.color }
        })),
        settings: {
          gravity: 9.8,
          lighting: "dynamic",
          environment: "city"
        }
      };

      await apiService.createGame({
        title: gameTitle,
        description: gameDescription,
        config: gameConfig,
        isPublic: false
      });
      
      toast.success("Game saved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save game");
    } finally {
      setIsSaving(false);
    }
  };

  const renderObject = (obj: GameObject) => {
    const isSelected = obj.id === selectedObject;
    const baseStyles = {
      left: obj.x,
      top: obj.y,
      width: obj.width,
      height: obj.height,
    };

    const getObjectDisplay = () => {
      switch (obj.type) {
        case "car":
          return (
            <div className="w-full h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              🏎️
            </div>
          );
        case "track":
          return (
            <div className="w-full h-full border-4 border-gray-600 rounded-full bg-gray-800 opacity-50" />
          );
        case "obstacle":
          return (
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white">
              🚧
            </div>
          );
        case "powerup":
          return (
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
              ⚡
            </div>
          );
        case "platform":
          return (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700" style={{ backgroundColor: obj.color }} />
          );
        case "weapon":
          return (
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white">
              🔫
            </div>
          );
        case "flag":
          return (
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white">
              🚩
            </div>
          );
        case "enemy":
          return (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white">
              👾
            </div>
          );
        default:
          return (
            <div className="w-full h-full rounded" style={{ backgroundColor: obj.color }} />
          );
      }
    };

    return (
      <div
        key={obj.id}
        className={cn(
          "absolute cursor-pointer transition-all",
          isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background"
        )}
        style={baseStyles}
        onClick={(e) => handleObjectClick(e, obj.id)}
      >
        {getObjectDisplay()}
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-gaming font-semibold">
            {gameType === "racing" ? "Racing Game" : 
             gameType === "kart-smash" ? "Kart Smash" :
             gameType === "shooting" ? "Shooter" :
             gameType === "capture-flag" ? "Capture Flag" :
             "Game"} Builder
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neon" size="sm">
                <Sparkles className="h-4 w-4 mr-1" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Game with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your game... e.g., 'Create a racing game with 4 players, cars, and a circular track'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={generateAIGame} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Game"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearCanvas}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="gaming" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Game title"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Game description (optional)"
                  value={gameDescription}
                  onChange={(e) => setGameDescription(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={saveGame} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Game"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant={isPlaying ? "destructive" : "neon"} 
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play className="h-4 w-4 mr-1" />
            {isPlaying ? "Stop" : "Play"}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Toolbar */}
        <div className="w-16 border-r border-border p-2 flex flex-col gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={cn(
                "w-full aspect-square rounded-lg flex items-center justify-center transition-all",
                activeTool === tool.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
          ))}
          
          <div className="h-px bg-border my-2" />
          
          <button
            className="w-full aspect-square rounded-lg flex items-center justify-center hover:bg-destructive/20 text-destructive transition-all"
            onClick={deleteSelected}
            disabled={!selectedObject}
            title="Delete Selected"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <div
            className="relative w-full h-[400px] bg-background/50 rounded-xl border-2 border-dashed border-border cursor-crosshair overflow-hidden"
            onClick={handleCanvasClick}
          >
            {objects.length === 0 && !isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p>Click to add {gameType === "racing" ? "cars, tracks, and obstacles" : 
                           gameType === "shooting" ? "platforms, weapons, and spawn points" :
                           "objects"} to your game</p>
              </div>
            )}
            {objects.map(renderObject)}
            
            {isPlaying && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-foreground font-medium">Game Running...</p>
                  <p className="text-sm text-muted-foreground">Click Stop to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-48 border-l border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Properties</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Color</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-md transition-all",
                      activeColor === color && "ring-2 ring-white ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Objects: {objects.length}</p>
              <p>Selected: {selectedObject ? "1" : "None"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBuilder;
