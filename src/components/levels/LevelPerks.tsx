import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Crown,
  Sparkles,
  Gift,
  Zap,
  Palette,
  Check,
  Lock
} from "lucide-react";

interface LevelTier {
  id: string;
  min_level: number;
  max_level: number;
  tier_name: string;
  tier_color: string;
  daily_listing_limit: number;
  point_multiplier: number;
  has_themes: boolean;
  streak_bonus_eligible: boolean;
  free_code_monthly: boolean;
}

interface LevelPerksProps {
  currentLevel: number;
  currentXp: number;
}

// XP calculation helpers
const xpForLevel = (level: number) => Math.pow(level - 1, 2) * 25;
const xpForNextLevel = (level: number) => Math.pow(level, 2) * 25;

export const LevelPerks: React.FC<LevelPerksProps> = ({ currentLevel, currentXp }) => {
  const [tiers, setTiers] = useState<LevelTier[]>([]);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    const { data } = await supabase
      .from("level_tiers")
      .select("*")
      .order("min_level", { ascending: true });
    setTiers(data || []);
  };

  const currentTier = tiers.find(t => currentLevel >= t.min_level && currentLevel <= t.max_level);
  const nextTier = tiers.find(t => t.min_level > currentLevel);
  
  const xpInCurrentLevel = currentXp - xpForLevel(currentLevel);
  const xpNeededForNext = xpForNextLevel(currentLevel) - xpForLevel(currentLevel);
  const levelProgress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  const TIER_ICONS: Record<string, React.ReactNode> = {
    Starter: <Star className="h-5 w-5" />,
    Contributor: <Sparkles className="h-5 w-5" />,
    Supporter: <Gift className="h-5 w-5" />,
    Champion: <Trophy className="h-5 w-5" />,
    Legend: <Crown className="h-5 w-5" />,
  };

  return (
    <div className="space-y-6">
      {/* Current Level Card */}
      <Card className="overflow-hidden">
        <div 
          className="h-2" 
          style={{ backgroundColor: currentTier?.tier_color || '#888' }}
        />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: currentTier?.tier_color || '#888' }}
              >
                {currentLevel}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Level {currentLevel}
                  {currentTier && (
                    <Badge 
                      variant="outline" 
                      className="ml-2"
                      style={{ borderColor: currentTier.tier_color, color: currentTier.tier_color }}
                    >
                      {TIER_ICONS[currentTier.tier_name]}
                      <span className="ml-1">{currentTier.tier_name}</span>
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{currentXp.toLocaleString()} XP total</CardDescription>
              </div>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next tier at</p>
                <p className="font-semibold" style={{ color: nextTier.tier_color }}>
                  Level {nextTier.min_level}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{xpInCurrentLevel} XP</span>
              <span>{xpNeededForNext} XP to next level</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Current Perks */}
      {currentTier && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Current Perks</CardTitle>
            <CardDescription>Benefits unlocked at {currentTier.tier_name} tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Zap className="h-5 w-5 text-swap-gold" />
                <div>
                  <p className="font-medium">{currentTier.point_multiplier}x Points</p>
                  <p className="text-sm text-muted-foreground">Point multiplier</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Star className="h-5 w-5 text-swap-sky" />
                <div>
                  <p className="font-medium">{currentTier.daily_listing_limit} Listings/Day</p>
                  <p className="text-sm text-muted-foreground">Daily limit</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${currentTier.has_themes ? 'bg-primary/10' : 'bg-muted/30'}`}>
                <Palette className={`h-5 w-5 ${currentTier.has_themes ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{currentTier.has_themes ? 'Custom Themes' : 'No Themes'}</p>
                  <p className="text-sm text-muted-foreground">Profile customization</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${currentTier.streak_bonus_eligible ? 'bg-primary/10' : 'bg-muted/30'}`}>
                <Sparkles className={`h-5 w-5 ${currentTier.streak_bonus_eligible ? 'text-swap-gold' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{currentTier.streak_bonus_eligible ? 'Streak Bonuses' : 'No Streak Bonus'}</p>
                  <p className="text-sm text-muted-foreground">Daily streak rewards</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${currentTier.free_code_monthly ? 'bg-swap-gold/10' : 'bg-muted/30'} sm:col-span-2`}>
                <Gift className={`h-5 w-5 ${currentTier.free_code_monthly ? 'text-swap-gold' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{currentTier.free_code_monthly ? 'Free Monthly Code' : 'No Free Code'}</p>
                  <p className="text-sm text-muted-foreground">Get a free reward code each month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Level Tiers</CardTitle>
          <CardDescription>Unlock more perks as you level up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tiers.map((tier) => {
              const isUnlocked = currentLevel >= tier.min_level;
              const isCurrent = currentLevel >= tier.min_level && currentLevel <= tier.max_level;
              
              return (
                <div
                  key={tier.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'border-2 bg-primary/5' 
                      : isUnlocked 
                        ? 'bg-muted/30 opacity-80' 
                        : 'opacity-50'
                  }`}
                  style={{ borderColor: isCurrent ? tier.tier_color : undefined }}
                >
                  <div 
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${!isUnlocked && 'grayscale opacity-50'}`}
                    style={{ backgroundColor: tier.tier_color }}
                  >
                    {isUnlocked ? (
                      TIER_ICONS[tier.tier_name] || <Star className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{tier.tier_name}</p>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                      {isUnlocked && !isCurrent && (
                        <Check className="h-4 w-4 text-swap-leaf" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {tier.min_level} - {tier.max_level}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{tier.point_multiplier}x points</p>
                    <p className="text-muted-foreground">{tier.daily_listing_limit} listings/day</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
