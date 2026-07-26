import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'pc_cart_session';
const CART_KEY = 'pc_cart_id';

function getSessionId(): string {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

async function getOrCreateCart(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id ?? null;

  // 1) Prefer an existing cart for this user/session.
  if (uid) {
    const { data } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem(CART_KEY, data.id);
      return data.id;
    }
  } else {
    const session_id = getSessionId();
    const { data } = await supabase
      .from('carts')
      .select('id')
      .is('user_id', null)
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      localStorage.setItem(CART_KEY, data.id);
      return data.id;
    }
  }

  // 2) Create a new cart.
  const payload = uid
    ? { user_id: uid, session_id: getSessionId() }
    : { user_id: null, session_id: getSessionId() };
  const { data: created, error } = await supabase
    .from('carts')
    .insert(payload)
    .select('id')
    .single();
  if (error || !created) throw error ?? new Error('Failed to create cart');
  localStorage.setItem(CART_KEY, created.id);
  return created.id;
}

export type AddToCartInput = {
  variantId: string;
  unitPrice: number;
  qty?: number;
};

export async function addToCart({ variantId, unitPrice, qty = 1 }: AddToCartInput): Promise<{ cartId: string; qty: number }> {
  const cartId = await getOrCreateCart();

  // Merge: if line exists, bump qty.
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, qty')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (existing?.id) {
    const nextQty = (existing.qty ?? 0) + qty;
    const { error } = await supabase
      .from('cart_items')
      .update({ qty: nextQty, unit_price: unitPrice })
      .eq('id', existing.id);
    if (error) throw error;
    await touchCart(cartId);
    return { cartId, qty: nextQty };
  }

  const { error } = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, variant_id: variantId, qty, unit_price: unitPrice });
  if (error) throw error;
  await touchCart(cartId);
  return { cartId, qty };
}

async function touchCart(cartId: string) {
  await supabase.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cartId);
}

export async function getCartCount(): Promise<number> {
  const cartId = localStorage.getItem(CART_KEY);
  if (!cartId) return 0;
  const { data } = await supabase.from('cart_items').select('qty').eq('cart_id', cartId);
  return (data ?? []).reduce((s, r) => s + (r.qty ?? 0), 0);
}
