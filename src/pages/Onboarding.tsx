import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2, HandHeart, Gift, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = "helper" | "supporter";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedType || !user) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        user_type: selectedType,
        onboarding_completed: true 
      })
      .eq("user_id", user.id);

    if (!error) {
      await refreshProfile();
      navigate("/");
    }
    
    setIsLoading(false);
  };

  const userTypes = [
    {
      type: "helper" as UserType,
      title: "Changemaker",
      description: "I want to help others and make a difference in my community",
      details: [
        "Complete cleanup quests and earn points",
        "Help with community listings",
        "Perform good deeds",
        "Redeem points for rewards",
      ],
      icon: HandHeart,
      color: "bg-swap-green/20 text-swap-green border-swap-green/30",
      selectedColor: "bg-swap-green/30 border-swap-green ring-2 ring-swap-green",
    },
    {
      type: "supporter" as UserType,
      title: "Supporter",
      description: "I want to support changemakers by offering services or rewards",
      details: [
        "Offer showers, meals, or beds",
        "Provide reward vouchers for partners",
        "Create opportunities for helpers",
        "Support your local community",
      ],
      icon: Gift,
      color: "bg-swap-gold/20 text-swap-gold border-swap-gold/30",
      selectedColor: "bg-swap-gold/30 border-swap-gold ring-2 ring-swap-gold",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary glow-green">
            <Leaf className="h-9 w-9 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient-swap">Welcome to SWAP</h1>
            <p className="text-muted-foreground mt-1">
              Tell us how you'd like to participate
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {userTypes.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            
            return (
              <Card
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className={cn(
                  "cursor-pointer transition-all duration-200 border-2",
                  isSelected ? option.selectedColor : "border-border/50 hover:border-border"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", option.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {option.title}
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {option.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {option.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          size="lg"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up your account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          You can change this later in your settings
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
