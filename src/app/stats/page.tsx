import ActivityPanel from '@/features/activity/ui/ActivityPanel';

export default function StatsPage() {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-[clamp(1.25rem,5vw,5rem)] pb-20 pt-28 max-[700px]:pt-24">
      <ActivityPanel />
    </main>
  );
}
