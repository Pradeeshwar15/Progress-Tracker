// Supabase Authentication Service

let currentUser = null;
let currentSession = null;

async function signUpUser(name, email, password) {
  if (!supabaseClient) {
    initSupabase();
  }
  if (!supabaseClient) throw new Error("Supabase client is not connected. Please check your network or credentials in Settings.");
  
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { name: name }
    }
  });

  if (error) throw error;
  
  if (data.user) {
    currentUser = data.user;
    currentSession = data.session;
  }
  return data;
}

async function loginUser(email, password) {
  if (!supabaseClient) {
    initSupabase();
  }
  if (!supabaseClient) throw new Error("Supabase client is not connected. Please check your network or credentials in Settings.");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  currentUser = data.user;
  currentSession = data.session;
  return data;
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
