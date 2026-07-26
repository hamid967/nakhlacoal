import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';

type Channel = {
  id: string;
  provider: 'amazon' | 'noon' | 'other';
  name: string;
  active: boolean;
  last_sync_at: string | null;
};

export default function Marketplace() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<'amazon' | 'noon' | 'other'>('amazon');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('marketplace_channels').select('id,provider,name,active,last_sync_at').order('created_at', { ascending: false });
    setChannels((data as Channel[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addChannel = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from('marketplace_channels').insert({ provider, name: name.trim(), active: false });
    if (error) return toast.error(error.message);
    setName('');
    load();
  };
  const toggleActive = async (c: Channel) => {
    await supabase.from('marketplace_channels').update({ active: !c.active }).eq('id', c.id);
    load();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">قنوات البيع الخارجية</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة تكاملات Amazon.sa وNoon (المزامنة الفعلية تحتاج مفاتيح API).</p>
      </div>

      <Card>
        <CardHeader><CardTitle>إضافة قناة</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <select value={provider} onChange={(e) => setProvider(e.target.value as 'amazon' | 'noon' | 'other')} className="border rounded px-3 h-10 bg-background">
            <option value="amazon">Amazon.sa</option>
            <option value="noon">Noon</option>
            <option value="other">أخرى</option>
          </select>
          <Input placeholder="اسم القناة" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Button onClick={addChannel}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
        </CardContent>
      </Card>

      {loading ? <Skeleton className="h-40 w-full" /> : (
        <div className="grid gap-3">
          {channels.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد قنوات بعد.</CardContent></Card>
          ) : channels.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Badge variant="outline">{c.provider}</Badge>
                    <span className="ms-2">آخر مزامنة: {c.last_sync_at ? new Date(c.last_sync_at).toLocaleString('ar-SA') : 'لم تتم بعد'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={c.active ? 'bg-jade' : 'bg-muted text-muted-foreground'}>{c.active ? 'نشطة' : 'موقوفة'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(c)}>{c.active ? 'إيقاف' : 'تفعيل'}</Button>
                  <Button size="sm" variant="ghost" disabled title="يحتاج مفاتيح API"><RefreshCw className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4 text-sm">
          <strong>ملاحظة:</strong> لتفعيل المزامنة التلقائية للمخزون والطلبات، أضف مفاتيح Amazon SP-API وNoon Partner API عبر إعدادات المشروع.
        </CardContent>
      </Card>
    </div>
  );
}
