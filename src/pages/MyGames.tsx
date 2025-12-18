import { useState, useEffect } from "react";
import { Search, Grid, List, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/cards/GameCard";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const allGames = [
  {
    title: "Cyber Legends",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    rating: 4.8,
    players: "12.5K",
    genre: "Action RPG",
    isNew: true,
    progress: 65,
  },
  {
    title: "Galaxy Wars",
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80",
    rating: 4.6,
    players: "8.2K",
    genre: "Strategy",
    playtime: "120h",
    progress: 45,
  },
  {
    title: "Shadow Quest",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    rating: 4.9,
    players: "25K",
    genre: "Adventure",
    playtime: "85h",
    progress: 78,
  },
];

const categories = ["All", "Racing", "Platformer", "Puzzle", "Shooter"];

const MyGames = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const createRoom = async (gameId: string) => {
    try {
      const response = await apiService.createRoom({ gameId, maxPlayers: 4 });
      window.location.href = `/room/${response.room.roomId}`;
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await apiService.deleteGame(gameId);
      toast.success('Game deleted successfully');
      loadGames();
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  const filteredGames = games.filter((game) => {
    const matchesCategory = activeCategory === "All" || game.config?.type === activeCategory.toLowerCase();
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-gaming font-bold mb-2">My Games</h1>
          <p className="text-muted-foreground">
            You created {games.length} games
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading games...</div>
        </div>
      ) : (
        <>
          {/* Games Grid */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div key={game._id} className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-4xl opacity-50">🎮</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-gaming font-semibold mb-2 group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {game.config?.type || 'Custom'} • {game.playCount} plays
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="gaming" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => createRoom(game._id)}
                      >
                        <Play className="h-4 w-4 mr-2" fill="currentColor" />
                        Create Room
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteGame(game._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGames.map((game) => (
                <div
                  key={game._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                >
                  <div className="w-20 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-gaming font-semibold group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {game.config?.type || 'Custom'} • {game.playCount} plays
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="gaming" 
                      size="sm"
                      onClick={() => createRoom(game._id)}
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                      Play
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteGame(game._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredGames.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {games.length === 0 ? "No games created yet" : "No games found matching your criteria"}
          </p>
          {games.length === 0 ? (
            <Button variant="neon" onClick={() => window.location.href = '/'}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Game
            </Button>
          ) : (
            <Button variant="neon" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyGames;