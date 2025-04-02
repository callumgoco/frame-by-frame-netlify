// Supabase client configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

// Initialize the Supabase client
function createSupabaseClient() {
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Initialize supabase once the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.supabaseClient = createSupabaseClient();
}); 