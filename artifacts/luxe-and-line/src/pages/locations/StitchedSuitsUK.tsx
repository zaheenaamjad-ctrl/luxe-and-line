import { Link } from "wouter";

export function StitchedSuitsUK() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Luxe & Line",
        "description": "Premium luxury stitched suits delivered across the UK with free delivery.",
        "url": "https://www.luxeandline.uk/stitched-suits-uk",
        "telephone": "+447449507661",
        "email": "hello@luxeandline.uk",
        "address": { "@type": "PostalAddress", "addressLocality": "Liverpool", "postalCode": "L7 0JN", "addressCountry": "GB" },
        "areaServed": { "@type": "Country", "name": "United Kingdom" },
        "priceRange": "££",
        "image": "https://www.luxeandline.uk/og-image.jpg"
      })}} />

      <nav className="text-xs font-body text-muted-foreground mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span>Luxury Stitched Suits UK</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Nationwide UK Delivery · Free on Every Order</p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">
          Luxury Stitched Suits UK | Luxe &amp; Line
        </h1>
        <div className="luxury-divider w-16 mb-6" />
        <p className="text-muted-foreground font-body leading-relaxed text-base">
          Premium fully stitched suits delivered free to every UK postcode. Nureh Gardenia, Charizma Sunshine, and Luxury Pret collections — ready to wear, no tailoring needed.
        </p>
      </header>

      <div className="prose prose-invert max-w-none font-body space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Buy Stitched Suits Online UK — Ready to Wear</h2>
          <p>
            Finding premium ready-to-wear stitched suits online in the UK has never been easier. At <strong className="text-foreground">Luxe &amp; Line</strong>, we deliver our full range of fully stitched suits directly to your door — free of charge, within 4–5 business days, to every UK postcode from London to Edinburgh, Birmingham to Belfast.
          </p>
          <p>
            Every suit in our collection is <strong className="text-foreground">fully stitched and ready to wear</strong> — no waiting for tailoring, no sizing uncertainty. Our suits are available in sizes S, M, L, XL and XXL, and our expert team is always on hand via WhatsApp to help you choose the right size.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Our UK Stitched Suit Collections</h2>
          <p>
            We carry three premium collections of stitched suits for women in the UK:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Nureh Gardenia Summer 2026</strong> — Embroidered lawn suits with chiffon dupattas. 10 exclusive designs, each piece hand-selected for its intricate craftsmanship. From £65 including UK delivery.</li>
            <li><strong className="text-foreground">Luxury Pret Vol-1</strong> — Embroidered cotton lawn suits with fancy chiffon dupattas. 10 contemporary designs at an exceptional price point. From £45 including UK delivery.</li>
            <li><strong className="text-foreground">Charizma Sunshine Vol-1</strong> — Vibrant summer prints with bold, confident designs. Perfect for summer occasions and everyday luxury. From £55 including UK delivery.</li>
          </ul>
          <p>
            All suits are <strong className="text-foreground">fully stitched and ready to wear</strong> — a complete outfit delivered to your door in one order.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Why Buy Stitched Suits from Luxe &amp; Line UK?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Free UK Delivery</strong> — Every order ships free to any UK address. The price you see is the price you pay.</li>
            <li><strong className="text-foreground">Ready to Wear</strong> — All suits are fully stitched. No tailoring required, no additional costs.</li>
            <li><strong className="text-foreground">Authentic Collections</strong> — Every piece is sourced directly from premium fashion houses and hand-selected for quality.</li>
            <li><strong className="text-foreground">Fast Dispatch</strong> — Orders are dispatched within 1–2 business days and arrive within 4–5 business days.</li>
            <li><strong className="text-foreground">Personal Service</strong> — Order via WhatsApp for personalised recommendations and sizing help.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Order Stitched Suits Online Across the UK</h2>
          <p>
            We deliver stitched suits to every corner of the United Kingdom — including London, Manchester, Birmingham, Leeds, Bradford, Leicester, Glasgow, Edinburgh, Cardiff, and all surrounding areas. Our free delivery service covers all UK postcodes, making luxury fashion accessible nationwide.
          </p>
          <p>
            Browse our full collection of stitched suits below, or <Link href="/contact" className="text-primary hover:underline">WhatsApp our team</Link> for personalised service. You can also read our <Link href="/reviews" className="text-primary hover:underline">verified customer reviews</Link> to see why hundreds of UK customers trust Luxe &amp; Line.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/shop?category=shalwar-kameez" className="inline-block text-[11px] uppercase tracking-[0.3em] font-body font-medium text-white px-6 py-3 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, hsl(270,80%,65%), hsl(270,60%,48%))" }}>
              Shop All Stitched Suits
            </Link>
            <Link href="/shop" className="inline-block text-[11px] uppercase tracking-[0.3em] font-body font-medium text-primary border border-primary/50 px-6 py-3 hover:bg-primary/10 transition-colors">
              View Full Collection
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
