import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Loader2, 
  Sparkles, 
  Star,
  Crown,
  Zap,
  Heart,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PointsPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  bonus?: number;
  icon: React.ReactNode;
  popular?: boolean;
  description: string;
}

const POINTS_PACKAGES: PointsPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    points: 500,
    price: 499,
    icon: <Leaf className="h-6 w-6" />,
    description: "Perfect for trying out rewards",
  },
  {
    id: "popular",
    name: "Popular Pack",
    points: 1500,
    price: 999,
    bonus: 200,
    icon: <Star className="h-6 w-6" />,
    popular: true,
    description: "Best value for regular users",
  },
  {
    id: "premium",
    name: "Premium Pack",
    points: 3500,
    price: 1999,
    bonus: 500,
    icon: <Crown className="h-6 w-6" />,
    description: "For the dedicated community member",
  },
  {
    id: "supporter",
    name: "Supporter Pack",
    points: 10000,
    price: 4999,
    bonus: 2000,
    icon: <Heart className="h-6 w-6" />,
    description: "Maximum impact & platform support",
  },
];

const BuyPoints = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (pkg: PointsPackage) => {
    if (!user) {
      toast({ title: "Please sign in to purchase points", variant: "destructive" });
      return;
    }

    setPurchasing(pkg.id);
    
    try {
      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-points-checkout", {
        body: { packageId: pkg.id },
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Buy SWAP Points</h1>
            <p className="text-muted-foreground">
              Support our platform and unlock amazing rewards
            </p>
          </div>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-primary/10 to-swap-gold/10 border-primary/20">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-full bg-primary/20">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Current Balance</p>
              <p className="text-3xl font-bold">{profile?.swap_points?.toLocaleString() || 0} Points</p>
            </div>
          </CardContent>
        </Card>

        {/* Why Buy Section */}
        <div className="text-center py-6">
          <h2 className="text-xl font-semibold mb-2">Why Buy Points?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your purchase directly supports our mission to encourage good deeds in communities worldwide.
            Plus, you'll get bonus points to redeem for exclusive rewards!
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {POINTS_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                pkg.popular ? "border-2 border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${pkg.popular ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                    {pkg.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold">{pkg.points.toLocaleString()}</span>
                    {pkg.bonus && (
                      <Badge variant="secondary" className="ml-2 bg-swap-gold/20 text-swap-gold">
                        +{pkg.bonus} bonus
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground">SWAP Points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${(pkg.price / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      ${((pkg.price / 100) / (pkg.points + (pkg.bonus || 0)) * 100).toFixed(2)}/100 pts
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.id}
                >
                  {purchasing === pkg.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure Payment
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Instant Delivery
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            100% to Good Causes
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BuyPoints;
