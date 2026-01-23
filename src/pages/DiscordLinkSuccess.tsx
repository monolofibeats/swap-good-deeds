import { Link, useSearchParams } from "react-router-dom";

export default function DiscordLinkSuccess() {
  const [params] = useSearchParams();
  const username = params.get("username");

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Discord connected</h1>
      <p style={{ marginTop: 12, opacity: 0.9 }}>
        {username ? (
          <>Connected as <b>{username}</b>. You can close this tab.</>
        ) : (
          <>You can close this tab and go back to SWAP.</>
        )}
      </p>

      <div style={{ marginTop: 18 }}>
        <Link to="/" style={{ textDecoration: "underline" }}>
          Back to SWAP
        </Link>
      </div>
    </div>
  );
}
