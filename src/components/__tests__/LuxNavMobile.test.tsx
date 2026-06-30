import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'en', changeLanguage: vi.fn() },
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

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LuxNav />
      <Routes>
        <Route path="*" element={<div />} />
      </Routes>
    </MemoryRouter>,
  );
}

// The mobile drawer lives in a fixed container with "lg:hidden" — always in DOM.
// We scope queries to that drawer to avoid colliding with the desktop nav.
function getDrawer(container: HTMLElement) {
  const aside = container.querySelector('aside');
  if (!aside) throw new Error('mobile drawer not found');
  return aside;
}

describe('LuxNav mobile drawer NavLink active states', () => {
  it('top-level drawer items render as NavLinks (anchors) to their routes', () => {
    const { container } = renderAt('/');
    const drawer = getDrawer(container);
    const hrefs = Array.from(drawer.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/products', '/about', '/quality', '/contact']));
  });

  it('marks the matching top-level drawer link active via aria-current', () => {
    const { container } = renderAt('/about');
    const drawer = getDrawer(container);
    const about = drawer.querySelector('a[href="/about"]') as HTMLElement;
    const home = drawer.querySelector('a[href="/"]') as HTMLElement;
    expect(about).toHaveAttribute('aria-current', 'page');
    expect(about.className).toMatch(/text-gold-hi/);
    expect(home).not.toHaveAttribute('aria-current');
  });

  it('marks the matching nested mega sub-link active and toggles when path changes', () => {
    const a = renderAt('/wholesale');
    let drawer = getDrawer(a.container);
    const wholesale = drawer.querySelector('a[href="/wholesale"]') as HTMLElement;
    const compare = drawer.querySelector('a[href="/compare"]') as HTMLElement;
    expect(wholesale).toHaveAttribute('aria-current', 'page');
    expect(wholesale.className).toMatch(/text-gold-hi/);
    expect(compare).not.toHaveAttribute('aria-current');
    a.unmount();

    const b = renderAt('/compare');
    drawer = getDrawer(b.container);
    const compare2 = drawer.querySelector('a[href="/compare"]') as HTMLElement;
    const wholesale2 = drawer.querySelector('a[href="/wholesale"]') as HTMLElement;
    expect(compare2).toHaveAttribute('aria-current', 'page');
    expect(wholesale2).not.toHaveAttribute('aria-current');
  });

  it('home link only matches the root path (end-matching)', () => {
    const { container } = renderAt('/products');
    const drawer = getDrawer(container);
    const home = drawer.querySelector('a[href="/"]') as HTMLElement;
    expect(home).not.toHaveAttribute('aria-current');
  });
});
