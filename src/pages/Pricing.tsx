import PricingCard from "@/components/cards/PricingCard";
import { Zap, Shield, Star, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for casual gamers",
    features: [
      "Access to free-to-play games",
      "Basic multiplayer features",
      "Community forums access",
      "Standard customer support",
      "5GB cloud saves",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "For serious gamers",
    features: [
      "Everything in Starter",
      "Exclusive game discounts (20%)",
      "Priority queue for multiplayer",
      "100GB cloud saves",
      "Early access to new releases",
      "Priority customer support",
    ],
    buttonText: "Start Free Trial",
    isPopular: true,
  },
  {
    name: "Ultimate",
    price: "$19.99",
    period: "month",
    description: "The complete gaming experience",
    features: [
      "Everything in Pro",
      "Access to 200+ premium games",
      "Exclusive in-game items",
      "Unlimited cloud saves",
      "VIP events and tournaments",
      "24/7 dedicated support",
      "Free monthly game credits",
    ],
    buttonText: "Go Ultimate",
  },
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "Is there a free trial?",
    answer: "Pro plan comes with a 7-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and various regional payment methods.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "You can cancel anytime. You'll retain access until the end of your billing period.",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const selectPlan = async (planName: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setLoading(true);
    try {
      if (planName === 'free') {
        toast.success("You're on the free plan!");
      } else {
        toast.success(`${planName} plan selected! Payment integration coming soon.`);
      }
    } catch (error) {
      toast.error("Failed to select plan");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to view pricing</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-gaming font-bold mb-4">
          Choose Your <span className="text-gradient">Gaming Plan</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Unlock premium features, exclusive games, and take your gaming experience to the next level.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>

      {/* Features Comparison */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-gaming font-bold text-center mb-8">Why Go Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-gaming font-semibold mb-2">Faster Downloads</h3>
            <p className="text-sm text-muted-foreground">
              Pro members get priority access to our CDN for 3x faster game downloads.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border text-center">
            <div className="w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-neon-purple" />
            </div>
            <h3 className="font-gaming font-semibold mb-2">Premium Security</h3>
            <p className="text-sm text-muted-foreground">
              Advanced anti-cheat protection and secure payment processing.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border text-center">
            <div className="w-12 h-12 rounded-full bg-neon-orange/10 flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-neon-orange" />
            </div>
            <h3 className="font-gaming font-semibold mb-2">Exclusive Content</h3>
            <p className="text-sm text-muted-foreground">
              Get access to exclusive skins, items, and early game releases.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-gaming font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20">
        <h2 className="text-2xl font-gaming font-bold mb-4">
          Ready to Level Up?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join millions of gamers who have already upgraded their experience.
        </p>
        <Button variant="gaming" size="xl" onClick={() => selectPlan('pro')}>
          Start Your Free Trial
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
