import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, KeyRound, Send, RefreshCw, FlaskConical, Rocket, AlertTriangle, Download, ChevronDown, ChevronLeft, FileCode, QrCode, Copy } from 'lucide-react';

type EnvKey = 'sandbox' | 'simulation' | 'production';
type EnvScope = 'nonprod' | 'production';

type Credential = {
  id: string;
  environment: EnvKey;
  org_name: string;
  org_vat: string;
  org_cr: string | null;
  device_serial: string;
  common_name: string;
  csr: string | null;
  compliance_csid: string | null;
  compliance_request_id: string | null;
  production_csid: string | null;
  onboarding_step: string;
  active: boolean;
  created_at: string;
};

type ZatcaInvoice = {
  id: string;
  invoice_id: string;
  credential_id: string;
  uuid: string;
  icv: number;
  pih: string | null;
  hash: string;
  xml_signed: string | null;
  qr_base64: string | null;
  invoice_type: string;
  invoice_subtype: string | null;
  submission_type: string;
  status: string;
  zatca_response: any;
  attempts: number;
  last_error: string | null;
  submitted_at: string | null;
  cleared_at: string | null;
  created_at: string;
  updated_at: string | null;
  alerted_at?: string | null;
  alert_count?: number | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  signed: 'bg-blue-500',
  cleared: 'bg-emerald-500',
  reported: 'bg-emerald-500',
  failed: 'bg-red-500',
  rejected: 'bg-red-600',
};

const SCOPE_KEY = 'zatca:env-scope';

function scopeOf(env: EnvKey): EnvScope {
  return env === 'production' ? 'production' : 'nonprod';
}

