import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, User } from "lucide-react";
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
    created_at: string;
  };
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const [author, setAuthor] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchAuthor = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, level")
        .eq("user_id", post.user_id)
        .single();
      setAuthor(data);
    };
    fetchAuthor();
  }, [post.user_id]);

  return (
    <Card className="overflow-hidden">
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
        {post.status === "rewarded" && post.points_awarded && post.points_awarded > 0 && (
          <Badge className="bg-swap-gold text-background gap-1">
            <Sparkles className="h-3 w-3" />
            +{post.points_awarded} pts
          </Badge>
        )}
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
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentImageIndex
                      ? "bg-primary w-4"
                      : "bg-primary/40 hover:bg-primary/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="p-4">
          <p className="text-sm leading-relaxed">
            <span className="font-medium">{author?.display_name || "Anonymous"}</span>{" "}
            {post.caption}
          </p>
        </div>
      )}
    </Card>
  );
};