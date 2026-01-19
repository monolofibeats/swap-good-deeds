import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Ticket, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateEU } from "@/lib/dateUtils";

const MyCodes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { fetchRedemptions(); }, []);

  const fetchRedemptions = async () => {
    const { data } = await supabase.from("redemptions").select("*, rewards(title, partner_name)").eq("user_id", user!.id).order("created_at", { ascending: false });
    setRedemptions(data || []);
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: "Code copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Codes</h1>
          <p className="text-muted-foreground">Your redeemed reward codes</p>
        </div>
        {redemptions.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><Ticket className="h-12 w-12" /><p>No codes yet. Redeem rewards to see them here!</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{r.rewards?.title}</p>
                    <p className="text-sm text-muted-foreground">{r.rewards?.partner_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateEU(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={r.status === "issued" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                    <code className="bg-muted px-3 py-1.5 rounded font-mono text-sm">{r.code}</code>
                    <Button variant="ghost" size="icon" onClick={() => copyCode(r.code)}>
                      {copied === r.code ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyCodes;
