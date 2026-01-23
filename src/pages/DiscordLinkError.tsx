import { Link, useSearchParams } from "react-router-dom";

export default function DiscordLinkError() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "unknown_error";

  return (
    <div style={{ padding: 24 }}>
      <h1>Discord connection failed ❌</h1>
      <p>Reason: {reason}</p>

      <Link to="/settings">Try again</Link>
    </div>
  );
}
