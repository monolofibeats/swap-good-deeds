import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function safeText(v: string | null) {
  return (v ?? "").trim();
}

export default function DiscordLinkConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const data = useMemo(() => {
    const discordUsername = safeText(params.get("discord_username"));
    const discordGlobalName = safeText(params.get("discord_global_name"));
    const avatarUrl = safeText(params.get("discord_avatar_url"));
    const userId = safeText(params.get("user_id"));

    const displayName = discordGlobalName || (discordUsername ? `@${discordUsername}` : "Discord account");
    const secondary = discordGlobalName && discordUsername ? `@${discordUsername}` : "";

    return { discordUsername, discordGlobalName, avatarUrl, userId, displayName, secondary };
  }, [params]);

  const onConfirm = () => {
    // UX-first: show success immediately
    // Later you can call an API to finalize linking if needed.
    const qs = data.discordUsername ? `?username=${encodeURIComponent(data.discordUsername)}` : "";
    navigate(`/link/discord/success${qs}`);
  };

  const onCancel = () => {
    navigate("/link/discord/error?reason=user_cancelled");
  };

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
                  <span className="text-foreground/90">Discord → SWAP</span>
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
                  className="h-11 w-full sm:w-auto"
                >
                  Continue
                </Button>

                <Button
                  onClick={onCancel}
                  variant="secondary"
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
