import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, NavLink, Routes, Route } from 'react-router-dom';

function Harness({ initial }: { initial: string }) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <nav>
        <NavLink
          to="/products"
          end
          className={({ isActive }) => `mega-item ${isActive ? 'is-active' : ''}`}
        >
          Products
        </NavLink>
        <NavLink
          to="/compare"
          end
          className={({ isActive }) => `mega-item ${isActive ? 'is-active' : ''}`}
        >
          Compare
        </NavLink>
      </nav>
      <Routes>
        <Route path="/products" element={<div>P</div>} />
        <Route path="/compare" element={<div>C</div>} />
        <Route path="*" element={<div>Other</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('NavLink is-active behavior', () => {
  it('adds is-active to the link whose route matches', () => {
    render(<Harness initial="/products" />);
    expect(screen.getByRole('link', { name: 'Products' })).toHaveClass('is-active');
    expect(screen.getByRole('link', { name: 'Compare' })).not.toHaveClass('is-active');
  });

  it('moves is-active when the path changes', () => {
    render(<Harness initial="/compare" />);
    expect(screen.getByRole('link', { name: 'Compare' })).toHaveClass('is-active');
    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveClass('is-active');
  });

  it('removes is-active from all links when path matches none', () => {
    render(<Harness initial="/about" />);
    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveClass('is-active');
    expect(screen.getByRole('link', { name: 'Compare' })).not.toHaveClass('is-active');
  });
});
