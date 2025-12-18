import { Play, Star, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  image: string;
  rating: number;
  players: string;
  playtime?: string;
  genre: string;
  isNew?: boolean;
  progress?: number;
}

const GameCard = ({ title, image, rating, players, playtime, genre, isNew, progress }: GameCardProps) => {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.3)]">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-primary text-primary-foreground animate-pulse-glow">
              NEW
            </span>
          )}
          <span className="px-2 py-1 text-xs font-medium rounded-md glass">
            {genre}
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="gaming" size="lg" className="gap-2">
            <Play className="h-5 w-5" fill="currentColor" />
            Play Now
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-gaming font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-neon-orange fill-neon-orange" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{players}</span>
          </div>
          {playtime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{playtime}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
