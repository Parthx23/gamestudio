import { useState } from "react";
import { Search, UserPlus, Users, MessageCircle, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const demoFriends = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80",
    status: "online",
    game: "Racing Game",
    level: 42,
    mutualFriends: 8,
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    status: "in-game",
    game: "Platformer",
    level: 38,
    mutualFriends: 12,
  },
  {
    id: 3,
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    status: "offline",
    lastSeen: "2 hours ago",
    level: 29,
    mutualFriends: 5,
  },
];

const Friends = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [friends] = useState(demoFriends);

  const inviteFriend = (friendId: number) => {
    toast.success("Game invitation sent!");
  };

  const sendMessage = (friendId: number) => {
    toast.success("Message sent!");
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-gaming font-bold mb-2">Friends</h1>
          <p className="text-muted-foreground">
            You have {friends.length} friends
          </p>
        </div>
        <Button variant="gaming">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="rounded-xl bg-card border border-border p-6 hover:border-primary/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                  friend.status === 'online' ? 'bg-green-500' : 
                  friend.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-gaming font-semibold">{friend.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {friend.status === 'in-game' ? `Playing ${friend.game}` : 
                   friend.status === 'online' ? 'Online' : friend.lastSeen}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Level {friend.level} • {friend.mutualFriends} mutual friends
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="gaming" 
                size="sm" 
                className="flex-1"
                onClick={() => inviteFriend(friend.id)}
                disabled={friend.status === 'offline'}
              >
                <Gamepad2 className="h-4 w-4 mr-1" />
                Invite
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendMessage(friend.id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFriends.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No friends found</h3>
          <p className="text-muted-foreground mb-6">
            No friends match your search criteria
          </p>
          <Button variant="neon" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default Friends;