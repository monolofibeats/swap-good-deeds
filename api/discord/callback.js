export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const stateB64 = req.query.state || "";

    if (!code) {
      return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=missing_code`);
    }

    const state = stateB64
      ? JSON.parse(Buffer.from(stateB64, "base64url").toString("utf8"))
      : null;

    const targetUserId = state?.user_id;
    if (!targetUserId) {
      return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=missing_state_user`);
    }

    // Safety: ensure required envs exist (prevents silent crashes)
    const required = [
      "DISCORD_CLIENT_ID",
      "DISCORD_CLIENT_SECRET",
      "DISCORD_REDIRECT_URI",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "APP_BASE_URL",
      "SITE_URL",
      "BOT_API_URL",
      "SWAP_INTERNAL_SECRET",
      "DISCORD_ROLE_LINKED_ID",
    ];
    for (const k of required) {
      if (!process.env[k]) {
        return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=missing_env_${k}`);
      }
    }

    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    const token = await tokenRes.json();
    if (!token?.access_token) {
      return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=token_exchange_failed`);
    }

    // Fetch discord user
    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const discord = await meRes.json();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Prevent linking this discord to a different SWAP user
    const conflictRes = await fetch(
  `${supabaseUrl}/rest/v1/users?discord_user_id=eq.${discord.id}&select=auth_user_id`,
  { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
);
const conflict = await conflictRes.json();
if (conflict?.[0]?.auth_user_id && String(conflict[0].auth_user_id) !== String(targetUserId)) {
  return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=discord_already_linked`);
}


    // Update intended user (no auto-create)
    // Update intended user (no auto-create) + VERIFY it actually updated
const updateRes = await fetch(`${supabaseUrl}/rest/v1/users?auth_user_id=eq.${targetUserId}`, {
  method: "PATCH",
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    discord_user_id: discord.id,
    discord_username: discord.username,
    discord_global_name: discord.global_name || null,
    discord_avatar_url: discord.avatar
      ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
      : null,
    discord_linked_at: new Date().toISOString(),
  }),
});

const updatedRows = await updateRes.json();
if (!updateRes.ok) {
  return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=supabase_update_failed`);
}
if (!updatedRows?.length) {
  // No row matched -> auth_user_id mapping missing
  return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=no_matching_user_row`);
}


    // Assign role via bot
    await fetch(`${process.env.BOT_API_URL}/assign-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-swap-secret": process.env.SWAP_INTERNAL_SECRET,
      },
      body: JSON.stringify({
        discord_user_id: discord.id,
        role_id: process.env.DISCORD_ROLE_LINKED_ID,
      }),
    });

    // Redirect to confirm
    const params = new URLSearchParams({
      user_id: String(targetUserId),
      discord_username: discord.username || "",
      discord_global_name: discord.global_name || "",
      discord_avatar_url: discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
        : "",
    });

    return res.redirect(302, `${process.env.APP_BASE_URL}/link/discord/confirm?${params.toString()}`);
  } catch (e) {
    return res.redirect(302, `${process.env.SITE_URL}/link/discord/error?reason=exception`);
  }
}
