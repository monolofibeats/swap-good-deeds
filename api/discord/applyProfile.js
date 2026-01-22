export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { user_id, use_name, use_avatar, display_name, avatar_url } = req.body || {};

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const patch = {};
  if (use_name) {
    patch.display_name = display_name;
    patch.display_name_source = "discord";
  }
  if (use_avatar) {
    patch.avatar_url = avatar_url; // add this column if you use it; otherwise store discord_avatar_url only
    patch.avatar_source = "discord";
  }

  await fetch(`${url}/rest/v1/users?id=eq.${user_id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  res.json({ ok: true });
}
