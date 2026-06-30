import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

let mockLang = 'ar';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: {
      get language() {
        return mockLang;
      },
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: any) => children,
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn(), role: null, loading: false }),
}));
vi.mock('@/components/OrderModal', () => ({ OrderModal: () => null }));
vi.mock('@/components/QuoteBuilder', () => ({ QuoteBuilder: () => null }));
vi.mock('@/components/LanguageToggle', () => ({ LanguageToggle: () => null }));
vi.mock('@/components/ThemeToggle', () => ({ ThemeToggle: () => null }));

import { LuxNav } from '../LuxNav';

function renderAt(path: string, dir: 'rtl' | 'ltr' = 'rtl') {
  document.documentElement.dir = dir;
  document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  mockLang = dir === 'rtl' ? 'ar' : 'en';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LuxNav />
      <Routes>
        <Route path="*" element={<div />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LuxNav RTL behavior preserves NavLink active state', () => {
  beforeEach(() => {
    document.documentElement.dir = 'rtl';
  });
  afterEach(() => {
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  it('keeps is-active on the matching top-level link under RTL', () => {
    const { container } = renderAt('/about', 'rtl');
    expect(document.documentElement.dir).toBe('rtl');
    const nav = container.querySelector('nav') as HTMLElement;
    const about = nav.querySelector('a[href="/about"]') as HTMLElement;
    expect(about).toHaveAttribute('aria-current', 'page');
    expect(about.className).toMatch(/\bactive\b/);
  });

  it('matches the same active behavior in LTR for the same path', () => {
    const rtl = renderAt('/about', 'rtl');
    const rtlActive = rtl.container.querySelector('nav a[href="/about"]') as HTMLElement;
    const rtlHasActive = /\bactive\b/.test(rtlActive.className);
    rtl.unmount();

    const ltr = renderAt('/about', 'ltr');
    const ltrActive = ltr.container.querySelector('nav a[href="/about"]') as HTMLElement;
    expect(/\bactive\b/.test(ltrActive.className)).toBe(rtlHasActive);
    expect(ltrActive).toHaveAttribute('aria-current', 'page');
  });

  it('mobile drawer in RTL still toggles is-active when path changes', () => {
    const a = renderAt('/wholesale', 'rtl');
    let drawer = a.container.querySelector('aside') as HTMLElement;
    expect(drawer.className).toMatch(/left-0/); // RTL anchors drawer to the left
    const wholesale = drawer.querySelector('a[href="/wholesale"]') as HTMLElement;
    expect(wholesale).toHaveAttribute('aria-current', 'page');
    expect(wholesale.className).toMatch(/text-gold-hi/);
    a.unmount();

    const b = renderAt('/compare', 'rtl');
    drawer = b.container.querySelector('aside') as HTMLElement;
    const compare = drawer.querySelector('a[href="/compare"]') as HTMLElement;
    const wholesale2 = drawer.querySelector('a[href="/wholesale"]') as HTMLElement;
    expect(compare).toHaveAttribute('aria-current', 'page');
    expect(wholesale2).not.toHaveAttribute('aria-current');
  });

  it('mega menu under RTL applies is-active to the matching sub-link', async () => {
    const { container } = renderAt('/compare', 'rtl');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /nav\.products/i }));
    });
    const mega = container.querySelector('.lux-emerald-mega') as HTMLElement;
    const compare = mega.querySelector('a[href="/compare"]') as HTMLElement;
    expect(compare.className).toMatch(/is-active/);
    expect(compare).toHaveAttribute('aria-current', 'page');
  });
});
