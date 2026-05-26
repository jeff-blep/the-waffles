"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    // Check username availability
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existingUser) {
      setError("That username is already taken.");
      setLoading(false);
      return;
    }

    // Sign up with Supabase auth
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update the username in our users table (trigger creates the row)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({ username: username.toLowerCase(), display_name: username })
        .eq("id", user.id);
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-waffle-orange">
            🧇 Waffles
          </h1>
          <p className="text-neutral mt-1 text-sm">Pull up a seat.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-waffle shadow-card p-8">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6">
            Create your account
          </h2>

          <form onSubmit={handleSignUp} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="waffle_lover"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-seat text-sm focus:outline-none focus:ring-2 focus:ring-waffle-orange focus:border-transparent"
              />
              <p className="text-xs text-neutral mt-1">
                Letters, numbers, underscores only. This is your public name.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-seat text-sm focus:outline-none focus:ring-2 focus:ring-waffle-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-seat text-sm focus:outline-none focus:ring-2 focus:ring-waffle-orange focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-seat px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-waffle-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral mt-4">
          By signing up you agree to our Terms of Service.
          You must be 18+ to participate.
        </p>
      </div>
    </div>
  );
}
