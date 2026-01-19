import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Leaf, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Sparkles, 
  Users, 
  ShoppingCart,
  Star,
  Zap
} from "lucide-react";
import { formatDateEU } from "@/lib/dateUtils";

const TRANSACTION_ICONS: Record<string, React.ReactNode> = {
  quest_reward: <Sparkles className="h-4 w-4 text-swap-gold" />,
  listing_reward: <Gift className="h-4 w-4 text-swap-sky" />,
  referral: <Users className="h-4 w-4 text-swap-leaf" />,
  purchase: <ShoppingCart className="h-4 w-4 text-primary" />,
  redemption: <Star className="h-4 w-4 text-swap-earth" />,
  admin_adjustment: <Zap className="h-4 w-4 text-muted-foreground" />,
  streak_bonus: <TrendingUp className="h-4 w-4 text-swap-gold" />,
  level_bonus: <TrendingUp className="h-4 w-4 text-swap-sky" />,
};

const TRANSACTION_LABELS: Record<string, string> = {
  quest_reward: "Quest Reward",
  listing_reward: "Listing Reward",
  referral: "Referral Bonus",
  purchase: "Points Purchase",
  redemption: "Reward Redeemed",
  admin_adjustment: "Admin Adjustment",
  streak_bonus: "Streak Bonus",
  level_bonus: "Level Bonus",
};

const PointsHistory = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("points_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    setTransactions(data || []);
    setLoading(false);
  };

  const totalEarned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with balance */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Points History</h1>
            <p className="text-muted-foreground">Track your SWAP Points earnings and spending</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Leaf className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{profile?.swap_points?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-swap-leaf/20">
                  <TrendingUp className="h-5 w-5 text-swap-leaf" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-swap-leaf">+{totalEarned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/20">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-destructive">-{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy More Points CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-swap-gold/10 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-swap-gold" />
              Want More Points?
            </CardTitle>
            <CardDescription>
              Support our platform and get bonus points to redeem amazing rewards!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/buy-points">
              <Button className="w-full sm:w-auto">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Points
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent point activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No transactions yet</p>
                <p className="text-sm">Complete quests to start earning points!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {transactions.map((tx, index) => (
                  <div key={tx.id}>
                    <div className="flex items-center gap-4 py-3">
                      <div className="p-2 rounded-full bg-muted">
                        {TRANSACTION_ICONS[tx.transaction_type] || <Leaf className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {TRANSACTION_LABELS[tx.transaction_type] || tx.transaction_type}
                        </p>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDateEU(tx.created_at)} at{" "}
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge
                        variant={tx.amount > 0 ? "default" : "destructive"}
                        className={tx.amount > 0 ? "bg-swap-leaf/20 text-swap-leaf hover:bg-swap-leaf/30" : ""}
                      >
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                      </Badge>
                    </div>
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PointsHistory;
