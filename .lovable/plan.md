# تطوير مساعد فحم النخلة — أسلوب 2025

## الهدف
استبدال الـ Widget الحالي بتجربة محادثة حديثة على مستوى ChatGPT/Claude:
- محادثات متعددة (Threads) محفوظة في المتصفح
- صفحة كاملة بقاعدة زجاجية عائمة (Glass Dock)
- مبنية على AI Elements الرسمية + AI SDK streaming

## التغييرات

### 1. AI Elements (تثبيت)
- `conversation` — transcript + sticky scroll
- `message` + `MessageResponse` — markdown مع streaming
- `prompt-input` — composer زجاجي
- `shimmer` — مؤشر "يفكر..."

### 2. مسارات جديدة
```
/assistant              → إنشاء thread جديد ثم redirect
/assistant/:threadId    → صفحة المحادثة الكاملة
```

### 3. تخزين الـ Threads (localStorage)
```text
nakhla.assistant.threads → [{ id, title, updatedAt, messages: UIMessage[] }]
```
- مسار bootstrap واحد محمي بـ `typeof window !== 'undefined'` (تجنّب StrictMode duplicates)
- العنوان يُولَّد تلقائياً من أول رسالة المستخدم
- زر "محادثة جديدة" + قائمة جانبية بكل المحادثات + حذف فردي

### 4. مكوّنات جديدة
- `src/pages/Assistant.tsx` — الصفحة الجديدة (تستبدل القديمة)
- `src/components/assistant/ThreadList.tsx` — شريط جانبي بقائمة المحادثات
- `src/components/assistant/GlassDock.tsx` — composer زجاجي عائم في الأسفل
- `src/hooks/useAssistantThreads.ts` — إدارة الـ threads في localStorage
- `src/components/assistant/QuickActions.tsx` — اقتراحات سريعة (طلب فحم معسل، استفسار، تواصل)

### 5. الباك-إند
- إعادة استخدام Edge Function `chat-assistant` الموجودة
- التحويل إلى صيغة AI SDK المعيارية: `streamText` + `toUIMessageStreamResponse({ originalMessages })`
- الحفاظ على system prompt الحالي (هوية فحم النخلة)
- معالجة 402/429 برسائل واضحة + رابط واتساب احتياطي

### 6. FAB
- `WhatsAppFab` يفتح `/assistant` بدل الـ widget المنبثق
- الإبقاء على نمط الجمرة الحيّة + الشارة

### 7. الأسلوب البصري — Glass Dock
- خلفية محادثة شفافة فوق mesh ذهبي/فحمي خفيف
- رسائل المستخدم: فقاعة `bg-primary/95` + `text-primary-foreground`
- رسائل المساعد: بدون خلفية، نص مباشر بخط body + markdown
- composer: `backdrop-blur-xl` + حدّ ذهبي 1px + ظل دافئ + زر إرسال icon-sm
- Shimmer "يفكر..." بدل dots التقليدية
- متجاوب: على الموبايل تختفي القائمة الجانبية خلف Sheet

## ملاحظات تقنية
- استخدام `useChat` من `@ai-sdk/react` مع `id={threadId}` و key للـ remount عند تبديل المحادثة
- حفظ الرسائل عبر `useEffect` مع dependencies كاملة (messages, status, threadId)
- focus تلقائي على textarea عند فتح/تبديل المحادثة
- RTL/LTR كامل (الموقع عربي افتراضياً)
- التحقق بعد البناء: إنشاء محادثتين، إرسال رسالة في كل، إعادة تحميل، التأكد من فصل السجل
