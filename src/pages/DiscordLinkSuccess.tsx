import { Link, useSearchParams } from "react-router-dom";

export default function DiscordLinkSuccess() {
  const [params] = useSearchParams();
  const username = params.get("username");

  return (
    <div style={{ padding: 24 }}>
      <h1>Discord connected ✅</h1>
      <p>
        {username
          ? <>Connected as <b>{username}</b>.</>
          : "Your Discord account is now linked."}
      </p>

      <Link to="/">Back to SWAP</Link>
    </div>
  );
}
