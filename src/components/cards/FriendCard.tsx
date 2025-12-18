import { MessageSquare, Gamepad2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FriendCardProps {
  name: string;
  avatar: string;
  status: "online" | "offline" | "playing" | "away";
  currentGame?: string;
  level: number;
}

const statusColors = {
  online: "bg-neon-green",
  offline: "bg-muted-foreground",
  playing: "bg-neon-purple",
  away: "bg-neon-orange",
};

const statusText = {
  online: "Online",
  offline: "Offline",
  playing: "Playing",
  away: "Away",
};

const FriendCard = ({ name, avatar, status, currentGame, level }: FriendCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
      {/* Avatar */}
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center overflow-hidden">
          <span className="font-gaming text-lg">{avatar}</span>
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card",
          statusColors[status]
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{name}</h4>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-gaming">
            {level}
          </span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            statusColors[status]
          )} />
          {status === "playing" && currentGame ? (
            <span className="truncate">Playing {currentGame}</span>
          ) : (
            statusText[status]
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Gamepad2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FriendCard;
