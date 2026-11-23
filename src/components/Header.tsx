import React from 'react';
import { QrCode } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 py-3 md:py-4 px-4 md:px-6 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-tr from-[#ff007f] via-[#ffaa00] via-[#00ffcc] to-[#9900ff] rounded-xl shadow-lg shadow-pink-500/10">
            <QrCode className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 via-amber-300 via-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PixelCraft QR Studio
            </h1>
            <p className="hidden sm:block text-[10px] md:text-xs text-slate-400 font-medium">
              Premium custom-branded vector generator with real-time AI styling
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-slate-400 bg-slate-950/80 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/5">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
};
