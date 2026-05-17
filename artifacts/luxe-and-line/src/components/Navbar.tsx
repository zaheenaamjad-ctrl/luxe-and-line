import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, LogIn, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetCart } from "@workspace/api-client-react";

function useCustomerAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("customer_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setUser(null);
  };

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
    { label: "Contact", href: "/contact" },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed w-full z-50 top-0 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo-transparent.png" alt="Luxe & Line" className="h-12 w-12 object-contain" />
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
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                >
                  <User size={16} />
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-8 w-44 bg-card border border-border shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-border/50">
                      <p className="text-xs font-body text-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-body text-muted-foreground hover:text-primary transition-colors"
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
                  className="flex items-center gap-1.5 text-xs font-body uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogIn size={13} />
                  Login
                </Link>
                <span className="text-border/60 text-xs">|</span>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-xs font-body uppercase tracking-wider px-3 py-1.5 border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                >
                  <UserPlus size={13} />
                  Register
                </Link>
              </div>
            )}

            {/* Admin icon */}
            <Link href="/admin" className="text-muted-foreground/50 hover:text-primary transition-colors hidden md:block">
              <User size={16} />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="text-foreground hover:text-primary transition-colors relative">
              <ShoppingBag size={20} />
              {cart?.itemCount ? (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.itemCount}
                </span>
              ) : null}
            </Link>

            <button className="md:hidden text-foreground hover:text-primary" onClick={toggleMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 pt-2 pb-4 space-y-1">
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
            <div className="border-t border-border/30 mt-2 pt-2 flex gap-3 px-3">
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
