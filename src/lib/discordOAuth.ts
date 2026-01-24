/**
 * Discord OAuth utility functions
 */

interface DiscordOAuthState {
  user_id: string;
  return_to: string;
  t: number;
}

/**
 * Encodes state as base64url JSON
 */
function encodeState(state: DiscordOAuthState): string {
  const json = JSON.stringify(state);
  // Use base64url encoding (URL-safe)
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds the Discord OAuth authorize URL
 */
export function buildDiscordAuthorizeUrl(userId: string, returnTo: string = '/settings'): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const authorizeUrl = import.meta.env.VITE_DISCORD_AUTHORIZE_URL || 'https://discord.com/oauth2/authorize';
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;
  const scopes = import.meta.env.VITE_DISCORD_SCOPES || 'identify';

  if (!clientId || !redirectUri) {
    console.error('Missing Discord OAuth environment variables');
    return '';
  }

  const state: DiscordOAuthState = {
    user_id: userId,
    return_to: returnTo,
    t: Date.now(),
  };

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    prompt: 'consent',
    state: encodeState(state),
  });

  return `${authorizeUrl}?${params.toString()}`;
}

/**
 * Checks if Discord OAuth is configured
 */
export function isDiscordOAuthConfigured(): boolean {
  return !!(
    import.meta.env.VITE_DISCORD_CLIENT_ID &&
    import.meta.env.VITE_DISCORD_REDIRECT_URI
  );
}
