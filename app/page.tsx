'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Instagram, Menu, MessageCircle, Minus, Plus, Search, ShoppingBag, Trash2, X, Volume2, VolumeX } from 'lucide-react'

type Product = { name: string; note: string; price: string; image: string; placeholder: string; code: string; tone: string; tag?: string }
const products: Product[] = [
  { name: 'Santal 33', note: 'Sandalwood · Cardamom · Leather', price: '€185', code: '01 / WOODY', image: '/images/santal-33.webp', placeholder: '/images/santal-33-blur.webp', tone: '#6f432c', tag: 'BESTSELLER' },
  { name: 'Après Minuit', note: 'Black tea · Fig · Smoked cedar', price: '€210', code: '02 / AMBER', image: '/images/apres-minuit.webp', placeholder: '/images/apres-minuit-blur.webp', tone: '#734c37', tag: 'NEW' },
  { name: 'Fleur de Nuit', note: 'Neroli · Rose absolute · Musk', price: '€175', code: '03 / FLORAL', image: '/images/fleur-de-nuit.webp', placeholder: '/images/fleur-de-nuit-blur.webp', tone: '#8b6550' },
  { name: 'Bois d’Argent', note: 'Vetiver · Iris · Pale woods', price: '€195', code: '04 / GREEN', image: '/images/bois-dargent.webp', placeholder: '/images/bois-dargent-blur.webp', tone: '#625649' },
  { name: 'Serein', note: 'Sea salt · Juniper · Mineral amber', price: '€165', code: '05 / FRESH', image: '/images/serein.webp', placeholder: '/images/serein-blur.webp', tone: '#58605b' },
  { name: 'La Dernière Heure', note: 'Tonka · Cacao · Black vanilla', price: '€225', code: '06 / ORIENTAL', image: '/images/la-derniere-heure.webp', placeholder: '/images/la-derniere-heure-blur.webp', tone: '#78553e' },
]

const journal = [
  { category: 'THE MATERIAL', title: 'The quiet, lasting warmth of sandalwood', read: '6 MIN READ', image: '/images/santal-33.webp' },
  { category: 'FIELD NOTES', title: 'A morning among the roses of Grasse', read: '4 MIN READ', image: '/images/fleur-de-nuit.webp' },
  { category: 'ON THE MAKING', title: 'Time is the most beautiful ingredient', read: '8 MIN READ', image: '/images/la-derniere-heure.webp' },
]
const testimonials = [
  { quote: 'It smells like a place I have not been in years. I didn’t know a fragrance could feel so much like coming home.', name: 'ÉLISE M. · PARIS', product: 'APÈS MINUIT' },
  { quote: 'Nothing loud, nothing hurried. Just a beautifully made scent that becomes part of your own story.', name: 'JULIAN R. · LONDON', product: 'SANTAL 33' },
  { quote: 'The first perfume I have worn every single day. It feels less like getting dressed and more like remembering.', name: 'AMARA O. · LAGOS', product: 'FLEUR DE NUIT' },
]

