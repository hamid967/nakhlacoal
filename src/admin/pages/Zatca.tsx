import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, KeyRound, Send, RefreshCw } from 'lucide-react';

type Credential = {
  id: string;
  environment: 'sandbox' | 'simulation' | 'production';
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
  uuid: string;
  icv: number;
  hash: string;
  invoice_type: string;
  submission_type: string;
  status: string;
  attempts: number;
  last_error: string | null;
  submitted_at: string | null;
  cleared_at: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  signed: 'bg-blue-500',
  cleared: 'bg-emerald-500',
  reported: 'bg-emerald-500',
  failed: 'bg-red-500',
  rejected: 'bg-red-600',
};

export default function ZatcaAdmin() {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [invoices, setInvoices] = useState<ZatcaInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  // New credential form
  const [form, setForm] = useState({
    environment: 'sandbox' as Credential['environment'],
    org_name: 'شركة فحم النخلة',
    org_vat: '',
    org_cr: '',
    device_serial: 'DEVICE-001',
    common_name: 'PalmCharcoal-POS-01',
  });
  const [otp, setOtp] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from('zatca_credentials').select('*').order('created_at', { ascending: false }),
      supabase.from('zatca_invoices').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    setCreds((c ?? []) as Credential[]);
    setInvoices((i ?? []) as ZatcaInvoice[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createCredential() {
    if (!form.org_vat || form.org_vat.length !== 15) {
      toast.error('الرقم الضريبي يجب أن يكون 15 رقمًا');
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
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

      <Tabs defaultValue="onboarding">
        <TabsList>
          <TabsTrigger value="onboarding">الأونبوردنغ والأجهزة</TabsTrigger>
          <TabsTrigger value="invoices">مراقبة الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إضافة جهاز جديد</CardTitle>
              <CardDescription>سجّل جهازًا (نقطة بيع/خادم) قبل توليد CSR وطلب الشهادة.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>البيئة</Label>
                <Select value={form.environment} onValueChange={(v: any) => setForm({ ...form, environment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (تطوير)</SelectItem>
                    <SelectItem value="simulation">Simulation (محاكاة)</SelectItem>
                    <SelectItem value="production">Production (إنتاج)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Input value={form.org_cr} onChange={(e) => setForm({ ...form, org_cr: e.target.value })} />
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
                <Button onClick={createCredential} disabled={busy === 'create'}>
                  {busy === 'create' ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <KeyRound className="w-4 h-4 ml-2" />}
                  إنشاء جهاز
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {creds.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد أجهزة مسجّلة بعد.</p>
            )}
            {creds.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.org_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {c.device_serial} · VAT {c.org_vat} · بيئة {c.environment}
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
              <CardTitle className="text-base">آخر 100 فاتورة</CardTitle>
              <CardDescription>سجل الإرسال إلى Clearance/Reporting مع سلسلة ICV/PIH.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
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
                    {invoices.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد فواتير بعد</td></tr>
                    )}
                    {invoices.map((z) => (
                      <tr key={z.id} className="border-t">
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
                        <td className="p-2">
                          {(z.status === 'failed' || z.status === 'pending' || z.status === 'signed') && (
                            <Button size="sm" variant="ghost" onClick={() => resubmit(z)} disabled={busy === z.id + ':resend'}>
                              {busy === z.id + ':resend' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
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
