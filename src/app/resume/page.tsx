import type { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowLeft, FiDownload } from '@/shared/ui/Icon';
import { RESUME_FILE, resume } from '@/entities/profile';
import { profile } from '@/entities/profile';

export const metadata: Metadata = {
  title: 'Résumé — Dr.ME',
  description: `Résumé of ${profile.name} — full-stack developer. View online or download as PDF.`,
};

export default function ResumePage() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1024px] flex-col gap-6 px-5 pb-20 pt-28 md:px-8">
      <Link
        href="/#about"
        className="vercel-link inline-flex w-fit items-center gap-1.5 text-[0.8rem] font-medium"
      >
        <FiArrowLeft size={14} aria-hidden="true" />
        <span>Back to portfolio</span>
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-ghost)]">
            {'// résumé'}
          </p>
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.05] tracking-[var(--tracking-section)] text-[var(--text)]">
            {profile.name}
          </h1>
          <p className="m-0 text-[0.9rem] text-[var(--text-secondary)]">
            {resume.headline} · {resume.location}
          </p>
        </div>
        <a
          href={RESUME_FILE}
          download
          className="inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--accent-secondary)] px-5 py-2.5 text-[0.78rem] font-semibold text-[#02120f] no-underline shadow-[0_4px_20px_-4px_var(--accent-secondary-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
        >
          <FiDownload size={15} aria-hidden="true" />
          <span>Download PDF</span>
        </a>
      </header>

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--shadow-md)]">
        <object
          data={RESUME_FILE}
          type="application/pdf"
          className="block h-[75vh] w-full"
          aria-label={`${profile.name} résumé (PDF)`}
        >
          <p className="m-0 p-8 text-[0.9rem] text-[var(--text-secondary)]">
            Your browser can&apos;t preview PDFs.{' '}
            <a href={RESUME_FILE} download className="vercel-link font-medium">
              Download it instead
              <span className="vercel-link-arrow" aria-hidden="true"> ↓</span>
            </a>
          </p>
        </object>
      </div>

      <p className="m-0 font-mono text-[0.68rem] text-[var(--text-ghost)]">
        {RESUME_FILE.split('/').pop()} · updated recently ·{' '}
        <a href={RESUME_FILE} download className="vercel-link">
          direct link
        </a>
      </p>
    </main>
  );
}
