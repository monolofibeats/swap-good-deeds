async function supabaseUpsertUser({ discord }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  await fetch(`${process.env.BOT_API_URL}/assign-role`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-swap-secret": process.env.SWAP_INTERNAL_SECRET
  },
  body: JSON.stringify({
    discord_user_id: discord.id,
    role_id: process.env.DISCORD_ROLE_LINKED_ID
  })
});


  // Find existing user by discord_user_id
  const findRes = await fetch(`${url}/rest/v1/users?discord_user_id=eq.${discord.id}&select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const found = await findRes.json();
  const existing = found?.[0] || null;

  // If none exists, create a minimal user now (auto-create requirement)
  if (!existing) {
    const createRes = await fetch(`${url}/rest/v1/users`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
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
    const created = await createRes.json();
    return created?.[0];
  }

  // Already exists → just update discord fields + linked timestamp
  await fetch(`${url}/rest/v1/users?id=eq.${existing.id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      discord_username: discord.username,
      discord_global_name: discord.global_name || null,
      discord_avatar_url: discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
        : null,
      discord_linked_at: new Date().toISOString(),
    }),
  });

  return existing;
}

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const stateB64 = req.query.state || "";
    const state = stateB64
      ? JSON.parse(Buffer.from(stateB64, "base64url").toString("utf8"))
      : { discord_id: null };

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        scope: "identify",
      }),
    });

    const token = await tokenRes.json();
    if (!token.access_token) {
      return res.status(400).json({ error: "Discord token exchange failed", token });
    }

    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const discord = await meRes.json();

    // If started from bot with discord_id, enforce same user
    if (state.discord_id && state.discord_id !== discord.id) {
      return res.status(403).send("This link was opened for a different Discord account. Please run /link again.");
    }

    const user = await supabaseUpsertUser({ discord });

    // Redirect to your frontend consent page
    const base = process.env.APP_BASE_URL || "";
    const params = new URLSearchParams({
      user_id: String(user.id),
      discord_username: discord.username || "",
      discord_global_name: discord.global_name || "",
      discord_avatar_url: discord.avatar
        ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
        : "",
    });

    res.writeHead(302, { Location: `${base}/link/discord/confirm?${params.toString()}` });
    res.end();
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