function Wordmark({ large = false }: { large?: boolean }) {
  return <a href="#home" aria-label="Maison Noir home" className={`wordmark ${large ? 'wordmark-large' : ''}`}>MAISON <span>NOIR</span><i>®</i></a>
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartReady, setCartReady] = useState(false)
  const [bagOpen, setBagOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [review, setReview] = useState(0)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null)
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.note}`.toLowerCase().includes(query.toLowerCase())), [query])
  const cartItems = products.filter(product => (cart[product.name] ?? 0) > 0)
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const cartSubtotal = cartItems.reduce((sum, product) => sum + Number(product.price.replace(/[^0-9.]/g, '')) * cart[product.name], 0)
  const formatPrice = (amount: number) => `€${amount.toLocaleString('en-IE')}`

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('maison-noir-cart')
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>
        const safeCart: Record<string, number> = {}
        products.forEach(product => {
          const quantity = parsed[product.name]
          if (typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0) safeCart[product.name] = quantity
        })
        setCart(safeCart)
      }
    } catch { /* Keep shopping available if storage is disabled. */ }
    setCartReady(true)
  }, [])

  useEffect(() => {
    if (cartReady) {
      try { window.localStorage.setItem('maison-noir-cart', JSON.stringify(cart)) } catch { /* Keep the in-memory cart usable. */ }
    }
  }, [cart, cartReady])

  useEffect(() => {
    if (!bagOpen && !searchOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setBagOpen(false); setSearchOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [bagOpen, searchOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target) } }), { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el))
    const lenis = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : new Lenis({ lerp: 0.085, smoothWheel: true })
    let frame = 0
    const raf = (time: number) => { lenis?.raf(time); frame = requestAnimationFrame(raf) }
    if (lenis) frame = requestAnimationFrame(raf)
    return () => { window.removeEventListener('scroll', onScroll); reveal.disconnect(); cancelAnimationFrame(frame); lenis?.destroy() }
  }, [])

  useEffect(() => () => { audioRef.current?.ctx.close() }, [])

  const toggleAtmosphere = () => {
    if (playing && audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.ctx.currentTime, .35)
      window.setTimeout(() => { audioRef.current?.ctx.close(); audioRef.current = null }, 900)
      setPlaying(false)
      return
    }
    try {
      const ctx = new window.AudioContext()
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.type = 'sine'; osc.frequency.value = 110
      gain.gain.value = 0
      osc.connect(gain); gain.connect(ctx.destination); osc.start()
      gain.gain.setTargetAtTime(0.018, ctx.currentTime, .8)
      audioRef.current = { ctx, osc, gain }; setPlaying(true)
    } catch { setPlaying(false) }
  }

  const subscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  const addToCart = (productName: string) => setCart(current => ({ ...current, [productName]: (current[productName] ?? 0) + 1 }))
  const setQuantity = (productName: string, quantity: number) => setCart(current => {
    const next = { ...current }
    if (quantity <= 0) delete next[productName]
    else next[productName] = quantity
    return next
  })
  const checkoutViaWhatsApp = () => {
    if (!cartItems.length) return
    const newline = String.fromCharCode(10)
    const lines = cartItems.map(product => {
      const quantity = cart[product.name]
      const unitPrice = Number(product.price.replace(/[^0-9.]/g, ''))
      return `• ${product.name} — ${product.note}${newline}  ${quantity} × ${formatPrice(unitPrice)} = ${formatPrice(unitPrice * quantity)}`
    })
    const message = [`Hello Maison Noir, I would like to place this order:`, '', ...lines, '', `Order total: ${formatPrice(cartSubtotal)}`, '', 'Please let me know the next steps.'].join(newline)
    const baseLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK?.trim() || 'https://wa.me/2349049205568'
    try {
      const checkoutUrl = new URL(baseLink)
      checkoutUrl.searchParams.set('text', message)
      window.open(checkoutUrl.toString(), '_blank', 'noopener,noreferrer')
    } catch {
      const fallbackUrl = new URL('https://wa.me/')
      fallbackUrl.searchParams.set('text', message)
      window.open(fallbackUrl.toString(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <main id="home">
      <div className="announcement"><span>COMPOSED IN GRASSE, FRANCE</span><span>COMPLIMENTARY DELIVERY ON ORDERS OVER €150</span><span>DISCOVER THE NEW COLLECTION <ArrowUpRight size={11} /></span></div>
      <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
        <Wordmark />
        <nav className={`${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <a href="#collection" onClick={() => setMenuOpen(false)}>FRAGRANCES</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>OUR STORY</a>
          <a href="#journal" onClick={() => setMenuOpen(false)}>JOURNAL</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label="Search fragrances" onClick={() => setSearchOpen(true)}><Search size={17} /><span>SEARCH</span></button>
          <button className="bag-link" type="button" onClick={() => setBagOpen(true)} aria-label={`Open shopping bag with ${itemCount} items`}><ShoppingBag size={17} /><span>BAG</span><b aria-live="polite">{itemCount.toString().padStart(2, '0')}</b></button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grain" />
        <div className="hero-copy">
          <div className="eyebrow collection-label"><span className="live-dot" /> NEW COLLECTION <span className="eyebrow-separator">/</span> 2026</div>
          <h1 id="hero-title">A scent that<br />stays <em>after</em><br />you leave.</h1>
          <p className="hero-intro">Fragrance as memory. Composed slowly, worn close, and made to become entirely your own.</p>
          <div className="hero-ctas"><a className="button button-primary" href="#collection">Explore the collection <ArrowUpRight size={15} /></a><a className="text-link" href="#story">Discover our story <ArrowRight size={15} /></a></div>
          <div className="hero-social"><a href="#journal" aria-label="Instagram"><Instagram size={15} /></a><span className="social-line" /><span>FOLLOW THE NOTES</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-halo" />
          <div className="hero-image-wrap"><img src="/images/santal-33.webp" alt="Sculptural amber fragrance bottle in warm, atmospheric light" fetchPriority="high" /></div>
          <div className="hero-image-caption"><span>01 — 06</span><span>EAU DE PARFUM · 50 ML</span></div>
          <div className="hero-product-note"><span className="note-rule" /><span>THE NO. 01<br /><em>ORIGINAL COMPOSITION</em></span></div>
        </div>
        <div className="hero-side-label">MAISON NOIR — PARFUMERIE CONTEMPORAINE</div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#collection"><span className="scroll-icon"><ArrowDown size={13} /></span><span>SCROLL TO DISCOVER</span></a>
          <div className="hero-stats"><div><strong>06</strong><span>ORIGINAL<br />COMPOSITIONS</span></div><i /><div><strong>27<span className="unit">%</span></strong><span>RARE NATURAL<br />INGREDIENTS</span></div><i /><div><strong>4.9<span className="unit">/5</span></strong><span>WORN &<br />REMEMBERED</span></div></div>
          <button className="atmosphere" onClick={toggleAtmosphere} aria-pressed={playing}>{playing ? <Volume2 size={14} /> : <VolumeX size={14} />}<span>{playing ? 'ATMOSPHERE ON' : 'PLAY ATMOSPHERE'}</span><span className={`sound-bars ${playing ? 'sound-on' : ''}`}><i /><i /><i /><i /></span></button>
        </div>
      </section>

      <section className="collection section-pad" id="collection">
        <div className="section-heading reveal"><div><span className="eyebrow">THE PERFUME WARDROBE <span className="eyebrow-separator">/</span> 001—006</span><h2>Made to be <em>kept.</em></h2></div><p>Six original compositions. Each one a considered study in contrast, memory, and the beauty of what lingers.</p></div>
        <div className="product-grid">
          {products.map((product, index) => <article className={`product-card reveal ${index % 3 === 1 ? 'product-offset' : ''}`} key={product.name} style={{ transitionDelay: `${(index % 3) * 100}ms` }}>
            <div className="product-image" style={{ backgroundImage: `url(${product.placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="product-glow" style={{ background: `radial-gradient(ellipse at 50% 55%, ${product.tone}66 0%, transparent 68%)` }} />
              <img src={product.image} alt={`${product.name} eau de parfum`} loading="lazy" />
              {product.tag && <span className="product-tag">{product.tag}</span>}
              <span className="product-number">0{index + 1}</span>
              <button type="button" className="add-to-bag" aria-label={`Add ${product.name} to bag`} onClick={() => addToCart(product.name)}>ADD TO BAG <ArrowUpRight size={14} /></button>
            </div>
            <div className="product-meta"><div><span className="eyebrow product-code">{product.code}</span><h3>{product.name}</h3><p>{product.note}</p></div><span className="product-price">{product.price}</span></div>
          </article>)}
        </div>
        <div className="collection-foot reveal"><span>EAU DE PARFUM · 50 ML · COMPOSED IN GRASSE</span><a className="text-link" href="#notes">Find your notes <ArrowRight size={15} /></a></div>
      </section>

      <section className="story" id="story">
        <div className="story-image"><img src="/images/bois-dargent.webp" alt="The dark, tactile world of traditional perfumery" loading="lazy" /><span className="image-index">GRASSE, FRANCE · 43°39′N</span></div>
        <div className="story-copy reveal"><span className="eyebrow">A HOUSE OF SMALL THINGS</span><h2>Made slowly.<br />Meant to <em>stay.</em></h2><p className="story-lede">We believe a fragrance should feel less like an accessory and more like a place you know by heart.</p><p>In a quiet atelier in Grasse, our perfumer works with materials that have a life of their own. Petals gathered at first light. Woods that have rested for years. A little uncertainty, left in on purpose.</p><a className="text-link" href="#journal">The art of taking time <ArrowRight size={15} /></a>
          <div className="timeline"><div><span>2018</span><p>A small atelier<br />opens in Grasse.</p></div><div><span>2021</span><p>Our first six<br />compositions.</p></div><div><span>2026</span><p>A new chapter<br />in scent.</p></div></div>
        </div>
        <blockquote className="story-quote reveal">“The most beautiful things<br />are the ones we <em>remember</em><br />without trying.”<cite>— THE MAISON NOIR APPROACH</cite></blockquote>
      </section>

      <section className="notes section-pad" id="notes">
        <div className="notes-intro reveal"><span className="eyebrow">THE ANATOMY OF A MEMORY</span><h2>Every scent has<br />a <em>beginning.</em></h2><p>A fragrance unfolds in its own time. Three movements, each leaving something behind.</p></div>
        <div className="notes-pyramid reveal" aria-label="Olfactory pyramid, showing top, heart, and base notes">
          <div className="pyramid-glow" />
          <div className="pyramid-shape"><div className="pyramid-top"><span>TOP</span><i>✳</i><b>Citrus · Green · Air</b></div><div className="pyramid-heart"><span>HEART</span><i>✳</i><b>Floral · Spice · Petal</b></div><div className="pyramid-base"><span>BASE</span><i>✳</i><b>Woods · Resin · Skin</b></div></div>
          <span className="pyramid-caption">THE OLFACTORY PYRAMID <i>—</i> A STUDY IN TIME</span>
        </div>
        <div className="notes-list reveal">
          {[['01','THE FIRST IMPRESSION','Bright, fleeting notes that find you first. Bergamot, petitgrain, a breath of green.'],['02','THE TRUE CHARACTER','The heart unfolds as the opening softens. Rose, iris, spice — the soul of the composition.'],['03','WHAT REMAINS','Warmth held close to the skin. Cedar, musk, amber — a quiet signature, hours later.']].map(([n, title, text]) => <div className="note-item" key={n}><span className="note-index">{n}</span><div><span className="eyebrow">{title}</span><p>{text}</p></div><ArrowUpRight className="note-arrow" size={16} /></div>)}
        </div>
      </section>

      <section className="journal section-pad" id="journal">
        <div className="section-heading reveal"><div><span className="eyebrow">THE JOURNAL <span className="eyebrow-separator">/</span> NOTES FROM THE ATELIER</span><h2>In good <em>company.</em></h2></div><a className="text-link journal-all" href="#newsletter">Read the journal <ArrowRight size={15} /></a></div>
        <div className="journal-grid">{journal.map((story, i) => <a href="#newsletter" className="journal-card reveal" key={story.title} style={{ transitionDelay: `${i * 100}ms` }}><div className="journal-image"><img src={story.image} alt="" loading="lazy" /><span className="journal-read">{story.read}</span></div><span className="eyebrow journal-category">{story.category}</span><h3>{story.title}</h3><span className="journal-link">READ THE STORY <ArrowUpRight size={13} /></span></a>)}</div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-aside"><span className="eyebrow">WORN & REMEMBERED</span><span className="review-counter">0{review + 1} <i>/</i> 03</span></div>
        <div className="testimonial-main" aria-live="polite"><div className="stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“{testimonials[review].quote}”</blockquote><span className="review-name">{testimonials[review].name}</span><span className="review-product">A NOTE ON {testimonials[review].product}</span></div>
        <div className="testimonial-controls"><button onClick={() => setReview((review + testimonials.length - 1) % testimonials.length)} aria-label="Previous review"><ArrowLeft size={17} /></button><button onClick={() => setReview((review + 1) % testimonials.length)} aria-label="Next review"><ArrowRight size={17} /></button></div>
      </section>

      <section className="newsletter" id="newsletter"><div className="newsletter-inner reveal"><span className="eyebrow">A LETTER, NOW AND THEN</span><h2>Receive the first whisper<br />of <em>new releases.</em></h2><p>Notes from our atelier, thoughtfully and occasionally sent.</p>{subscribed ? <div className="success-message">Thank you. Your first letter will find its way to you soon.</div> : <form className="newsletter-form" onSubmit={subscribe}><label className="sr-only" htmlFor="email">Your email address</label><input id="email" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required /><button type="submit" aria-label="Subscribe to the newsletter"><span>JOIN THE LETTER</span><ArrowUpRight size={16} /></button></form>}<span className="newsletter-note">A FEW GOOD THINGS. NO NOISE. UNSUBSCRIBE WHENEVER.</span></div><div className="newsletter-mark">MN</div></section>

      <footer className="footer">
        <div className="marquee" aria-label="Crafted in Grasse, shipped worldwide, carbon neutral"><div className="marquee-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>CRAFTED IN GRASSE <i>✳</i> SHIPPED WORLDWIDE <i>✳</i> CARBON CONSCIOUS <i>✳</i> MADE TO BE REMEMBERED <i>✳</i></span>)}</div></div>
        <div className="footer-main"><div className="footer-brand"><Wordmark /><p>Fragrance as memory.<br />Made slowly in Grasse, France.</p><a href="#journal" className="footer-social"><Instagram size={15} /> FOLLOW OUR NOTES</a></div>
          {[['THE WARDROBE','Fragrances','Discovery set','Gift cards','Find your scent'],['THE HOUSE','Our story','The atelier','Journal','Stockists'],['HERE TO HELP','Contact','Shipping & returns','Frequently asked','Care guide']].map(([title, ...links]) => <div className="footer-column" key={title}><span className="eyebrow">{title}</span>{links.map(link => <a href={link === 'Fragrances' ? '#collection' : link === 'Our story' ? '#story' : '#newsletter'} key={link}>{link}</a>)}</div>)}
        </div>
        <div className="footer-giant">MAISON NOIR</div>
        <div className="footer-bottom"><span>© 2026 MAISON NOIR PARFUMERIE</span><div><a href="#newsletter">PRIVACY</a><a href="#newsletter">TERMS</a><a href="#home">EN / EUR</a></div><span>COMPOSED WITH INTENTION IN GRASSE, FRANCE</span></div>
      </footer>

      {bagOpen && <div className="cart-overlay">
        <button className="cart-backdrop" aria-label="Close shopping bag" onClick={() => setBagOpen(false)} />
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="cart-header"><div><span className="eyebrow">MAISON NOIR <span className="eyebrow-separator">/</span> YOUR SELECTION</span><h2 id="cart-title">The bag <em>({itemCount})</em></h2></div><button className="icon-button cart-close" onClick={() => setBagOpen(false)} aria-label="Close shopping bag"><X /></button></div>
          {cartItems.length ? <>
            <div className="cart-items">{cartItems.map(product => {
              const quantity = cart[product.name]
              const unitPrice = Number(product.price.replace(/[^0-9.]/g, ''))
              return <article className="cart-item" key={product.name}>
                <div className="cart-item-image"><img src={product.image} alt={`${product.name} fragrance bottle`} /></div>
                <div className="cart-item-details"><div className="cart-item-heading"><div><span className="eyebrow">{product.code}</span><h3>{product.name}</h3></div><span className="cart-item-price">{formatPrice(unitPrice * quantity)}</span></div>
                  <p>{product.note}</p><div className="cart-item-controls"><div className="quantity-control"><button type="button" onClick={() => setQuantity(product.name, quantity - 1)} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button><span aria-label={`Quantity ${quantity}`}>{quantity}</span><button type="button" onClick={() => setQuantity(product.name, quantity + 1)} aria-label={`Add one ${product.name}`}><Plus size={13} /></button></div><button type="button" className="remove-item" onClick={() => setQuantity(product.name, 0)}><Trash2 size={13} /> REMOVE</button><span className="cart-unit-price">{formatPrice(unitPrice)} EACH</span></div>
                </div>
              </article>
            })}</div>
            <div className="cart-summary"><div><span>SUBTOTAL</span><strong>{formatPrice(cartSubtotal)}</strong></div><p>Shipping and delivery details can be confirmed directly with the maison.</p><button className="checkout-button" type="button" onClick={checkoutViaWhatsApp}>CHECK OUT VIA WHATSAPP <ArrowUpRight size={16} /></button><span className="checkout-caption"><MessageCircle size={13} /> Your order and total will be prepared in a WhatsApp message.</span></div>
          </> : <div className="cart-empty"><ShoppingBag size={24} /><h3>A little room for something lovely.</h3><p>Your selection is waiting to be made.</p><button className="button button-primary" onClick={() => { setBagOpen(false); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore the collection <ArrowUpRight size={15} /></button></div>}
        </aside>
      </div>}

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search fragrances"><div className="search-panel"><div className="search-top"><Wordmark /><button className="icon-button" onClick={() => { setSearchOpen(false); setQuery('') }} aria-label="Close search"><X /></button></div><span className="eyebrow">FIND YOUR FRAGRANCE</span><div className="search-input-wrap"><Search size={20} /><input autoFocus placeholder="Try a note, a mood, a name…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)} /></div><div className="search-results">{filtered.map(p => <a href="#collection" key={p.name} onClick={() => setSearchOpen(false)}><span>{p.name}</span><span>{p.note}</span><ArrowUpRight size={15} /></a>)}{filtered.length === 0 && <p>No compositions found. Try another note.</p>}</div><span className="eyebrow search-foot">SIX ORIGINAL COMPOSITIONS · MADE IN GRASSE</span></div><button className="search-backdrop" aria-label="Close search" onClick={() => setSearchOpen(false)} /></div>}
    </main>
  )
}
