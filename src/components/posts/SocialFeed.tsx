import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SocialPostCard } from "./SocialPostCard";
import { CreatePostDialog } from "./CreatePostDialog";
import { Loader2 } from "lucide-react";

export const SocialFeed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .in("status", ["published", "rewarded"])
      .order("created_at", { ascending: false })
      .limit(50);
    
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Posts</h3>
        <CreatePostDialog onPostCreated={fetchPosts} />
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};