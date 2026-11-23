import React from 'react';
import { 
  Sparkles, Sliders, Palette, Upload, Plus, X
} from 'lucide-react';
import { 
  QRConfig, QRPreset, DotStyle, EyeFrameStyle, EyeBallStyle 
} from '../types';
import { PRESETS } from './presets';
import { PRESET_LOGOS } from './logos';

interface DesignControlsTabProps {
  activeTab: 'templates' | 'shapes' | 'colors' | 'logo';
  config: QRConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRConfig>>;
  applyPreset: (preset: QRPreset) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleLogoUpload: (file: File) => void;
}

export const DesignControlsTab: React.FC<DesignControlsTabProps> = ({
  activeTab,
  config,
  setConfig,
  applyPreset,
  dragActive,
  handleDrag,
  handleDrop,
  handleLogoUpload
}) => {
  return (
    <>
      {/* Tab 2: Preset Themes */}
      {activeTab === 'templates' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Apply pre-tested styling themes crafted by designers. Tap any item to instantly rewrite colors, structures, and layouts.
          </p>

          <div className="bg-gradient-to-r from-red-950/30 via-slate-900/60 to-indigo-950/30 border border-indigo-500/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span>REPLICATE YOUR REFERENCE STYLE CODES</span>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-normal">
                To build custom styles: Apply the <strong>Crimson Gamer Profile</strong> or <strong>Stealth Obsidian Circle</strong> templates below, then open the <strong>Logo tab</strong> to upload your avatar photo!
              </p>
            </div>
            <span className="text-[9px] bg-red-950/65 text-red-400 border border-red-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Helpful</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {PRESETS.map((p) => {
              const isSelected = 
                config.style.dotStyle === p.style.dotStyle && 
                config.style.fgGradient.color1 === p.style.fgGradient.color1;
              
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`flex items-start text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900/45 hover:bg-slate-900/90 border-white/5 hover:border-slate-800'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                  <div className="mr-3 mt-1 flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center font-bold relative shadow"
                      style={{
                        background: p.style.useTransparentBg 
                          ? `linear-gradient(45deg, ${p.style.fgGradient.color1} 0%, ${p.style.fgGradient.color2 || p.style.fgGradient.color1} 100%)`
                          : `linear-gradient(135deg, ${p.style.bgGradient.color1} 0%, ${p.style.bgGradient.color1} 100%)`
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded-lg"
                        style={{
                          background: `linear-gradient(${p.style.fgGradient.angle || 45}deg, ${p.style.fgGradient.color1}, ${p.style.fgGradient.color2 || p.style.fgGradient.color1})`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-200">{p.name}</span>
                      {p.style.useTransparentBg && (
                        <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Alt Transparent</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Shapes & Structures */}
      {activeTab === 'shapes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">QR Modules (Dot Matrix)</h3>
              <span className="text-[10px] bg-slate-900 border border-white/5 py-0.5 px-2 rounded-md text-indigo-400 font-mono capitalize">
                {config.style.dotStyle}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'square', name: 'Classic Blocks', desc: 'Standard pixel squares' },
                { id: 'circle', name: 'Artistic Dots', desc: 'Symmetric round circular dots' },
                { id: 'rounded', name: 'Soft Pillow', desc: 'Slightly rounded islands' },
                { id: 'fluid', name: 'Connecting Fluid', desc: 'Adjacent blocks connect smoothly' },
                { id: 'diamond', name: 'Brutal Diamonds', desc: 'Rotated elegant diamond grid' },
                { id: 'star', name: 'Starry Pixels', desc: '4-point celestial stars' },
                { id: 'plus', name: 'Plus & Crosses', desc: 'Precise geometric grid crosshairs' },
                { id: 'ring', name: 'Outline Rings', desc: 'Aesthetic hollow modern rings' },
                { id: 'hexagon', name: 'Hexagonal Grid', desc: 'High-tech honeycombed modules' }
              ].map(styleOpt => (
                <button
                  key={styleOpt.id}
                  onClick={() => setConfig(prev => ({ ...prev, style: { ...prev.style, dotStyle: styleOpt.id as DotStyle } }))}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                    config.style.dotStyle === styleOpt.id
                      ? 'bg-slate-900 border-indigo-600 shadow'
                      : 'bg-slate-900/30 border-white/5 hover:border-slate-800'
                  }`}
                >
                  <span className="block text-xs font-semibold text-slate-200">{styleOpt.name}</span>
                  <span className="block text-[10px] text-slate-400 leading-normal mt-0.5">{styleOpt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Module Sizing & Layout Properties</h3>
            
            <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Module Size (Individual Dot Scale)</span>
                <span className="font-mono text-indigo-400">
                  {Math.round((config.style.dotScale ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="130"
                step="5"
                value={Math.round((config.style.dotScale ?? 1.0) * 100)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 100;
                  setConfig(prev => ({ ...prev, style: { ...prev.style, dotScale: val } }));
                }}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Quiet Zone Border Margin</span>
                <span className="font-mono text-indigo-400">{config.style.margin} modules</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={config.style.margin}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setConfig(prev => ({ ...prev, style: { ...prev.style, margin: val } }));
                }}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Error Correction Resilience (ECC)</span>
                <span className="font-mono text-indigo-400">
                  Level {config.errorCorrectionLevel}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-white/5 font-mono text-[10px]">
                {[
                  { val: 'L', label: 'Low (L)' },
                  { val: 'M', label: 'Medium (M)' },
                  { val: 'Q', label: 'Quartile (Q)' },
                  { val: 'H', label: 'High (H)' }
                ].map((ecc) => (
                  <button
                    type="button"
                    key={ecc.val}
                    onClick={() => setConfig(prev => ({ ...prev, errorCorrectionLevel: ecc.val as any }))}
                    className={`py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${
                      config.errorCorrectionLevel === ecc.val 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ecc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eye Frame Shape (Outer Finder)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'square', name: 'Square' },
                { id: 'rounded', name: 'Rounded' },
                { id: 'circle', name: 'Circle' },
                { id: 'shield', name: 'Shield' },
                { id: 'leaf', name: 'Organic Leaf' }
              ].map(styleOpt => (
                <button
                  key={styleOpt.id}
                  onClick={() => setConfig(prev => ({ ...prev, style: { ...prev.style, eyeFrameStyle: styleOpt.id as EyeFrameStyle } }))}
                  className={`p-2 rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                    config.style.eyeFrameStyle === styleOpt.id
                      ? 'bg-slate-900 border-indigo-600 text-white font-semibold'
                      : 'bg-slate-900/30 border-white/5 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{styleOpt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eye Ball Shape (Center Core)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'square', name: 'Square' },
                { id: 'rounded', name: 'Rounded' },
                { id: 'circle', name: 'Circle' },
                { id: 'diamond', name: 'Diamond' },
                { id: 'leaf', name: 'Organic Leaf' }
              ].map(styleOpt => (
                <button
                  key={styleOpt.id}
                  onClick={() => setConfig(prev => ({ ...prev, style: { ...prev.style, eyeBallStyle: styleOpt.id as EyeBallStyle } }))}
                  className={`p-2 rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                    config.style.eyeBallStyle === styleOpt.id
                      ? 'bg-slate-900 border-indigo-600 text-white font-semibold'
                      : 'bg-slate-900/30 border-white/5 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{styleOpt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Colors & Gradients */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">QR Code Fill (Foreground Color Type)</label>
              <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5 text-[10px] flex-wrap gap-0.5">
                {[
                  { id: 'solid', label: 'Solid' },
                  { id: 'linear', label: 'Linear' },
                  { id: 'radial', label: 'Radial' },
                  { id: 'diagonal', label: 'Diagonal' },
                  { id: 'conic', label: 'Conic' }
                ].map(gType => (
                  <button
                    key={gType.id}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      style: {
                        ...prev.style,
                        fgGradient: {
                          ...prev.style.fgGradient,
                          type: gType.id as any,
                          color2: prev.style.fgGradient.color2 || '#e11d48'
                        }
                      }
                    }))}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer font-bold capitalize ${config.style.fgGradient.type === gType.id ? 'bg-gradient-to-r from-[#ff007f] to-[#9900ff] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    {gType.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              <div className="flex items-center gap-3 bg-slate-900/65 p-3 rounded-xl border border-white/5">
                <input
                  type="color"
                  value={config.style.fgGradient.color1}
                  onChange={(e) => setConfig(prev => ({ ...prev, style: { ...prev.style, fgGradient: { ...prev.style.fgGradient, color1: e.target.value } } }))}
                  className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent block"
                />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Color #1 (Start)</span>
                  <span className="text-xs font-semibold text-slate-200 font-mono uppercase">{config.style.fgGradient.color1}</span>
                </div>
              </div>

              {config.style.fgGradient.type !== 'solid' && (
                <div className="flex items-center gap-3 bg-slate-900/65 p-3 rounded-xl border border-white/5">
                  <input
                    type="color"
                    value={config.style.fgGradient.color2 || '#3b82f6'}
                    onChange={(e) => setConfig(prev => ({ ...prev, style: { ...prev.style, fgGradient: { ...prev.style.fgGradient, color2: e.target.value } } }))}
                    className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent block"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Color #2 (End)</span>
                    <span className="text-xs font-semibold text-slate-200 font-mono uppercase">{config.style.fgGradient.color2 || '#3b82f6'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Backdrop (Background Canvas)</label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={config.style.useTransparentBg}
                  onChange={(e) => setConfig(prev => ({ ...prev, style: { ...prev.style, useTransparentBg: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-indigo-500"
                />
                <span className="text-xs text-indigo-400 font-bold font-mono">Transparent BG</span>
              </label>
            </div>

            {!config.style.useTransparentBg && (
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <input
                  type="color"
                  value={config.style.bgGradient.color1}
                  onChange={(e) => setConfig(prev => ({ ...prev, style: { ...prev.style, bgGradient: { type: 'solid', color1: e.target.value } } }))}
                  className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent block"
                />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Canvas Color</span>
                  <span className="text-xs font-semibold text-slate-200 font-mono uppercase">{config.style.bgGradient.color1}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Branding Brand Logos */}
      {activeTab === 'logo' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Logo Source Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'No Logo' },
                { id: 'preset', label: 'Preset Vectors' },
                { id: 'upload', label: 'Upload Custom' }
              ].map(src => (
                <button
                  key={src.id}
                  onClick={() => setConfig(prev => ({ ...prev, logo: { ...prev.logo, sourceType: src.id as any } }))}
                  className={`p-3 rounded-lg border text-center transition-all duration-200 cursor-pointer text-xs font-medium ${
                    config.logo.sourceType === src.id
                      ? 'bg-slate-900 border-indigo-600 font-bold text-white'
                      : 'bg-slate-900/30 border-white/5 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>

          {config.logo.sourceType === 'preset' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Select Vector Brand Icon</label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {PRESET_LOGOS.map((lg) => (
                  <button
                    key={lg.id}
                    onClick={() => setConfig(prev => ({ ...prev, logo: { ...prev.logo, presetKey: lg.id } }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border gap-2 transition-all cursor-pointer ${
                      config.logo.presetKey === lg.id
                        ? 'bg-slate-900 border-indigo-600 text-white font-bold'
                        : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-slate-950 p-1.5"
                      style={{ color: lg.color }}
                      dangerouslySetInnerHTML={{ __html: lg.svg }}
                    />
                    <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{lg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.logo.sourceType === 'upload' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Upload Logo File (PNG/JPG/SVG)</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-white/10 hover:border-slate-700 bg-slate-900/30'
                }`}
              >
                {config.logo.uploadUrl ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <img 
                      src={config.logo.uploadUrl} 
                      alt="Custom uploaded logo" 
                      className="w-14 h-14 rounded-xl border border-white/10 bg-white object-contain p-1"
                    />
                    <div className="text-xs">
                      <span className="block font-semibold text-emerald-400">Custom Logo Loaded Successfully</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, logo: { ...prev.logo, uploadUrl: undefined, sourceType: 'none' } }))}
                        className="text-[10px] text-red-400 hover:underline mt-1 block h-fit w-auto cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-pink-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-pink-400 hover:underline text-xs font-bold">Select a local file</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <span className="text-slate-500 text-xs"> or drag and drop here</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
