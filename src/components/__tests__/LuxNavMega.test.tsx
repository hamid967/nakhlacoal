import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock i18n: return the key as the translated value
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
}));

// Mock auth — unauthenticated
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn(), role: null, loading: false }),
}));

// Mock heavy children that aren't relevant here
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

describe('LuxNav mega menu active states', () => {
  beforeEach(() => {
    // jsdom: stub scroll listener target
    window.scrollTo = vi.fn() as any;
  });

  it('marks the Products mega trigger active when on a child route', () => {
    renderAt('/compare');
    // The trigger button contains the text nav.products
    const trigger = screen.getByRole('button', { name: /nav\.products/i });
    const label = within(trigger).getByText('nav.products');
    expect(label).toHaveAttribute('data-active', 'true');
  });

  it('does not mark Products trigger active on unrelated route', () => {
    renderAt('/about');
    const trigger = screen.getByRole('button', { name: /nav\.products/i });
    const label = within(trigger).getByText('nav.products');
    expect(label).toHaveAttribute('data-active', 'false');
  });

  it('applies is-active to the matching mega item link when opened', async () => {
    const { container } = renderAt('/compare');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /nav\.products/i }));
    });

    const mega = container.querySelector('.lux-emerald-mega') as HTMLElement;
    expect(mega).toBeTruthy();
    const compareLink = mega.querySelector('a[href="/compare"]') as HTMLElement;
    const productsLink = mega.querySelector('.lux-emerald-mega-item[href="/products"]') as HTMLElement;

    expect(compareLink.className).toMatch(/is-active/);
    expect(compareLink).toHaveAttribute('aria-current', 'page');
    expect(productsLink.className).not.toMatch(/is-active/);
  });

  it('moves is-active to a different mega item when the path changes', async () => {
    const { container } = renderAt('/wholesale');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /nav\.products/i }));
    });

    const mega = container.querySelector('.lux-emerald-mega') as HTMLElement;
    const wholesale = mega.querySelector('a[href="/wholesale"]') as HTMLElement;
    const compare = mega.querySelector('a[href="/compare"]') as HTMLElement;

    expect(wholesale.className).toMatch(/is-active/);
    expect(compare.className).not.toMatch(/is-active/);
  });
});
