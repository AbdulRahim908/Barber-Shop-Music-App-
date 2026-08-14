"use client";

import { useState, useEffect } from "react";

export function ListenerCount() {
  const [listeners, setListeners] = useState(1402);

  useEffect(() => {
    // Generate a realistic base number based on the current hour to make it feel persistent
    const hour = new Date().getHours();
    let base = 1200;
    if (hour > 18 || hour < 2) base = 1800; // More listeners in the evening
    else if (hour > 9 && hour < 17) base = 1400; // Average during the day
    else base = 900; // Less early morning
    
    // Add some initial randomness
    setListeners(base + Math.floor(Math.random() * 150));

    // Fluctuate the number every 4-8 seconds
    const interval = setInterval(() => {
      setListeners((prev) => {
        // Randomly go up or down by 1 to 3
        const change = Math.floor(Math.random() * 3) + 1;
        const up = Math.random() > 0.45; // Slightly biased to go up over time during a session
        return up ? prev + change : prev - change;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-[11px] font-medium text-white/80 tracking-wider">
        {listeners.toLocaleString()} LISTENING
      </span>
    </div>
  );
}
