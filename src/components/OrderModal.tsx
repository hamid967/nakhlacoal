import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { products } from '@/data/products';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '966501234567';

export function OrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [product, setProduct] = useState(products[0]?.slug ?? '');
  const [qty, setQty] = useState('10');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find((x) => x.slug === product);
    const text = isAr
      ? `مرحباً، أود تقديم طلب:\n• المنتج: ${p?.nameAr ?? product}\n• الكمية: ${qty} كجم\n• الاسم: ${name}\n• الجوال: ${phone}\n• ملاحظات: ${notes}`
      : `Hello, I'd like to place an order:\n• Product: ${p?.nameEn ?? product}\n• Quantity: ${qty} kg\n• Name: ${name}\n• Phone: ${phone}\n• Notes: ${notes}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{isAr ? 'اطلب الآن' : 'Place an Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'المنتج' : 'Product'}</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background">
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{isAr ? p.nameAr : p.nameEn}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'الكمية (كجم)' : 'Quantity (kg)'}</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'الاسم' : 'Name'}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'الجوال' : 'Phone'}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+966..." className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'ملاحظات' : 'Notes'}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-[#25D366] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <MessageCircle className="w-4 h-4" />
            {isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
