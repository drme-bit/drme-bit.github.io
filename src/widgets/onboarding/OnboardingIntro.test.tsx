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
    expect(dialog).toHaveTextContent("Hi, I'm Vyacheslav.");
    expect(dialog).toHaveTextContent('Full-stack developer building software');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /writing/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('button', { name: /start exploring/i })).toBeInTheDocument();
  });

  it('dismisses via the CTA and remembers the choice', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<OnboardingIntro />);

    fireEvent.click(screen.getByRole('button', { name: /start exploring/i }));
    expect(window.localStorage.getItem('drme-onboarded')).toBe('1');
  });

  it('dismisses on Escape', () => {
    window.sessionStorage.setItem('drme-loaded', '1');
    render(<OnboardingIntro />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(window.localStorage.getItem('drme-onboarded')).toBe('1');
  });
});
