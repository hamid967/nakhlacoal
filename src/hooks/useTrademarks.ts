import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trademarks as fallback, type Trademark } from '@/data/trademarks';
import tm0 from '@/assets/trademarks/trademark-0.png';
import tm1 from '@/assets/trademarks/trademark-1.png';
import tm2 from '@/assets/trademarks/trademark-2.png';
import tm3 from '@/assets/trademarks/trademark-3.png';
import tm4 from '@/assets/trademarks/trademark-4.png';

const imageById: Record<string, string> = {
  'palm-charcoal': tm0,
  nakhlan: tm1,
  'al-markaz': tm2,
  'al-nakhlatain': tm3,
  baashen: tm4,
};

export function useTrademarks() {
  const [items, setItems] = useState<Trademark[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('trademarks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error || !data?.length) {
        setError(error?.message ?? null);
        setLoading(false);
        return;
      }
      setItems(
        data.map((r: any) => ({
          id: r.id,
          registrationNo: r.registration_no,
          nameAr: r.name_ar,
          nameEn: r.name_en,
          niceClass: r.nice_class,
          filedHijri: r.filed_hijri ?? '',
          registeredHijri: r.registered_hijri ?? '',
          expiresHijri: r.expires_hijri ?? '',
          ownerAr: r.owner_ar ?? '',
          addressAr: r.address_ar ?? '',
          countryAr: r.country_ar ?? '',
          descriptionAr: r.description_ar ?? '',
          goodsAr: r.goods_ar ?? '',
          colors: r.colors ?? [],
          image: imageById[r.id] ?? tm0,
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { trademarks: items, loading, error };
}
