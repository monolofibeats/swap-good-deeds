import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DiscordLinkSuccess() {
  const [params] = useSearchParams();
  const username = params.get("username");

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
        <Card className="w-full border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Discord connected
            </CardTitle>
            <CardDescription className="text-base">
              Your account has been successfully linked.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">
                Connected account
              </div>
              <div className="mt-1 text-lg font-medium">
                {username ? `@${username}` : "Discord user"}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link to="/settings">Go to settings</Link>
              </Button>

              <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
                <Link to="/">Back to SWAP</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              You can safely close this tab. Your Discord roles and perks will update automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
