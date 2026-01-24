import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface DiscordConnectionCardProps {
  discordUserId: string | null;
  discordUsername: string | null;
  discordGlobalName: string | null;
  discordAvatarUrl: string | null;
  discordLinkedAt: string | null;
  onDisconnected: () => void;
}

export function DiscordConnectionCard({
  discordUserId,
  discordUsername,
  discordGlobalName,
  discordAvatarUrl,
  discordLinkedAt,
  onDisconnected,
}: DiscordConnectionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disconnecting, setDisconnecting] = useState(false);

  const isConnected = !!discordUserId;
  const displayName = discordGlobalName || (discordUsername ? `@${discordUsername}` : null);

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
      const { error } = await supabase
        .from('profiles')
        .update({
          discord_user_id: null,
          discord_username: null,
          discord_global_name: null,
          discord_avatar_url: null,
          discord_linked_at: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Disconnected" });
      onDisconnected();
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
                <AvatarImage src={discordAvatarUrl || undefined} alt="Discord avatar" />
                <AvatarFallback className="bg-[#5865F2]/20 text-[#5865F2]">
                  {discordUsername?.[0]?.toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                {discordGlobalName && discordUsername && (
                  <p className="text-sm text-muted-foreground truncate">@{discordUsername}</p>
                )}
              </div>
              <Badge variant="outline" className="border-[#5865F2]/50 text-[#5865F2]">
                Connected
              </Badge>
            </div>

            {discordLinkedAt && (
              <p className="text-xs text-muted-foreground">
                Connected on {new Date(discordLinkedAt).toLocaleDateString()}
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
