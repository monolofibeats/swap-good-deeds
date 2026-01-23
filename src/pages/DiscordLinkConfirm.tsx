import { useSearchParams, Link, useNavigate } from "react-router-dom";

export default function DiscordLinkConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const username = params.get("discord_username");
  const globalName = params.get("discord_global_name");
  const avatarUrl = params.get("discord_avatar_url");

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Confirm Discord Link</h1>
      <p style={{ marginTop: 12, opacity: 0.9 }}>
        We found this Discord account:
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Discord avatar" width={56} height={56} style={{ borderRadius: 12 }} />
        ) : null}
        <div>
          <div style={{ fontWeight: 700 }}>{globalName || username || "Unknown user"}</div>
          <div style={{ opacity: 0.8 }}>{username ? `@${username}` : ""}</div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate("/link/discord/success")}
          style={{ padding: "10px 14px", borderRadius: 10 }}
        >
          Looks good
        </button>

        <Link to="/link/discord/error?reason=user_cancelled" style={{ alignSelf: "center", textDecoration: "underline" }}>
          Cancel
        </Link>
      </div>

      <p style={{ marginTop: 16, opacity: 0.75 }}>
        (Next: we’ll finalize linking in your account settings.)
      </p>
    </div>
  );
}
