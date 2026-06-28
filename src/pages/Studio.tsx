import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Studio() {
  const [prompt, setPrompt] = useState("A cinematic launch teaser for our premium hookah-grade palm charcoal");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"intro" | "image" | null>(null);

  const run = async (mode: "intro" | "image") => {
    setLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke("ai-studio", {
        body: { mode, prompt },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      if (mode === "intro") setText((data as any).text ?? "");
      else setImage((data as any).image ?? null);
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="container max-w-4xl pt-32 pb-24">
      <p className="text-xs uppercase tracking-[0.35em] text-gold mb-4">AI Studio</p>
      <h1 className="font-display text-5xl md:text-6xl text-gold-hi mb-6">Marketing Forge</h1>
      <p className="text-foreground/70 mb-10 max-w-2xl">
        Generate a luxury intro headline, paragraph, and a 15-second video concept — plus a cinematic marketing image — for any Palm Charcoal campaign idea.
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
          onClick={() => run("intro")}
          disabled={loading !== null}
          className="btn-gold disabled:opacity-50"
        >
          {loading === "intro" ? "Writing…" : "Generate Intro + Video Concept"}
        </button>
        <button
          onClick={() => run("image")}
          disabled={loading !== null}
          className="px-6 py-3 rounded-md border-luxe-strong text-gold-hi text-xs uppercase tracking-[0.25em] disabled:opacity-50"
        >
          {loading === "image" ? "Rendering…" : "Generate Marketing Image"}
        </button>
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
    </section>
  );
}
