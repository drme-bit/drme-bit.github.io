'use client';

import { useEffect, useState } from 'react';
import { usePresence } from '../model/PresenceProvider';

/*  Live guest cursors (Figma-style): colored arrow + name flag.
    Positions glide via CSS transition — zero rAF code. Desktop only;
    the navbar stack covers touch.  */

function RemoteArrow({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3.5 19 11.5 12.6 12.4 9.5 19.5Z"
        fill={color}
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RemoteCursors() {
  const { viewers } = usePresence();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate: SSR renders null, layer mounts only on client
    setFine(window.matchMedia('(pointer: fine)').matches);
  }, []);

  if (!fine || viewers.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[900]">
      {viewers.map((v) => (
        <div
          key={v.id}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            transform: `translate(${v.x}px, ${v.y}px)`,
            transition: 'transform 140ms linear',
          }}
        >
          <RemoteArrow color={v.color} />
          <span
            className="mt-0.5 ml-3.5 inline-block rounded-full px-1.5 py-px font-mono text-[10px] font-medium whitespace-nowrap text-black/85"
            style={{ backgroundColor: v.color }}
          >
            {v.name}
          </span>
        </div>
      ))}
    </div>
  );
}
