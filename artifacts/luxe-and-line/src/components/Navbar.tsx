import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetCart } from "@workspace/api-client-react";
import { AUTH_CHANGE_EVENT, getAuthUser, clearAuth } from "@/lib/auth";

const ADMIN_EMAILS = new Set(["syedimad348@gmail.com", "zaheenaamjad@gmail.com", "luxeline26@gmail.com"]);

function useCustomerAuth() {
  const [user, setUser] = useState(() => getAuthUser());

  useEffect(() => {
    const sync = () => setUser(getAuthUser());
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const logout = () => clearAuth();
  return { user, logout };
}

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: cart } = useGetCart();
  const { user, logout } = useCustomerAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed w-full z-50 top-0" style={{ background: "hsl(265,30%,5%)" }}>
      {/* Announcement bar */}
      <div
        className="border-b text-center py-1.5 px-4"
        style={{ background: "hsl(265,28%,8%)", borderColor: "hsl(270,50%,40%,0.2)" }}
      >
        <p className="text-[10px] font-body text-muted-foreground tracking-widest uppercase flex items-center justify-center gap-3 flex-wrap">
          <span>🇬🇧 Free UK Delivery on All Orders</span>
          <span className="text-border/40">·</span>
          <Link href="/terms" className="hover:text-primary transition-colors text-muted-foreground/70">
            Terms & Conditions
          </Link>
          <span className="text-border/40">·</span>
          <Link href="/policy" className="hover:text-primary transition-colors text-muted-foreground/70">
            Privacy Policy
          </Link>
          <span className="text-border/40">·</span>
          <Link href="/reviews" className="hover:text-primary transition-colors text-muted-foreground/70">
            Reviews
          </Link>
        </p>
      </div>

      {/* Main navbar */}
      <div className="border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo-transparent.png" alt="Luxe & Line" className="h-10 w-10 object-contain" loading="eager" />
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm uppercase tracking-wider transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              {/* Auth buttons */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                  >
                    <User size={15} />
                    <span>{user.name.split(" ")[0]}</span>
                  </button>
                  {showUserMenu && (
                    <div
                      className="absolute right-0 top-8 bg-card border border-border py-2 w-36 z-50"
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <div className="px-4 py-1.5 text-[10px] font-body text-muted-foreground/50 uppercase tracking-wider border-b border-border/30 mb-1">
                        {user.email.length > 18 ? user.email.slice(0, 18) + "…" : user.email}
                      </div>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-body text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors uppercase tracking-wider"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-xs font-body uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                  >
                    <LogIn size={14} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 text-xs font-body uppercase tracking-wider text-primary border border-primary/60 px-3 py-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <UserPlus size={14} />
                    Register
                  </Link>
                </div>
              )}

              {/* Admin icon — only visible to admin accounts */}
              {user && ADMIN_EMAILS.has(user.email) && (
                <Link href="/admin" className="text-muted-foreground/50 hover:text-primary transition-colors hidden md:block" title="Admin dashboard">
                  <LayoutDashboard size={16} />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="text-foreground hover:text-primary transition-colors relative">
                <ShoppingBag size={20} />
                {cart?.itemCount ? (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cart.itemCount}
                  </span>
                ) : null}
              </Link>

              <button className="md:hidden text-foreground hover:text-primary" onClick={toggleMenu} aria-label="Toggle menu">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border" style={{ background: "hsl(265,30%,6%)" }}>
          <div className="px-4 pt-2 pb-4 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 text-sm font-body uppercase tracking-wider ${location === link.href ? "text-primary" : "text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border/20 mt-2 pt-2 space-y-0.5">
              <Link
                href="/terms"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-body uppercase tracking-wider ${location === "/terms" ? "text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/policy"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-body uppercase tracking-wider ${location === "/policy" ? "text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-body uppercase tracking-wider ${location === "/reviews" ? "text-primary" : "text-muted-foreground hover:text-primary"} transition-colors`}
              >
                Reviews & FAQ
              </Link>
            </div>

            <div className="border-t border-border/20 mt-2 pt-2 flex gap-3 px-3">
              {user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="text-xs font-body uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Out ({user.name.split(" ")[0]})
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-body uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">Login</Link>
                  <span className="text-border/40">|</span>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-body uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
