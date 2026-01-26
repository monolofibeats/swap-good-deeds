import { SupabaseClient } from '@supabase/supabase-js';

export interface UserRow {
  id: string;
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
 * Fetches the user row from the `users` table by auth_user_id.
 * @param supabase - The Supabase client instance.
 * @param authUserId - The UUID from supabase.auth.user.id
 * @returns The user row or null if not found.
 */
export async function fetchUserRowByAuthId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user row:', error);
    return null;
  }

  return data as UserRow | null;
}

/**
 * Updates Discord fields on the user row.
 */
export async function updateUserDiscordFields(
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
    .from('profiles')
    .update(fields)
    .eq('id', authUserId);

  if (error) {
    console.error('Error updating user Discord fields:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Clears Discord connection fields for a user.
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
