'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download, RefreshCcw, Link as LinkIcon, Type, Palette,
  Layout, QrCode, Image as ImageIcon, ChevronDown, Share2,
  Code, X, Crop, Copy
} from 'lucide-react';

// --- Types ---
interface Settings {
  url: string;
  pageBgColor: string;
  cardColor: string;
  scanMeText: string;
  scanMeColor: string;
  scanMeSize: number;
  scanMeFont: string;
  scanMeWeight: string;
  qrColor: string;
  qrBgColor: string;
  arrowColor: string;
  arrowStyle: string;
  bgPattern: string;
  bgImage: string | null;
}

interface ExportSettings {
  includeBg: boolean;
  includeCardBg: boolean;
  includeText: boolean;
  includeArrow: boolean;
  padding: number;
}

// Extend window interface for html2canvas
declare global {
  interface Window {
    html2canvas: any;
  }
}

// --- Defaults ---
const defaults: Settings = {
  url: 'https://eticpa.et',
  pageBgColor: '#1e3a29',
  cardColor: '#18181b',
  scanMeText: 'SCAN ME',
  scanMeColor: '#ffffff',
  scanMeSize: 32,
  scanMeFont: 'sans',
  scanMeWeight: '900',
  qrColor: '#000000',
  qrBgColor: '#ffffff',
  arrowColor: '#ffffff',
  arrowStyle: 'triangle',
  bgPattern: 'none',
  bgImage: null,
};

