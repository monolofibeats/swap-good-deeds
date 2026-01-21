import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareButton } from "@/components/shared/ShareButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Heart, MessageCircle, Send, User, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostDetailDialogProps {
  post: {
    id: string;
    user_id: string;
    caption: string | null;
    media_urls: string[];
    wants_rewards: boolean;
    status: string;
    points_awarded: number | null;
    xp_awarded: number | null;
    created_at: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const PostDetailDialog = ({ post, open, onOpenChange }: PostDetailDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [author, setAuthor] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  } | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLiked = user ? likes.includes(user.id) : false;

  useEffect(() => {
    if (open) {
      fetchAuthor();
      fetchLikes();
      fetchComments();
    }
  }, [open, post.id]);

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, level")
      .eq("user_id", post.user_id)
      .single();
    setAuthor(data);
  };

  const fetchLikes = async () => {
    const { data } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", post.id);
    setLikes(data?.map((l) => l.user_id) || []);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data) {
      // Fetch authors for comments
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      setComments(
        data.map((c) => ({
          ...c,
          author: profileMap.get(c.user_id) || null,
        }))
      );
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    setIsLiking(true);

    if (isLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      setLikes(likes.filter((id) => id !== user.id));
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: post.id, user_id: user.id });
      setLikes([...likes, user.id]);
    }

    setIsLiking(false);
  };

  const handleComment = async () => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) return;

    setIsCommenting(true);

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      setComments([...comments, { ...data, author: profile }]);
      setNewComment("");
    }

    setIsCommenting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left: Image Carousel */}
          <div className="relative bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            {post.media_urls.length > 0 && (
              <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent className="h-full">
                  {post.media_urls.map((url, i) => (
                    <CarouselItem key={i} className="h-full flex items-center justify-center">
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        className="max-h-[500px] w-auto object-contain"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {post.media_urls.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            )}
          </div>

          {/* Right: Details, Comments */}
          <div className="flex flex-col h-full max-h-[500px]">
            {/* Author header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {author?.display_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{author?.display_name || "Anonymous"}</p>
                  <Badge variant="outline" className="text-xs">
                    Lvl {author?.level || 1}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Caption & Reward Status */}
            <div className="p-4 border-b border-border space-y-2">
              {post.caption && (
                <p className="text-sm leading-relaxed">
                  <span className="font-medium">{author?.display_name || "Anonymous"}</span>{" "}
                  {post.caption}
                </p>
              )}
              {post.status === "rewarded" && post.points_awarded && post.points_awarded > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-swap-gold text-background gap-1">
                    <Sparkles className="h-3 w-3" />
                    Got rewarded: +{post.points_awarded} pts
                    {post.xp_awarded ? `, +${post.xp_awarded} XP` : ""}
                  </Badge>
                </div>
              )}
            </div>

            {/* Comments */}
            <ScrollArea className="flex-1 p-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {comment.author?.display_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{comment.author?.display_name || "Anonymous"}</span>{" "}
                          {comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 ${isLiked ? "text-red-500" : ""}`}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  {likes.length > 0 && <span>{likes.length}</span>}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <MessageCircle className="h-5 w-5" />
                  {comments.length > 0 && <span>{comments.length}</span>}
                </Button>
                <ShareButton
                  url={`${window.location.origin}/post/${post.id}`}
                  title={post.caption || "Check out this post on SWAP!"}
                />
              </div>

              {/* Comment input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={isCommenting || !newComment.trim()}
                >
                  {isCommenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};