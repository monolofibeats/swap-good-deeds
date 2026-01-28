import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string; // usually equals auth.user.id
  discord_user_id: string | null;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  discord_linked_at: string | null;
  display_name_source: string | null;
  avatar_source: string | null;
};

/**
 * Fetch profile row by auth user id (profiles.id = auth.user.id)
 */
export async function fetchProfileRowByAuthId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile row:", error);
    return null;
  }

  return (data as ProfileRow) ?? null;
}

/**
 * Update Discord fields on profile row.
 */
export async function updateProfileDiscordFields(
  supabase: SupabaseClient,
  authUserId: string,
  fields: {
    discord_user_id: string | null;
    discord_username: string | null;
    discord_global_name: string | null;
    discord_avatar_url: string | null;
    discord_linked_at: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", authUserId);

  if (error) {
    console.error("Error updating profile Discord fields:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function disconnectProfileDiscord(
  supabase: SupabaseClient,
  authUserId: string
): Promise<{ success: boolean; error?: string }> {
  return updateProfileDiscordFields(supabase, authUserId, {
    discord_user_id: null,
    discord_username: null,
    discord_global_name: null,
    discord_avatar_url: null,
    discord_linked_at: null,
  });
}

/**
 * Backwards-compatible aliases (in case other files still import "UserRow" or "users" naming)
 */
export type UserRow = ProfileRow;
export const fetchUserRowByAuthId = fetchProfileRowByAuthId;
export const updateUserDiscordFields = updateProfileDiscordFields;
export const disconnectUserDiscord = disconnectProfileDiscord;
