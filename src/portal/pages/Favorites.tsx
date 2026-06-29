import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { products } from '@/data/products';

export default function PortalFavorites() {
  const [fav, setFav] = useState<string[]>([]);
  useEffect(() => {
    try { setFav(JSON.parse(localStorage.getItem('palm-favorites') || '[]')); } catch { setFav([]); }
  }, []);
  const items = products.filter((p) => fav.includes(p.slug));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · WISHLIST</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">المفضلة</h1>
      </header>

      {!items.length ? (
        <div className="a-card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto"
               style={{ background: 'var(--a-surface-2)', color: 'hsl(var(--destructive))' }}>
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--a-text-muted)' }}>لا توجد منتجات في المفضلة بعد.</p>
          <Link to="/portal/catalog" className="a-btn a-btn-palm mt-4 inline-flex">تصفّح الكتالوج</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <div key={p.slug} className="a-card a-card-hover overflow-hidden">
              <img src={p.image} alt={p.nameAr} className="w-full aspect-[4/3] object-cover" />
              <div className="p-5">
                <h3 className="a-display text-xl">{p.nameAr}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>{p.taglineAr}</p>
                <Link to="/portal/orders/new" className="a-btn a-btn-palm mt-4 w-full">إعادة الطلب</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
