import { supabase } from '../lib/supabase';
import { User, HistoryEntry, AppTab } from '../types';

// ─── SIGN UP ───────────────────────────────────────────────────────────────
// Creates a real Supabase account. Duplicate emails are rejected automatically.
// If email confirmation is enabled in the Supabase dashboard, needsConfirmation
// will be true and the user must click the magic link before they are signed in.
export async function signUp(
  email: string,
  name: string
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: generatePassword(email),
    options: { data: { name } },
  });
  if (error) return { error: error.message, needsConfirmation: false };
  // If Supabase email confirmation is ON, data.session is null until confirmed
  return { error: null, needsConfirmation: !data.session };
}

// ─── MAGIC-LINK LOGIN ───────────────────────────────────────────────────────
// Sends a one-time sign-in link to the email.
// shouldCreateUser: false means this will fail for unknown emails (prevents
// accidental new account creation on the login path).
export async function loginWithMagicLink(
  email: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ─── LOGOUT ────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── GET CURRENT USER PROFILE ───────────────────────────────────────────────
// Reads the Supabase session then fetches the user's row from public.profiles.
// Returns null if there is no active session.
export async function getCurrentProfile(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;

  return {
    id: user.id,
    email: user.email ?? '',
    name: profile.name ?? user.user_metadata?.name ?? 'User',
    tier: (profile.tier as 'free' | 'pro' | 'package') ?? 'free',
    credits: profile.credits ?? 3,
    history: [],          // Session 6 will load this from scan_history table
    joinedAt: Date.now(), // Not stored in Session 5; placeholder
  };
}

// ─── SAVE TO HISTORY (local-only for now — Session 6 migrates to Supabase) ──
// Logs a warning but does not block the user if Supabase write is not yet set up.
export function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  // TODO Session 6: INSERT into public.scan_history
  console.warn('[authService] saveToHistory: Supabase migration pending (Session 6)');
}

// ─── DEDUCT CREDIT (local-only for now) ─────────────────────────────────────
export function deductCredit(): User | null {
  // TODO Session 6: UPDATE profiles SET credits = credits - 1
  console.warn('[authService] deductCredit: Supabase migration pending (Session 6)');
  return null;
}

// ─── UPGRADE TIER (local-only for now) ──────────────────────────────────────
export function upgradeTier(_tier: 'pro' | 'package'): void {
  // TODO Session 6: UPDATE profiles SET tier = $tier
  console.warn('[authService] upgradeTier: Supabase migration pending (Session 6)');
}

// ─── INTERNAL HELPERS ────────────────────────────────────────────────────────
// Generates a deterministic password from the email so the user never needs to
// remember it — all sign-ins use the magic link / OTP flow.
function generatePassword(email: string): string {
  return btoa(email + 'atsbeaters_salt_2025').slice(0, 20) + 'Aa1!';
}

// ─── LEGACY SHIM — kept so existing App.tsx import * as auth works ───────────
// App.tsx calls auth.login(email, name) synchronously. We expose a no-op that
// lets the TypeScript compiler stay happy while App.tsx is being updated.
// Remove this once App.tsx has been fully migrated to the async signUp/loginWithMagicLink flow.
export function login(_email: string, _name: string): User {
  throw new Error(
    'auth.login() is no longer supported. Call auth.signUp() or auth.loginWithMagicLink() instead.'
  );
}

export function getCurrentUser(): User | null {
  // Synchronous access is no longer available — session is now async.
  // App.tsx uses the Supabase onAuthStateChange listener instead.
  return null;
}
