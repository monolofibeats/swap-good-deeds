import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, User, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserResult {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
  existingConversations: { participants?: { user_id: string }[] }[];
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated,
  existingConversations,
}: NewConversationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [recentChats, setRecentChats] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load recent chat participants when dialog opens
  useEffect(() => {
    if (open) {
      loadRecentChats();
    }
  }, [open]);

  const loadRecentChats = async () => {
    // Get unique participants from existing conversations
    const participantIds = new Set<string>();
    existingConversations.forEach((conv) => {
      conv.participants?.forEach((p) => {
        if (p.user_id !== user?.id) {
          participantIds.add(p.user_id);
        }
      });
    });

    if (participantIds.size === 0) return;

    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", Array.from(participantIds))
      .limit(10);

    if (data) {
      setRecentChats(data);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    // Search by username or display_name
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .neq("user_id", user?.id)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    setSearching(false);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  const startConversation = async (targetUser: UserResult) => {
    if (!user) return;

    setCreating(true);

    // Check if conversation already exists
    for (const conv of existingConversations) {
      const hasTarget = conv.participants?.some((p) => p.user_id === targetUser.user_id);
      if (hasTarget && conv.participants?.length === 2) {
        // Conversation already exists, just open it
        // We need to find the conversation ID - fetch it
        const { data: participation } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id);

        if (participation) {
          for (const p of participation) {
            const { data: otherPart } = await supabase
              .from("conversation_participants")
              .select("user_id")
              .eq("conversation_id", p.conversation_id)
              .eq("user_id", targetUser.user_id)
              .single();

            if (otherPart) {
              const { count } = await supabase
                .from("conversation_participants")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", p.conversation_id);

              if (count === 2) {
                setCreating(false);
                onConversationCreated(p.conversation_id);
                onOpenChange(false);
                return;
              }
            }
          }
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        conversation_type: "dm",
        created_by: user.id,
        title: null,
      })
      .select()
      .single();

    if (convError) {
      toast({
        title: "Failed to create conversation",
        description: convError.message,
        variant: "destructive",
      });
      setCreating(false);
      return;
    }

    // Add participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: user.id },
      { conversation_id: newConv.id, user_id: targetUser.user_id },
    ]);

    setCreating(false);
    onConversationCreated(newConv.id);
    onOpenChange(false);
    
    toast({
      title: "Conversation started",
      description: `You can now chat with ${targetUser.display_name}`,
    });
  };

  const displayUsers = searchQuery.length >= 2 ? searchResults : recentChats;
  const showingRecent = searchQuery.length < 2 && recentChats.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="h-[300px]">
            {searching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!searching && displayUsers.length === 0 && searchQuery.length >= 2 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No users found</p>
                <p className="text-sm">Try a different username</p>
              </div>
            )}

            {!searching && displayUsers.length === 0 && searchQuery.length < 2 && recentChats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Search for users by username</p>
                <p className="text-sm">e.g., @john.doe</p>
              </div>
            )}

            {!searching && displayUsers.length > 0 && (
              <div className="space-y-1">
                {showingRecent && (
                  <p className="text-xs text-muted-foreground px-2 pb-2">Recent chats</p>
                )}
                {displayUsers.map((userResult) => (
                  <button
                    key={userResult.user_id}
                    onClick={() => startConversation(userResult)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userResult.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{userResult.display_name}</p>
                      {userResult.username && (
                        <p className="text-sm text-muted-foreground">@{userResult.username}</p>
                      )}
                    </div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
