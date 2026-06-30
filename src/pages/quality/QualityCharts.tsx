import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const trend = [
  { batch: '١', q: 92 }, { batch: '٢', q: 94 }, { batch: '٣', q: 93 },
  { batch: '٤', q: 96 }, { batch: '٥', q: 97 }, { batch: '٦', q: 98 },
  { batch: '٧', q: 97 }, { batch: '٨', q: 99 },
];
const comparison = [
  { metric: 'الكربون', palm: 85, market: 68 },
  { metric: 'الاحتراق', palm: 185, market: 110 },
  { metric: 'الحرارة', palm: 95, market: 70 },
  { metric: 'الرماد', palm: 97, market: 78 },
  { metric: 'النقاء', palm: 99, market: 75 },
];
const radar = [
  { k: 'الاحتراق', palm: 95, market: 65 },
  { k: 'الحرارة', palm: 92, market: 70 },
  { k: 'الرماد', palm: 97, market: 60 },
  { k: 'الدخان', palm: 96, market: 55 },
  { k: 'الرائحة', palm: 98, market: 62 },
  { k: 'الكربون', palm: 94, market: 68 },
];

export default function QualityCharts() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="clay-card rounded-2xl p-6 shadow-luxe"
      >
        <h3 className="font-arabic font-bold mb-4">اتجاه الجودة عبر الدفعات</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid stroke="hsl(var(--gold) / 0.1)" strokeDasharray="3 3" />
            <XAxis dataKey="batch" stroke="hsl(var(--foreground))" />
            <YAxis domain={[80, 100]} stroke="hsl(var(--foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--dark))', border: 'none', color: 'hsl(var(--background))' }} />
            <Line type="monotone" dataKey="q" stroke="hsl(var(--gold-hi))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--jade))' }} animationDuration={1800} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
        className="clay-card rounded-2xl p-6 shadow-luxe"
      >
        <h3 className="font-arabic font-bold mb-4">فحم النخلة مقابل متوسط السوق</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparison}>
            <CartesianGrid stroke="hsl(var(--gold) / 0.1)" strokeDasharray="3 3" />
            <XAxis dataKey="metric" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--dark))', border: 'none', color: 'hsl(var(--background))' }} />
            <Legend />
            <Bar dataKey="palm" name="فحم النخلة" fill="hsl(var(--gold-hi))" radius={[6, 6, 0, 0]} animationDuration={1500} />
            <Bar dataKey="market" name="السوق" fill="hsl(var(--jade))" radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
        className="lg:col-span-2 clay-card rounded-2xl p-6 shadow-luxe"
      >
        <h3 className="font-arabic font-bold mb-4">مقارنة الأداء متعدد المحاور</h3>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={radar}>
            <PolarGrid stroke="hsl(var(--gold) / 0.2)" />
            <PolarAngleAxis dataKey="k" stroke="hsl(var(--foreground))" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--foreground) / 0.4)" />
            <Radar name="فحم النخلة" dataKey="palm" stroke="hsl(var(--gold-hi))" fill="hsl(var(--gold-hi))" fillOpacity={0.5} animationDuration={1800} />
            <Radar name="السوق" dataKey="market" stroke="hsl(var(--jade))" fill="hsl(var(--jade))" fillOpacity={0.3} animationDuration={1800} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
