import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRowByAuthId, ProfileRow } from "@/lib/userProfile";

/**
 * Hook to fetch and cache the profile/user row (Discord fields live here).
 */
export function useUserRow(authUserId: string | undefined) {
  return useQuery<ProfileRow | null>({
    queryKey: ["usersRow", authUserId],
    queryFn: async () => {
      if (!authUserId) return null;
      return fetchUserRowByAuthId(supabase, authUserId);
    },
    enabled: !!authUserId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Helper for invalidation.
 */
export function useInvalidateUserRow() {
  const queryClient = useQueryClient();
  return (authUserId: string) => {
    queryClient.invalidateQueries({ queryKey: ["usersRow", authUserId] });
  };
}
