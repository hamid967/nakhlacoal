import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';

function renderAt(path = '/admin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div data-testid="admin-child">Admin Home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminLayout', () => {
  beforeEach(() => localStorage.clear());

  it('renders the nested route content', () => {
    renderAt();
    expect(screen.getByTestId('admin-child')).toHaveTextContent('Admin Home');
  });

  it('applies RTL direction on the shell', () => {
    const { container } = renderAt();
    const shell = container.querySelector('.admin-shell') as HTMLElement;
    expect(shell).toBeInTheDocument();
    expect(shell.getAttribute('dir')).toBe('rtl');
  });

  it('defaults to the light theme when no preference is stored', () => {
    const { container } = renderAt();
    const shell = container.querySelector('.admin-shell') as HTMLElement;
    expect(shell.getAttribute('data-theme')).toBe('light');
  });

  it('reads the persisted theme from localStorage', () => {
    localStorage.setItem('admin-theme', 'dark');
    const { container } = renderAt();
    const shell = container.querySelector('.admin-shell') as HTMLElement;
    expect(shell.getAttribute('data-theme')).toBe('dark');
  });
});
