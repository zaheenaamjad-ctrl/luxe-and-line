import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export function Register() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
      } else {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_user", JSON.stringify(data.user));
        navigate("/shop");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-4">Join Us</p>
          <h1 className="font-serif text-4xl text-foreground mb-3">Create Account</h1>
          <div className="w-20 h-px mx-auto" style={{ background: "linear-gradient(90deg, transparent, hsl(43,65%,50%), transparent)" }} />
          <p className="text-xs font-body text-muted-foreground mt-4">No account needed to shop — but creating one lets you track orders.</p>
        </div>

        <div className="bg-card/60 backdrop-blur-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

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
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full bg-background border border-border px-4 py-3 pr-12 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-body text-muted-foreground mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-body bg-red-500/10 border border-red-500/20 px-4 py-3">
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
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-body text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-body text-muted-foreground/50 mt-6 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="hover:text-muted-foreground transition-colors underline underline-offset-2">Terms & Conditions</Link>
          {" "}and{" "}
          <Link href="/policy" className="hover:text-muted-foreground transition-colors underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
