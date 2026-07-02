import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * MediaRecorder-based STT that uploads to the `voice-transcribe` edge function.
 * Works reliably on browsers where the native SpeechRecognition API is missing
 * (Safari desktop, Firefox, most Android WebViews).
 */
export function useVoiceRecorder(onResult: (text: string) => void, lang: 'ar' | 'en' = 'ar') {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        if (blob.size < 1024) { setBusy(false); return; }
        setBusy(true);
        try {
          const fd = new FormData();
          const ext = (mime || 'audio/webm').includes('mp4') ? 'mp4' : 'webm';
          fd.append('file', blob, `voice.${ext}`);
          fd.append('language', lang);
          const { data, error } = await supabase.functions.invoke('voice-transcribe', { body: fd });
          if (error) throw error;
          const text = (data as { text?: string })?.text?.trim();
          if (text) onResult(text);
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      stopStream();
      setRecording(false);
    }
  }, [lang, onResult]);

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop();
    mediaRef.current = null;
    setRecording(false);
  }, []);

  useEffect(() => () => { stop(); stopStream(); }, [stop]);

  return { recording, busy, start, stop, toggle: () => (recording ? stop() : start()) };
}

/**
 * Server TTS playback via the `voice-speak` edge function.
 * Returns { speak, stop, playing } — one shared <audio> element per hook instance.
 */
export function useVoicePlayer() {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    audioRef.current = null;
  };

  const stop = useCallback(() => { cleanup(); setPlaying(null); }, []);

  const speak = useCallback(async (id: string, text: string, lang: 'ar' | 'en' = 'ar') => {
    if (playing === id) { stop(); return; }
    stop();
    setPlaying(id);
    try {
      const { data, error } = await supabase.functions.invoke('voice-speak', {
        body: { text, lang },
      });
      if (error) throw error;
      const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying((p) => (p === id ? null : p)); cleanup(); };
      audio.onerror = () => { setPlaying(null); cleanup(); };
      await audio.play();
    } catch {
      setPlaying(null);
      cleanup();
    }
  }, [playing, stop]);

  useEffect(() => () => cleanup(), []);

  return { speak, stop, playing };
}
