import { SupabaseClient } from "@supabase/supabase-js";

export interface ProfileRow {
  id: string; // == auth.users.id in Lovable cloud schema
  discord_user_id: string | null;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  discord_linked_at: string | null;
  display_name_source: string | null;
  avatar_source: string | null;
}

/**
 * Fetches the profile row from the `profiles` table by id (auth user id).
 */
export async function fetchProfileById(
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
 * Updates Discord fields on the profile row (match on profiles.id).
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

/**
 * Clears Discord connection fields for a user.
 */
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
