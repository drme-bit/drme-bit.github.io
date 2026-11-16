import { FiZap, BsFillKanbanFill, RiRobot2Fill } from '@/shared/ui/Icon';
import { FiLayers, FiGitBranch, FiActivity } from 'react-icons/fi';
import type { IconType } from 'react-icons';

/*  Highlights are ordered as a story, one step of the loop per card:
    Plan → Design → Build → Ship → Measure → Fix
    `desc` is always visible; `detail` is revealed on hover (always visible on small screens).  */

export interface Highlight {
  icon: IconType;
  eyebrow: string;
  title: string;
  desc: string;
  detail: string;
  image: string;
  imageAlt: string;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: BsFillKanbanFill,
    eyebrow: 'Plan',
    title: 'Kanban Workflow',
    desc: 'I ship in small, frequent iterations — tasks move with intention from Backlog to Done.',
    detail:
      'Big features are sliced into small, shippable tasks, each with a clear definition of done before it starts. Nothing sits in “In progress” for long — blocked work is surfaced early instead of hiding in a column.',
    image: '/images/demonstration/linear_board.webp',
    imageAlt: 'A kanban board with tasks moving from Backlog to Done',
  },
  {
    icon: FiLayers,
    eyebrow: 'Design',
    title: 'Simple Architecture',
    desc: 'Boring architecture the next person can understand wins over elegant puzzles.',
    detail:
      'Decisions are written down in a few lines: what I chose, what I rejected and why. Boundaries stay obvious, so a new teammate can find their way without a guided tour.',
    image: '/images/demonstration/design_books.webp',
    imageAlt: 'A diagram of the system architecture and its service boundaries',
  },
  {
    icon: RiRobot2Fill,
    eyebrow: 'Build',
    title: 'AI-Augmented',
    desc: 'Copilot, Cursor and agents as force multipliers for speed, refactoring and code quality.',
    detail:
      'I lean on them for boilerplate, refactoring and exploring unfamiliar code. Every suggestion is reviewed — I own what ships — and architecture and security decisions stay with me.',
    image: '/images/demonstration/jetbrains_ai.webp',
    imageAlt: 'A JetBrains IDE with an AI assistant suggesting code changes',
  },
  {
    icon: FiGitBranch,
    eyebrow: 'Ship',
    title: 'Automated Delivery',
    desc: 'From commit to production through an automated pipeline — no manual steps to forget.',
    detail:
      'Builds, tests and container images run automatically, and deploys are driven from Git. Secrets live in a vault, never in the repo, so shipping stays boring and repeatable.',
    image: '/images/demonstration/jenkins_image.webp',
    imageAlt: 'A CI/CD pipeline running from commit to deployment',
  },
  {
    icon: FiActivity,
    eyebrow: 'Measure',
    title: 'Measure First',
    desc: 'Performance budgets, real metrics, profiling before optimizing.',
    detail:
      'I take a baseline, change one thing, then compare. If the number didn’t move, the change didn’t help — feelings are not benchmarks.',
    image: '/images/demonstration/graphana_workspace.webp',
    imageAlt: 'A metrics dashboard comparing performance before and after a change',
  },
  {
    icon: FiZap,
    eyebrow: 'Fix',
    title: 'Deep Focus',
    desc: 'When something doesn’t work, I don’t stop — every bug is a puzzle that just needs more time.',
    detail:
      'I reproduce the bug first, then narrow it down. Logs and a profiler come before guesses, and every fix ends with a test so it stays fixed.',
    image: '/images/demonstration/me-coding-demo.webp',
    imageAlt: 'Me coding at my workstation',
  },
];
