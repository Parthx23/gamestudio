import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  examplePrompt: string;
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
    color: "from-orange-500 to-red-600",
    examplePrompt: "futuristic neon city race track with jumps and tight corners"
  },
  {
    id: "kart-smash",
    name: "Kart Smash Arena",
    description: "Crash, bash and smash your way to victory in chaotic kart battles",
    icon: Bomb,
    players: "2-12 Players",
    difficulty: "Easy",
    tags: ["Chaos", "Party"],
    color: "from-purple-500 to-pink-600",
    examplePrompt: "demolition derby arena with explosive barrels and ramps"
  },
  {
    id: "shooting",
    name: "Shooter Showdown",
    description: "Team-based tactical shooter with multiple game modes",
    icon: Crosshair,
    players: "4-16 Players",
    difficulty: "Hard",
    tags: ["Tactical", "Team-based"],
    color: "from-red-500 to-orange-600",
    examplePrompt: "military base with cover points and sniper towers"
  },
  {
    id: "battle-royale",
    name: "Battle Royale",
    description: "Last player standing in an ever-shrinking battlefield",
    icon: Crown,
    players: "20-100 Players",
    difficulty: "Hard",
    tags: ["Survival", "Competitive"],
    color: "from-yellow-500 to-amber-600",
    examplePrompt: "post-apocalyptic wasteland with scattered loot and safe zones"
  },
  {
    id: "capture-flag",
    name: "Capture The Flag",
    description: "Strategic team gameplay with objective-based missions",
    icon: Flag,
    players: "4-12 Players",
    difficulty: "Medium",
    tags: ["Strategy", "Team-based"],
    color: "from-blue-500 to-cyan-600",
    examplePrompt: "medieval castle with two bases and strategic chokepoints"
  },
  {
    id: "arena-combat",
    name: "Arena Combat",
    description: "Intense 1v1 or team arena battles with unique characters",
    icon: Swords,
    players: "2-8 Players",
    difficulty: "Hard",
    tags: ["Fighting", "Skill-based"],
    color: "from-emerald-500 to-teal-600",
    examplePrompt: "gladiator colosseum with moving platforms and weapon spawns"
  },
  {
    id: "tower-defense",
    name: "Tower Defense Co-op",
    description: "Build defenses together and survive endless waves",
    icon: Shield,
    players: "2-4 Players",
    difficulty: "Medium",
    tags: ["Co-op", "Strategy"],
    color: "from-indigo-500 to-purple-600",
    examplePrompt: "winding path through forest with tower placement spots"
  },
  {
    id: "party-games",
    name: "Party Games",
    description: "Collection of fun mini-games for friends and family",
    icon: Trophy,
    players: "2-8 Players",
    difficulty: "Easy",
    tags: ["Casual", "Fun"],
    color: "from-pink-500 to-rose-600",
    examplePrompt: "colorful playground with obstacle courses and mini challenges"
  }
];

const Publishing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleStartFromAIPrompt = () => {
    navigate("/builder?mode=ai");
  };

  const handleSelectTypeFirst = () => {
    document.getElementById('game-types-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const generateAIGame = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a game description');
      return;
    }
    
    setGenerating(true);
    try {
      await apiService.generateAIGame(aiPrompt);
      toast.success('AI game generated successfully!');
      setAiPrompt('');
      setShowAIGenerator(false);
      loadGames();
    } catch (error) {
      toast.error('Failed to generate AI game');
    } finally {
      setGenerating(false);
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
        {(() => {
          const aiCredits = user?.aiCredits ?? 0;
          return (
            <button
              onClick={handleStartFromAIPrompt}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:from-emerald-300 hover:to-sky-400 transition"
              title={aiCredits > 0 ? `${aiCredits} AI credits remaining` : "No AI credits left"}
            >
              <span className="text-base">+</span>
              <span>Start from AI prompt</span>
            </button>
          );
        })()}
      </div>

      {/* AI Generate vs Select Type buttons */}
      <div className="flex items-center justify-end gap-3 mt-4 mb-6">
        <button
          onClick={handleStartFromAIPrompt}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-slate-900 shadow hover:bg-sky-400 transition"
        >
          <span className="text-xs">✨</span>
          <span>AI Generate</span>
        </button>

        <button
          onClick={handleSelectTypeFirst}
          className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-1.5 text-sm font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300 transition"
        >
          <span className="text-xs">🎮</span>
          <span>Select game type first</span>
        </button>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-gaming font-bold mb-4">AI Game Generator</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Describe your game idea and AI will create it for you!
            </p>
            <Textarea
              placeholder="e.g., A multiplayer space shooter where 4 players fight waves of alien invaders. Players can collect power-ups like laser cannons, shields, and speed boosts. The game has a cyberpunk theme with neon colors and electronic music."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="mb-4"
              rows={5}
            />
            <p className="text-xs text-muted-foreground mb-4">
              💡 Be specific! Include: game type, number of players, theme, mechanics, and visual style for best results.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAIGenerator(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="neon" 
                onClick={generateAIGame}
                disabled={generating}
                className="flex-1"
              >
                {generating ? 'Generating...' : 'Generate Game'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Updated Multiplayer info bar */}
      <div className="mt-4 rounded-2xl bg-slate-900/60 border border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <span className="text-lg">👥</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              All games are multiplayer
            </p>
            <p className="text-xs text-slate-400">
              Use <span className="font-medium text-sky-300">AI Generate</span> to auto‑configure maps, rules and player counts for any type below.
            </p>
          </div>
        </div>
      </div>

      {/* Game Types Grid */}
      <div id="game-types-section">
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
                className="group flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-4 text-left hover:border-sky-500/70 hover:bg-slate-900 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        {game.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {game.description}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                    AI‑ready
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
                    <span className="text-xs">👥</span>
                    <span>{game.players}</span>
                  </span>
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-slate-900/80 px-3 py-2 text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-sky-300 font-medium mr-1">Try:</span>
                  "{game.examplePrompt}"
                </div>
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
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-3 text-3xl">🎮</div>
            <h3 className="text-white font-medium mb-1">
              No games to publish yet
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Kickstart your first 3D world with a single prompt. Describe any idea and let AI build the level.
            </p>
            <button
              onClick={handleStartFromAIPrompt}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition"
            >
              <span>✨ Generate game with AI</span>
            </button>
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
