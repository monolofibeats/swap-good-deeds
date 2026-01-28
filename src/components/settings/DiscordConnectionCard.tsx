import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Link2, Link2Off } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildDiscordAuthorizeUrl, isDiscordOAuthConfigured } from "@/lib/discordOAuth";
import { useUserRow, useInvalidateUserRow } from "@/hooks/useUserRow";
import { disconnectProfileDiscord } from "@/lib/userProfile";

export function DiscordConnectionCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disconnecting, setDisconnecting] = useState(false);
  
  const { data: userRow, isLoading } = useUserRow(user?.id);
  const invalidateUserRow = useInvalidateUserRow();

  const isConnected = !!userRow?.discord_user_id;
  const displayName = userRow?.discord_global_name || (userRow?.discord_username ? `@${userRow.discord_username}` : null);

  const handleConnect = () => {
    if (!user) return;
    
    if (!isDiscordOAuthConfigured()) {
      toast({
        title: "Discord not configured",
        description: "Discord OAuth is not configured for this application.",
        variant: "destructive",
      });
      return;
    }

    const authorizeUrl = buildDiscordAuthorizeUrl(user.id, '/settings');
    if (authorizeUrl) {
      window.location.href = authorizeUrl;
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    
    setDisconnecting(true);
    try {
      const result = await disconnectProfileDiscord(supabase, user.id);

      if (!result.success) throw new Error(result.error);

      toast({ title: "Disconnected" });
      invalidateUserRow(user.id);
    } catch (error: any) {
      toast({
        title: "Failed to disconnect",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#5865F2]" />
            Discord
          </CardTitle>
          <CardDescription>
            Connecting Discord enables role sync and perks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-muted/20">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#5865F2]" />
          Discord
        </CardTitle>
        <CardDescription>
          Connecting Discord enables role sync and perks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-muted/20">
              <Avatar className="h-12 w-12 border border-border/60">
                <AvatarImage src={userRow?.discord_avatar_url || undefined} alt="Discord avatar" />
                <AvatarFallback className="bg-[#5865F2]/20 text-[#5865F2]">
                  {userRow?.discord_username?.[0]?.toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                {userRow?.discord_global_name && userRow?.discord_username && (
                  <p className="text-sm text-muted-foreground truncate">@{userRow.discord_username}</p>
                )}
              </div>
              <Badge variant="outline" className="border-[#5865F2]/50 text-[#5865F2]">
                Connected
              </Badge>
            </div>

            {userRow?.discord_linked_at && (
              <p className="text-xs text-muted-foreground">
                Connected on {new Date(userRow.discord_linked_at).toLocaleDateString()}
              </p>
            )}

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2" disabled={disconnecting}>
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Off className="h-4 w-4" />
                  )}
                  Disconnect Discord
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Discord account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will unlink your Discord account from SWAP. You can reconnect anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect}>
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <div className="p-4 rounded-lg border border-dashed border-border/60 bg-muted/10">
              <p className="text-sm text-muted-foreground text-center">
                No Discord account connected
              </p>
            </div>

            <Button onClick={handleConnect} className="w-full gap-2">
              <Link2 className="h-4 w-4" />
              Connect Discord
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
