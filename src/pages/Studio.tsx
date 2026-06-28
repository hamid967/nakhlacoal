import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Image as ImageIcon,
  Type,
  Download,
  Copy,
  Check,
  Trash2,
  History as HistoryIcon,
  Loader2,
  RotateCcw,
} from "lucide-react";

type Entry = {
  id: string;
  createdAt: number;
  prompt: string;
  text?: string;
  image?: string;
};

const STORAGE_KEY = "palm-studio-history";

const PRESETS = [
  "A cinematic launch teaser for our premium hookah-grade palm charcoal",
  "An editorial campaign for restaurant-grade lump charcoal aimed at Michelin chefs",
  "A Ramadan gift-box story for export to Gulf luxury retailers",
  "A behind-the-scenes film of the kiln masters at sunrise in the palm grove",
];

function parseSections(raw: string) {
  if (!raw) return { headline: "", intro: "", video: "" };
  const grab = (label: string, next: string[]) => {
    const re = new RegExp(
      `${label}[:\\s\\-]*([\\s\\S]*?)(?=${next.map((n) => `\\b${n}\\b`).join("|")}|$)`,
      "i"
    );
    const m = raw.match(re);
    return (m?.[1] ?? "").replace(/^\*+|\*+$/g, "").trim();
  };
  return {
    headline: grab("HEADLINE", ["INTRO", "VIDEO"]),
    intro: grab("INTRO", ["VIDEO", "HEADLINE"]),
    video: grab("VIDEO", ["HEADLINE", "INTRO"]),
  };
}