export default function QRStudio() {
  // --- URL Parameter Logic ---
  const getParams = () => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  };

  const [settings, setSettings] = useState<Settings>(defaults);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [isEmbedMode, setIsEmbedMode] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load params on mount
  useEffect(() => {
    const params = getParams();
    const embedView = params.get('view') === 'embed';
    setIsEmbedMode(embedView);

    const newSettings = { ...defaults };
    if (params.has('url')) newSettings.url = params.get('url')!;
    if (params.has('bg')) newSettings.pageBgColor = params.get('bg')!;
    if (params.has('card')) newSettings.cardColor = params.get('card')!;
    if (params.has('text')) newSettings.scanMeText = params.get('text')!;
    if (params.has('tcolor')) newSettings.scanMeColor = params.get('tcolor')!;
    if (params.has('tsize')) newSettings.scanMeSize = parseInt(params.get('tsize')!);
    if (params.has('qcolor')) newSettings.qrColor = params.get('qcolor')!;
    if (params.has('qbg')) newSettings.qrBgColor = params.get('qbg')!;
    if (params.has('acolor')) newSettings.arrowColor = params.get('acolor')!;
    if (params.has('astyle')) newSettings.arrowStyle = params.get('astyle')!;

    if (embedView && !params.has('bg')) {
      newSettings.pageBgColor = 'transparent';
    }

    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Load html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update QR URL
  useEffect(() => {
    const color = settings.qrColor.replace('#', '');
    const bg = settings.qrBgColor.replace('#', '');
    const data = encodeURIComponent(settings.url);
    // Use margin=1 to prevent clipping, handled nicely by the white box
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${data}&color=${color}&bgcolor=${bg}&margin=1`);
  }, [settings.url, settings.qrColor, settings.qrBgColor]);

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('bgImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Render for Embed Mode ---
  if (isEmbedMode) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          backgroundColor: settings.pageBgColor,
          ...getPatternStyle(settings)
        }}
      >
        <CardComponent settings={settings} qrUrl={qrUrl} />
      </div>
    );
  }

  // --- Render for Studio Mode ---
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row text-slate-800 font-sans bg-slate-50">

      {/* LEFT PANEL: Controls */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 h-auto md:h-screen overflow-y-auto shadow-xl z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-emerald-600" />
              QR Studio
            </h1>
            <button
              onClick={() => setSettings(defaults)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              title="Reset"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-8">
            <Section title="Content" icon={<LinkIcon className="w-4 h-4" />}>
              <InputGroup label="Target URL">
                <input
                  type="text"
                  value={settings.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </InputGroup>
            </Section>

            <Section title="Background" icon={<ImageIcon className="w-4 h-4" />}>
              <ColorPicker
                label="Background Color"
                value={settings.pageBgColor}
                onChange={(v) => handleChange('pageBgColor', v)}
              />
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Pattern / Image</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['none', 'dots', 'grid', 'lines'].map(pat => (
                    <button
                      key={pat}
                      onClick={() => handleChange('bgPattern', pat)}
                      className={`aspect-square rounded border flex items-center justify-center hover:bg-slate-50 ${settings.bgPattern === pat ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                      title={pat}
                    >
                      <div className={`w-4 h-4 opacity-50 ${pat === 'none' ? 'bg-slate-300 rounded-full' : ''}`} style={pat !== 'none' ? { backgroundImage: pat === 'dots' ? 'radial-gradient(black 1px, transparent 0)' : pat === 'grid' ? 'linear-gradient(black 1px, transparent 0), linear-gradient(90deg, black 1px, transparent 0)' : 'repeating-linear-gradient(45deg, black, black 1px, transparent 1px, transparent 4px)', backgroundSize: '8px 8px' } : {}} />
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="bg-upload" />
                  <label htmlFor="bg-upload" className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer">
                    <ImageIcon className="w-3 h-3" />
                    {settings.bgImage ? 'Change Image' : 'Upload Image'}
                  </label>
                  {settings.bgImage && <button onClick={() => handleChange('bgImage', null)} className="text-[10px] text-red-500 mt-1 hover:underline">Remove Image</button>}
                </div>
              </div>
            </Section>

            <Section title="Card & Header" icon={<Palette className="w-4 h-4" />}>
              <ColorPicker label="Card Color" value={settings.cardColor} onChange={(v) => handleChange('cardColor', v)} />

              <div className="mt-4 border-t border-slate-100 pt-4">
                <InputGroup label="Header Text">
                  <input
                    type="text"
                    value={settings.scanMeText}
                    onChange={(e) => handleChange('scanMeText', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold tracking-wide"
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <select
                    value={settings.scanMeFont}
                    onChange={(e) => handleChange('scanMeFont', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-emerald-500 outline-none bg-slate-50"
                  >
                    <option value="sans">Sans-Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                    <option value="cursive">Handwritten</option>
                  </select>
                  <select
                    value={settings.scanMeWeight}
                    onChange={(e) => handleChange('scanMeWeight', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:border-emerald-500 outline-none bg-slate-50"
                  >
                    <option value="400">Normal</option>
                    <option value="700">Bold</option>
                    <option value="900">Black</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <ColorPicker label="Text Color" value={settings.scanMeColor} onChange={(v) => handleChange('scanMeColor', v)} />

                <InputGroup label={`Text Size: ${settings.scanMeSize}px`}>
                  <input
                    type="range" min={0} max={64} value={settings.scanMeSize}
                    onChange={(e) => handleChange('scanMeSize', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg accent-emerald-600"
                  />
                </InputGroup>
              </div>
            </Section>

            <Section title="Indicators" icon={<ChevronDown className="w-4 h-4" />}>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Arrow Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {['triangle', 'chevron', 'bar', 'none'].map(style => (
                    <button
                      key={style}
                      onClick={() => handleChange('arrowStyle', style)}
                      className={`py-2 rounded border text-xs font-medium ${settings.arrowStyle === style ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {settings.arrowStyle !== 'none' && (
                <ColorPicker label="Arrow Color" value={settings.arrowColor} onChange={(v) => handleChange('arrowColor', v)} />
              )}
            </Section>

            <Section title="QR Code" icon={<Layout className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker label="Dots" value={settings.qrColor} onChange={(v) => handleChange('qrColor', v)} />
                <ColorPicker label="Background" value={settings.qrBgColor} onChange={(v) => handleChange('qrBgColor', v)} />
              </div>
            </Section>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => setShowEmbedModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share & Integrate
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download Studio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Preview */}
      <div
        className="flex-1 flex items-center justify-center p-8 min-h-[500px] relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: settings.pageBgColor,
          ...getPatternStyle(settings)
        }}
      >
        <div ref={cardRef} className="relative transition-transform duration-300 hover:scale-[1.02]" style={{ color: '#000000' }}>
          <CardComponent settings={settings} qrUrl={qrUrl} />
        </div>
      </div>

      {/* Modals */}
      {showDownloadModal && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          qrUrl={qrUrl}
          cardRef={cardRef}
          settings={settings}
        />
      )}

      {showEmbedModal && (
        <EmbedModal
          isOpen={showEmbedModal}
          onClose={() => setShowEmbedModal(false)}
          settings={settings}
        />
      )}
    </div>
  );
}

/* --- Components --- */

// Replaced Tailwind with Inline Styles to fix html2canvas "lab()" errors
const CardComponent: React.FC<CardComponentProps> = ({ settings, qrUrl, exportMode = false, exportSettings }) => {
  const showText = exportMode && exportSettings ? exportSettings.includeText : true;
  const showCardBg = exportMode && exportSettings ? exportSettings.includeCardBg : true;
  const showArrow = exportMode && exportSettings ? exportSettings.includeArrow : true;
  const padding = exportMode && exportSettings ? exportSettings.padding : 32;

  const cardBg = showCardBg ? settings.cardColor : 'transparent';
  // Use inline box-shadow instead of Tailwind
  const shadowStyle = showCardBg ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none';

  const getFontFamily = () => {
    switch (settings.scanMeFont) {
      case 'serif': return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
      case 'mono': return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case 'cursive': return '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive';
      default: return 'system-ui, -apple-system, sans-serif';
    }
  };

  return (
    <div
      style={{
        backgroundColor: cardBg,
        width: '320px',
        padding: `${padding}px`,
        boxShadow: shadowStyle,
        borderRadius: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header Text */}
      {showText && settings.scanMeSize > 0 && (
        <h2
          style={{
            color: settings.scanMeColor,
            fontSize: `${settings.scanMeSize}px`,
            fontFamily: getFontFamily(),
            fontWeight: settings.scanMeWeight as any,
            marginBottom: '8px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {settings.scanMeText}
        </h2>
      )}

      {/* The Arrow */}
      {showArrow && settings.arrowStyle !== 'none' && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '24px', height: '24px', alignItems: 'flex-end' }}>
          {settings.arrowStyle === 'triangle' && (
            <div
              style={{
                width: 0, height: 0,
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderBottom: `20px solid ${settings.arrowColor}`,
                transform: 'scaleY(-1)'
              }}
            />
          )}
          {settings.arrowStyle === 'chevron' && (
            <div
              style={{
                width: '40px', height: '20px',
                borderBottom: `6px solid ${settings.arrowColor}`,
                borderRight: `6px solid ${settings.arrowColor}`,
                transform: 'rotate(45deg) translateY(-5px)'
              }}
            />
          )}
          {settings.arrowStyle === 'bar' && (
            <div
              style={{
                width: '60px', height: '6px',
                backgroundColor: settings.arrowColor,
                borderRadius: '4px'
              }}
            />
          )}
        </div>
      )}

      {/* QR Container */}
      <div
        style={{
          backgroundColor: settings.qrBgColor,
          padding: '16px',
          borderRadius: '16px',
          width: '100%',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              // Mix-blend removed to avoid download artifacts
              imageRendering: 'pixelated'
            }}
            crossOrigin="anonymous"
          />
        ) : (
          <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Loading...</div>
        )}
      </div>
    </div>
  );
};

/* --- Helpers --- */
const getPatternStyle = (settings: Settings): React.CSSProperties => {
  if (settings.bgImage) {
    return {
      backgroundImage: `url(${settings.bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  const color = 'rgba(255,255,255,0.1)';
  switch (settings.bgPattern) {
    case 'dots': return { backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
    case 'grid': return { backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
    case 'lines': return { backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)` };
    default: return {};
  }
};

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  settings: Settings;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, qrUrl, cardRef, settings }) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'full' | 'custom'>('full');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [exportOpts, setExportOpts] = useState<ExportSettings>({
    includeBg: true,
    includeCardBg: true,
    includeText: true,
    includeArrow: true,
    padding: 32
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // Helper to build the API URL based on current selected tab
  const getApiUrl = () => {
    if (typeof window === 'undefined') return '';

    // If raw, return the direct QR generator URL (upstream)
    if (activeTab === 'raw') {
      return qrUrl;
    }

    const baseUrl = window.location.origin + '/api/qr';
    const params = new URLSearchParams();

    // Common settings
    params.set('url', settings.url);
    params.set('qcolor', settings.qrColor);
    params.set('qbg', settings.qrBgColor);

    if (activeTab === 'full') {
      // Full mode: Transparent BG, Standard Card settings
      params.set('bg', 'transparent');
      params.set('card', settings.cardColor);
      params.set('text', settings.scanMeText);
      params.set('tcolor', settings.scanMeColor);
      params.set('tsize', settings.scanMeSize.toString());
      params.set('acolor', settings.arrowColor);
      params.set('astyle', settings.arrowStyle);
    } else if (activeTab === 'custom') {
      // Custom mode: Map exportOpts to API params

      // Background - Explicitly check if included
      params.set('bg', exportOpts.includeBg ? settings.pageBgColor : 'transparent');

      // Card Background - Explicitly check if included
      params.set('card', exportOpts.includeCardBg ? settings.cardColor : 'transparent');

      // Text
      if (exportOpts.includeText) {
        params.set('text', settings.scanMeText);
        params.set('tcolor', settings.scanMeColor);
        params.set('tsize', settings.scanMeSize.toString());
      } else {
        params.set('text', ''); // Clear text to hide it
        params.set('tsize', '0'); // Ensure size is 0
      }

      // Arrow
      params.set('acolor', settings.arrowColor);
      params.set('astyle', exportOpts.includeArrow ? settings.arrowStyle : 'none');
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopyApiUrl = () => {
    const url = getApiUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      alert('API URL copied to clipboard!');
    }
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      if (activeTab === 'raw') {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        saveBlob(blob, 'qr-code-only.png');
      } else if (activeTab === 'full') {
        if (window.html2canvas && cardRef.current) {
          // Force transparent background for the capture
          const canvas = await window.html2canvas(cardRef.current, {
            backgroundColor: null, // Critical for transparency
            scale: 4,
            useCORS: true,
            allowTaint: true
          });
          saveCanvas(canvas, 'qr-card-full.png');
        }
      } else if (activeTab === 'custom') {
        if (window.html2canvas && previewRef.current) {
          // If user unchecks "Page Background", ensure we capture transparently
          const captureBg = exportOpts.includeBg ? settings.pageBgColor : null;

          const canvas = await window.html2canvas(previewRef.current, {
            backgroundColor: captureBg,
            scale: 4,
            useCORS: true,
            allowTaint: true
          });
          saveCanvas(canvas, 'qr-custom-export.png');
        }
      }
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    }
    setIsProcessing(false);
  };

  const saveBlob = (blob: Blob, name: string) => {
    const url = window.URL.createObjectURL(blob);
    triggerDownload(url, name);
  };
  const saveCanvas = (canvas: HTMLCanvasElement, name: string) => {
    const url = canvas.toDataURL('image/png');
    triggerDownload(url, name);
  };
  const triggerDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">

        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Download Options</h3>
            <button onClick={onClose} className="md:hidden p-1 bg-slate-200 rounded-full"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-2 mb-8">
            <OptionButton active={activeTab === 'raw'} onClick={() => setActiveTab('raw')} icon={<QrCode className="w-4 h-4" />} title="QR Code Only" desc="Just the code, transparent background." />
            <OptionButton active={activeTab === 'full'} onClick={() => setActiveTab('full')} icon={<Layout className="w-4 h-4" />} title="Full Card Design" desc="The complete card design as seen." />
            <OptionButton active={activeTab === 'custom'} onClick={() => setActiveTab('custom')} icon={<Crop className="w-4 h-4" />} title="Custom Selection" desc="Toggle elements and resize." />
          </div>

          {activeTab === 'custom' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 mb-6 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Include</div>
              <Toggle label="Page Background" checked={exportOpts.includeBg} onChange={c => setExportOpts(p => ({ ...p, includeBg: c }))} />
              <Toggle label="Card Background" checked={exportOpts.includeCardBg} onChange={c => setExportOpts(p => ({ ...p, includeCardBg: c }))} />
              <Toggle label="Header Text" checked={exportOpts.includeText} onChange={c => setExportOpts(p => ({ ...p, includeText: c }))} />
              <Toggle label="Arrow Indicator" checked={exportOpts.includeArrow} onChange={c => setExportOpts(p => ({ ...p, includeArrow: c }))} />
              <div className="pt-2 border-t border-slate-100 mt-2">
                <div className="flex justify-between text-xs font-semibold mb-1"><span>Padding</span><span>{exportOpts.padding}px</span></div>
                <input type="range" min={0} max={100} value={exportOpts.padding} onChange={(e) => setExportOpts(p => ({ ...p, padding: parseInt(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-emerald-600" />
              </div>
            </div>
          )}

          <div className="mt-auto space-y-3">
            <button
              onClick={handleCopyApiUrl}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy API URL
            </button>
            <button onClick={handleDownload} disabled={isProcessing} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {isProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isProcessing ? 'Generating...' : 'Download PNG'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-200 relative flex items-center justify-center p-8 overflow-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm z-10 hidden md:block transition-all"><X className="w-5 h-5 text-slate-600" /></button>
          <div className="border border-slate-300 shadow-sm bg-white/50 backdrop-blur rounded-lg p-1 absolute top-4 left-4 text-xs font-mono text-slate-500">Preview</div>
          <div className="origin-center animate-in fade-in zoom-in duration-300">
            {activeTab === 'raw' && <div className="bg-transparent border-2 border-dashed border-slate-400 p-1"><img src={qrUrl} alt="Preview" className="w-64 h-64 object-contain" /></div>}
            {activeTab === 'full' && <div className="pointer-events-none scale-75 md:scale-90"><CardComponent settings={settings} qrUrl={qrUrl} /></div>}
            {activeTab === 'custom' && <div ref={previewRef} className="inline-block" style={{ backgroundColor: exportOpts.includeBg ? settings.pageBgColor : 'transparent', color: '#000000' }}><div style={exportOpts.includeBg ? getPatternStyle(settings) : {}} className="p-8"><CardComponent settings={settings} qrUrl={qrUrl} exportMode={true} exportSettings={exportOpts} /></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ... EmbedModal, OptionButton, Toggle, Section, InputGroup, ColorPicker (unchanged) ...
interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose, settings }) => {
  // Construct the base URL with parameters
  const getShareUrl = (embedMode = false) => {
    if (typeof window === 'undefined') return '';

    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    // Add all current settings to params
    params.set('url', settings.url);
    if (embedMode) params.set('bg', 'transparent'); // Embeds usually want transparent bg
    else params.set('bg', settings.pageBgColor);

    params.set('card', settings.cardColor);
    params.set('text', settings.scanMeText);
    params.set('tcolor', settings.scanMeColor);
    params.set('tsize', settings.scanMeSize.toString());
    params.set('qcolor', settings.qrColor);
    params.set('qbg', settings.qrBgColor);
    params.set('acolor', settings.arrowColor);
    params.set('astyle', settings.arrowStyle);

    if (embedMode) params.set('view', 'embed');

    return `${baseUrl}?${params.toString()}`;
  };

  const getApiUrl = () => {
    if (typeof window === 'undefined') return '';

    const baseUrl = window.location.origin + '/api/qr';
    const params = new URLSearchParams();

    params.set('url', settings.url);
    params.set('bg', 'transparent');
    params.set('card', settings.cardColor);
    params.set('text', settings.scanMeText);
    params.set('tcolor', settings.scanMeColor);
    params.set('tsize', settings.scanMeSize.toString());
    params.set('qcolor', settings.qrColor);
    params.set('qbg', settings.qrBgColor);
    params.set('acolor', settings.arrowColor);
    params.set('astyle', settings.arrowStyle);

    return `${baseUrl}?${params.toString()}`;
  };

  const shareUrl = getShareUrl(false);
  const embedUrl = getShareUrl(true);
  const apiUrl = getApiUrl();
  const embedCode = `<iframe src="${embedUrl}" width="400" height="500" style="border:none;"></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            Share & Integrate
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">

          {/* Section 1: Direct Link */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-500" /> Dynamic Link
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Use this link to open the studio with your current settings pre-loaded.
            </p>
            <div className="flex gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500" />
              <button onClick={() => copyToClipboard(shareUrl)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors">Copy</button>
            </div>
          </div>

          {/* Section 2: Embed Code */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" /> Embed HTML
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Paste this code into your website to embed just the card (without the editor sidebar).
              You can programmatically change the <code>url=</code> parameter in the src to generate codes dynamically for your users!
            </p>
            <div className="relative">
              <textarea readOnly value={embedCode} className="w-full h-24 bg-slate-800 text-emerald-400 rounded-lg px-4 py-3 text-xs font-mono outline-none resize-none" />
              <button onClick={() => copyToClipboard(embedCode)} className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs backdrop-blur-sm transition-colors">Copy</button>
            </div>
          </div>

          {/* Section 3: Image API */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" /> Image API (Server-Side)
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Use this URL to generate a PNG image of your design programmatically. Perfect for <code>&lt;img&gt;</code> tags or mobile apps.
            </p>
            <div className="flex gap-2 mb-2">
              <input type="text" readOnly value={apiUrl} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500" />
              <button onClick={() => copyToClipboard(apiUrl)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors">Copy</button>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <code className="text-[10px] text-slate-500 font-mono block break-all">
                &lt;img src="{apiUrl}" alt="QR Code" /&gt;
              </code>
            </div>
          </div>

          {/* Section 4: API Usage Hint */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <h4 className="font-bold text-sm text-emerald-900 mb-1">Developer API Hint</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Want to generate a QR for a different user? Just replace the content of the <code>url</code> parameter in the URL:
            </p>
            <code className="block mt-2 bg-white px-2 py-1.5 rounded border border-emerald-100 text-xs font-mono text-emerald-700">
              .../api/qr?url=<span className="font-bold text-emerald-900">NEW_URL_HERE</span>&text=<span className="font-bold text-emerald-900">CUSTOM_TEXT</span>
            </code>
          </div>

        </div>
      </div>
    </div>
  );
};

/* --- Helpers --- */
interface OptionButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}
const OptionButton: React.FC<OptionButtonProps> = ({ active, onClick, icon, title, desc }) => (
  <button onClick={onClick} className={`w-full text-left p-3 rounded-xl border transition-all ${active ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}>
    <div className={`flex items-center gap-2 font-bold text-sm ${active ? 'text-emerald-800' : 'text-slate-700'}`}>{icon}{title}</div>
    <div className="text-xs text-slate-500 mt-1 ml-6 leading-tight">{desc}</div>
  </button>
);

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm text-slate-600 group-hover:text-slate-800">{label}</span>
    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} /></div>
    <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </label>
);

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
    <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">{icon}{title}</div>
    {children}
  </div>
);

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}
const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-600">{label}</label>{children}</div>
);

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}
const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-full shadow-sm ring-1 ring-slate-200 overflow-hidden shrink-0"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0" /></div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-2 py-1.5 text-xs font-mono border border-slate-200 rounded focus:border-emerald-500 outline-none uppercase" />
    </div>
  </div>
);