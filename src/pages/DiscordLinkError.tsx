import { Link, useSearchParams } from "react-router-dom";

export default function DiscordLinkError() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "unknown_error";

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Discord connect failed ❌</h1>
      <p style={{ marginTop: 12, opacity: 0.9 }}>
        Reason: <code>{reason}</code>
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <Link to="/settings" style={{ textDecoration: "underline" }}>
          Try again
        </Link>
        <Link to="/" style={{ textDecoration: "underline" }}>
          Back to SWAP
        </Link>
      </div>
    </div>
  );
}
