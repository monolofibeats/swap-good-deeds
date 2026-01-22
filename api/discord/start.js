export default async function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  // optional: if coming from Discord bot, we pass discord_id to enforce same account
  const { discord_id, guild_id } = req.query;

  const state = Buffer.from(
    JSON.stringify({ discord_id: discord_id || null, guild_id: guild_id || null, t: Date.now() })
  ).toString("base64url");

  const scope = encodeURIComponent("identify");
  const authUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}`;

  res.writeHead(302, { Location: authUrl });
  res.end();
}
