import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.redirect(
      302,
      `${process.env.SITE_URL}/link/discord/error?reason=missing_code`
    );
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const token = await tokenRes.json();

    if (!token.access_token) {
      return res.redirect(
        302,
        `${process.env.SITE_URL}/link/discord/error?reason=token_exchange_failed`
      );
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const user = await userRes.json();

    const username = encodeURIComponent(
      `${user.username}${user.discriminator !== "0" ? "#" + user.discriminator : ""}`
    );

    // TODO: Supabase user linking happens later

    return res.redirect(
      302,
      `${process.env.SITE_URL}/link/discord/success?username=${username}`
    );
  } catch (err) {
    return res.redirect(
      302,
      `${process.env.SITE_URL}/link/discord/error?reason=exception`
    );
  }
}