export default function Studio() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const [prompt, setPrompt] = useState(PRESETS[0]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"intro" | "image" | "both" | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const sections = useMemo(() => parseSections(text), [text]);

  const persist = (next: Entry[]) => {
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 20)));
    } catch {}
  };

  const callAi = async (mode: "intro" | "image") => {
    const { data, error } = await supabase.functions.invoke("ai-studio", {
      body: { mode, prompt },
    });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as { text?: string; image?: string };
  };

  const run = async (mode: "intro" | "image" | "both") => {
    if (!prompt.trim()) {
      toast.error(isAr ? "اكتب فكرة الحملة أولاً" : "Write a campaign brief first");
      return;
    }
    setLoading(mode);
    try {
      let newText = text;
      let newImage = image;
      if (mode === "intro" || mode === "both") {
        const r = await callAi("intro");
        newText = r.text ?? "";
        setText(newText);
      }
      if (mode === "image" || mode === "both") {
        const r = await callAi("image");
        newImage = r.image ?? null;
        setImage(newImage);
      }
      const entry: Entry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        prompt,
        text: newText || undefined,
        image: newImage || undefined,
      };
      persist([entry, ...history]);
      toast.success(isAr ? "تم حفظ المفهوم" : "Concept saved");
    } catch (e: any) {
      const msg = e?.message ?? "Generation failed";
      if (/429/.test(msg)) toast.error(isAr ? "تجاوزت الحد. حاول لاحقاً" : "Rate limited — try again shortly");
      else if (/402/.test(msg)) toast.error(isAr ? "نفدت الأرصدة" : "AI credits exhausted");
      else toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  const exportEntry = (e: { prompt: string; text?: string; image?: string }) => {
    const md = `# Palm Charcoal — Marketing Concept\n\n**Brief:** ${e.prompt}\n\n${
      e.text ?? "(no copy)"
    }\n\n${e.image ? `![visual](${e.image})\n` : ""}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palm-concept-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = (src: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `palm-visual-${Date.now()}.png`;
    a.click();
  };

  const copyText = async (key: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const loadEntry = (e: Entry) => {
    setPrompt(e.prompt);
    setText(e.text ?? "");
    setImage(e.image ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setText("");
    setImage(null);
  };

  const Section = ({
    label,
    value,
    copyKey,
  }: {
    label: string;
    value: string;
    copyKey: string;
  }) =>
    value ? (
      <div className="group relative p-6 bg-surface/60 border-luxe rounded-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{label}</span>
          <button
            onClick={() => copyText(copyKey, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 hover:text-gold-hi"
            aria-label="Copy"
          >
            {copied === copyKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="whitespace-pre-wrap text-foreground/85 leading-relaxed text-sm">{value}</p>
      </div>
    ) : null;

  return (
    <>
      <SEO title={isAr ? 'استوديو الذكاء' : 'AI Studio'} description="" path="/studio" noindex />
    <section className="container max-w-6xl pt-32 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <p className="text-xs uppercase tracking-[0.35em] text-gold">
          {isAr ? "استوديو الذكاء" : "AI Studio"}
        </p>
      </div>
      <h1 className="font-display text-5xl md:text-6xl text-gold-hi mb-6">
        {isAr ? "مَصهَر التسويق" : "Marketing Forge"}
      </h1>
      <p className="text-foreground/70 mb-10 max-w-2xl">
        {isAr
          ? "ولّد عنواناً فاخراً، فقرة افتتاحية، ومخطط لقطات لفيديو 15 ثانية — مع صورة تسويقية سينمائية — لأي فكرة حملة."
          : "Generate a luxury headline, intro paragraph, and a 15-second video shot list — plus a cinematic marketing image — for any Palm Charcoal campaign idea."}
      </p>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <label className="block text-xs uppercase tracking-[0.25em] text-foreground/60 mb-2">
            {isAr ? "فكرة الحملة" : "Campaign brief"}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-surface border-luxe rounded-md p-4 text-sm text-foreground/90 focus:outline-none focus:border-gold/50 resize-none"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-foreground/15 text-foreground/70 hover:border-gold/40 hover:text-gold-hi transition-colors"
              >
                {p.length > 48 ? p.slice(0, 45) + "…" : p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => run("both")}
            disabled={loading !== null}
            className="btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "both" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading === "both"
              ? isAr ? "جارٍ الصياغة…" : "Forging…"
              : isAr ? "مفهوم + صورة" : "Concept + Image"}
          </button>
          <button
            onClick={() => run("intro")}
            disabled={loading !== null}
            className="px-5 py-3 rounded-md border-luxe-strong text-gold-hi text-xs uppercase tracking-[0.25em] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "intro" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
            {isAr ? "نص فقط" : "Copy only"}
          </button>
          <button
            onClick={() => run("image")}
            disabled={loading !== null}
            className="px-5 py-3 rounded-md border-luxe-strong text-gold-hi text-xs uppercase tracking-[0.25em] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "image" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {isAr ? "صورة فقط" : "Image only"}
          </button>
          {(text || image) && (
            <>
              <button
                onClick={() => exportEntry({ prompt, text, image: image ?? undefined })}
                className="px-5 py-3 rounded-md border border-foreground/20 text-foreground/80 text-xs uppercase tracking-[0.25em] hover:border-gold/40 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> {isAr ? "تصدير" : "Export .md"}
              </button>
              <button
                onClick={reset}
                className="px-5 py-3 rounded-md border border-foreground/10 text-foreground/50 text-xs uppercase tracking-[0.25em] hover:text-foreground/80 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> {isAr ? "إعادة" : "Reset"}
              </button>
            </>
          )}
        </div>
      </div>

      {loading && !text && !image && (
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="h-48 rounded-md bg-surface/60 border-luxe animate-pulse" />
          <div className="h-48 rounded-md bg-surface/60 border-luxe animate-pulse" />
        </div>
      )}

      {(sections.headline || sections.intro || sections.video || (text && !sections.headline)) && (
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <Section label={isAr ? "العنوان" : "Headline"} value={sections.headline} copyKey="h" />
          <Section label={isAr ? "المقدمة" : "Intro"} value={sections.intro} copyKey="i" />
          <div className="md:col-span-2">
            <Section label={isAr ? "مخطط لقطات الفيديو" : "Video shot list"} value={sections.video} copyKey="v" />
          </div>
          {!sections.headline && text && (
            <div className="md:col-span-2">
              <Section label={isAr ? "النص" : "Copy"} value={text} copyKey="t" />
            </div>
          )}
        </div>
      )}

      {image && (
        <figure className="mt-6 relative group border-luxe rounded-md overflow-hidden">
          <img src={image} alt="Generated marketing visual" className="w-full block" />
          <button
            onClick={() => downloadImage(image)}
            className="absolute top-3 right-3 px-3 py-2 rounded-md bg-background/70 backdrop-blur border-luxe text-xs text-gold-hi opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
        </figure>
      )}

      {history.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs uppercase tracking-[0.35em] text-gold flex items-center gap-2">
              <HistoryIcon className="w-3.5 h-3.5" />
              {isAr ? "السجل" : "History"} · {history.length}
            </h2>
            <button
              onClick={() => persist([])}
              className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground/80 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> {isAr ? "مسح" : "Clear"}
            </button>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((e) => (
              <li
                key={e.id}
                className="p-5 bg-surface border-luxe rounded-md flex flex-col gap-3 hover:border-gold/30 transition-colors"
              >
                {e.image && (
                  <img src={e.image} alt="" className="w-full h-32 object-cover rounded" />
                )}
                <p className="text-sm text-foreground/80 line-clamp-2">{e.prompt}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-3 mt-auto pt-2 border-t border-foreground/10">
                  <button
                    onClick={() => loadEntry(e)}
                    className="text-xs text-gold-hi hover:underline"
                  >
                    {isAr ? "تحميل" : "Load"}
                  </button>
                  <button
                    onClick={() => exportEntry(e)}
                    className="text-xs text-foreground/70 hover:text-gold-hi"
                  >
                    {isAr ? "تصدير" : "Export"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
    </>
  );
}

