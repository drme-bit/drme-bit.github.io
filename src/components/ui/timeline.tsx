"use client";

import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const measure = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) setHeight(rect.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-transparent font-sans"
      ref={containerRef}
    >
      <div className="mx-auto w-full max-w-none px-4 pb-8 pt-12 md:px-0 md:pb-10 md:pt-14">
        <h2 className="mb-4 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] md:text-5xl">
          Experience &amp; background
        </h2>
        <p className="max-w-[48ch] text-sm leading-6 text-[var(--text-secondary)] md:text-base">
          Roles, teams and shipped work — freelance, game servers and
          full-stack apps.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto w-full max-w-none pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            id={`timeline-entry-${index}`}
            className="flex scroll-mt-28 justify-start pt-5 md:scroll-mt-36 md:gap-10 md:pt-16"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-[30%] md:shrink-0 md:flex-row md:max-w-none">
              <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg)] md:left-0">
                <div className="h-3 w-3 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] md:left-3" />
              </div>
              <h3 className="hidden text-xl font-semibold tracking-[-0.045em] text-[var(--text-dim)] md:block md:pl-20 md:text-4xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full min-w-0 pr-2 pl-14 sm:pr-3 sm:pl-16 md:flex-1 md:pr-4 md:pl-4">
              <h3 className="mb-3 block text-left text-xl font-semibold tracking-[-0.04em] text-[var(--text-dim)] sm:mb-4 sm:text-2xl md:hidden">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute top-0 left-5 w-px overflow-hidden bg-[var(--border)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-5"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-px rounded-full bg-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
};
