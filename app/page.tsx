import { Clock } from "./components/Clock";
import { Player } from "./components/Player";
import { playlists } from "./data/playlists";

// Inline grain texture
const GRAIN_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

export default function Home() {
  // We start by just passing Mix 1 to the player for now
  const tracks = playlists['Mix 1'] || [];

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      
      {/* Background with CSS for portrait/landscape */}
      <div 
        className="-z-20 absolute inset-0 bg-cover bg-top hero-bg"
        style={{
          // We can use inline styles with a trick, but Tailwind classes + standard CSS are better
          // Instead, let's use a class that we define in a style tag here, or globals.css.
          // Since it's page specific, we'll just inject it:
        }}
      >
        <style dangerouslySetInnerHTML={{__html: "          .hero-bg {            background-image: url('/bg/scene-wide.png');          }          @media (orientation: portrait) {            .hero-bg {              background-image: url('/bg/scene-tall.png');            }          }"}} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      </div>

      {/* Grain overlay */}
      <div 
        className="-z-10 absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("${GRAIN_URL}")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* TOP ROW */}
      <header className="w-full relative z-30" style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))"
      }}>
        <div className="flex items-center justify-between w-full">
          {/* Top Left: Clock */}
          <div className="flex-1">
            <Clock />
          </div>

          {/* Top Center: Listener Count */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-medium text-white/80 tracking-wider">1,402 LISTENING</span>
            </div>
          </div>

          {/* Top Right: Social Links */}
          <div className="flex-1 flex justify-end gap-3 flex-wrap">
            <a href="https://x.com/Officialrahim27" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="https://www.instagram.com/rim_fitt?igsh=MXVvc3dqd2JzeGllcg%3D%3D" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://github.com/AbdulRahim908" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
            <a href="https://linkedin.com/in/abdul-rahim-583999207" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </header>

      {/* MIDDLE TITLE */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 text-center px-4 pointer-events-none transform -translate-y-[10vh]">
        <h1 className="text-5xl sm:text-7xl text-white drop-shadow-2xl tracking-wide mb-2 font-[family-name:var(--font-playfair)] italic font-bold">
          Barber Play list
        </h1>
        <p className="text-sm sm:text-lg text-white/70 font-medium drop-shadow-lg tracking-widest uppercase">
          {tracks.length}+ tracks - non stop
        </p>
      </div>

      {/* BOTTOM AREA: The Player */}
      <footer className="w-full" style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))"
      }}>
        {tracks.length > 0 ? (
          <Player tracks={tracks} />
        ) : (
          <div className="text-white text-center">No tracks available</div>
        )}
      </footer>

    </main>
  );
}
