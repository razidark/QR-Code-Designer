import React from 'react';
import { Sparkles, Info, Check } from 'lucide-react';

interface AIGeneratorTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiLoading: boolean;
  aiError: string | null;
  aiSuggestion: any | null;
  getAISuggestion: () => void;
  applyAiTheme: () => void;
}

export const AIGeneratorTab: React.FC<AIGeneratorTabProps> = ({
  aiPrompt,
  setAiPrompt,
  aiLoading,
  aiError,
  aiSuggestion,
  getAISuggestion,
  applyAiTheme
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-tr from-purple-950/40 via-slate-950/50 to-slate-950/20 border border-purple-500/10 rounded-xl p-4 space-y-2 flex flex-col justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Sparkles className="h-4 w-4" />
          <span>AI BRANDING ASSISTANT (POWERED BY GEMINI)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Describe your brand identity, product niche, or visual aesthetics. Google Gemini will instantly recommend bespoke color palettes, fluid grids, and logo categories suited for your brand.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">State Your Brand concept</label>
        <div className="relative">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. A premium high-contrast luxury matcha boutique in Kyoto. Minimal olive green aesthetic and dark clay backdrops."
            rows={3}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={getAISuggestion}
          disabled={aiLoading || !aiPrompt.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#ff007f] via-[#ef4444] via-[#ffaa00] via-[#3b82f6] to-[#9900ff] hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aiLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Consulting Design Model...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Brand Style Recommendation</span>
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="p-3 bg-red-950/80 border border-red-500/20 text-xs text-red-400 rounded-lg flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {aiSuggestion && (
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="font-bold text-slate-200 block uppercase tracking-wider">Recommended Layout</span>
            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded-md uppercase tracking-wider">Design Concept Compiled</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 leading-normal">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] block font-medium uppercase font-mono">Colors</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ background: aiSuggestion.fgType === 'linear' ? `linear-gradient(45deg, ${aiSuggestion.fgColor1}, ${aiSuggestion.fgColor2})` : aiSuggestion.fgColor1 }}
                />
                <div>
                  <span className="font-semibold text-slate-200 block font-mono uppercase">{aiSuggestion.fgColor1}</span>
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">{aiSuggestion.fgType}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] block font-medium uppercase font-mono">Backdrop</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ background: aiSuggestion.useTransparentBg ? 'transparent' : aiSuggestion.bgColor }}
                />
                <div>
                  <span className="font-semibold text-slate-200 block font-mono uppercase">
                    {aiSuggestion.useTransparentBg ? 'Transparent' : aiSuggestion.bgColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <span className="text-slate-400 text-[10px] block font-medium uppercase font-mono">Structural Patterns</span>
              <p className="text-slate-200">
                Modules: <strong className="capitalize">{aiSuggestion.dotStyle}</strong> • Outer Eye Frame: <strong className="capitalize">{aiSuggestion.eyeFrameStyle}</strong> • Eye Ball: <strong className="capitalize">{aiSuggestion.eyeBallStyle}</strong>
              </p>
            </div>

            <div className="space-y-1 col-span-2 border-t border-white/5 pt-2.5">
              <span className="text-slate-400 text-[10px] block font-medium uppercase font-mono">Design Rationale</span>
              <p className="text-slate-300 italic leading-relaxed font-sans">
                &quot;{aiSuggestion.rationale}&quot;
              </p>
            </div>
          </div>

          <button
            onClick={applyAiTheme}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Apply AI Brand Theme Code</span>
          </button>
        </div>
      )}
    </div>
  );
};
