import { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminNotifications, type AdminNotification } from '@/admin/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const SEV_ICON: Record<AdminNotification['severity'], any> = {
  info: Info, success: CheckCircle2, warning: AlertTriangle, critical: AlertOctagon,
};
const SEV_COLOR: Record<AdminNotification['severity'], string> = {
  info: 'text-sky-500', success: 'text-emerald-500',
  warning: 'text-amber-500', critical: 'text-red-500',
};

function formatRel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)}د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}س`;
  return `${Math.floor(diff / 86400)}ي`;
}

export function NotificationBell() {
  const { items, unread, markRead, markAllRead } = useAdminNotifications(20);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="a-btn a-btn-ghost relative" title="الإشعارات" aria-label="notifications">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span
              className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold grid place-items-center text-white"
              style={{ background: 'var(--a-gold, hsl(var(--palm-gold)))' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" dir="rtl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-sm">الإشعارات {unread > 0 && <span className="text-xs text-muted-foreground">({unread} غير مقروء)</span>}</div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllRead} className="h-7 text-xs">
                <CheckCheck className="w-3.5 h-3.5 me-1" /> قراءة الكل
              </Button>
            )}
            <Link to="/admin/notifications" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline px-2">الكل</Link>
          </div>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">لا توجد إشعارات.</div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const Icon = SEV_ICON[n.severity] || Info;
                const inner = (
                  <div className={`px-4 py-3 flex gap-3 hover:bg-muted/50 ${!n.read_at ? 'bg-muted/30' : ''}`}>
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${SEV_COLOR[n.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`text-sm ${!n.read_at ? 'font-semibold' : ''} truncate`}>{n.title}</div>
                        <span className="text-[10px] text-muted-foreground shrink-0 ms-auto">{formatRel(n.created_at)}</span>
                      </div>
                      {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                    </div>
                    {!n.read_at && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link to={n.link} onClick={() => { setOpen(false); markRead(n.id); }}>{inner}</Link>
                    ) : (
                      <button className="w-full text-start" onClick={() => markRead(n.id)}>{inner}</button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
