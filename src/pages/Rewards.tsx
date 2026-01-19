import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Utensils, Droplets, Bed, Tag, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: any = { food: Utensils, shower: Droplets, bed: Bed, discount: Tag, other: Gift };

const Rewards = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    const { data } = await supabase.from("rewards").select("*").eq("is_active", true).order("cost_points");
    setRewards(data || []);
    setLoading(false);
  };

  const handleRedeem = async (rewardId: string, cost: number) => {
    if (!profile || profile.swap_points < cost) {
      toast({ title: "Not enough SWAP Points", variant: "destructive" });
      return;
    }
    setRedeeming(rewardId);
    const { data, error } = await supabase.rpc("redeem_reward", { p_user_id: user!.id, p_reward_id: rewardId });
    setRedeeming(null);
    if (error) {
      toast({ title: "Redemption failed", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Reward redeemed!", description: `Your code: ${data}` });
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rewards</h1>
            <p className="text-muted-foreground">Redeem your points for real rewards</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{profile?.swap_points || 0}</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const Icon = categoryIcons[reward.category] || Gift;
            const canAfford = (profile?.swap_points || 0) >= reward.cost_points;
            return (
              <Card key={reward.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
                    <Badge variant="outline" className="capitalize">{reward.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reward.partner_name}</p>
                </CardHeader>
                <CardContent className="flex-1"><p className="text-sm text-muted-foreground">{reward.description}</p></CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-1"><Leaf className="h-4 w-4 text-primary" /><span className="font-bold">{reward.cost_points}</span></div>
                  <Button size="sm" disabled={!canAfford || redeeming === reward.id} onClick={() => handleRedeem(reward.id, reward.cost_points)}>
                    {redeeming === reward.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Rewards;
