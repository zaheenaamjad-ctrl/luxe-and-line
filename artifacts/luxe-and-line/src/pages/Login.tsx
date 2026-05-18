import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { saveAuth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type GoogleAccountsId = {
  initialize: (o: {
    client_id: string;
    callback: (r: { credential: string }) => void;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (el: HTMLElement, o: {
    theme: string; size: string; text: string; shape: string; width: number;
  }) => void;
  prompt: () => void;
};

type GoogleWindow = Window & { google?: { accounts: { id: GoogleAccountsId } } };

export function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<((r: { credential: string }) => void) | undefined>(undefined);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json() as { token?: string; user?: { id: number; name: string; email: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Google sign-in failed.");
      } else if (data.token && data.user) {
        saveAuth(data.token, data.user);
        navigate("/shop");
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Keep callback ref fresh so the Google initialized callback always calls latest version
  callbackRef.current = handleGoogleResponse;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const init = () => {
      const g = (window as GoogleWindow).google;
      if (!g?.accounts?.id || !googleBtnRef.current) return;

      const width = Math.max(googleBtnRef.current.clientWidth || 400, 200);

      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r: { credential: string }) => callbackRef.current?.(r),
        use_fedcm_for_prompt: false,
      });

      g.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width,
      });
    };

    if ((window as GoogleWindow).google?.accounts?.id) {
      init();
      return;
    }

    let attempts = 0;
    const t = setInterval(() => {
      if ((window as GoogleWindow).google?.accounts?.id || ++attempts > 40) {
        clearInterval(t);
        init();
      }
    }, 250);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; user?: { id: number; name: string; email: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
      } else if (data.token && data.user) {
        saveAuth(data.token, data.user);
        navigate("/shop");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-4">Welcome Back</p>
          <h1 className="font-serif text-4xl text-foreground mb-3">Sign In</h1>
          <div className="w-20 h-px mx-auto" style={{ background: "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)" }} />
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-border p-8">
          {/* Google Sign-In */}
          <div className="mb-6">
            <div
              ref={googleBtnRef}
              className="w-full flex justify-center min-h-[44px] items-center"
              aria-label="Sign in with Google"
            >
              {googleLoading && (
                <div className="w-5 h-5 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
              )}
            </div>
            {!GOOGLE_CLIENT_ID && (
              <p className="text-center text-xs font-body text-muted-foreground/50 mt-2">Google sign-in not configured</p>
            )}
            <div className="relative mt-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-card/60 text-[10px] uppercase tracking-widest font-body text-muted-foreground/60">Or sign in with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-background border border-border px-4 py-3 pr-12 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-red-400 text-xs font-body bg-red-500/10 border border-red-500/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-body uppercase tracking-[0.2em] text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
              style={{ background: "hsl(270,80%,65%)", color: "#fff" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs font-body text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
                Create one
              </Link>
            </p>
            <p className="text-xs font-body text-muted-foreground">
              <Link href="/shop" className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                Continue shopping without an account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
