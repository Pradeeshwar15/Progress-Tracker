// Supabase Authentication Service with Instant Fallback Engine

let currentUser = null;
let currentSession = null;

const LOCAL_AUTH_KEY = 'prepsphere_local_auth_session';

function saveLocalAuthSession(user) {
  try {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save local auth session:", e);
  }
}

function getLocalAuthSession() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearLocalAuthSession() {
  try {
    localStorage.removeItem(LOCAL_AUTH_KEY);
  } catch (e) {}
}

function createFallbackUser(email, name = null) {
  const defaultName = name || email.split('@')[0];
  const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
  return {
    id: 'user_' + String(email).replace(/[^a-zA-Z0-9]/g, '_'),
    email: email,
    user_metadata: { name: formattedName },
    isLocalFallback: true
  };
}

async function signUpUser(name, email, password) {
  initSupabase();

  if (supabaseClient) {
    const performSignUp = async () => {
      const signUpPromise = supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cloud timeout")), 3500)
      );
      return await Promise.race([signUpPromise, timeoutPromise]);
    };

    try {
      const res = await performSignUp();
      if (res && res.data && res.data.user) {
        currentUser = res.data.user;
        currentSession = res.data.session;
        clearLocalAuthSession();
        return res.data;
      }
    } catch (e) {
      console.warn("Cloud signup skipped or timed out, activating local session fallback:", e.message);
    }
  }

  // Fallback local sign up
  const localUser = createFallbackUser(email, name);
  saveLocalAuthSession(localUser);
  currentUser = localUser;
  currentSession = { user: localUser, access_token: 'local_token' };
  return { user: localUser, session: currentSession, isLocalFallback: true };
}

async function loginUser(email, password) {
  initSupabase();

  if (supabaseClient) {
    const performLogin = async () => {
      const loginPromise = supabaseClient.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cloud timeout")), 3500)
      );
      return await Promise.race([loginPromise, timeoutPromise]);
    };

    try {
      const res = await performLogin();
      if (res && res.data && res.data.user) {
        currentUser = res.data.user;
        currentSession = res.data.session;
        clearLocalAuthSession();
        return res.data;
      }
    } catch (e) {
      console.warn("Cloud login skipped or timed out, activating instant local account fallback:", e.message);
    }
  }

  // Instant local session fallback
  const localUser = createFallbackUser(email);
  saveLocalAuthSession(localUser);
  currentUser = localUser;
  currentSession = { user: localUser, access_token: 'local_token' };
  return { user: localUser, session: currentSession, isLocalFallback: true };
}

async function logoutUser() {
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {}
  }
  clearLocalAuthSession();
  currentUser = null;
  currentSession = null;
}

async function getCurrentAuthSession() {
  // Check local session first
  const localUser = getLocalAuthSession();
  if (localUser) {
    currentUser = localUser;
    currentSession = { user: localUser, access_token: 'local_token' };
  }

  if (supabaseClient) {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (!error && session) {
        currentSession = session;
        currentUser = session.user;
        clearLocalAuthSession();
        return session;
      }
    } catch (e) {
      console.warn("Could not check cloud session:", e.message);
    }
  }

  return currentSession;
}

function listenToAuthChanges(onAuthChangeCallback) {
  if (!supabaseClient) return;
  try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        currentSession = session;
        currentUser = session.user;
        clearLocalAuthSession();
      }
      if (typeof onAuthChangeCallback === 'function') {
        onAuthChangeCallback(event, currentSession);
      }
    });
  } catch (e) {}
}
