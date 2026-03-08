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
// Reads the Supabase session then fetches the user's row from public.profiles
// and their recent scan history from public.scan_history.
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

  // Load scan history from public.scan_history (Session 6)
  const { data: historyRows } = await supabase
    .from('scan_history')
    .select('id, type, input, result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const history: HistoryEntry[] = (historyRows || []).map((row: any) => ({
    id: row.id,
    type: row.type as AppTab,
    input: row.input,
    result: row.result,
    timestamp: new Date(row.created_at).getTime(),
  }));

  return {
    id: user.id,
    email: user.email ?? '',
    name: profile.name ?? user.user_metadata?.name ?? 'User',
    tier: (profile.tier as 'free' | 'pro' | 'package') ?? 'free',
    credits: profile.credits ?? 3,
    history,
    joinedAt: new Date(profile.created_at ?? Date.now()).getTime(),
  };
}

// ─── SAVE TO HISTORY ────────────────────────────────────────────────────────
// INSERTs a scan result into public.scan_history for the currently logged-in user.
export async function saveToHistory(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('scan_history').insert({
    user_id: user.id,
    type: entry.type,
    input: entry.input,
    result: entry.result,
  });

  if (error) {
    console.error('[authService] saveToHistory error:', error.message);
  }
}

// ─── DEDUCT CREDIT ──────────────────────────────────────────────────────────
// Atomically decrements credits in public.profiles using a Postgres RPC call,
// then returns the refreshed User profile so the UI can update immediately.
// Returns null if the user is not logged in or the RPC fails.
export async function deductCredit(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Use Supabase RPC for atomic decrement — prevents race conditions
  const { error: rpcError } = await supabase.rpc('decrement_credit', {
    uid: user.id,
  });

  if (rpcError) {
    console.error('[authService] deductCredit RPC error:', rpcError.message);
    return null;
  }

  // Re-fetch the updated profile so the returned User has the new credit count
  return getCurrentProfile();
}

// ─── UPGRADE TIER ───────────────────────────────────────────────────────────
// Updates the user's tier (and optionally credits) in public.profiles.
// Called from redeemLicense in App.tsx after a successful Gumroad verification.
export async function upgradeTier(
  tier: 'pro' | 'package',
  credits: number
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('profiles')
    .update({ tier, credits })
    .eq('id', user.id);

  if (error) {
    console.error('[authService] upgradeTier error:', error.message);
    return null;
  }

  return getCurrentProfile();
}

// ─── INTERNAL HELPERS ────────────────────────────────────────────────────────
// Generates a deterministic password from the email so the user never needs to
// remember it — all sign-ins use the magic link / OTP flow.
function generatePassword(email: string): string {
  return btoa(email + 'atsbeaters_salt_2025').slice(0, 20) + 'Aa1!';
}

// ─── LEGACY SHIM — kept so existing App.tsx import * as auth works ───────────
// Remove once no callers remain.
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
