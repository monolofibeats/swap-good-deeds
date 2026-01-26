import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProfileRow {
  // In Lovable/Supabase "profiles", the primary key is usually the same UUID as auth.users.id
  id: string;

  discord_user_id: string | null;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  discord_linked_at: string | null;

  display_name_source: string | null;
  avatar_source: string | null;
}

/**
 * Fetch a single profile row by the authenticated user's id (auth.users.id).
 */
export async function fetchUserRowByAuthId(
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

  return (data as ProfileRow | null) ?? null;
}

/**
 * Update Discord fields on the current user's profile row (profiles.id = auth user id).
 */
export async function updateUserDiscordFields(
  supabase: SupabaseClient,
  authUserId: string,
  fields: Pick<
    ProfileRow,
    | "discord_user_id"
    | "discord_username"
    | "discord_global_name"
    | "discord_avatar_url"
    | "discord_linked_at"
  >
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

/**
 * Clear Discord connection fields for a user.
 */
export async function disconnectUserDiscord(
  supabase: SupabaseClient,
  authUserId: string
): Promise<{ success: boolean; error?: string }> {
  return updateUserDiscordFields(supabase, authUserId, {
    discord_user_id: null,
    discord_username: null,
    discord_global_name: null,
    discord_avatar_url: null,
    discord_linked_at: null,
  });
}
