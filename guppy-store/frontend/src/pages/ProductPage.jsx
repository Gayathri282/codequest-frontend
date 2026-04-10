import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { BREEDS } from '../utils/breeds';

export default function ProductPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/breed/${slug}`)
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const meta = BREEDS.find(b => b.slug === slug);

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}> {/* Black background */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/40 mb-6 transition-colors hover:text-[#D4AF37]"> {/* Gold hover */}
          <ChevronLeft size={16} /> Back to breeds
        </Link>

        {/* Breed header */}
        <div className={`relative rounded-2xl overflow-hidden mb-8 h-40`}>
          {meta?.image ? (
            <img src={meta.image} alt={`${meta.name} guppy breed`} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full`} style={{ background: meta?.gradient || 'linear-gradient(135deg, #111111, #050505)' }}> {/* Dark gray/black gradient */}
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: `url('/fish.svg')`, backgroundSize: '60px', backgroundRepeat: 'repeat' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Breed</p>
            <h1 className="text-2xl font-bold text-white">{meta?.name || slug.replace(/-/g, ' ')}</h1>
            {meta?.tagline && <p className="text-white/65 text-sm mt-1">{meta.tagline}</p>}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex flex-wrap gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="w-44 rounded-2xl animate-pulse" style={{ aspectRatio: '3/4', background: '#111111' }} /> 
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <img src="/fish.svg" alt="No fish listed yet in this breed — check back soon" className="w-16 h-16 opacity-20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white/50">No fish listed yet</h2>
            <p className="text-white/30 mt-1 text-sm">Check back soon — new arrivals coming!</p>
            <Link to="/" // Browse other breeds button
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
                color: '#000',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '12px 24px',
                boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
              }}>Browse other breeds</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/40 mb-4">{products.length} fish available</p>
            <div className="flex flex-wrap gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
