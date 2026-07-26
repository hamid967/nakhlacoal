import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock auth to avoid pulling the real Supabase-backed context into jsdom.
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'admin@example.com' }, roles: ['admin'], loading: false }),
}));

// Stub the sidebar — it pulls a binary logo asset that vitest can't transform.
vi.mock('@/admin/AdminSidebar', () => ({
  AdminSidebar: () => <aside data-testid="sidebar" />,
}));

// Framer-motion's <AnimatePresence> is fine in jsdom, but skip <motion.main> exit anims
// to keep DOM assertions deterministic.
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import AdminLayout from './AdminLayout';

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>child</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const getShell = (container: HTMLElement) =>
  container.querySelector('.admin-shell') as HTMLElement;

describe('Admin theme toggle', () => {
  beforeEach(() => localStorage.clear());

  it('starts in light mode and persists nothing until toggled', () => {
    const { container } = renderLayout();
    expect(getShell(container).getAttribute('data-theme')).toBe('light');
    expect(screen.getByTitle('تبديل الثيم')).toBeInTheDocument();
  });

  it('flips to dark on click and writes localStorage', () => {
    const { container } = renderLayout();
    fireEvent.click(screen.getByTitle('تبديل الثيم'));
    expect(getShell(container).getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('admin-theme')).toBe('dark');
  });

  it('toggles back to light on a second click', () => {
    const { container } = renderLayout();
    const btn = screen.getByTitle('تبديل الثيم');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(getShell(container).getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('admin-theme')).toBe('light');
  });

  it('swaps the toggle icon between Moon (light) and Sun (dark)', () => {
    renderLayout();
    const btn = screen.getByTitle('تبديل الثيم');
    // lucide renders an <svg> with class containing the icon name.
    expect(btn.querySelector('svg.lucide-moon')).toBeTruthy();
    fireEvent.click(btn);
    expect(btn.querySelector('svg.lucide-sun')).toBeTruthy();
  });

  it('rehydrates the persisted dark preference on mount', () => {
    localStorage.setItem('admin-theme', 'dark');
    const { container } = renderLayout();
    expect(getShell(container).getAttribute('data-theme')).toBe('dark');
    expect(screen.getByTitle('تبديل الثيم').querySelector('svg.lucide-sun')).toBeTruthy();
  });
});
