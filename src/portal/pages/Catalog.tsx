import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Eye } from 'lucide-react';
import { products } from '@/data/products';

export default function PortalCatalog() {
  const [q, setQ] = useState('');
  const [fav, setFav] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('palm-favorites') || '[]'); } catch { return []; }
  });

  const toggleFav = (slug: string) => {
    const next = fav.includes(slug) ? fav.filter((s) => s !== slug) : [...fav, slug];
    setFav(next);
    localStorage.setItem('palm-favorites', JSON.stringify(next));
  };

  const filtered = products.filter((p) =>
    !q || `${p.nameAr} ${p.nameEn} ${p.taglineAr}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · CATALOG</p>
          <h1 className="a-display text-4xl md:text-5xl mt-1">الكتالوج</h1>
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
          <input className="a-input ps-9" placeholder="ابحث عن منتج…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <div key={p.slug} className="a-card a-card-hover overflow-hidden">
            <div className="aspect-[4/3] relative">
              <img decoding="async" loading="lazy" src={p.image} alt={p.nameAr} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleFav(p.slug)}
                className="absolute top-3 end-3 w-9 h-9 rounded-full grid place-items-center backdrop-blur"
                style={{ background: 'rgba(255,255,255,.85)', color: fav.includes(p.slug) ? 'hsl(var(--destructive))' : 'var(--a-text-muted)' }}
                aria-label="favorite"
              >
                <Heart className="w-4 h-4" fill={fav.includes(p.slug) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="p-5">
              <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--a-text-muted)' }}>{p.category}</div>
              <h3 className="a-display text-xl mt-1">{p.nameAr}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>{p.taglineAr}</p>
              <div className="flex gap-2 mt-4">
                <Link to={`/products/${p.slug}`} className="a-btn a-btn-ghost flex-1"><Eye className="w-3.5 h-3.5" /> التفاصيل</Link>
                <Link to="/portal/orders/new" className="a-btn a-btn-palm flex-1">اطلب الآن</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
