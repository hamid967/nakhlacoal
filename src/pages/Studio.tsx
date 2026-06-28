import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Entry = {
  id: string;
  createdAt: number;
  prompt: string;
  text?: string;
  image?: string;
};

const STORAGE_KEY = "palm-studio-history";

export default function Studio() {
  const [prompt, setPrompt] = useState(
    "A cinematic launch teaser for our premium hookah-grade palm charcoal"
  );
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"intro" | "image" | "both" | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

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
      toast.success("Concept saved to history");
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
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

  const loadEntry = (e: Entry) => {
    setPrompt(e.prompt);
    setText(e.text ?? "");
    setImage(e.image ?? null);
  };

  const clearHistory = () => persist([]);

  return (
    <section className="container max-w-5xl pt-32 pb-24">
      <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">AI Studio</p>
      <h1 className="font-display text-5xl md:text-6xl text-gold-hi mb-6">Marketing Forge</h1>
      <p className="text-foreground/70 mb-10 max-w-2xl">
        Generate a luxury headline, intro paragraph, and a 15-second video shot list — plus a
        cinematic marketing image — for any Palm Charcoal campaign idea.
      </p>

      <label className="block text-xs uppercase tracking-[0.25em] text-foreground/60 mb-2">
        Campaign brief
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="w-full bg-surface border-luxe rounded-md p-4 text-sm text-foreground/90 focus:outline-none focus:border-gold/50"
      />

      <div className="flex flex-wrap gap-3 mt-5">
        <button
          onClick={() => run("both")}
          disabled={loading !== null}
          className="btn-gold disabled:opacity-50"
        >
          {loading === "both" ? "Forging…" : "Generate Concept + Image"}
        </button>
        <button
          onClick={() => run("intro")}
          disabled={loading !== null}
          className="px-6 py-3 rounded-md border-luxe-strong text-gold-hi text-xs uppercase tracking-[0.25em] disabled:opacity-50"
        >
          {loading === "intro" ? "Writing…" : "Copy Only"}
        </button>
        <button
          onClick={() => run("image")}
          disabled={loading !== null}
          className="px-6 py-3 rounded-md border-luxe-strong text-gold-hi text-xs uppercase tracking-[0.25em] disabled:opacity-50"
        >
          {loading === "image" ? "Rendering…" : "Image Only"}
        </button>
        {(text || image) && (
          <button
            onClick={() => exportEntry({ prompt, text, image: image ?? undefined })}
            className="px-6 py-3 rounded-md border border-foreground/20 text-foreground/80 text-xs uppercase tracking-[0.25em] hover:border-gold/40"
          >
            Export ↓
          </button>
        )}
      </div>

      {text && (
        <article className="mt-12 p-8 bg-surface border-luxe rounded-md whitespace-pre-wrap text-foreground/85 leading-relaxed">
          {text}
        </article>
      )}

      {image && (
        <figure className="mt-8 border-luxe rounded-md overflow-hidden">
          <img src={image} alt="Generated marketing visual" className="w-full block" />
        </figure>
      )}

      {history.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs uppercase tracking-[0.35em] text-gold">History</h2>
            <button
              onClick={clearHistory}
              className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground/80"
            >
              Clear
            </button>
          </div>
          <ul className="grid sm:grid-cols-2 gap-4">
            {history.map((e) => (
              <li
                key={e.id}
                className="p-5 bg-surface border-luxe rounded-md flex flex-col gap-3"
              >
                {e.image && (
                  <img src={e.image} alt="" className="w-full h-32 object-cover rounded" />
                )}
                <p className="text-sm text-foreground/80 line-clamp-2">{e.prompt}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => loadEntry(e)}
                    className="text-xs text-gold-hi hover:underline"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => exportEntry(e)}
                    className="text-xs text-foreground/70 hover:text-gold-hi"
                  >
                    Export
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