export default function ZatcaAdmin() {
  const [scope, setScope] = useState<EnvScope>(() => {
    const s = typeof window !== 'undefined' ? localStorage.getItem(SCOPE_KEY) : null;
    return s === 'production' ? 'production' : 'nonprod';
  });
  const [creds, setCreds] = useState<Credential[]>([]);
  const [invoices, setInvoices] = useState<ZatcaInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const defaultEnv: EnvKey = scope === 'production' ? 'production' : 'sandbox';

  const [form, setForm] = useState({
    org_name: 'شركة فحم النخلة',
    org_vat: '',
    org_cr: '',
    device_serial: 'DEVICE-001',
    common_name: 'PalmCharcoal-POS-01',
    environment: defaultEnv as EnvKey,
  });
  const [otp, setOtp] = useState('');

  // keep form environment in sync with active scope
  useEffect(() => {
    setForm((f) => ({
      ...f,
      environment: scope === 'production' ? 'production' : (f.environment === 'production' ? 'sandbox' : f.environment),
    }));
    localStorage.setItem(SCOPE_KEY, scope);
  }, [scope]);

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from('zatca_credentials').select('*').order('created_at', { ascending: false }),
      supabase.from('zatca_invoices').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    setCreds((c ?? []) as Credential[]);
    setInvoices((i ?? []) as ZatcaInvoice[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Deep-link: ?invoice=<id>&env=<sandbox|simulation|production>
  useEffect(() => {
    if (loading) return;
    const target = searchParams.get('invoice');
    if (!target) return;
    const zi = invoices.find((z) => z.id === target);
    if (!zi) return;
    const cred = creds.find((c) => c.id === zi.credential_id);
    const desiredScope: EnvScope = cred ? scopeOf(cred.environment) : (searchParams.get('env') === 'production' ? 'production' : 'nonprod');
    if (desiredScope !== scope) {
      setScope(desiredScope);
      return; // wait for re-render
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(target);
      return next;
    });
    // switch to invoices tab and scroll
    requestAnimationFrame(() => {
      const el = rowRefs.current[target];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary');
        setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), 2400);
      }
    });
    // clear the query param so refresh doesn't re-trigger
    const next = new URLSearchParams(searchParams);
    next.delete('invoice');
    next.delete('env');
    setSearchParams(next, { replace: true });
  }, [loading, invoices, creds, searchParams, scope, setSearchParams]);


  const scopedCreds = useMemo(
    () => creds.filter((c) => scopeOf(c.environment) === scope),
    [creds, scope],
  );
  const scopedCredIds = useMemo(() => new Set(scopedCreds.map((c) => c.id)), [scopedCreds]);
  const scopedInvoices = useMemo(
    () => invoices.filter((z) => scopedCredIds.has(z.credential_id)),
    [invoices, scopedCredIds],
  );
  const filteredInvoices = useMemo(
    () => scopedInvoices.filter((z) => statusFilter === 'all' || z.status === statusFilter),
    [scopedInvoices, statusFilter],
  );

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyText(t: string) {
    try {
      await navigator.clipboard.writeText(t);
      toast.success('تم النسخ');
    } catch {
      toast.error('تعذّر النسخ');
    }
  }

  const counts = useMemo(() => {
    const c = { nonprod: 0, production: 0 };
    for (const cr of creds) c[scopeOf(cr.environment)]++;
    return c;
  }, [creds]);

  async function createCredential() {
    if (!form.org_vat || form.org_vat.length !== 15) {
      toast.error('الرقم الضريبي يجب أن يكون 15 رقمًا');
      return;
    }
    if (scope === 'production' && form.environment !== 'production') {
      toast.error('في وضع Production يجب أن تكون بيئة الجهاز production');
      return;
    }
    if (scope === 'nonprod' && form.environment === 'production') {
      toast.error('في وضع Sandbox لا يمكن إنشاء جهاز production');
      return;
    }
    setBusy('create');
    const { error } = await supabase.from('zatca_credentials').insert(form);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success('تم إنشاء بيانات الجهاز');
    setForm({ ...form, device_serial: `DEVICE-${Date.now().toString().slice(-4)}` });
    load();
  }

  async function generateCsr(id: string) {
    setBusy(id + ':csr');
    const { data, error } = await supabase.functions.invoke('zatca-generate-csr', {
      body: { credentialId: id },
    });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    if ((data as any)?.error) { toast.error((data as any).error); return; }
    toast.success('تم توليد CSR والمفتاح الخاص');
    load();
  }

  async function onboard(id: string, step: 'compliance' | 'production') {
    if (step === 'compliance' && !otp) {
      toast.error('أدخل OTP من بوابة فاتورة');
      return;
    }
    setBusy(id + ':' + step);
    const { data, error } = await supabase.functions.invoke('zatca-onboard', {
      body: { credentialId: id, step, otp: step === 'compliance' ? otp : undefined },
    });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    const d = data as any;
    if (d?.error) { toast.error(`${d.error}: ${JSON.stringify(d.body ?? '')}`); return; }
    toast.success(step === 'compliance' ? 'تم استلام Compliance CSID' : 'تم تفعيل Production CSID');
    setOtp('');
    load();
  }

  async function resubmit(zRow: ZatcaInvoice) {
    setBusy(zRow.id + ':resend');
    const { data, error } = await supabase.functions.invoke('zatca-sign-invoice', {
      body: { invoiceId: zRow.invoice_id },
    });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    const d = data as any;
    if (d?.error) { toast.error(d.error); return; }
    toast.success(`الحالة: ${d?.status ?? 'ok'}`);
    load();
  }

  const isProd = scope === 'production';

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ZATCA — الفوترة الإلكترونية (المرحلة الثانية)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            الأونبوردنغ مع هيئة الزكاة والضريبة والجمارك ومراقبة إرسال الفواتير.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Environment switcher */}
      <Card className={isProd ? 'border-red-500/60 bg-red-50/40 dark:bg-red-950/20' : 'border-amber-500/60 bg-amber-50/40 dark:bg-amber-950/20'}>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isProd ? (
              <Rocket className="w-5 h-5 text-red-600" />
            ) : (
              <FlaskConical className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <div className="font-semibold text-sm">
                البيئة النشطة: {isProd ? 'Production (إنتاج فعلي)' : 'Sandbox / Simulation (اختبار)'}
              </div>
              <div className="text-xs text-muted-foreground">
                الاعتماديات والفواتير معزولة لكل بيئة. عدد الأجهزة — Sandbox: {counts.nonprod} · Production: {counts.production}
              </div>
            </div>
          </div>
          <div className="inline-flex rounded-md border bg-background p-1">
            <button
              type="button"
              onClick={() => setScope('nonprod')}
              className={`px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 transition ${
                !isProd ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" /> Sandbox
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isProd && !confirm('هل أنت متأكد من التبديل إلى Production؟ سيتم إرسال الفواتير فعليًا إلى هيئة الزكاة.')) return;
                setScope('production');
              }}
              className={`px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 transition ${
                isProd ? 'bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" /> Production
            </button>
          </div>
        </CardContent>
      </Card>

      {isProd && (
        <div className="flex items-start gap-2 rounded-md border border-red-500/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            وضع Production نشط. أي جهاز أو فاتورة يُنشأ هنا سيتصل بواجهات ZATCA الرسمية ويُصدر شهادات إنتاج فعلية.
          </div>
        </div>
      )}

      <Tabs defaultValue="onboarding">
        <TabsList>
          <TabsTrigger value="onboarding">
            الأونبوردنغ والأجهزة ({scopedCreds.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            مراقبة الفواتير ({scopedInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                إضافة جهاز جديد — {isProd ? 'Production' : 'Sandbox/Simulation'}
              </CardTitle>
              <CardDescription>
                {isProd
                  ? 'سيتم تسجيل الجهاز مع بيئة Production الرسمية.'
                  : 'اختر Sandbox للتطوير أو Simulation لاختبار سيناريو ما قبل الإنتاج.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {!isProd && (
                <div>
                  <Label>نوع البيئة الاختبارية</Label>
                  <div className="inline-flex rounded-md border bg-background p-1 mt-1">
                    {(['sandbox', 'simulation'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm({ ...form, environment: v })}
                        className={`px-3 py-1.5 text-xs rounded-sm transition ${
                          form.environment === v ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {v === 'sandbox' ? 'Sandbox' : 'Simulation'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>اسم المنشأة</Label>
                <Input value={form.org_name} onChange={(e) => setForm({ ...form, org_name: e.target.value })} />
              </div>
              <div>
                <Label>الرقم الضريبي (15 رقم)</Label>
                <Input value={form.org_vat} maxLength={15} onChange={(e) => setForm({ ...form, org_vat: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <Label>السجل التجاري</Label>
                <Input value={form.org_cr ?? ''} onChange={(e) => setForm({ ...form, org_cr: e.target.value })} />
              </div>
              <div>
                <Label>الرقم التسلسلي للجهاز</Label>
                <Input value={form.device_serial} onChange={(e) => setForm({ ...form, device_serial: e.target.value })} />
              </div>
              <div>
                <Label>الاسم الشائع (CN)</Label>
                <Input value={form.common_name} onChange={(e) => setForm({ ...form, common_name: e.target.value })} />
              </div>
              <div className="md:col-span-3">
                <Button
                  onClick={createCredential}
                  disabled={busy === 'create'}
                  className={isProd ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {busy === 'create' ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <KeyRound className="w-4 h-4 ml-2" />}
                  إنشاء جهاز {isProd ? 'Production' : 'اختباري'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {scopedCreds.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                لا توجد أجهزة مسجّلة في بيئة {isProd ? 'Production' : 'Sandbox/Simulation'} بعد.
              </p>
            )}
            {scopedCreds.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {c.org_name}
                        <Badge variant="outline" className={c.environment === 'production' ? 'text-red-600 border-red-600' : 'text-amber-600 border-amber-600'}>
                          {c.environment}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {c.device_serial} · VAT {c.org_vat}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={c.active ? 'bg-emerald-500' : 'bg-gray-400'}>
                        {c.active ? 'مفعّل' : c.onboarding_step}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                    <div>CSR: {c.csr ? '✓ متوفر' : '—'}</div>
                    <div>Compliance CSID: {c.compliance_csid ? '✓' : '—'}</div>
                    <div>Request ID: {c.compliance_request_id ?? '—'}</div>
                    <div>Production CSID: {c.production_csid ? '✓' : '—'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    {!c.csr && (
                      <Button size="sm" variant="outline" onClick={() => generateCsr(c.id)} disabled={busy === c.id + ':csr'}>
                        {busy === c.id + ':csr' ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
                        1) توليد CSR
                      </Button>
                    )}
                    {c.csr && !c.compliance_csid && (
                      <>
                        <div className="flex flex-col">
                          <Label className="text-xs">OTP من بوابة فاتورة</Label>
                          <Input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-32" placeholder="123456" />
                        </div>
                        <Button size="sm" onClick={() => onboard(c.id, 'compliance')} disabled={busy === c.id + ':compliance'}>
                          {busy === c.id + ':compliance' ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
                          2) طلب Compliance CSID
                        </Button>
                      </>
                    )}
                    {c.compliance_csid && !c.production_csid && (
                      <Button size="sm" onClick={() => onboard(c.id, 'production')} disabled={busy === c.id + ':production'}>
                        {busy === c.id + ':production' ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
                        3) تفعيل Production CSID
                      </Button>
                    )}
                    {c.active && <Badge variant="outline" className="text-emerald-600 border-emerald-600">جاهز للإرسال</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">
                    فواتير بيئة {isProd ? 'Production' : 'Sandbox/Simulation'}
                  </CardTitle>
                  <CardDescription>سجل الإرسال إلى Clearance/Reporting مع سلسلة ICV/PIH والحمولات الكاملة.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border bg-background p-0.5">
                    {(['all','signed','cleared','reported','failed','rejected','pending'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 text-xs rounded-sm transition ${
                          statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s === 'all' ? 'الكل' : s}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => exportInvoicesCsv(filteredInvoices, scope)}>
                    <Download className="w-3.5 h-3.5 ml-1.5" /> CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 w-6"></th>
                      <th className="p-2 text-right">ICV</th>
                      <th className="p-2 text-right">النوع</th>
                      <th className="p-2 text-right">Endpoint</th>
                      <th className="p-2 text-right">الحالة</th>
                      <th className="p-2 text-right">المحاولات</th>
                      <th className="p-2 text-right">Hash</th>
                      <th className="p-2 text-right">أرسلت</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 && (
                      <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">لا توجد فواتير مطابقة</td></tr>
                    )}
                    {filteredInvoices.map((z) => {
                      const isOpen = expanded.has(z.id);
                      return (
                        <>
                          <tr key={z.id} ref={(el) => { rowRefs.current[z.id] = el; }} className="border-t hover:bg-muted/30 cursor-pointer transition-shadow" onClick={() => toggleExpanded(z.id)}>
                            <td className="p-2">
                              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                            </td>
                            <td className="p-2 font-mono">{z.icv}</td>
                            <td className="p-2">{z.invoice_type === 'simplified' ? 'مبسّطة' : 'قياسية'}</td>
                            <td className="p-2">{z.submission_type === 'clearance' ? 'Clearance' : 'Reporting'}</td>
                            <td className="p-2">
                              <Badge className={STATUS_COLORS[z.status] ?? 'bg-gray-500'}>{z.status}</Badge>
                            </td>
                            <td className="p-2">{z.attempts}</td>
                            <td className="p-2 font-mono text-[10px] truncate max-w-[120px]" title={z.hash}>
                              {z.hash?.slice(0, 12)}…
                            </td>
                            <td className="p-2">{z.submitted_at ? new Date(z.submitted_at).toLocaleString('ar-SA') : '—'}</td>
                            <td className="p-2" onClick={(e) => e.stopPropagation()}>
                              {(z.status === 'failed' || z.status === 'pending' || z.status === 'signed') && (
                                <Button size="sm" variant="ghost" onClick={() => resubmit(z)} disabled={busy === z.id + ':resend'}>
                                  {busy === z.id + ':resend' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                </Button>
                              )}
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className="border-t bg-muted/20">
                              <td></td>
                              <td colSpan={8} className="p-3">
                                <InvoiceDetail z={z} onCopy={(t) => copyText(t)} />
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- helpers ----------

function downloadBlob(name: string, data: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function exportInvoicesCsv(rows: ZatcaInvoice[], scope: EnvScope) {
  const headers = [
    'created_at','updated_at','submitted_at','cleared_at',
    'icv','uuid','invoice_id','credential_id',
    'invoice_type','submission_type','status','attempts',
    'hash','pih','last_error',
  ];
  const esc = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => esc((r as any)[h])).join(','));
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadBlob(`zatca-${scope}-${stamp}.csv`, lines.join('\n'), 'text/csv;charset=utf-8');
}

function InvoiceDetail({ z, onCopy }: { z: ZatcaInvoice; onCopy: (t: string) => void }) {
  const responseStr = z.zatca_response ? JSON.stringify(z.zatca_response, null, 2) : '';
  const stamp = new Date(z.created_at).toISOString().replace(/[:.]/g, '-');
  const base = `zatca-${z.icv}-${stamp}`;

  const timeline: Array<{ label: string; at: string | null; tone: string }> = [
    { label: 'أُنشئت', at: z.created_at, tone: 'bg-gray-500' },
    { label: 'وُقّعت', at: z.status !== 'pending' ? z.updated_at : null, tone: 'bg-blue-500' },
    { label: 'أُرسلت', at: z.submitted_at, tone: 'bg-amber-500' },
    {
      label: z.submission_type === 'clearance' ? 'تمت المصادقة' : 'تم الإبلاغ',
      at: z.cleared_at,
      tone: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Meta grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <div><span className="text-muted-foreground">UUID: </span><span className="font-mono">{z.uuid}</span></div>
        <div><span className="text-muted-foreground">Invoice: </span><span className="font-mono">{z.invoice_id.slice(0, 8)}…</span></div>
        <div><span className="text-muted-foreground">Subtype: </span>{z.invoice_subtype ?? '—'}</div>
        <div><span className="text-muted-foreground">Cred: </span><span className="font-mono">{z.credential_id.slice(0, 8)}…</span></div>
        <div className="col-span-2 md:col-span-4">
          <span className="text-muted-foreground">PIH: </span>
          <span className="font-mono break-all">{z.pih ?? '—'}</span>
        </div>
        <div className="col-span-2 md:col-span-4">
          <span className="text-muted-foreground">Hash: </span>
          <span className="font-mono break-all">{z.hash}</span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="text-[11px] font-semibold mb-1.5 text-muted-foreground">السجل الزمني</div>
        <div className="flex flex-wrap items-center gap-2">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${t.at ? t.tone : 'bg-muted'}`} />
              <span className="text-[11px]">
                {t.label}
                {t.at && <span className="text-muted-foreground mr-1"> · {new Date(t.at).toLocaleString('ar-SA')}</span>}
              </span>
              {i < timeline.length - 1 && <span className="text-muted-foreground">›</span>}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          محاولات الإرسال: <span className="font-semibold text-foreground">{z.attempts}</span>
        </div>
      </div>

      {/* Error banner */}
      {z.last_error && (
        <div className="rounded-md border border-red-500/50 bg-red-50 dark:bg-red-950/30 p-2 text-[11px] text-red-700 dark:text-red-300">
          <div className="font-semibold mb-0.5">آخر خطأ:</div>
          <div className="font-mono whitespace-pre-wrap break-all">{z.last_error}</div>
        </div>
      )}

      {/* Payloads */}
      <div className="grid md:grid-cols-2 gap-2">
        <PayloadBox
          title="Signed UBL XML"
          icon={<FileCode className="w-3.5 h-3.5" />}
          content={z.xml_signed}
          language="xml"
          onCopy={onCopy}
          onDownload={() => z.xml_signed && downloadBlob(`${base}.xml`, z.xml_signed, 'application/xml')}
        />
        <PayloadBox
          title="ZATCA Response"
          icon={<Send className="w-3.5 h-3.5" />}
          content={responseStr}
          language="json"
          onCopy={onCopy}
          onDownload={() => responseStr && downloadBlob(`${base}-response.json`, responseStr, 'application/json')}
        />
      </div>

      {z.qr_base64 && (
        <div className="flex items-start gap-3 rounded-md border p-2">
          <QrCode className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold mb-1">QR (TLV Base64)</div>
            <div className="font-mono text-[10px] break-all text-muted-foreground line-clamp-3">{z.qr_base64}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onCopy(z.qr_base64!)}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => downloadBlob(`${base}-qr.txt`, z.qr_base64!, 'text/plain')}>
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PayloadBox({
  title, icon, content, language, onCopy, onDownload,
}: {
  title: string;
  icon: React.ReactNode;
  content: string | null;
  language: string;
  onCopy: (t: string) => void;
  onDownload: () => void;
}) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/40 px-2 py-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          {icon} {title} <span className="text-muted-foreground font-normal">({language})</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => content && onCopy(content)} disabled={!content}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDownload} disabled={!content}>
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <pre dir="ltr" className="p-2 text-[10px] font-mono bg-background max-h-56 overflow-auto whitespace-pre-wrap break-all">
        {content || <span className="text-muted-foreground">— لا يوجد —</span>}
      </pre>
    </div>
  );
}

