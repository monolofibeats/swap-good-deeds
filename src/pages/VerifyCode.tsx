import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, QrCode, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  valid: boolean;
  redemption?: any;
  reward?: any;
  user?: any;
  error?: string;
}

const VerifyCode = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      // Look up the redemption by code
      const { data: redemption, error: redemptionError } = await supabase
        .from("redemptions")
        .select(`
          *,
          rewards:reward_id (
            id,
            title,
            description,
            partner_name,
            category
          )
        `)
        .eq("code", code.trim().toUpperCase())
        .single();

      if (redemptionError || !redemption) {
        setResult({ valid: false, error: "Code not found" });
        setLoading(false);
        return;
      }

      // Check if already redeemed
      if (redemption.status === "redeemed") {
        setResult({ valid: false, error: "Code already redeemed", redemption });
        setLoading(false);
        return;
      }

      // Check if expired
      if (redemption.status === "expired") {
        setResult({ valid: false, error: "Code has expired", redemption });
        setLoading(false);
        return;
      }

      // Get user info
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("user_id", redemption.user_id)
        .single();

      // Check if this reward is from this supporter's partner name
      const rewardPartner = (redemption.rewards as any)?.partner_name;
      const isOwnReward = rewardPartner?.toLowerCase() === profile?.display_name?.toLowerCase();

      setResult({
        valid: true,
        redemption,
        reward: redemption.rewards,
        user: userProfile,
      });

    } catch (error: any) {
      setResult({ valid: false, error: error.message });
    }

    setLoading(false);
  };

  const markAsRedeemed = async () => {
    if (!result?.redemption) return;

    setLoading(true);

    const { error } = await supabase
      .from("redemptions")
      .update({ 
        status: "redeemed", 
        redeemed_at: new Date().toISOString() 
      })
      .eq("id", result.redemption.id);

    if (error) {
      toast({ title: "Failed to mark as redeemed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code marked as redeemed!", description: "The changemaker has used this reward." });
      setResult({
        ...result,
        redemption: { ...result.redemption, status: "redeemed" }
      });
    }

    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verify Reward Code</h1>
          <p className="text-muted-foreground">
            Enter a code to verify if it's valid and from your rewards
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Code Verification
            </CardTitle>
            <CardDescription>
              Enter the reward code shown by the changemaker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., ABC123XY)"
                className="font-mono text-lg tracking-wider"
                maxLength={20}
              />
              <Button onClick={verifyCode} disabled={loading || !code.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border-2 ${
                result.valid 
                  ? "border-swap-green bg-swap-green/10" 
                  : "border-destructive bg-destructive/10"
              }`}>
                <div className="flex items-start gap-3">
                  {result.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-swap-green flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className={`font-semibold ${result.valid ? "text-swap-green" : "text-destructive"}`}>
                        {result.valid ? "Valid Code!" : "Invalid Code"}
                      </h3>
                      {result.error && (
                        <p className="text-sm text-muted-foreground">{result.error}</p>
                      )}
                    </div>

                    {result.reward && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-md bg-background/50">
                          <p className="font-medium">{result.reward.title}</p>
                          <p className="text-sm text-muted-foreground">{result.reward.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{result.reward.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Partner: {result.reward.partner_name}
                            </span>
                          </div>
                        </div>

                        {result.user && (
                          <div className="p-3 rounded-md bg-background/50">
                            <p className="text-sm font-medium">Redeemed by:</p>
                            <p className="text-sm">
                              {result.user.display_name}
                              {result.user.username && (
                                <span className="text-muted-foreground ml-1">
                                  @{result.user.username}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <Badge 
                            variant={result.redemption?.status === "redeemed" ? "secondary" : "default"}
                            className={result.redemption?.status === "issued" ? "bg-swap-green" : ""}
                          >
                            {result.redemption?.status === "redeemed" ? "Already Used" : "Ready to Use"}
                          </Badge>

                          {result.valid && result.redemption?.status === "issued" && (
                            <Button onClick={markAsRedeemed} disabled={loading} size="sm">
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Mark as Redeemed
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VerifyCode;