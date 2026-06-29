
# Customer Portal — بوابة العميل المتميزة

نسخة موجّهة للعميل من لوحة الإدارة الحالية. تعيد استخدام **نفس** نظام التصميم (admin.css، الـSidebar/Topbar، البطاقات `a-card`، الـpills، الـcharts، حركات Framer Motion، الزجاجية، الزوايا، الخطوط، الألوان)، مع تغيير **المحتوى والصلاحيات والتنقّل** فقط.

## النطاق

- مسار جذر جديد: `/portal/*` محمي بدور `user` (أو أعلى) عبر `ProtectedRoute`.
- لا يصل العميل لأي مسار `/admin/*` نهائياً (محمي بالفعل بـ`requireRole="admin"`).
- لا تُعرض بيانات عملاء آخرين، تقارير مالية للشركة، إدارة المخزون، إدارة المستخدمين، الجودة، التحليلات الداخلية، أو إعدادات الموقع.

## القطع المُعاد استخدامها (بدون تكرار)

- `src/admin/admin.css` — كل التوكنات والمكوّنات (`a-card`, `a-btn`, `a-pill-*`, `a-display`).
- `AdminTopbar` (نسخة مُعاد تسميتها سيمانتيكاً `PortalTopbar` تستورد نفس CSS وتوفّر theme toggle + ابحث + بروفايل).
- نفس بنية `AdminLayout` (Sidebar + Topbar + AnimatePresence main).
- `framer-motion`, `recharts`, `lucide-react`, `sonner`.

## الملفات الجديدة

```
src/portal/
  PortalLayout.tsx          # نسخة من AdminLayout، يستورد admin.css
  PortalSidebar.tsx         # نفس بنية AdminSidebar، عناصر العميل فقط
  PortalTopbar.tsx          # مطابق لـ AdminTopbar (theme/search/profile)
  pages/
    Dashboard.tsx           # ترحيب + 8 بطاقات + رسم طلباتي + آخر الطلبات + توصيات
    Orders.tsx              # جدول طلباتي مع فلتر/بحث (RLS: user_id = auth.uid())
    NewOrder.tsx            # غلاف لـ pages/NewOrder الحالي داخل الـshell
    Tracking.tsx            # تايملاين الطلب (يعيد منطق OrderTracking)
    Invoices.tsx            # قائمة فواتير (placeholder + جدول)
    Payments.tsx            # سجل مدفوعات (placeholder)
    Quotes.tsx              # عروض سعرية
    Catalog.tsx             # بطاقات منتجات من src/data/products + بحث/فلتر/مفضلة
    Trademarks.tsx          # عرض من src/data/trademarks (قراءة فقط)
    Favorites.tsx           # localStorage wishlist
    Notifications.tsx
    Messages.tsx            # placeholder chat UI
    Support.tsx             # واتساب/بريد/هاتف + روابط
    Addresses.tsx
    Profile.tsx             # غلاف Profile الحالي
    Settings.tsx            # لغة + ثيم + إشعارات + 2FA placeholder
    Placeholder.tsx
```

## التنقّل (Sidebar — RTL، 18 عنصر)

لوحة التحكم · طلباتي · إنشاء طلب · تتبع الطلبات · الفواتير · المدفوعات · العروض السعرية · المنتجات · العلامات التجارية · الكتالوج · الشهادات · المفضلة · الإشعارات · الدعم · الرسائل · العناوين · الملف الشخصي · الإعدادات · تسجيل الخروج

مجموعات: **عام** (Dashboard) · **الطلبات** (طلباتي/جديد/تتبع/عروض) · **المالية** (فواتير/مدفوعات) · **المنتجات** (كتالوج/علامات/شهادات/مفضلة) · **التواصل** (إشعارات/رسائل/دعم) · **الحساب** (عناوين/بروفايل/إعدادات/خروج).

## مصادر البيانات

- `orders` — مفلتر بـ `eq('user_id', user.id)` (RLS موجود).
- `inventory_items` — قراءة عامة للكتالوج/التسعير.
- `profiles` — صف العميل فقط.
- بدون جداول جديدة في هذه المرحلة. الفواتير/المدفوعات/العروض/الرسائل/الإشعارات تظهر كبطاقات "قريباً" مع UI كامل ومُحاكاة من الطلبات حيث يصحّ.

## التوجيه

في `src/App.tsx`:

```tsx
<Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
  <Route index element={<PortalDashboard />} />
  <Route path="orders" element={<PortalOrders />} />
  <Route path="orders/new" element={<PortalNewOrder />} />
  <Route path="orders/:id" element={<PortalTracking />} />
  ... (باقي المسارات)
</Route>
```

- زر "حسابي" في `LuxNav` يربط لـ `/portal` للعملاء المسجّلين.
- بعد تسجيل دخول غير-admin من `/auth` بدون `from`، نوجّه إلى `/portal`.

## الصفحة الرئيسية (Dashboard Home)

نفس شبكة `grid-cols-2 md:grid-cols-4` ببطاقات `a-card a-card-hover`:

1. إجمالي الطلبات · 2. قيد التنفيذ · 3. مكتملة · 4. الفواتير المستحقة · 5. نقاط الولاء (مُحاكاة = طلبات×10) · 6. رصيد المحفظة (0 ر.س placeholder) · 7. منتجات مفضّلة · 8. آخر عرض ساري.

رسومات:
- AreaChart: طلباتي آخر 14 يوم (نفس gradient `#1A4A00`).
- PieChart: حالات طلباتي.
- قائمة "آخر الطلبات" (نفس قائمة Activity في AdminDashboard).
- شريط "منتجات مُوصى بها" يعيد استخدام `ProductRecommender`.
- اختصارات سريعة: طلب جديد · تتبع · فواتير · دعم.

## مطابقة الحركة والثيم

- نفس `motion.div initial/animate/transition` المستخدمة في `AdminDashboard`.
- نفس `AnimatePresence mode="wait"` للانتقال بين الصفحات.
- `data-theme` (light/dark) يُحفظ في `localStorage` بمفتاح `portal-theme` (مستقل عن admin).

## ملاحظات تقنية

- إعادة الاستخدام تكون عبر **استيراد نفس CSS والمكوّنات**، ليس نسخ الأنماط. أي تعديل مستقبلي على `admin.css` ينعكس على البوابتين تلقائياً.
- `PortalSidebar` و`PortalTopbar` يُبنيان كنسخ مبسّطة من الأصل (نفس JSX/classes) لكن بقائمة عناصر مختلفة وبدون أدوات إدارية.
- التحقق من الدور: `ProtectedRoute` بدون `requireRole` يكفي (أي مستخدم مسجّل). الـRLS على `orders/profiles` يضمن عزل البيانات على مستوى قاعدة البيانات.
- المسارات الفرعية الموجودة فعلاً (`/orders/new`, `/orders/:id`, `/profile`, `/catalog`) تبقى كما هي للتوافق، والبوابة تستضيف نسخاً مغلّفة بنفس الـshell.

## خارج النطاق (يمكن لاحقاً)

- جداول `invoices`, `payments`, `quotes`, `notifications`, `messages`, `addresses`, `favorites` مع RLS — تُضاف عند تفعيلها فعلياً.
- بوابة دفع (Mada/Apple Pay) و2FA.
- خرائط شحن حيّة.
