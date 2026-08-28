// Supabase Client Initialization
const DEFAULT_SUPABASE_URL = (typeof window !== 'undefined' && window.ENV_SUPABASE_URL) ? window.ENV_SUPABASE_URL : "https://dzxodwhnkjzofhzngkaf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV_SUPABASE_KEY) ? window.ENV_SUPABASE_KEY : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eG9kd2hua2p6b2Zoem5na2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MjEzNDgsImV4cCI6MjEwMzI5NzM0OH0.6NN5auOnGqxth4U4aVCSY9mZZtj0qyKMYMMdiIhvqi8";



function isInvalidCredential(val) {
  if (!val || typeof val !== 'string') return true;
  const v = val.trim().toLowerCase();
  return (
    v === '' ||
    v === 'undefined' ||
    v === 'null' ||
    v.includes('your-project') ||
    v.includes('your-actual') ||
    v.includes('your-supabase') ||
    v.includes('example') ||
    v.includes('placeholder')
  );
}

// Normalize Supabase URL if dashboard URL is entered by mistake
function normalizeSupabaseUrl(rawUrl) {
  if (isInvalidCredential(rawUrl)) return DEFAULT_SUPABASE_URL;
  let url = rawUrl.trim();
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

  if (isInvalidCredential(storedUrl)) {
    storedUrl = DEFAULT_SUPABASE_URL;
    localStorage.removeItem('supabase_url');
  }
  if (isInvalidCredential(storedKey)) {
    storedKey = DEFAULT_SUPABASE_ANON_KEY;
    localStorage.removeItem('supabase_key');
  }

  const url = normalizeSupabaseUrl(storedUrl);
  const key = storedKey.trim();
  return { url, key };
}

let supabaseClient = null;

function initSupabase(forceDefault = false) {
  if (forceDefault) {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
  }
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


