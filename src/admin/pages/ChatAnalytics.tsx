import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2, MessageSquare, Users, Sparkles, TrendingUp, Radio } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

type Conversation = {
  id: string;
  user_id: string | null;
  title: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

const PERIODS = [
  { value: 7, label: '٧ أيام' },
  { value: 30, label: '٣٠ يوم' },
  { value: 90, label: '٩٠ يوم' },
  { value: 0, label: 'الكل' },
];

export default function ChatAnalytics() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, m] = await Promise.all([
        supabase.from('chat_conversations').select('*').order('updated_at', { ascending: false }).limit(500),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(3000),
      ]);
      setConvs((c.data as Conversation[]) || []);
      setMsgs((m.data as Message[]) || []);
      setLoading(false);
    })();
  }, []);

  const filteredConvs = useMemo(() => {
    if (!days) return convs;
    const cutoff = Date.now() - days * 86400000;
    return convs.filter((c) => new Date(c.updated_at).getTime() >= cutoff);
  }, [convs, days]);

  const filteredMsgs = useMemo(() => {
    if (!days) return msgs;
    const cutoff = Date.now() - days * 86400000;
    return msgs.filter((m) => new Date(m.created_at).getTime() >= cutoff);
  }, [msgs, days]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(filteredConvs.map((c) => c.user_id).filter(Boolean)).size;
    const userMsgs = filteredMsgs.filter((m) => m.role === 'user').length;
    const assistantMsgs = filteredMsgs.filter((m) => m.role === 'assistant').length;

    const byDay: Record<string, { convs: number; msgs: number }> = {};
    filteredConvs.forEach((c) => {
      const d = new Date(c.created_at).toISOString().slice(0, 10);
      if (!byDay[d]) byDay[d] = { convs: 0, msgs: 0 };
      byDay[d].convs += 1;
    });
    filteredMsgs.forEach((m) => {
      const d = new Date(m.created_at).toISOString().slice(0, 10);
      if (!byDay[d]) byDay[d] = { convs: 0, msgs: 0 };
      byDay[d].msgs += 1;
    });
    const timeline = Object.entries(byDay)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const byHour: Record<number, number> = {};
    filteredMsgs.forEach((m) => {
      const h = new Date(m.created_at).getHours();
      byHour[h] = (byHour[h] || 0) + 1;
    });
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: byHour[h] || 0 }));

    const avgMsgsPerConv = filteredConvs.length ? Math.round((filteredMsgs.length / filteredConvs.length) * 10) / 10 : 0;

    return {
      totalConvs: filteredConvs.length,
      totalMsgs: filteredMsgs.length,
      uniqueUsers,
      userMsgs,
      assistantMsgs,
      avgMsgsPerConv,
      timeline,
      hourly,
    };
  }, [filteredConvs, filteredMsgs]);

  const selectedMsgs = useMemo(
    () => msgs.filter((m) => m.conversation_id === selected).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [msgs, selected],
  );

  return (
    <section dir="rtl">
      <SEO title="تحليلات المساعد — فحم النخلة" description="إحصاءات محادثات مساعد الذكاء الاصطناعي." path="/admin/chats" />

      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.3em] text-emerald-700/70">ADMIN · AI ASSISTANT</p>
          <h1 className="a-display text-3xl mt-2" style={{ color: 'var(--a-palm)' }}>تحليلات المساعد الذكي</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>محادثات العملاء مع مساعد فحم النخلة AI.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-full a-glass">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-4 py-1.5 rounded-full text-xs transition ${days === p.value ? 'a-btn-primary' : ''}`}
              style={days !== p.value ? { color: 'var(--a-text-muted)' } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin" style={{ color: 'var(--a-palm)' }} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={MessageSquare} label="إجمالي المحادثات" value={stats.totalConvs.toLocaleString('ar-SA')} />
            <StatCard icon={Sparkles} label="إجمالي الرسائل" value={stats.totalMsgs.toLocaleString('ar-SA')} />
            <StatCard icon={Users} label="عملاء مميزون" value={stats.uniqueUsers.toLocaleString('ar-SA')} />
            <StatCard icon={TrendingUp} label="متوسط الرسائل / محادثة" value={String(stats.avgMsgsPerConv)} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="النشاط اليومي">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="convs" name="محادثات" stroke="#1A4A00" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="msgs" name="رسائل" stroke="#C9A227" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="ذروة النشاط بالساعة">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="رسائل" fill="#1A4A00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <ChartCard title="أحدث المحادثات" className="lg:col-span-2">
              <div className="a-scroll max-h-[500px] overflow-y-auto -mx-2">
                {filteredConvs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-right px-3 py-2.5 rounded-lg mb-1 transition text-sm ${selected === c.id ? 'a-btn-primary' : 'hover:bg-[var(--a-soft)]'}`}
                  >
                    <div className="font-medium truncate">{c.title || 'محادثة'}</div>
                    <div className="text-xs opacity-70 truncate mt-0.5">{c.last_message_preview || '—'}</div>
                    <div className="text-[10px] opacity-50 mt-1">{new Date(c.updated_at).toLocaleString('ar-SA')}</div>
                  </button>
                ))}
                {!filteredConvs.length && <div className="py-8 text-center text-xs opacity-60">لا توجد محادثات.</div>}
              </div>
            </ChartCard>

            <ChartCard title={selected ? 'تفاصيل المحادثة' : 'اختر محادثة لعرضها'} className="lg:col-span-3">
              <div className="a-scroll max-h-[500px] overflow-y-auto space-y-3">
                {selectedMsgs.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-[var(--a-soft)]' : ''}`}
                    style={m.role === 'assistant' ? { background: 'rgba(26,74,0,0.06)', border: '1px solid rgba(26,74,0,0.15)' } : {}}
                  >
                    <div className="text-[10px] opacity-60 mb-1">
                      {m.role === 'user' ? '👤 عميل' : '🌴 المساعد'} · {new Date(m.created_at).toLocaleString('ar-SA')}
                    </div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
                {selected && !selectedMsgs.length && <div className="py-8 text-center text-xs opacity-60">لا توجد رسائل.</div>}
                {!selected && <div className="py-8 text-center text-xs opacity-60">اختر محادثة من القائمة.</div>}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="a-glass p-5 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color: 'var(--a-palm)' }} />
      </div>
      <div className="mt-2 text-2xl a-display" style={{ color: 'var(--a-palm)' }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`a-glass p-5 rounded-2xl ${className}`}>
      <h3 className="text-sm font-medium mb-4 tracking-wide" style={{ color: 'var(--a-palm)' }}>{title}</h3>
      {children}
    </div>
  );
}
