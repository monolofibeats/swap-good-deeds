import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Sparkles, Coins, CreditCard, Check, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromoteModalProps {
  itemType: "listing" | "quest";
  itemId: string;
  itemTitle: string;
  isOwner?: boolean;
  isPromoted?: boolean;
  children?: React.ReactNode;
}

const PROMOTION_PACKAGES = [
  { 
    id: "7-days", 
    label: "7 Days", 
    points: 500, 
    priceCents: 499, 
    description: "Perfect for quick visibility boost",
    popular: false 
  },
  { 
    id: "14-days", 
    label: "14 Days", 
    points: 800, 
    priceCents: 799, 
    description: "Great value for longer exposure",
    popular: true 
  },
  { 
    id: "30-days", 
    label: "30 Days", 
    points: 1200, 
    priceCents: 999, 
    description: "Maximum exposure at best rate",
    popular: false 
  },
];

export const PromoteModal = ({ itemType, itemId, itemTitle, isOwner = false, isPromoted = false, children }: PromoteModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("14-days");
  const [paymentMethod, setPaymentMethod] = useState<"points" | "money">("points");
  const [processing, setProcessing] = useState(false);

  const selectedPkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage)!;
  const userPoints = (profile as any)?.swap_points || 0;
  const canAffordWithPoints = userPoints >= selectedPkg.points;
  const durationDays = parseInt(selectedPackage.split("-")[0]);

  const handlePromote = async () => {
    if (!user) {
      toast({ title: "Please sign in to promote", variant: "destructive" });
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === "points") {
        if (!canAffordWithPoints) {
          toast({ title: "Not enough points", description: "Switch to money payment or earn more points!", variant: "destructive" });
          setProcessing(false);
          return;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Deduct points
        const { error: pointsError } = await supabase
          .from("profiles")
          .update({ swap_points: userPoints - selectedPkg.points })
          .eq("user_id", user.id);

        if (pointsError) throw pointsError;

        // Record transaction
        await supabase.from("points_transactions").insert({
          user_id: user.id,
          amount: -selectedPkg.points,
          transaction_type: "promotion_purchase",
          description: `Promoted ${itemType} for ${durationDays} days`,
          related_id: itemId,
        });

        // Create promotion purchase record
        await supabase.from("promotion_purchases").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          payment_type: "points",
          points_spent: selectedPkg.points,
          duration_days: durationDays,
          expires_at: expiresAt.toISOString(),
          status: "active",
        });

        // Update item to promoted
        const table = itemType === "listing" ? "listings" : "quests";
        await supabase.from(table).update({
          is_promoted: true,
          promoted_at: new Date().toISOString(),
          promotion_expires_at: expiresAt.toISOString(),
        }).eq("id", itemId);

        toast({ title: "Promotion activated!", description: `Your ${itemType} is now featured for ${durationDays} days!` });
        setOpen(false);
        window.location.reload();
      } else {
        // Stripe checkout - redirect to Stripe
        toast({ title: "Redirecting to payment...", description: "Please complete payment to activate promotion." });
        
        // TODO: Create Stripe checkout session edge function for promotions
        // For now, show coming soon
        toast({ title: "Coming soon!", description: "Stripe payments for promotions will be available shortly. Use points for now!", variant: "default" });
      }
    } catch (error: any) {
      console.error("Promotion error:", error);
      toast({ title: "Promotion failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (isPromoted) {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <Sparkles className="h-4 w-4 text-swap-gold" />
        Already Promoted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 border-swap-gold/50 hover:bg-swap-gold/10 hover:border-swap-gold">
            <Rocket className="h-4 w-4 text-swap-gold" />
            Boost Visibility
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-swap-gold" />
            Promote Your {itemType === "listing" ? "Listing" : "Quest"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits */}
          <Card className="bg-gradient-to-br from-swap-gold/10 to-swap-earth/10 border-swap-gold/30">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-swap-gold" />
                Promotion Benefits
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-swap-green" /> Pinned to top of feeds</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-swap-green" /> "Promoted" badge for visibility</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-swap-green" /> Priority in search results</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-swap-green" /> More views, more responses</li>
              </ul>
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Duration</Label>
            <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage} className="space-y-2">
              {PROMOTION_PACKAGES.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPackage === pkg.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={pkg.id} id={pkg.id} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pkg.label}</span>
                        {pkg.popular && (
                          <Badge className="bg-swap-gold text-background text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{pkg.points} pts</div>
                    <div className="text-xs text-muted-foreground">or ${(pkg.priceCents / 100).toFixed(2)}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={paymentMethod === "points" ? "default" : "outline"}
                className="gap-2 h-auto py-3"
                onClick={() => setPaymentMethod("points")}
              >
                <Coins className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Points</div>
                  <div className="text-xs opacity-80">{userPoints.toLocaleString()} available</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "money" ? "default" : "outline"}
                className="gap-2 h-auto py-3"
                onClick={() => setPaymentMethod("money")}
              >
                <CreditCard className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Card</div>
                  <div className="text-xs opacity-80">${(selectedPkg.priceCents / 100).toFixed(2)}</div>
                </div>
              </Button>
            </div>
            {paymentMethod === "points" && !canAffordWithPoints && (
              <p className="text-sm text-destructive">
                You need {selectedPkg.points - userPoints} more points. Switch to card payment or earn more points!
              </p>
            )}
          </div>

          {/* Promote Button */}
          <Button 
            onClick={handlePromote} 
            className="w-full gap-2 bg-gradient-to-r from-swap-gold to-swap-earth hover:opacity-90"
            disabled={processing || (paymentMethod === "points" && !canAffordWithPoints)}
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Promote for {selectedPkg.points} Points
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
