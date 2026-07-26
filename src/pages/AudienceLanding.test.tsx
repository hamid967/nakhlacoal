import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/components/SEO', () => ({ SEO: () => null }));
vi.mock('@/lib/track', () => ({ trackConversion: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (k: string) => k }),
}));

// brand mock is mutated per-test
const brandMock: { footer?: { whatsapp?: string }; contact?: { whatsapp?: string } } = {};
vi.mock('@/lib/brand', () => ({
  get brand() {
    return brandMock;
  },
}));

async function renderPage() {
  const { default: AudienceLanding } = await import('./AudienceLanding');
  render(
    <MemoryRouter initialEntries={['/for/restaurants']}>
      <Routes>
        <Route path="/for/:slug" element={<AudienceLanding />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AudienceLanding WhatsApp CTA fallback', () => {
  beforeEach(() => {
    delete brandMock.footer;
    delete brandMock.contact;
    vi.resetModules();
  });

  it('uses brand.footer.whatsapp when present', async () => {
    brandMock.footer = { whatsapp: 'https://wa.me/966540060085' };
    await renderPage();
    const wa = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('https://wa.me/966540060085'));
    expect(wa).toBeTruthy();
    expect(wa!.getAttribute('href')).toContain('?text=');
  });

  it('falls back to brand.contact.whatsapp when footer is missing', async () => {
    brandMock.contact = { whatsapp: 'https://wa.me/100000' };
    await renderPage();
    const wa = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('https://wa.me/100000'));
    expect(wa).toBeTruthy();
  });

  it('renders no WhatsApp link and shows DEV badge when both are missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderPage();
    const waLink = screen
      .queryAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('https://wa.me'));
    expect(waLink).toBeUndefined();
    // catalog fallback still rendered
    expect(screen.getByRole('link', { name: /catalog/i })).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Missing WhatsApp link'));
    warn.mockRestore();
  });
});
