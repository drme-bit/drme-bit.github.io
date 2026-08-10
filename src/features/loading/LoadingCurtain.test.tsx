import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingCurtain, LOADED_EVENT } from './LoadingCurtain';

describe('LoadingCurtain', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('renders nothing when already loaded', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<LoadingCurtain />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the boot screen on first run', () => {
    render(<LoadingCurtain />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('drme@portfolio');
    expect(status).toHaveTextContent('booting Dr.ME');
  });

  it('exports a stable loaded event name', () => {
    expect(LOADED_EVENT).toBe('drme:loaded');
  });
});
