import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { BREEDS }  from '../utils/breeds';
import api         from '../utils/api';

/* ── Category chip ─────────────────────────────────────────── */
function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
      style={active ? {
        background: '#D4AF37',
        color: '#000',
        boxShadow: '0 0 20px rgba(212,175,55,0.3)',
      } : {
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {label}
    </button>
  );
}

/* ── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, slug }) {
  return (
    <div className="flex items-center justify-between mb-8 px-1">
      <h2 className="text-white font-bold text-2xl tracking-tighter italic">{title}</h2>
      <Link
        to={`/breed/${slug}`}
        className="text-[10px] font-bold uppercase tracking-[0.3em] transition-opacity hover:opacity-70 text-[#D4AF37]"
      >
        Explore Collection →
      </Link>
    </div>
  );
}

/* ── Skeleton card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-[20px] animate-pulse"
      style={{ width: 185, height: 240, background: '#111111' }}
    />
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [activeSlug, setActiveSlug] = useState('all');
  const [loading,    setLoading]    = useState(true);
  const browseRef = useRef(null);

  useEffect(() => {
    api.get('/admin/categories') // Assuming this fetches categories with slug and name
      .then(r => setCategories(r.data.length ? r.data : BREEDS))
      .catch(() => setCategories(BREEDS));

    api.get('/products?limit=40')
      .then(r => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeSlug === 'all'
    ? products
    : products.filter(p =>
        (p.breedSlug || p.breed?.toLowerCase().replace(/\s+/g, '-')) === activeSlug
      );

  const byBreed = categories.slice(0, 6).map(cat => ({
    cat,
    items: products.filter(p =>
      (p.breedSlug || p.breed?.toLowerCase().replace(/\s+/g, '-')) === (cat.slug || cat._id)
    ),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>

      {/* ══════════════════════════════════════════════════════
          SCREEN 1 — Hero / Splash
      ══════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] flex items-end pb-20 px-8 overflow-hidden">
        <img 
          src="/public/home.png"
          alt="Royal Guppy" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        
        <div className="relative z-10 max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.5em] mb-4">The Sovereign Collection</p>
          <h1 className="text-white font-extrabold leading-[1.05] mb-8" style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', fontFamily: "'Playfair Display', serif" }}>
            Exquisite<br />Lineage.
          </h1>
          <button // "Begin Journey" button
            onClick={() => browseRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-6 group"
          >
            <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowRight size={24} className="text-black" />
            </div>
            <span className="text-white font-bold text-sm tracking-[0.3em] uppercase border-b border-[#D4AF37]/30 pb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Begin Journey</span>
          </button>
        </div>
      </section>

      {/* Scroll-down hint */}
      <div className="hidden md:flex justify-center -mt-8 mb-2 relative z-10">
        <button
          onClick={() => browseRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-70 group"
        >
          <span className="text-white/30 text-xs font-medium tracking-widest uppercase">Explore</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <ArrowRight size={14} style={{ color: '#D4AF37', transform: 'rotate(90deg)' }} /> {/* Gold arrow */}
          </div>
        </button>
      </div>

      {/* ════════════════════════════════════════════════
          BROWSE SECTION
      ════════════════════════════════════════════════ */}
      <section ref={browseRef} className="px-4 md:px-6 py-10 max-w-7xl mx-auto">

        {/* Section heading */}
        <div className="mb-8 px-1">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-[0.3em] mb-2">
            Our Collection
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontFamily: "'Playfair Display', serif" }}>
            Curated <span className="italic font-light">Selection</span>
          </h2>
        </div>

        {/* ── Category chips ── */}
        <div
          className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-3 mb-8 -mx-4 px-4 scroll-smooth-x"
        >
          <Chip label="All" active={activeSlug === 'all'} onClick={() => setActiveSlug('all')} />
          {categories.map(cat => (
            <Chip
              key={cat.slug || cat._id}
              label={cat.name}
              active={activeSlug === (cat.slug || cat._id)}
              onClick={() => setActiveSlug(cat.slug || cat._id)}
            />
          ))}
        </div>

        {/* ── Filtered view (single breed selected) ── */}
        {activeSlug !== 'all' && (
          <div className="mb-10">
            {loading ? (
              <div className="flex gap-4 overflow-hidden pb-2">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <img src="/fish.svg" alt="No fish in this category yet — check back soon" className="w-12 h-12 opacity-10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">No fish in this category yet</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 scroll-smooth-x">
                {filtered.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── All breeds grouped ── */}
        {activeSlug === 'all' && (
          <div className="space-y-10">
            {loading ? (
              <>
                {[1, 2].map(i => (
                  <div key={i}>
                    <div className="flex justify-between mb-5 px-1">
                      <div className="w-28 h-5 rounded-full animate-pulse" style={{ background: '#111111' }} />
                      <div className="w-12 h-5 rounded-full animate-pulse" style={{ background: '#111111' }} />
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                      {[1,2,3,4].map(j => <SkeletonCard key={j} />)}
                    </div>
                  </div>
                ))}
              </>
            ) : byBreed.length > 0 ? (
              byBreed.map(({ cat, items }) => (
                <div key={cat.slug || cat._id}>
                  <SectionHeader title={cat.name} slug={cat.slug || cat._id} />
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 scroll-smooth-x">
                    {items.map(p => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              <div>
                <SectionHeader title="All Fish" slug="fancy-guppy" />
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 scroll-smooth-x">
                  {products.map(p => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <img
                  src="/fish.svg"
                  alt="No products yet — add some via admin panel"
                  className="w-14 h-14 opacity-10 mx-auto mb-4"
                />
                <p className="text-white/20 text-sm">No fish available yet</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════
          WHY US STRIP
      ════════════════════════════════════════════════ */}
      <section className="mt-6 mb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <div
          className="rounded-3xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.1)' }}
        >
          {[
            { icon: '✨', label: 'Royal Lineage', sub: 'Championship genes' },
            { icon: '🚚', label: 'Fast Delivery', sub: 'Ships in 24h' },
            { icon: '💎', label: 'Rare Breeds', sub: 'Limited availability' },
            { icon: '🤝', label: 'Expert Care', sub: 'Lifetime support' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-white/35 text-xs">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
