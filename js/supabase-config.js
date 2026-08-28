// Supabase Client Initialization
// Configure your Supabase credentials here or through environment settings
const DEFAULT_SUPABASE_URL = (typeof window !== 'undefined' && window.ENV_SUPABASE_URL) ? window.ENV_SUPABASE_URL : "";
const DEFAULT_SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV_SUPABASE_KEY) ? window.ENV_SUPABASE_KEY : "";


// Normalize Supabase URL if dashboard URL is entered by mistake
function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_SUPABASE_URL;
  let url = rawUrl.trim();
  if (!url || url === 'undefined' || url === 'null' || url.includes('your-project-ref')) {
    return DEFAULT_SUPABASE_URL;
  }
  if (url.includes('supabase.com/dashboard/project/')) {
    const parts = url.split('/project/');
    if (parts[1]) {
      const ref = parts[1].split('/')[0].split('?')[0];
      url = `https://${ref}.supabase.co`;
    }
  }
  return url;
}

// Use custom settings if configured in localStorage or default fallback
function getSupabaseCredentials() {
  let storedUrl = localStorage.getItem('supabase_url');
  let storedKey = localStorage.getItem('supabase_key');

  if (!storedUrl || storedUrl === 'undefined' || storedUrl === 'null' || storedUrl.includes('your-project-ref')) {
    storedUrl = DEFAULT_SUPABASE_URL;
  }
  if (!storedKey || storedKey === 'undefined' || storedKey === 'null' || storedKey.includes('your-supabase-anon-public-key')) {
    storedKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  const url = normalizeSupabaseUrl(storedUrl);
  const key = storedKey.trim();
  return { url, key };
}

let supabaseClient = null;

function initSupabase() {
  const { url, key } = getSupabaseCredentials();

  const createClientFn = (window.supabase && window.supabase.createClient) ||
                         (window.supabaseClient && window.supabaseClient.createClient) ||
                         (typeof window.createClient === 'function' ? window.createClient : null);

  if (createClientFn && url && key) {
    try {
      supabaseClient = createClientFn(url, key);
      console.log("[Supabase] Connected to Cloud Backend:", url);
    } catch (e) {
      console.error("[Supabase] Could not initialize client with credentials:", e);
      supabaseClient = null;
    }
  } else {
    console.warn("[Supabase] Operating in local mode. CDN function:", !!createClientFn, "URL:", url);
    supabaseClient = null;
  }
  return supabaseClient;
}


