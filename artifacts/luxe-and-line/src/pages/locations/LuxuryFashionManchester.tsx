import { Link } from "wouter";

export function LuxuryFashionManchester() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Luxe & Line",
        "description": "Designer luxury fashion delivered across Manchester and Greater Manchester.",
        "url": "https://www.luxeandline.uk/luxury-fashion-manchester",
        "telephone": "+447449507661",
        "email": "hello@luxeandline.uk",
        "address": { "@type": "PostalAddress", "addressLocality": "Liverpool", "postalCode": "L7 0JN", "addressCountry": "GB" },
        "areaServed": { "@type": "City", "name": "Manchester" },
        "priceRange": "££",
        "image": "https://www.luxeandline.uk/og-image.jpg"
      })}} />

      <nav className="text-xs font-body text-muted-foreground mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span>Designer Fashion Manchester</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Serving Manchester · Free UK Delivery</p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">
          Designer Fashion Manchester | Luxe &amp; Line
        </h1>
        <div className="luxury-divider w-16 mb-6" />
        <p className="text-muted-foreground font-body leading-relaxed text-base">
          Luxury fashion for women delivered free across Manchester. Premium stitched suits, designer denim and artisan gifts from Luxe & Line.
        </p>
      </header>

      <div className="prose prose-invert max-w-none font-body space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Manchester's Destination for Luxury Fashion Online</h2>
          <p>
            Manchester has always had a strong sense of style — bold, confident, and unashamedly its own. At <strong className="text-foreground">Luxe & Line</strong>, we celebrate that spirit with a curated luxury fashion collection that delivers to every Manchester postcode, free of charge.
          </p>
          <p>
            Whether you're shopping from the Northern Quarter, Didsbury, Chorlton, or anywhere across Greater Manchester, our collection of luxury stitched suits, premium denim, genuine leather wallets, and artisan confectionery arrives at your door within 4–5 business days.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Our Manchester Collection</h2>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Luxury Stitched Suits</h3>
          <p>
            Manchester's vibrant cultural community has a sophisticated taste for quality stitched suits. Our <Link href="/shop?category=shalwar-kameez" className="text-primary hover:underline">Nureh Gardenia and Charizma collections</Link> bring premium ready-to-wear fashion directly to Manchester homes. Each piece is fully stitched, carefully inspected, and dispatched with care.
          </p>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Premium Denim Jeans</h3>
          <p>
            Manchester's street style legacy made denim famous. Our <Link href="/shop?category=jeans" className="text-primary hover:underline">wide-leg and straight-cut denim</Link> honours that heritage with quality construction and custom sizing. Waist × length measurements ensure the perfect fit for every body.
          </p>
          <h3 className="font-serif text-xl text-foreground mt-6 mb-3">Luxury Leather Accessories</h3>
          <p>
            Our <Link href="/shop?category=wallets" className="text-primary hover:underline">Atrix genuine leather wallets</Link> are the kind of understated luxury Manchester style celebrates — quality without ostentation, craftsmanship without fuss.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Why Manchester Customers Love Luxe &amp; Line</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free delivery to all M postcodes and Greater Manchester</li>
            <li>Curated collections — every piece individually selected</li>
            <li>Honest pricing — luxury quality without inflated markups</li>
            <li>Responsive customer support via WhatsApp</li>
            <li>Easy returns policy — shop with confidence</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Fashion Occasions in Manchester</h2>
          <p>
            Manchester's event calendar is packed year-round — from Eid celebrations and wedding season to corporate dinners and cultural festivals. Luxe & Line's collection has something for every occasion. For formal events, our embroidered stitched suits are unmatched. For every day, our denim offers premium quality you'll reach for constantly.
          </p>
          <p>
            See what our <Link href="/reviews" className="text-primary hover:underline">customers are saying</Link> or explore our <Link href="/blog/how-to-style-stitched-suits-uk-2026" className="text-primary hover:underline">styling guide</Link> for outfit inspiration.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Order from Manchester Today</h2>
          <p>
            Placing an order is simple — browse, select, checkout, and receive your items within 4–5 days anywhere in Manchester. Our team is available on WhatsApp (+44 7449 507661) or email (hello@luxeandline.uk) for any queries. We also stock <Link href="/shop" className="text-primary hover:underline">artisan Kunafa Chocolates</Link> — perfect for gifting across Manchester.
          </p>
        </section>

        <div className="mt-12 p-6 border border-primary/20 bg-card">
          <p className="font-serif text-xl text-foreground mb-2">Shop designer fashion — delivered to Manchester</p>
          <p className="text-muted-foreground text-sm mb-4">Free UK delivery · Premium quality · Easy returns</p>
          <Link href="/shop">
            <button className="bg-primary text-primary-foreground px-8 py-3 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
