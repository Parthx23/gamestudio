import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

const PricingCard = ({ name, price, period, description, features, isPopular, buttonText }: PricingCardProps) => {
  return (
    <div className={cn(
      "relative p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-2",
      isPopular 
        ? "bg-gradient-to-b from-primary/10 to-card border-primary/50 hover:border-primary hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.4)]" 
        : "bg-card border-border hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.2)]"
    )}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-gaming">
            <Zap className="h-4 w-4" fill="currentColor" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="font-gaming text-xl mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-gaming font-bold text-gradient">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <Button 
        variant={isPopular ? "gaming" : "neon"} 
        className="w-full"
        size="lg"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PricingCard;
