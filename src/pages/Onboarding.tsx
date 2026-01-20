import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2, HandHeart, Gift, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = "helper" | "supporter";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ status: string } | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Check if user already has a pending/approved supporter application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setCheckingApplication(false);
        return;
      }

      const { data } = await supabase
        .from("supporter_applications")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setExistingApplication(data);
      setCheckingApplication(false);
    };

    checkExistingApplication();
  }, [user]);

  // If user is already a supporter, redirect to home
  useEffect(() => {
    if (profile?.user_type === "supporter") {
      navigate("/home");
    }
  }, [profile, navigate]);

  const handleContinue = async () => {
    if (!selectedType || !user) return;

    setIsLoading(true);
    
    // If they chose supporter
    if (selectedType === "supporter") {
      // Check if user is already an approved supporter
      if (profile?.user_type === "supporter") {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", user.id);
        await refreshProfile();
        navigate("/home");
        return;
      }

      // Check if they already have a pending or approved application
      if (existingApplication?.status === "pending" || existingApplication?.status === "approved") {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", user.id);
        await refreshProfile();
        navigate("/home");
        return;
      }

      // Mark onboarding as complete but don't set user_type yet (pending approval)
      await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true 
        })
        .eq("user_id", user.id);
      
      await refreshProfile();
      navigate("/supporter-application");
      return;
    }
    
    // For changemakers, set type immediately
    const { error } = await supabase
      .from("profiles")
      .update({ 
        user_type: selectedType,
        onboarding_completed: true 
      })
      .eq("user_id", user.id);

    if (!error) {
      await refreshProfile();
      navigate("/home");
    }
    
    setIsLoading(false);
  };

  const isAlreadySupporter = profile?.user_type === "supporter";
  const hasPendingApplication = existingApplication?.status === "pending";
  const hasApprovedApplication = existingApplication?.status === "approved";

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
      disabled: false,
    },
    {
      type: "supporter" as UserType,
      title: "Supporter",
      description: isAlreadySupporter 
        ? "You're already an approved Supporter!" 
        : hasPendingApplication 
          ? "Your application is pending review"
          : hasApprovedApplication
            ? "Your application was approved!"
            : "I represent a business and want to support changemakers",
      details: isAlreadySupporter || hasPendingApplication || hasApprovedApplication
        ? [
            isAlreadySupporter ? "✓ You can offer rewards" : hasPendingApplication ? "Application submitted" : "Application approved!",
            isAlreadySupporter ? "✓ You can create listings" : "We'll notify you when reviewed",
            isAlreadySupporter ? "✓ Full supporter access" : "Check back soon",
          ]
        : [
            "Offer rewards like meals, showers, or stays",
            "Create listings for help (e.g., dishwashing)",
            "Support the community",
            "Requires admin approval",
          ],
      icon: Gift,
      color: "bg-swap-gold/20 text-swap-gold border-swap-gold/30",
      selectedColor: "bg-swap-gold/30 border-swap-gold ring-2 ring-swap-gold",
      disabled: false,
    },
  ];

  if (checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            const showStatusBadge = option.type === "supporter" && (isAlreadySupporter || hasPendingApplication || hasApprovedApplication);
            
            return (
              <Card
                key={option.type}
                onClick={() => !option.disabled && setSelectedType(option.type)}
                className={cn(
                  "cursor-pointer transition-all duration-200 border-2 relative",
                  option.disabled && "opacity-50 cursor-not-allowed",
                  isSelected ? option.selectedColor : "border-border/50 hover:border-border"
                )}
              >
                {showStatusBadge && (
                  <div className={cn(
                    "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                    isAlreadySupporter ? "bg-swap-green/20 text-swap-green" :
                    hasPendingApplication ? "bg-swap-gold/20 text-swap-gold" :
                    "bg-swap-green/20 text-swap-green"
                  )}>
                    <CheckCircle2 className="w-3 h-3" />
                    {isAlreadySupporter ? "Active" : hasPendingApplication ? "Pending" : "Approved"}
                  </div>
                )}
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
              {selectedType === "supporter" ? "Continuing..." : "Setting up your account..."}
            </>
          ) : (
            <>
              {selectedType === "supporter" 
                ? (isAlreadySupporter || hasPendingApplication || hasApprovedApplication) 
                  ? "Continue to Home" 
                  : "Continue to Application"
                : "Continue"
              }
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {selectedType === "supporter" 
            ? (isAlreadySupporter 
                ? "You already have supporter access" 
                : hasPendingApplication 
                  ? "Your application is being reviewed"
                  : hasApprovedApplication
                    ? "Your supporter access is ready!"
                    : "Supporter accounts require admin approval"
              )
            : "You can change this later in your settings"}
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
