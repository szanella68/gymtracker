// Minimal Supabase OAuth launcher (no keys on client)
(function(){
  const SUPABASE_URL = 'https://oyetlgzmnhdnjfucdtrj.supabase.co'; // set from project settings

  function buildAuthorizeUrl(provider, redirectPath) {
    const redirectTo = `${window.location.origin}/gymtracker${redirectPath || '/auth/callback.html'}`;
    const u = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
    u.searchParams.set('provider', provider);
    u.searchParams.set('redirect_to', redirectTo);
    // Optional: add scopes/state if needed
    return u.toString();
  }

  function loginWith(provider = 'google') {
    window.location.href = buildAuthorizeUrl(provider, '/auth/callback.html');
  }

  // Expose
  window.AuthSupabase = { loginWith };
})();

