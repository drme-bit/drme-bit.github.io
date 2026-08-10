import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingIntro } from './OnboardingIntro';

describe('OnboardingIntro', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('renders nothing when already onboarded', () => {
    window.localStorage.setItem('drme-onboarded', '1');
    render(<OnboardingIntro />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the welcome card once the loader finished', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<OnboardingIntro />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('this is a live portfolio');
    expect(dialog).toHaveTextContent('full-stack developer from Odesa');
    expect(screen.getAllByText(/explore skills|read the source|meet the author|say hello/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /enter the site/i })).toBeInTheDocument();
  });

  it('dismisses via the CTA and remembers the choice', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<OnboardingIntro />);

    fireEvent.click(screen.getByRole('button', { name: /enter the site/i }));
    expect(window.localStorage.getItem('drme-onboarded')).toBe('1');
  });

  it('dismisses on Enter', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<OnboardingIntro />);

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(window.localStorage.getItem('drme-onboarded')).toBe('1');
  });
});
