import { useState, useEffect } from "react";
import { 
  Upload, 
  Rocket,
  AlertCircle,
  Gamepad2,
  Car,
  Target,
  Swords,
  Trophy,
  Users,
  Zap,
  Flame,
  Shield,
  Crosshair,
  Flag,
  Bomb,
  Crown,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameBuilder from "@/components/game-builder/GameBuilder";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  players: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  color: string;
}

const gameTypes: GameType[] = [
  {
    id: "racing",
    name: "Racing Madness",
    description: "High-speed competitive racing with power-ups and obstacles",
    icon: Car,
    players: "2-8 Players",
    difficulty: "Medium",
    tags: ["Competitive", "Fast-paced"],
    color: "from-orange-500 to-red-600"
  },
  {
    id: "kart-smash",
    name: "Kart Smash Arena",
    description: "Crash, bash and smash your way to victory in chaotic kart battles",
    icon: Bomb,
    players: "2-12 Players",
    difficulty: "Easy",
    tags: ["Chaos", "Party"],
    color: "from-purple-500 to-pink-600"
  },
  {
    id: "shooting",
    name: "Shooter Showdown",
    description: "Team-based tactical shooter with multiple game modes",
    icon: Crosshair,
    players: "4-16 Players",
    difficulty: "Hard",
    tags: ["Tactical", "Team-based"],
    color: "from-red-500 to-orange-600"
  },
  {
    id: "battle-royale",
    name: "Battle Royale",
    description: "Last player standing in an ever-shrinking battlefield",
    icon: Crown,
    players: "20-100 Players",
    difficulty: "Hard",
    tags: ["Survival", "Competitive"],
    color: "from-yellow-500 to-amber-600"
  },
  {
    id: "capture-flag",
    name: "Capture The Flag",
    description: "Strategic team gameplay with objective-based missions",
    icon: Flag,
    players: "4-12 Players",
    difficulty: "Medium",
    tags: ["Strategy", "Team-based"],
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "arena-combat",
    name: "Arena Combat",
    description: "Intense 1v1 or team arena battles with unique characters",
    icon: Swords,
    players: "2-8 Players",
    difficulty: "Hard",
    tags: ["Fighting", "Skill-based"],
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "tower-defense",
    name: "Tower Defense Co-op",
    description: "Build defenses together and survive endless waves",
    icon: Shield,
    players: "2-4 Players",
    difficulty: "Medium",
    tags: ["Co-op", "Strategy"],
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "party-games",
    name: "Party Games",
    description: "Collection of fun mini-games for friends and family",
    icon: Trophy,
    players: "2-8 Players",
    difficulty: "Easy",
    tags: ["Casual", "Fun"],
    color: "from-pink-500 to-rose-600"
  }
];

const Publishing = () => {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    if (user) {
      loadGames();
    }
  }, [user]);

  const loadGames = async () => {
    try {
      const response = await apiService.getUserGames();
      setGames(response.games);
    } catch (error) {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const publishGame = async (gameId: string) => {
    try {
      toast.success('Game published successfully!');
      loadGames();
    } catch (error) {
      toast.error('Failed to publish game');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to publish games</p>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-gaming font-bold">Game Builder</h1>
          <Button variant="outline" onClick={() => setShowBuilder(false)}>
            Back to Publishing
          </Button>
        </div>
        <GameBuilder gameType={selectedGame} />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-gaming font-bold mb-2">Game Publishing</h1>
          <p className="text-muted-foreground">
            Choose your multiplayer game type and start building
          </p>
        </div>
        <Button 
          variant="gaming" 
          onClick={() => setShowBuilder(true)}
          disabled={!selectedGame}
        >
          <Rocket className="h-4 w-4 mr-2" />
          {selectedGame ? `Build ${gameTypes.find(g => g.id === selectedGame)?.name}` : 'Select Game Type First'}
        </Button>
      </div>

      {/* Multiplayer Badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-gaming font-semibold text-primary">All Games Are Multiplayer</h3>
          <p className="text-sm text-muted-foreground">
            Every game type supports real-time multiplayer with friends and global matchmaking
          </p>
        </div>
        <Zap className="h-5 w-5 text-primary ml-auto animate-pulse" />
      </div>

      {/* Game Types Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-gaming font-semibold">Choose Your Game Type</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameTypes.map((game) => {
            const Icon = game.icon;
            const isSelected = selectedGame === game.id;
            
            return (
              <button
                key={game.id}
                onClick={() => {
                  setSelectedGame(isSelected ? null : game.id);
                  if (!isSelected) {
                    setTimeout(() => setShowBuilder(true), 100);
                  }
                }}
                className={cn(
                  "group relative p-6 rounded-2xl text-left transition-all duration-300",
                  "border-2 hover:scale-[1.02]",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                )}
              >
                {/* Glow effect on selection */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                )}
                
                {/* Icon with gradient background */}
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                  "bg-gradient-to-br",
                  game.color,
                  isSelected && "scale-110"
                )}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="font-gaming font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {game.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {game.description}
                </p>
                
                {/* Player count */}
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{game.players}</span>
                </div>
                
                {/* Tags and Difficulty */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getDifficultyColor(game.difficulty)}>
                    {game.difficulty}
                  </Badge>
                  {game.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Flame className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Published Games */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Rocket className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-gaming font-semibold">Your Published Games</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading games...</div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game: any) => (
              <div key={game._id} className="rounded-xl bg-card border border-border p-6 hover:border-primary/30 transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-4xl opacity-50">🎮</div>
                </div>
                <h3 className="font-gaming font-semibold mb-2">{game.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {game.config?.type || 'Custom'} • {game.playCount} plays
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="gaming" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => publishGame(game._id)}
                  >
                    <Rocket className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await apiService.createRoom({ gameId: game._id, maxPlayers: 4 });
                        window.location.href = `/room/${response.room.roomId}`;
                      } catch (error) {
                        toast.error('Failed to create room');
                      }
                    }}
                  >
                    <Gamepad2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <div className="text-6xl mb-4 opacity-50">🎮</div>
            <h3 className="text-lg font-semibold mb-2">No games to publish yet</h3>
            <p className="text-muted-foreground mb-4">Create your first game to get started!</p>
            <Button variant="gaming" onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Game
            </Button>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="p-8 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-gaming font-semibold">Import Game Assets</h2>
        </div>
        
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
          <p className="text-lg font-medium mb-2">Drop your game assets here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, audio, 3D models, and sprite sheets
          </p>
          <Button variant="neon">Browse Files</Button>
        </div>
      </div>

      {/* Tips */}
      <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-gaming font-semibold mb-1">Multiplayer Building Tips</h4>
            <p className="text-sm text-muted-foreground">
              Each game type comes with pre-built multiplayer networking. Focus on designing 
              your maps, characters, and gameplay mechanics. Our servers handle all the 
              real-time synchronization, matchmaking, and player connections automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publishing;
