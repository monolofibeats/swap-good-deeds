import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Camera, User, Trophy, Star, Copy, Check, Share2, Moon, Sun, Heart, Sparkles, MessageSquare, HelpCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Level calculation: XP needed = level^2 * 25
const calculateLevel = (xp: number) => Math.max(1, Math.floor(Math.sqrt(xp / 25)) + 1);
const xpForLevel = (level: number) => Math.pow(level - 1, 2) * 25;
const xpForNextLevel = (level: number) => Math.pow(level, 2) * 25;

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [requestingSupport, setRequestingSupport] = useState(false);
  const [supporterAppStatus, setSupporterAppStatus] = useState<string | null>(null);
  const [loadingAppStatus, setLoadingAppStatus] = useState(true);

  // Check current theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Check supporter application status
  useEffect(() => {
    const checkSupporterApp = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("supporter_applications")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setSupporterAppStatus(data?.status || null);
      setLoadingAppStatus(false);
    };
    
    checkSupporterApp();
  }, [user]);

  const currentXp = (profile as any)?.xp || 0;
  const currentLevel = (profile as any)?.level || calculateLevel(currentXp);
  const avatarUrl = (profile as any)?.avatar_url;
  const referralCode = (profile as any)?.referral_code || "LOADING";
  const currentUserType = (profile as any)?.user_type as string | null;
  
  const xpInCurrentLevel = currentXp - xpForLevel(currentLevel);
  const xpNeededForNext = xpForNextLevel(currentLevel) - xpForLevel(currentLevel);
  const levelProgress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;

  const isChangemaker = currentUserType === "helper";
  const isSupporter = currentUserType === "supporter";
  
  // Supporters always have Changemaker access (it's the base role)
  // Once a supporter, always a supporter - the role is permanent

  const requestSupport = async () => {
    if (!user) return;
    setRequestingSupport(true);
    
    try {
      // Check if user already has an open support ticket
      const { data: existingTicket } = await supabase
        .from("support_tickets")
        .select("conversation_id")
        .eq("user_id", user.id)
        .in("status", ["open", "in_progress"])
        .limit(1)
        .maybeSingle();
      
      if (existingTicket) {
        // Navigate to existing support conversation
        toast({ title: "Opening existing support chat" });
        navigate("/messages");
        return;
      }
      
      // Create a support conversation (type 'dm' to work with existing RLS)
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({
          conversation_type: "dm",
          created_by: user.id,
          title: "Support Chat",
        })
        .select()
        .single();
      
      if (convError) throw convError;
      
      // Add user as participant
      const { error: partError } = await supabase.from("conversation_participants").insert({
        conversation_id: conv.id,
        user_id: user.id,
      });
      
      if (partError) throw partError;
      
      // Create support ticket linked to this conversation
      const { error: ticketError } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        conversation_id: conv.id,
      });
      
      if (ticketError) throw ticketError;
      
      // Send initial message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_id: user.id,
        content: "Hi! I need help with something.",
      });
      
      if (msgError) throw msgError;
      
      toast({ title: "Support request created!", description: "We'll get back to you soon." });
      navigate("/messages");
    } catch (error: any) {
      console.error("Support request error:", error);
      toast({ title: "Failed to create support request", description: error.message, variant: "destructive" });
    } finally {
      setRequestingSupport(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('user_id', user.id);
    
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated!" });
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('swap-theme', newIsDark ? 'dark' : 'light');
    toast({ title: newIsDark ? "Dark mode enabled" : "Light mode enabled" });
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SWAP!',
          text: 'Earn points for good deeds and get rewards!',
          url: link,
        });
      } catch {}
    } else {
      copyReferralLink();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your avatar and display name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {profile?.display_name?.[0]?.toUpperCase() || <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Click to upload a new photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or GIF. Max 5MB.</p>
              </div>
            </div>

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
                <Button onClick={handleSaveProfile} disabled={saving || !displayName.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how SWAP looks for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {isDarkMode ? "Using dark theme for eye comfort" : "Using light theme"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Sun className={`h-4 w-4 ${!isDarkMode ? 'text-swap-gold' : 'text-muted-foreground'}`} />
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
                <Moon className={`h-4 w-4 ${isDarkMode ? 'text-swap-sky' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP & Level Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-swap-gold" />
              Level & XP
            </CardTitle>
            <CardDescription>Track your progress and unlock rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-swap-gold to-swap-earth text-2xl font-bold text-background">
                  {currentLevel}
                </div>
                <div>
                  <p className="font-semibold">Level {currentLevel}</p>
                  <p className="text-sm text-muted-foreground">{currentXp.toLocaleString()} XP total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next level at</p>
                <p className="font-semibold text-primary">{xpForNextLevel(currentLevel).toLocaleString()} XP</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{xpInCurrentLevel} XP</span>
                <span>{xpNeededForNext} XP needed</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>

            <Separator />

            {/* Level Rewards Preview */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Unlock at higher levels:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={currentLevel >= 5 ? "border-swap-gold text-swap-gold" : "opacity-50"}>
                  <Star className="h-3 w-3 mr-1" /> Level 5 Badge
                </Badge>
                <Badge variant="outline" className={currentLevel >= 10 ? "border-swap-gold text-swap-gold" : "opacity-50"}>
                  <Star className="h-3 w-3 mr-1" /> Level 10 Badge
                </Badge>
                <Badge variant="outline" className={currentLevel >= 25 ? "border-swap-gold text-swap-gold" : "opacity-50"}>
                  <Trophy className="h-3 w-3 mr-1" /> Level 25 Badge
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-swap-sky" />
              Invite Friends
            </CardTitle>
            <CardDescription>Earn 100 SWAP Points for each friend who joins!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Referral Code</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-4 py-2 rounded-md bg-muted font-mono text-lg tracking-wider">
                  {referralCode}
                </div>
                <Button variant="outline" onClick={copyReferralLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={shareReferralLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              When someone signs up using your link, you'll receive 100 SWAP Points and 200 XP!
            </p>
          </CardContent>
        </Card>

        {/* Role Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-swap-gold" />
              Your Role
            </CardTitle>
            <CardDescription>Choose how you want to participate in SWAP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {/* Changemaker Option - Base role, always active */}
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-swap-green/20 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-swap-green" />
                    </div>
                    <div>
                      <p className="font-medium">Changemaker</p>
                      <p className="text-sm text-muted-foreground">Complete quests and help with listings</p>
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-13">
                  This is your base role — all users are changemakers.
                </p>
              </div>

              {/* Supporter Option - Permanent once approved */}
              <div className={`p-4 rounded-lg border-2 transition-all ${
                isSupporter ? "border-swap-sky bg-swap-sky/5" : "border-border"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-swap-sky/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-swap-sky" />
                    </div>
                    <div>
                      <p className="font-medium">Supporter</p>
                      <p className="text-sm text-muted-foreground">Provide resources like stays, meals, etc.</p>
                    </div>
                  </div>
                  {isSupporter && (
                    <Badge className="bg-swap-sky/20 text-swap-sky border-swap-sky">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                {isSupporter ? (
                  <div className="mt-3 pt-3 border-t border-swap-sky/20">
                    <div className="flex items-center gap-2 text-sm text-swap-sky">
                      <Check className="h-4 w-4" />
                      You're an approved supporter!
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      The supporter role is permanent and cannot be removed. You can access the 
                      <Button 
                        variant="link" 
                        className="h-auto p-0 px-1 text-xs text-swap-sky"
                        onClick={() => navigate("/supporter")}
                      >
                        Supporter Dashboard
                      </Button>
                      anytime.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-border">
                    {loadingAppStatus ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking status...
                      </div>
                    ) : supporterAppStatus === "pending" ? (
                      <div className="flex items-center gap-2 text-sm text-swap-gold">
                        <AlertCircle className="h-4 w-4" />
                        Application pending review
                      </div>
                    ) : supporterAppStatus === "needs_more_info" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-swap-gold">
                          <AlertCircle className="h-4 w-4" />
                          More information requested
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate("/supporter-application")}
                        >
                          Update Application
                        </Button>
                      </div>
                    ) : supporterAppStatus === "rejected" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Previous application was not approved
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate("/supporter-application")}
                        >
                          Apply Again
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate("/supporter-application")}
                      >
                        Apply to Become a Supporter
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Becoming a supporter requires admin approval. Once approved, this role is permanent.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-swap-earth" />
              Need Help?
            </CardTitle>
            <CardDescription>Get support from the SWAP team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={requestSupport}
              variant="outline"
              className="w-full gap-2"
              disabled={requestingSupport}
            >
              {requestingSupport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Start Support Chat
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Our team will respond as soon as possible
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
