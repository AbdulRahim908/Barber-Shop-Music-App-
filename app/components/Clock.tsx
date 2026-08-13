"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [timeParts, setTimeParts] = useState<{ hour: string; minute: string; ampm: string } | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const updateClock = () => {
      const parts = formatter.formatToParts(new Date());
      let hour = "";
      let minute = "";
      let ampm = "";

      for (const part of parts) {
        if (part.type === "hour") hour = part.value;
        if (part.type === "minute") minute = part.value;
        if (part.type === "dayPeriod") ampm = part.value;
      }

      setTimeParts({ hour, minute, ampm });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeParts) {
    return <div className="text-white/80 font-medium tabular-nums min-w-[70px] opacity-0" aria-hidden="true">00:00 AM</div>;
  }

  return (
    <div className="text-white/90 font-medium tabular-nums tracking-wide min-w-[70px] flex items-center gap-1 drop-shadow-md text-lg sm:text-xl">
      <span>
        {timeParts.hour}
        <span className="animate-blink inline-block relative -top-[1px] mx-[1px]">:</span>
        {timeParts.minute}
      </span>
      <span className="text-sm text-white/70 uppercase font-semibold">{timeParts.ampm}</span>
    </div>
  );
}
