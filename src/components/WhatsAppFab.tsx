import { MessageCircle } from 'lucide-react';

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/966551234567"
      target="_blank"
      rel="noreferrer noopener"
      aria-label="WhatsApp"
      className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-gold transition-transform duration-500 hover:scale-110"
      style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="absolute inset-0 rounded-full bg-[#25d366]/40 animate-ping" />
    </a>
  );
}
