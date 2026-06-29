
CREATE TABLE public.trademarks (
  id text PRIMARY KEY,
  registration_no text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  nice_class text NOT NULL,
  filed_hijri text,
  registered_hijri text,
  expires_hijri text,
  owner_ar text,
  address_ar text,
  country_ar text,
  description_ar text,
  goods_ar text,
  colors text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.trademarks TO anon, authenticated;
GRANT ALL ON public.trademarks TO service_role;

ALTER TABLE public.trademarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active trademarks"
  ON public.trademarks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage trademarks"
  ON public.trademarks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trademarks_set_updated_at
  BEFORE UPDATE ON public.trademarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.trademarks (id, registration_no, name_ar, name_en, nice_class, filed_hijri, registered_hijri, expires_hijri, owner_ar, address_ar, country_ar, description_ar, goods_ar, colors, sort_order) VALUES
('palm-charcoal','143313025','فحم النخلة','Palm Charcoal','الفئة 4','1434/05/05','1443/11/28','1453/11/27','محمد عبدالله محمد باعشن','ص.ب 10273، جدة 21433','المملكة العربية السعودية','عبارة فحم النخلة بالعربية وعبارة Palm Charcoal بحروف لاتينية مع رسم نخلة بشكل خاص، بالألوان الأخضر والبني والأسود. لا تشمل الحماية كلمة "فحم" بالعربي وكلمة "Charcoal" باللاتيني.','الفحم', ARRAY['#1A4A00','#6B3A2A','#0D0D0D'], 1),
('nakhlan','1436000025','فحم نخلان','Nakhlan Charcoal','الفئة 4','1436/04/08','1445/12/30','1455/12/29','مؤسسة محمد عبدالله محمد باعشن التجارية','ص.ب 010273، جدة 21433','المملكة العربية السعودية','رسم سعفات نخيل باللون الأخضر، وبجانبها عبارة "فحم نخلان" بحروف عربية، وأسفلها عبارة "Nakhlan Charcoal" بحروف لاتينية باللون الرمادي.','فحم، فحم إنثراسايت، قوالب فحم', ARRAY['#2E7D32','#8E8E8E','#0D0D0D'], 2),
('al-markaz','1436001982','فحم المركاز','Al-Markaz Charcoal','الفئة 4','1436/05/05','1446/01/25','1456/01/25','مؤسسة محمد عبدالله محمد باعشن التجارية','ص.ب 010273، جدة 21433','المملكة العربية السعودية','بطاقة بالألوان الأسود والأحمر، بداخلها عبارة "فحم المركاز" بحروف عربية حمراء محددة بالأبيض، وأسفلها كلمة Al-Markaz بحروف لاتينية حمراء.','الفحم', ARRAY['#B00020','#0D0D0D','#FFFFFF'], 3),
('al-nakhlatain','1441000830','فحم النخلتين','Al-Nakhlatain Coal','الفئة 4','1441/03/21','1441/01/01','1451/01/01','مؤسسة محمد عبدالله محمد باعشن التجارية','ص.ب 010273، جدة 21433','المملكة العربية السعودية','رسم نخلتين باللون الأخضر بينهما عبارة "فحم النخلتين" بحروف عربية، وأسفلها عبارة Al-Nakhlatain Coal بحروف لاتينية باللون الأسود.','زيوت وشحوم صناعية، وقود (بما في ذلك وقود المحركات)، مواد إضاءة، شموع وفتائل للإضاءة.', ARRAY['#1A4A00','#0D0D0D'], 4),
('baashen','1443003357','باعشن','Baashen','الفئة 4','1443/06/14','1443/01/22','1453/01/21','مؤسسة محمد عبدالله محمد باعشن التجارية','ص.ب 010273، جدة 21433','المملكة العربية السعودية','بطاقة باللون الأصفر بإطار باللون البني الغامق بداخلها كلمة "باعشن" بحروف عربية باللون الأزرق داخل شكل هندسي يعلوه رسم شعلة نار، وأسفلها مكعبات فحم باللون الأسود.','فحم، فحم [وقود]، فحم الكوك، قوالب الفحم الحجري القابلة للاشتعال، قوالب فحم', ARRAY['#E8B923','#3A1F0E','#0B2B6B','#0D0D0D'], 5);
