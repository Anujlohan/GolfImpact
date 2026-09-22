'use client';

import { useState, useEffect, useMemo } from 'react';

export function DrawCountdown({ targetDate }: { targetDate?: Date }) {
  const targetTimestamp = useMemo(() => {
    if (targetDate) return targetDate.getTime();
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    ).getTime();
  }, [targetDate]);

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTimestamp - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return (
    <div className="flex items-center justify-center gap-3 text-center">
      <div className="rounded border border-border bg-slate-900 px-3 py-2 min-w-[60px]">
        <span className="text-xl font-bold text-white block">{timeLeft.days}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Days</span>
      </div>
      <span className="text-muted-foreground font-bold">:</span>
      <div className="rounded border border-border bg-slate-900 px-3 py-2 min-w-[60px]">
        <span className="text-xl font-bold text-white block">{timeLeft.hours}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Hours</span>
      </div>
      <span className="text-muted-foreground font-bold">:</span>
      <div className="rounded border border-border bg-slate-900 px-3 py-2 min-w-[60px]">
        <span className="text-xl font-bold text-white block">{timeLeft.minutes}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Mins</span>
      </div>
      <span className="text-muted-foreground font-bold">:</span>
      <div className="rounded border border-border bg-slate-900 px-3 py-2 min-w-[60px]">
        <span className="text-xl font-bold text-white block">{timeLeft.seconds}</span>
        <span className="text-[10px] text-muted-foreground uppercase">Secs</span>
      </div>
    </div>
  );
}
