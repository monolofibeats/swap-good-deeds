import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatorCardProps {
  creatorUserId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  itemType: "quest" | "listing";
  itemId: string;
  itemTitle: string;
}

export const CreatorCard = ({
  creatorUserId,
  displayName,
  username,
  avatarUrl,
  itemType,
  itemId,
  itemTitle,
}: CreatorCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const isOwnItem = user?.id === creatorUserId;

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    
    const { data, error } = await supabase.functions.invoke("send-contact-notification", {
      body: {
        recipientUserId: creatorUserId,
        senderUserId: user.id,
        itemType,
        itemId,
        itemTitle,
        message: message.trim(),
      },
    });

    setSending(false);

    if (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message sent!",
        description: "They've been notified and will see your message in their inbox.",
      });
      setDialogOpen(false);
      setMessage("");
      
      // Navigate to the conversation
      if (data?.conversationId) {
        navigate("/messages");
      }
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            {username && (
              <p className="text-sm text-muted-foreground">@{username}</p>
            )}
          </div>
        </div>

        {!isOwnItem && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4 gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send a message to {displayName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  About: <span className="font-medium text-foreground">{itemTitle}</span>
                </p>
                <Textarea
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="w-full" 
                  disabled={!message.trim() || sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isOwnItem && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            This is your {itemType}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
