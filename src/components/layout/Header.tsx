import { Bell, Search, MessageSquare, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { toast } from "sonner";

const Header = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading...</div>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between h-full px-6">
          <div className="font-gaming text-xl font-bold text-gradient">
            Cosmic Game Deck
          </div>
          <div className="flex gap-2">
            <Button onClick={async () => {
              try {
                await authService.demoLogin();
              } catch (error) {
                console.error('Demo login failed:', error);
              }
            }} variant="outline">
              <LogIn className="h-4 w-4 mr-2" />
              Demo Login
            </Button>
            <Button onClick={() => {
              toast.error('Google OAuth not configured yet. Use Demo Login instead.');
            }} variant="gaming">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In with Google
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games, friends, publishers..."
            className="pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center">
              5
            </span>
          </Button>
          
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
          
          {/* User Avatar */}
          <div className="ml-4 flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.plan} Member</p>
            </div>
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-gaming text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-neon-green border-2 border-background" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
