import logo from '@/assets/palm-charcoal-logo.png';

type Props = {
  variant?: 'light' | 'dark';
  position?: 'br' | 'bl' | 'tr' | 'tl';
};

export function ImageWatermark({ variant = 'light', position = 'br' }: Props) {
  const pos = {
    br: 'bottom-3 end-3',
    bl: 'bottom-3 start-3',
    tr: 'top-3 end-3',
    tl: 'top-3 start-3',
  }[position];

  const isLight = variant === 'light';

  return (
    <div
      className={`pointer-events-none absolute ${pos} z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full backdrop-blur-md ${
        isLight ? 'bg-dark/55 text-background' : 'bg-background/70 text-dark'
      }`}
      style={{ border: '1px solid rgba(212,175,55,0.55)' }}
    >
      <img
        src={logo}
        alt="Palm Charcoal"
        width={20}
        height={20}
        loading="lazy"
        decoding="async"
        className="w-5 h-5 object-contain drop-shadow"
      />
      <span
        className="text-[9px] md:text-[10px] tracking-[0.18em] font-semibold uppercase"
        style={{ color: '#D4AF37', letterSpacing: '0.18em' }}
      >
        www.nakhlacoal.com
      </span>
    </div>
  );
}
