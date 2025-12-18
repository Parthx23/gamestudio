import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
}

const StatsCard = ({ icon: Icon, label, value, change, trend }: StatsCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-muted text-primary">
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-md",
            trend === "up" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
          )}>
            {trend === "up" ? "↑" : "↓"} {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-gaming font-bold mb-1 group-hover:text-gradient transition-all">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default StatsCard;