import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserDiscordFields } from "@/lib/userProfile";

function safeText(v: string | null) {
  return (v ?? "").trim();
}

export default function DiscordLinkConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();

  const data = useMemo(() => {
    const discordUserId = safeText(params.get("discord_user_id"));
    const discordUsername = safeText(params.get("discord_username"));
    const discordGlobalName = safeText(params.get("discord_global_name"));
    const avatarUrl = safeText(params.get("discord_avatar_url"));
    const userId = safeText(params.get("user_id"));

    const displayName = discordGlobalName || (discordUsername ? `@${discordUsername}` : "Discord account");
    const secondary = discordGlobalName && discordUsername ? `@${discordUsername}` : "";

    return { discordUserId, discordUsername, discordGlobalName, avatarUrl, userId, displayName, secondary };
  }, [params]);

  // Check for missing required params
  useEffect(() => {
    if (!data.discordUsername && !data.discordGlobalName) {
      navigate("/link/discord/error?reason=missing_params");
    }
  }, [data, navigate]);

  const onConfirm = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to connect your Discord account.",
        variant: "destructive",
      });
      return;
    }

    // Verify user_id matches current user
    if (data.userId && data.userId !== user.id) {
      toast({
        title: "User mismatch",
        description: "This link was intended for a different account.",
        variant: "destructive",
      });
      navigate("/link/discord/error?reason=user_mismatch");
      return;
    }

    setConfirming(true);
    try {
      // Update the users table (auth_user_id matches user.id)
      const result = await updateUserDiscordFields(supabase, user.id, {
        discord_user_id: data.discordUserId || null,
        discord_username: data.discordUsername || null,
        discord_global_name: data.discordGlobalName || null,
        discord_avatar_url: data.avatarUrl || null,
        discord_linked_at: new Date().toISOString(),
      });

      if (!result.success) throw new Error(result.error);

      // Invalidate the user row cache so Settings page refetches
      queryClient.invalidateQueries({ queryKey: ['usersRow', user.id] });
      
      // Also refresh the profile context if needed
      await refreshProfile();
      
      const qs = data.discordUsername ? `?username=${encodeURIComponent(data.discordUsername)}` : "";
      navigate(`/link/discord/success${qs}`);
    } catch (error: any) {
      console.error("Discord link error:", error);
      toast({
        title: "Failed to connect",
        description: error.message,
        variant: "destructive",
      });
      navigate("/link/discord/error?reason=exception");
    } finally {
      setConfirming(false);
    }
  };

  const onCancel = () => {
    navigate("/link/discord/error?reason=user_cancelled");
  };

  // Early return if missing params (useEffect will redirect)
  if (!data.discordUsername && !data.discordGlobalName) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
        <Card className="w-full border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Confirm Discord connection
            </CardTitle>
            <CardDescription className="text-base">
              Review the account below before continuing.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {data.avatarUrl ? (
                    <img
                      src={data.avatarUrl}
                      alt="Discord avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      SWAP
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg font-medium">{data.displayName}</div>
                  {data.secondary ? (
                    <div className="truncate text-sm text-muted-foreground">{data.secondary}</div>
                  ) : null}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-4">
                  <span>Connection</span>
                  <span className="text-foreground/90">Discord to SWAP</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Data used</span>
                  <span className="text-foreground/90">Name and avatar</span>
                </div>

                {data.userId ? (
                  <div className="flex items-center justify-between gap-4">
                    <span>Reference</span>
                    <span className="truncate font-mono text-xs text-foreground/80">{data.userId}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={onConfirm}
                  disabled={confirming}
                  className="h-11 w-full sm:w-auto"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

                <Button
                  onClick={onCancel}
                  variant="secondary"
                  disabled={confirming}
                  className="h-11 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                If this does not look right, cancel and connect again with the correct Discord account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
