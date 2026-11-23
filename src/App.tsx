/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Plus, Smile, Sliders, Palette, Upload, Sparkles,
  CheckCircle2, ShieldAlert, Info, Check, Copy
} from 'lucide-react';
import { 
  QRConfig, QRHistoryItem, QRPreset, DotStyle, EyeFrameStyle, EyeBallStyle 
} from './types';
import { generatePixPayload } from './lib/pix';
import QRCanvasRenderer from './components/QRCanvasRenderer';
import { PRESETS } from './components/presets';
import { Header } from './components/Header';
import { ContentTab } from './components/ContentTab';
import { DesignControlsTab } from './components/DesignControlsTab';
import { AIGeneratorTab } from './components/AIGeneratorTab';
import { LibraryModal } from './components/LibraryModal';

interface QRHandler {
  downloadPNG: (res: number) => void;
  downloadSVG: () => void;
  getSVGString: () => string;
}

export default function App() {
  // 1. Initial configuration state
  const [config, setConfig] = useState<QRConfig>({
    mode: 'url',
    value: 'https://ai.studio/build',
    url: 'https://ai.studio/build',
    text: 'Designed with Google AI Studio',
    wifi: { ssid: 'Guest_WiFi', password: 'my-super-secret-password', security: 'WPA' },
    vcard: { name: 'Evelyn', lastName: 'Mercer', organization: 'Creative Studio', title: 'Director', phone: '+1234567890', email: 'hello@creative.studio', url: 'https://creative.studio' },
    sms: { phone: '+1234567890', message: 'Hello! I scanned your custom QR Code.' },
    email: { email: 'hello@mybrand.com', subject: 'Inquiry', body: 'Hi, I saw your QR code...' },
    phone: '+1234567890',
    pix: { key: '12345678900', keyType: 'cpf_cnpj', receiverName: 'ALEX SILVA', receiverCity: 'SAO PAULO', amount: '10.00', txid: 'PIXPLAYGROUND', description: 'PixelCraft QR Payments' },
    style: { ...PRESETS[0].style },
    logo: { ...PRESETS[0].logo },
    errorCorrectionLevel: 'H'
  });

  // 2. Active UI States
  const [activeTab, setActiveTab] = useState<'content' | 'templates' | 'shapes' | 'colors' | 'logo' | 'ai'>('content');
  const [resolution, setResolution] = useState<number>(1024);
  const [copied, setCopied] = useState<boolean>(false);
  const [library, setLibrary] = useState<QRHistoryItem[]>([]);
  const [savedName, setSavedName] = useState<string>('');
  
  // AI advice states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);

  // Drag over state for custom logo uploads
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Export handlers reference
  const qrHandlerRef = useRef<QRHandler | null>(null);

  // Real-time scan verification state
  const [scanVerified, setScanVerified] = useState<{ success: boolean; data?: string } | null>(null);

  // Load saved history/library on launch
  useEffect(() => {
    const saved = localStorage.getItem('qr_designer_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load library:', e);
      }
    }
  }, []);

  // Update localStorage when library changes
  const saveLibraryToStorage = (updatedList: QRHistoryItem[]) => {
    setLibrary(updatedList);
    localStorage.setItem('qr_designer_library', JSON.stringify(updatedList));
  };

  // 3. Render and compile payload format based on active mode in real-time
  useEffect(() => {
    let rawStr = '';
    const { mode, url, text, wifi, vcard, sms, email, phone, pix } = config;

    switch (mode) {
      case 'url':
        let processedUrl = url.trim();
        if (processedUrl && !/^https?:\/\//i.test(processedUrl) && !/^mailto:/i.test(processedUrl)) {
          processedUrl = 'https://' + processedUrl;
        }
        rawStr = processedUrl;
        break;
      case 'text':
        rawStr = text;
        break;
      case 'wifi':
        rawStr = `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password || ''};H:${wifi.hidden ? 'true' : ''};;`;
        break;
      case 'vcard':
        rawStr = `BEGIN:VCARD\nVERSION:3.0\nN:${vcard.lastName || ''};${vcard.name || ''};;;\nFN:${vcard.name || ''} ${vcard.lastName || ''}\nORG:${vcard.organization || ''}\nTITLE:${vcard.title || ''}\nTEL:${vcard.phone || ''}\nEMAIL:${vcard.email || ''}\nURL:${vcard.url || ''}\nADR:;;${vcard.address || ''};;;;\nEND:VCARD`;
        break;
      case 'sms':
        rawStr = `SMSTO:${sms.phone}:${sms.message || ''}`;
        break;
      case 'email':
        rawStr = `mailto:${email.email}?subject=${encodeURIComponent(email.subject || '')}&body=${encodeURIComponent(email.body || '')}`;
        break;
      case 'phone':
        rawStr = `tel:${phone}`;
        break;
      case 'pix':
        rawStr = generatePixPayload(pix);
        break;
    }

    setConfig(prev => ({ ...prev, value: rawStr }));
  }, [
    config.mode, config.url, config.text, config.phone,
    config.wifi.ssid, config.wifi.password, config.wifi.security, config.wifi.hidden,
    config.vcard.name, config.vcard.lastName, config.vcard.organization, config.vcard.title, config.vcard.phone, config.vcard.email, config.vcard.url, config.vcard.address,
    config.sms.phone, config.sms.message,
    config.email.email, config.email.subject, config.email.body,
    config.pix.key, config.pix.keyType, config.pix.receiverName, config.pix.receiverCity, config.pix.amount, config.pix.txid, config.pix.description
  ]);

  // Handle Logo resolution correction
  useEffect(() => {
    if (config.logo.sourceType !== 'none') {
      if (config.errorCorrectionLevel !== 'H' && config.errorCorrectionLevel !== 'Q') {
        setConfig(prev => ({ ...prev, errorCorrectionLevel: 'H' }));
      }
    }
  }, [config.logo.sourceType]);

  // Apply visual style presets
  const applyPreset = (preset: QRPreset) => {
    setConfig(prev => ({
      ...prev,
      style: { ...preset.style },
      logo: { ...prev.logo, ...preset.logo }
    }));
  };

  // Convert custom logo files to base64
  const handleLogoUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image exceeds 2MB. Please upload a smaller logo icon for optimal loading.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setConfig(prev => ({
        ...prev,
        logo: {
          ...prev.logo,
          sourceType: 'upload',
          uploadUrl: dataUrl
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Image Drag and drop utilities
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  // Suggest brand styling via Google Gemini API
  const getAISuggestion = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);

    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to query the design assistant.');
      }

      const data = await response.json();
      setAiSuggestion(data);
    } catch (err: any) {
      setAiError(err.message || 'Server timeout or connection failure.');
    } finally {
      setAiLoading(false);
    }
  };

  // Instantly map Gemini colors and shapes back into config!
  const applyAiTheme = () => {
    if (!aiSuggestion) return;
    const { dotStyle, eyeFrameStyle, eyeBallStyle, fgColor1, fgColor2, fgType, bgColor, useTransparentBg, logoPreset } = aiSuggestion;

    setConfig(prev => ({
      ...prev,
      style: {
        ...prev.style,
        dotStyle: dotStyle as DotStyle,
        eyeFrameStyle: eyeFrameStyle as EyeFrameStyle,
        eyeBallStyle: eyeBallStyle as EyeBallStyle,
        fgGradient: {
          type: fgType as 'solid' | 'linear',
          color1: fgColor1,
          color2: fgColor2,
          angle: 45
        },
        bgGradient: {
          type: 'solid',
          color1: bgColor,
        },
        useTransparentBg,
        customEyeColor: false
      },
      logo: {
        ...prev.logo,
        sourceType: logoPreset !== 'none' ? 'preset' : 'none',
        presetKey: logoPreset !== 'none' ? logoPreset : undefined,
        borderColor: fgColor1,
        borderWidth: 2,
        bgType: 'rounded',
        bgColor: bgColor === '#ffffff' ? '#ffffff' : bgColor
      },
      errorCorrectionLevel: 'H'
    }));
  };

  // Add QR configuration to Local Storage Library
  const addToLibrary = () => {
    const title = savedName.trim() || `My Studio QR (${config.mode.toUpperCase()})`;
    const newItem: QRHistoryItem = {
      id: `saved-${Date.now()}`,
      createdAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      name: title,
      mode: config.mode,
      rawContent: config.value,
      config: JSON.parse(JSON.stringify(config)),
      favorite: false
    };

    const newLibrary = [newItem, ...library];
    saveLibraryToStorage(newLibrary);
    setSavedName('');
  };

  // Restore style configuration from historic entry card
  const restoreLibraryItem = (item: QRHistoryItem) => {
    const restored = JSON.parse(JSON.stringify(item.config));
    if (!restored.pix) {
      restored.pix = { key: '12345678900', keyType: 'cpf_cnpj', receiverName: 'ALEX SILVA', receiverCity: 'SAO PAULO', amount: '10.00', txid: 'PIXPLAYGROUND', description: 'PixelCraft QR Payments' };
    }
    setConfig(restored);
  };

  const deleteLibraryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = library.filter(item => item.id !== id);
    saveLibraryToStorage(updated);
  };

  const toggleFavoriteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = library.map(item => {
      if (item.id === id) {
        return { ...item, favorite: !item.favorite };
      }
      return item;
    });
    saveLibraryToStorage(updated);
  };

  // Copy SVG raw XML content to clipboard
  const copyRawSVG = () => {
    if (qrHandlerRef.current) {
      const xml = qrHandlerRef.current.getSVGString();
      if (xml) {
        navigator.clipboard.writeText(xml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Perform quick contrast/diagnostic checks in UI
  const getContrastReport = () => {
    const { fgGradient, bgGradient, useTransparentBg } = config.style;
    const { sourceType, sizePercent } = config.logo;

    const reports: string[] = [];
    let isWarning = false;

    if (useTransparentBg) {
      reports.push("Transparent backdrop applied. Advise scanning on light surfaces.");
    }

    if (sourceType !== 'none' && sizePercent > 22) {
      reports.push("Large logo footprint in center. Scanner may require premium error correction (Level H recommended).");
      if (config.errorCorrectionLevel !== 'H') isWarning = true;
    }

    const colHex = fgGradient.color1.toLowerCase();
    const bgHex = bgGradient.color1.toLowerCase();
    if (colHex === '#ffffff' || colHex === '#f4f4f5' || colHex === '#e4e4e7') {
      if (bgHex === '#ffffff' || bgHex === '#f4f4f5' || bgHex === '#e4e4e7') {
        reports.push("CRITICAL CONTRAST LOSS: Foreground and Background are both light. Scanning will fail!");
        isWarning = true;
      }
    }

    return {
      text: reports.length > 0 ? reports.join(' • ') : "All QR segments optimized. Excellent scan contrast verified.",
      isWarning
    };
  };

  const diagnostic = getContrastReport();

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151722_1px,transparent_1px),linear-gradient(to_bottom,#151722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Header bar */}
      <Header />

      {/* Main dashboard space */}
      <main className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 pb-16 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Left Side: Customizer Workbench */}
        <section className="md:col-span-7 2xl:col-span-8 bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden md:min-h-[580px] flex flex-col">
          {/* Work category navigation Tabs */}
          <div className="flex flex-wrap md:flex-nowrap border-b border-white/5 bg-slate-950/70 p-1 overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'content', label: '1. Content', icon: Plus },
              { id: 'templates', label: '2. Presets', icon: Smile },
              { id: 'shapes', label: '3. Shapes', icon: Sliders },
              { id: 'colors', label: '4. Colors', icon: Palette },
              { id: 'logo', label: '5. Brand Logo', icon: Upload },
              { id: 'ai', label: 'AI Suggest', icon: Sparkles, highlight: true }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-medium rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? tab.highlight 
                      ? 'bg-gradient-to-r from-[#ff007f] via-[#ef4444] to-[#9900ff] text-white shadow shadow-pink-500/25' 
                      : 'bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-purple-500/10 text-white border border-rose-500/30 shadow-[0_0_15px_rgba(255,0,128,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className={`h-3.5 w-3.5 ${tab.highlight && activeTab !== tab.id ? 'text-pink-400 animate-pulse font-bold' : ''}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 flex-1">
            {activeTab === 'content' && (
              <ContentTab config={config} setConfig={setConfig} />
            )}

            {['templates', 'shapes', 'colors', 'logo'].includes(activeTab) && (
              <DesignControlsTab
                activeTab={activeTab as any}
                config={config}
                setConfig={setConfig}
                applyPreset={applyPreset}
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleLogoUpload={handleLogoUpload}
              />
            )}

            {activeTab === 'ai' && (
              <AIGeneratorTab
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                aiLoading={aiLoading}
                aiError={aiError}
                aiSuggestion={aiSuggestion}
                getAISuggestion={getAISuggestion}
                applyAiTheme={applyAiTheme}
              />
            )}
          </div>
        </section>

        {/* Right Side: Preview, Diagnostics, Export, Library */}
        <section className="md:col-span-5 2xl:col-span-4 space-y-4 md:space-y-6 md:sticky md:top-4">
          
          {/* Live Preview Screen */}
          <div className="bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Studio Preview</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {config.style.useTransparentBg ? 'RGBA Graphic' : 'RGB Graphic'}
              </span>
            </div>

            {/* Inner dynamic drawing canvas */}
            <QRCanvasRenderer
              config={config}
              size={300}
              exportTrigger={(handlerObj) => {
                qrHandlerRef.current = handlerObj;
              }}
              onScanVerify={(result) => setScanVerified(result)}
            />

            {/* Real-time Scan Verification & Diagnostic Block */}
            <div className="w-full mt-4 space-y-2">
              {scanVerified && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] leading-relaxed transition-all duration-300 ${
                  scanVerified.success
                    ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/20 text-red-300 animate-pulse'
                }`}>
                  {scanVerified.success ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block uppercase tracking-wider">
                      {scanVerified.success ? '✓ Scan Verification Passed' : '✗ Readability Warning'}
                    </span>
                    <span>
                      {scanVerified.success 
                        ? 'This QR Code is active and decoded successfully in real-time!'
                        : 'Warning: The QR scanner cannot read this code. Try increasing contrast, scaling down the logo, or selecting simpler modules.'}
                    </span>
                    {scanVerified.success && scanVerified.data && (
                      <div className="mt-1 font-mono text-[9px] bg-slate-950/60 p-1 px-1.5 rounded border border-white/5 truncate max-w-full">
                        Decoded Content: {scanVerified.data}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] leading-relaxed transition-all duration-300 ${
                diagnostic.isWarning 
                  ? 'bg-amber-950/55 border-amber-500/20 text-amber-300' 
                  : 'bg-slate-900/40 border-white/5 text-slate-400'
              }`}>
                {diagnostic.isWarning ? (
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block uppercase tracking-wider">Contrast & Quality Advisory</span>
                  <span>{diagnostic.text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Suite Options Panel */}
          <div className="bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Export Graphic</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Raster PNG Export Resolution</span>
                  <span className="font-mono text-indigo-400">{resolution} x {resolution} px</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/60 rounded-lg border border-white/5 font-mono text-[10px]">
                  {[
                    { val: 512, label: '512px (Web)' },
                    { val: 1024, label: '1024px (HD)' },
                    { val: 2048, label: '2048px (Print)' }
                  ].map(resPreset => (
                    <button
                      key={resPreset.val}
                      onClick={() => setResolution(resPreset.val)}
                      className={`py-1.5 px-2 rounded-md text-center transition-all cursor-pointer ${resolution === resPreset.val ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {resPreset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-semibold">
                <button
                  onClick={() => qrHandlerRef.current?.downloadPNG(resolution)}
                  disabled={!config.value}
                  className="py-3 px-4 bg-gradient-to-r from-[#ff007f] via-[#ef4444] to-[#9900ff] hover:brightness-110 text-white rounded-xl transition-all shadow-md shadow-pink-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Download HD PNG</span>
                </button>

                <button
                  onClick={() => qrHandlerRef.current?.downloadSVG()}
                  disabled={!config.value}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 text-pink-400" />
                  <span>Download SVG Vector</span>
                </button>
              </div>

              <button
                onClick={copyRawSVG}
                disabled={!config.value}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-white/5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied Vector Path!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy SVG Inline Code to Clip</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Local Storage Saved Library */}
          <LibraryModal
            savedName={savedName}
            setSavedName={setSavedName}
            addToLibrary={addToLibrary}
            library={library}
            restoreLibraryItem={restoreLibraryItem}
            toggleFavoriteItem={toggleFavoriteItem}
            deleteLibraryItem={deleteLibraryItem}
          />
        </section>
      </main>
    </div>
  );
}
