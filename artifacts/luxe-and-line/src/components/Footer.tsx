import { Link } from "wouter";
import { MapPin, Phone, Mail, Shield, Truck, Clock } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "hsl(265,30%,5%)" }} className="border-t-2 border-primary/30">
      {/* Trust strip */}
      <div className="border-b border-primary/15" style={{ background: "hsl(265,28%,7%)" }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Truck, label: "UK Delivery Included", sub: "All prices include delivery" },
              { icon: Shield, label: "Authentic Products", sub: "Direct from Pakistan" },
              { icon: Clock, label: "4–5 Day Delivery", sub: "After payment confirmation" },
              { icon: Mail, label: "luxeline26@gmail.com", sub: "We reply within 24hrs" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 py-2">
                <Icon size={16} className="text-primary mb-1" />
                <p className="text-[10px] uppercase tracking-widest font-body text-foreground/80">{label}</p>
                <p className="text-[9px] font-body text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo-transparent.png" alt="Luxe & Line" className="h-10 w-10 object-contain" />
              <span className="font-serif text-xl tracking-widest text-primary">LUXE & LINE</span>
            </div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed mb-5">
              A premium South Asian fashion boutique based in Liverpool, UK. Bringing the warmth and richness of Pakistani craftsmanship to modern British wardrobes.
            </p>
            <div className="space-y-2 text-xs font-body text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
                <span>39 Stanley Street, L7 0JN<br />Liverpool, Merseyside, UK</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-primary shrink-0" />
                <a href="tel:+447449507661" className="hover:text-primary transition-colors">+44 7449 507661</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-primary shrink-0" />
                <a href="mailto:luxeline26@gmail.com" className="hover:text-primary transition-colors">luxeline26@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] text-primary mb-5 pb-3 border-b border-primary/25">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: "/shop?category=shalwar-kameez", label: "Shalwar Kameez" },
                { href: "/shop?category=jeans", label: "Premium Jeans" },
                { href: "/shop?category=wallets", label: "Leather Wallets" },
                { href: "/shop?category=food", label: "Pistachio Kunafa Bites" },
                { href: "/shop", label: "All Collections" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body text-xs text-muted-foreground hover:text-primary transition-colors hover:pl-1 inline-block" style={{ transitionProperty: "color, padding-left" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] text-primary mb-5 pb-3 border-b border-primary/25">Company</h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/reviews", label: "Reviews & FAQ" },
                { href: "/shop", label: "Our Collection" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body text-xs text-muted-foreground hover:text-primary transition-colors hover:pl-1 inline-block" style={{ transitionProperty: "color, padding-left" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] text-primary mb-5 pb-3 border-b border-primary/25">Legal & Account</h4>
            <ul className="space-y-3">
              {[
                { href: "/policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/login", label: "Customer Login" },
                { href: "/register", label: "Create Account" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body text-xs text-muted-foreground hover:text-primary transition-colors hover:pl-1 inline-block" style={{ transitionProperty: "color, padding-left" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-2 border-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[10px] text-muted-foreground tracking-widest uppercase">
            © {year} Luxe & Line · Liverpool, United Kingdom. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-body text-muted-foreground">
            <Link href="/policy" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span className="text-border">|</span>
            <span>UK Company · Registered Liverpool</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
