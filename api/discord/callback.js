function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

async function assignLinkedRole(discordUserId) {
  const botApi = process.env.BOT_API_URL;
  const secret = process.env.SWAP_INTERNAL_SECRET;
  const roleId = process.env.DISCORD_ROLE_LINKED_ID;

  if (!botApi || !secret || !roleId) return;

  await fetch(`${botApi.replace(/\/$/, "")}/assign-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-swap-secret": secret,
    },
    body: JSON.stringify({
      discord_user_id: discordUserId,
      role_id: roleId,
    }),
  });
}

async function getDiscordUser(accessToken) {
  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return await meRes.json();
}

async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    client_secret: process.env.DISCORD_CLIENT_SECRET || "",
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  return await tokenRes.json();
}

async function updateProfileDiscordFields({ authUserId, discord }) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // IMPORTANT: Lovable Cloud uses "profiles" (not "users")
  const table = "profiles";
  const url = `${supabaseUrl}/rest/v1/${table}?user_id=eq.${encodeURIComponent(authUserId)}`;

  const patchRes = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      discord_user_id: String(discord.id),
      discord_username: discord.username || null,
      discord_global_name: discord.global_name || null,
      discord_avatar_url: discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
        : null,
      discord_linked_at: new Date().toISOString(),
      display_name_source: "discord",
      avatar_source: "discord",
    }),
  });

  const patched = await patchRes.json();

  if (!patchRes.ok) {
    const msg =
      patched?.message ||
      patched?.error ||
      `supabase_update_failed_${patchRes.status}`;
    throw new Error(msg);
  }

  return patched?.[0] || null;
}

export default async function handler(req, res) {
  try {
    const siteUrl = process.env.SITE_URL || process.env.APP_BASE_URL || "";
    const appBase = process.env.APP_BASE_URL || process.env.SITE_URL || "";

    const code = req?.query?.code;
    const stateB64 = req?.query?.state || "";

    if (!code) {
      return redirect(res, `${siteUrl}/link/discord/error?reason=missing_code`);
    }

    // Require envs that must exist for linking
    const required = [
      "DISCORD_CLIENT_ID",
      "DISCORD_CLIENT_SECRET",
      "DISCORD_REDIRECT_URI",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];
    for (const k of required) {
      if (!process.env[k]) {
        return redirect(res, `${siteUrl}/link/discord/error?reason=missing_env_${k}`);
      }
    }

    // Decode state
    const state = stateB64
      ? JSON.parse(Buffer.from(stateB64, "base64url").toString("utf8"))
      : null;

    const targetUserId = state?.user_id;
    if (!targetUserId) {
      return redirect(res, `${siteUrl}/link/discord/error?reason=missing_state_user`);
    }

    // Exchange code -> token
    const token = await exchangeCodeForToken(code);
    if (!token?.access_token) {
      return redirect(res, `${siteUrl}/link/discord/error?reason=token_exchange_failed`);
    }

    // Fetch discord identity
    const discord = await getDiscordUser(token.access_token);
    if (!discord?.id) {
      return redirect(res, `${siteUrl}/link/discord/error?reason=discord_user_fetch_failed`);
    }

    // Persist in DB (Lovable Cloud: profiles table)
    await updateProfileDiscordFields({ authUserId: targetUserId, discord });

    // Assign role (non-blocking)
    try {
      await assignLinkedRole(String(discord.id));
    } catch (_) {}

    // Redirect to confirm page (IMPORTANT: include discord_user_id so frontend doesn't write NULL)
    const qs = new URLSearchParams({
      user_id: String(targetUserId),
      discord_user_id: String(discord.id),
      discord_username: discord.username || "",
      discord_global_name: discord.global_name || "",
      discord_avatar_url: discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
        : "",
    });

    return redirect(res, `${appBase}/link/discord/confirm?${qs.toString()}`);
  } catch (e) {
    const siteUrl = process.env.SITE_URL || process.env.APP_BASE_URL || "";
    return redirect(res, `${siteUrl}/link/discord/error?reason=exception`);
  }
}
