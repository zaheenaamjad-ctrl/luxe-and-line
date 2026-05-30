import { Link } from "wouter";

export function StitchedSuitsLondon() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Luxe & Line",
        "description": "Luxury stitched suits for women delivered across London and the UK.",
        "url": "https://www.luxeandline.uk/stitched-suits-london",
        "telephone": "+447449507661",
        "email": "hello@luxeandline.uk",
        "address": { "@type": "PostalAddress", "addressLocality": "Liverpool", "postalCode": "L7 0JN", "addressCountry": "GB" },
        "areaServed": { "@type": "City", "name": "London" },
        "priceRange": "££",
        "image": "https://www.luxeandline.uk/og-image.jpg"
      })}} />

      <nav className="text-xs font-body text-muted-foreground mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span>Luxury Stitched Suits London</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Serving London · Free UK Delivery</p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">
          Luxury Stitched Suits London | Luxe &amp; Line
        </h1>
        <div className="luxury-divider w-16 mb-6" />
        <p className="text-muted-foreground font-body leading-relaxed text-base">
          Premium ready-to-wear stitched suits delivered free to every London postcode. Nureh Gardenia, Charizma, Zeenat collections available online.
        </p>
      </header>

      <div className="prose prose-invert max-w-none font-body space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Premium Stitched Suits Delivered to London</h2>
          <p>
            London is home to one of the UK's most fashion-conscious communities, and the demand for luxury stitched suits in London has never been greater. Whether you're in East London, South London, West London, or the city centre, <strong className="text-foreground">Luxe & Line</strong> delivers our full collection of premium stitched suits directly to your door — free of charge, within 4–5 business days.
          </p>
          <p>
            Our collection is curated specifically for the discerning London buyer: women who appreciate craftsmanship, who value authenticity, and who refuse to compromise on quality. From the embroidered intricacy of our Nureh Gardenia pieces to the vibrant prints of Charizma Sun Shine, every suit in our range is fully stitched, ready to wear, and dispatched with care.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Why London Customers Choose Luxe &amp; Line</h2>
          <p>
            London has no shortage of fashion options — but finding truly premium stitched suits at honest prices, with reliable UK delivery, is harder than it should be. That's the gap Luxe & Line was created to fill.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free UK delivery to all London postcodes (E, EC, N, NW, SE, SW, W, WC)</li>
            <li>Fully stitched and ready to wear — no tailoring delays</li>
            <li>Authentic designer collections: Nureh Gardenia, Charizma, Zeenat</li>
            <li>One universal size — beautifully crafted to flatter all figures</li>
            <li>WhatsApp support for styling advice and order queries</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Occasions for Stitched Suits in London</h2>
          <p>
            London's cultural calendar is rich with occasions that call for stunning stitched suits. Whether it's an Eid celebration in the East End, a wedding reception in Mayfair, a family gathering in Southall, or a formal dinner in Canary Wharf — the right stitched suit transforms any occasion.
          </p>
          <p>
            Our most popular suits for London occasions include the heavily embroidered formal pieces from our <Link href="/shop?category=shalwar-kameez" className="text-primary hover:underline">full stitched suits collection</Link>, available for immediate dispatch.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Styling Stitched Suits for London Life</h2>
          <p>
            London fashion is uniquely layered — the city rewards bold choices and appreciates subtlety in equal measure. For daytime London wear, we recommend lighter prints and breathable fabrics. For evening events, the richly embroidered pieces in our collection command the room.
          </p>
          <p>
            Read our complete styling guide in <Link href="/blog/how-to-style-stitched-suits-uk-2026" className="text-primary hover:underline">How to Style Stitched Suits in the UK — 2026 Guide</Link>, or browse our <Link href="/reviews" className="text-primary hover:underline">customer reviews</Link> from satisfied London buyers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Order Today — Delivered to London</h2>
          <p>
            Browse our full collection online, place your order, and receive it within 4–5 business days — anywhere in London. No minimum order. No delivery charge. If you need help choosing or have any questions, our team is available on WhatsApp at +44 7449 507661 or by email at hello@luxeandline.uk.
          </p>
          <p>
            We also stock <Link href="/shop?category=wallets" className="text-primary hover:underline">luxury leather wallets</Link>, <Link href="/shop?category=jeans" className="text-primary hover:underline">premium denim jeans</Link>, and <Link href="/shop" className="text-primary hover:underline">artisan confectionery</Link> — all delivered free to London.
          </p>
        </section>

        <div className="mt-12 p-6 border border-primary/20 bg-card">
          <p className="font-serif text-xl text-foreground mb-2">Shop luxury stitched suits — delivered to London</p>
          <p className="text-muted-foreground text-sm mb-4">Free UK delivery · Ready to wear · Premium quality</p>
          <Link href="/shop?category=shalwar-kameez">
            <button className="bg-primary text-primary-foreground px-8 py-3 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
              Browse Collection
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
