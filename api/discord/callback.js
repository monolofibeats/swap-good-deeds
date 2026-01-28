export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const stateB64 = req.query.state || "";

    if (!code) {
      return res.redirect(
        302,
        `${process.env.SITE_URL}/link/discord/error?reason=missing_code`
      );
    }

    const state = stateB64
      ? JSON.parse(Buffer.from(stateB64, "base64url").toString("utf8"))
      : null;

    const targetUserId = state?.user_id;
    if (!targetUserId) {
      return res.redirect(
        302,
        `${process.env.SITE_URL}/link/discord/error?reason=missing_state_user`
      );
    }

    // Required envs (ONLY what we really need now)
    const required = [
      "DISCORD_CLIENT_ID",
      "DISCORD_CLIENT_SECRET",
      "DISCORD_REDIRECT_URI",
      "APP_BASE_URL",
      "SITE_URL",
      "BOT_API_URL",
      "SWAP_INTERNAL_SECRET",
      "DISCORD_ROLE_LINKED_ID",
    ];

    for (const k of required) {
      if (!process.env[k]) {
        return res.redirect(
          302,
          `${process.env.SITE_URL}/link/discord/error?reason=missing_env_${k}`
        );
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
      return res.redirect(
        302,
        `${process.env.SITE_URL}/link/discord/error?reason=token_exchange_failed`
      );
    }

    // Fetch Discord user
    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const discord = await meRes.json();

    // Assign role via bot (server-side secret safe here)
    try {
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
    } catch (e) {
      // role assign failure should NOT kill OAuth flow
      console.warn("assign-role failed:", e);
    }

    // Redirect to confirm page (frontend will update DB using Supabase client/session)
    const avatarUrl = discord.avatar
      ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
      : "";

    const params = new URLSearchParams({
  user_id: String(targetUserId),
  discord_user_id: String(discord.id),        // <-- DAS HIER IST DER FIX
  discord_username: discord.username || "",
  discord_global_name: discord.global_name || "",
  discord_avatar_url: discord.avatar
    ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
    : "",
});

return res.redirect(302, `${process.env.APP_BASE_URL}/link/discord/confirm?${params.toString()}`);
    );
  } catch (e) {
    return res.redirect(
      302,
      `${process.env.SITE_URL}/link/discord/error?reason=exception`
    );
  }
}
