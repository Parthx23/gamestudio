import { Gamepad2, Users, Trophy, Clock, Plus } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import GameCard from "@/components/cards/GameCard";
import GameBuilder from "@/components/game-builder/GameBuilder";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";



const Dashboard = () => {
  const { user } = useAuth();
  const [showBuilder, setShowBuilder] = useState(false);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-gaming font-bold mb-2">
            Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to explore your gaming world?
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="gaming" size="lg" onClick={() => setShowBuilder(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Game
          </Button>
          <Button variant="outline" size="lg">
            <Gamepad2 className="h-5 w-5 mr-2" />
            Quick Match
          </Button>
        </div>
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
          label="AI Credits"
          value={user.aiCredits.toString()}
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
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <div className="text-6xl mb-4 opacity-50">🎮</div>
            <h3 className="text-lg font-semibold mb-2">No games yet</h3>
            <p className="text-muted-foreground mb-4">Create your first game to get started!</p>
            <Button variant="gaming" onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;