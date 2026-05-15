import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useGetCart } from "@workspace/api-client-react";
export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: cart } = useGetCart();

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
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo-transparent.png" alt="Luxe & Line" className="h-12 w-12 object-contain" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm uppercase tracking-wider transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
              <User size={20} />
            </Link>
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium uppercase tracking-wider ${location === link.href ? 'text-primary' : 'text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
