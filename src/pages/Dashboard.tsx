import { Gamepad2, Users, Trophy, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsCard from "@/components/cards/StatsCard";
import GameCard from "@/components/cards/GameCard";
import GameBuilder from "@/components/game-builder/GameBuilder";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";



const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBuilder, setShowBuilder] = useState(false);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCreateGame = () => {
    setShowBuilder(true);
  };

  useEffect(() => {
    if (user) {
      loadRecentGames();
    }
  }, [user]);

  const loadRecentGames = async () => {
    try {
      const response = await apiService.getUserGames();
      setRecentGames(response.games.slice(0, 3));
    } catch (error) {
      console.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view your dashboard</p>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-gaming font-bold">Game Builder</h1>
          <Button variant="outline" onClick={() => setShowBuilder(false)}>
            Back to Dashboard
          </Button>
        </div>
        <GameBuilder gameType="default" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome back, {user?.name || "Demo"}
          </h1>
          <p className="text-sm text-slate-400">
            Ready to explore your gaming world?
          </p>
        </div>

        <button
          onClick={handleCreateGame}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-sky-500 px-5 py-2 text-sm font-medium text-slate-900 shadow-lg hover:from-teal-300 hover:to-sky-400 transition"
        >
          <span className="text-xs">🎮</span>
          <span>Create Game</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Gamepad2}
          label="Games Created"
          value={user.gamesCreated.toString()}
        />
        <StatsCard
          icon={Users}
          label="Friends"
          value="0"
        />
        <StatsCard
          icon={Trophy}
          label="Plan"
          value={user.plan.toUpperCase()}
        />
        <StatsCard
          icon={Clock}
          label="Total Games"
          value={recentGames.length.toString()}
        />
      </div>

      {/* Recent Games */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-gaming font-semibold">Your Recent Games</h2>
          <Button variant="ghost" className="text-primary" onClick={() => window.location.href = '/games'}>
            View All
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading games...</div>
          </div>
        ) : recentGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGames.map((game) => (
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
                  <Button 
                    variant="gaming" 
                    size="sm" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        const response = await apiService.createRoom({ gameId: game._id, maxPlayers: 4 });
                        window.location.href = `/room/${response.room.roomId}`;
                      } catch (error) {
                        console.error('Failed to create room');
                      }
                    }}
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Play Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-3 text-3xl">🎮</div>
            <h3 className="text-white font-medium mb-1">
              No games yet
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Start creating your first game using our visual game builder.
            </p>
            <button
              onClick={handleCreateGame}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition"
            >
              <span>🎮 Create Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;