import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-xl text-primary tracking-widest mb-6">LUXE & LINE</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              A premium South Asian fashion boutique based in Liverpool, UK. Bringing the warmth and richness of Lahori craftsmanship to the modern UK wardrobe.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans font-semibold text-foreground uppercase tracking-wider text-sm mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/shop?category=shalwar-kameez" className="text-muted-foreground hover:text-primary text-sm transition-colors">Shalwar Kameez</Link></li>
              <li><Link href="/shop?category=jeans" className="text-muted-foreground hover:text-primary text-sm transition-colors">Premium Jeans</Link></li>
              <li><Link href="/shop?category=wallets" className="text-muted-foreground hover:text-primary text-sm transition-colors">Leather Wallets</Link></li>
              <li><Link href="/shop?category=food" className="text-muted-foreground hover:text-primary text-sm transition-colors">Gourmet Treats</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-foreground uppercase tracking-wider text-sm mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary text-sm transition-colors">Contact</Link></li>
              <li><Link href="/policy" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-foreground uppercase tracking-wider text-sm mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>Atif Shah</li>
              <li>39 Stanley Street, L7 0JN</li>
              <li>Fairfield, Liverpool</li>
              <li>Merseyside, UK</li>
              <li><a href="tel:+447405358689" className="hover:text-primary transition-colors">+44 7405 358689</a></li>
              <li><a href="mailto:hello@luxeandline.co.uk" className="hover:text-primary transition-colors">hello@luxeandline.co.uk</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Luxe & Line. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Crafted with intention.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
