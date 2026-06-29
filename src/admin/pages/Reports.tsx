import AdminAnalytics from '@/pages/AdminAnalytics';

export default function AdminReports() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>INTELLIGENCE</p>
        <h1 className="a-display text-4xl mt-1">التقارير والتحليلات</h1>
      </header>
      <div className="a-card overflow-hidden">
        {/* Reuse the existing analytics module inside the admin shell */}
        <div style={{ background: 'transparent' }}>
          <AdminAnalytics />
        </div>
      </div>
    </div>
  );
}
