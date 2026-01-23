import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DiscordLinkError() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "unknown";

  const reasonLabel: Record<string, string> = {
    user_cancelled: "You cancelled the connection process.",
    token_exchange_failed: "Discord authorization failed.",
    missing_code: "Authorization data was missing.",
    exception: "An unexpected error occurred.",
    unknown: "The connection could not be completed."
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
        <Card className="w-full border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Connection failed
            </CardTitle>
            <CardDescription className="text-base">
              We couldn’t connect your Discord account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">
                Reason
              </div>
              <div className="mt-1 text-base font-medium">
                {reasonLabel[reason] ?? reasonLabel.unknown}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 w-full sm:w-auto">
                <Link to="/settings">Try again</Link>
              </Button>

              <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
                <Link to="/">Back to SWAP</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              If the problem persists, please contact support or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
