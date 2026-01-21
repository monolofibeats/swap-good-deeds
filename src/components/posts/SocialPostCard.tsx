import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShareButton } from "@/components/shared/ShareButton";
import { PostDetailDialog } from "./PostDetailDialog";
import { Sparkles, User, Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SocialPostCardProps {
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
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const { user } = useAuth();
  const [author, setAuthor] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch author
      const { data: authorData } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, level")
        .eq("user_id", post.user_id)
        .single();
      setAuthor(authorData);

      // Fetch like count
      const { count: likes } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      setLikeCount(likes || 0);

      // Fetch comment count
      const { count: comments } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      setCommentCount(comments || 0);

      // Check if current user liked
      if (user) {
        const { data: userLike } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsLiked(!!userLike);
      }
    };
    fetchData();
  }, [post.user_id, post.id, user]);

  const handleQuickLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (isLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: post.id, user_id: user.id });
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  return (
    <>
      <Card className="overflow-hidden cursor-pointer card-hover" onClick={() => setIsDetailOpen(true)}>
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

        {/* Media */}
        {post.media_urls.length > 0 && (
          <div className="relative aspect-square bg-muted">
            <img
              src={post.media_urls[currentImageIndex]}
              alt="Post media"
              className="w-full h-full object-cover"
            />
            {/* Carousel dots */}
            {post.media_urls.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.media_urls.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImageIndex
                        ? "bg-primary w-4"
                        : "bg-foreground/40 hover:bg-foreground/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-3 flex items-center gap-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleQuickLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <MessageCircle className="h-5 w-5" />
            {commentCount > 0 && <span className="text-sm">{commentCount}</span>}
          </Button>
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            <ShareButton
              url={`${window.location.origin}/post/${post.id}`}
              title={post.caption || "Check out this post on SWAP!"}
            />
          </div>
        </div>

        {/* Caption & Reward Status */}
        <div className="p-4 space-y-2">
          {post.caption && (
            <p className="text-sm leading-relaxed line-clamp-2">
              <span className="font-medium">{author?.display_name || "Anonymous"}</span>{" "}
              {post.caption}
            </p>
          )}
          {post.status === "rewarded" && post.points_awarded && post.points_awarded > 0 && (
            <Badge className="bg-swap-gold text-background gap-1">
              <Sparkles className="h-3 w-3" />
              Got rewarded: +{post.points_awarded} pts
            </Badge>
          )}
        </div>
      </Card>

      <PostDetailDialog
        post={post}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
};