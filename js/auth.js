// Supabase Authentication Service

let currentUser = null;
let currentSession = null;

async function signUpUser(name, email, password) {
  initSupabase();
  if (!supabaseClient) throw new Error("Supabase client is not connected. Please check your network or credentials in Settings.");

  const performSignUp = async () => {
    const signUpPromise = supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Sign up request timed out. Please check network connection.")), 12000)
    );
    return await Promise.race([signUpPromise, timeoutPromise]);
  };

  try {
    const { data, error } = await performSignUp();
    if (error) throw error;
    if (data.user) {
      currentUser = data.user;
      currentSession = data.session;
    }
    return data;
  } catch (err) {
    console.warn("First sign-up attempt failed, force resetting connection and retrying...", err);
    initSupabase(true);
    if (!supabaseClient) throw err;
    const { data, error } = await performSignUp();
    if (error) throw error;
    if (data.user) {
      currentUser = data.user;
      currentSession = data.session;
    }
    return data;
  }
}

async function loginUser(email, password) {
  initSupabase();
  if (!supabaseClient) throw new Error("Supabase client is not connected. Please check your network or credentials in Settings.");

  const performLogin = async () => {
    const loginPromise = supabaseClient.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Login request timed out. Please check network connection.")), 12000)
    );
    return await Promise.race([loginPromise, timeoutPromise]);
  };

  try {
    const { data, error } = await performLogin();
    if (error) throw error;
    currentUser = data.user;
    currentSession = data.session;
    return data;
  } catch (err) {
    console.warn("First login attempt failed, force resetting connection and retrying...", err);
    initSupabase(true);
    if (!supabaseClient) throw err;
    const { data, error } = await performLogin();
    if (error) throw error;
    currentUser = data.user;
    currentSession = data.session;
    return data;
  }
}

async function logoutUser() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentUser = null;
  currentSession = null;
}

async function getCurrentAuthSession() {
  if (!supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  if (session) {
    currentSession = session;
    currentUser = session.user;
  }
  return session;
}

function listenToAuthChanges(onAuthChangeCallback) {
  if (!supabaseClient) return;
  supabaseClient.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    currentUser = session ? session.user : null;
    if (typeof onAuthChangeCallback === 'function') {
      onAuthChangeCallback(event, session);
    }
  });
}
