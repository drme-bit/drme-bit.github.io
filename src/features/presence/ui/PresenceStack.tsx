'use client';

import { usePresence } from '../model/PresenceProvider';

/*  Who else is here: overlapping guest avatars + headcount.
    Renders nothing when you're alone — stays out of the way.  */

export function PresenceStack() {
  const { viewers } = usePresence();
  if (viewers.length === 0) return null;

  const shown = viewers.slice(0, 5);
  const extra = viewers.length - shown.length;

  return (
    <div
      className="flex items-center"
      role="status"
      aria-label={`${viewers.length} other ${viewers.length === 1 ? 'visitor' : 'visitors'} viewing now`}
    >
      <div className="flex items-center">
        {shown.map((v, i) => (
          <span
            key={v.id}
            title={v.name}
            aria-hidden={i > 0}
            style={{ backgroundColor: v.color, zIndex: shown.length - i }}
            className="-ml-2 flex size-6 items-center justify-center rounded-full border border-black/50 font-mono text-[10px] font-semibold text-black/80 first:ml-0"
          >
            {v.name.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
      {extra > 0 ? (
        <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">+{extra}</span>
      ) : (
        <span className="ml-1.5 hidden font-mono text-[11px] text-muted-foreground sm:inline">
          {viewers.length === 1 ? '1 viewing' : `${viewers.length} viewing`}
        </span>
      )}
    </div>
  );
}
