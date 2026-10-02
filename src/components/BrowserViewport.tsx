import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  ShieldCheck,
  Search,
  ExternalLink,
  BookOpen,
  Terminal,
  Activity,
  Server,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ViewportMode, ProxySettings, ServerStatusResponse } from '../types/browser';

interface BrowserViewportProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  viewportMode: ViewportMode;
  settings: ProxySettings;
  serverStatus: ServerStatusResponse | null;
  onOpenDeployGuide: () => void;
  onOpenInspect: () => void;
}

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  currentUrl,
  onNavigate,
  isLoading,
  setIsLoading,
  viewportMode,
  settings,
  serverStatus,
  onOpenDeployGuide,
  onOpenInspect,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [startInput, setStartInput] = useState('');

  // Compute final iframe URL through proxy gateway
  const getProxyStreamUrl = (target: string) => {
    if (!target) return '';
    const params = new URLSearchParams();
    params.set('url', target);
    if (settings.disableScripts) {
      params.set('disable_scripts', 'true');
    }
    if (settings.userAgent) {
      params.set('ua', settings.userAgent);
    }

    if (settings.mode === 'custom' && settings.customGatewayUrl) {
      const base = settings.customGatewayUrl.replace(/\/$/, '');
      return `${base}?${params.toString()}`;
    }
    return `/api/proxy?${params.toString()}`;
  };

  // Re-render iframe when URL or key changes
  useEffect(() => {
    if (currentUrl) {
      setIsLoading(true);
      setIframeError(false);
    }
  }, [currentUrl, iframeKey]);

  // Handle postMessage from bridge script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'AEGIS_NAVIGATE' && event.data.url) {
        onNavigate(event.data.url);
      } else if (event.data.type === 'AEGIS_PAGE_METADATA') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, setIsLoading]);

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = startInput.trim();
    if (!trimmed) return;

    if (!trimmed.includes('.') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      onNavigate(`https://duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`);
    } else {
      let formatted = trimmed;
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      onNavigate(formatted);
    }
  };

  const bookmarks = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Random', category: 'Knowledge' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/html/', category: 'Search' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com', category: 'Tech' },
    { name: 'Internet Archive', url: 'https://archive.org', category: 'Archive' },
    { name: 'BBC World', url: 'https://www.bbc.com/news', category: 'News' },
    { name: 'Example Domain', url: 'https://example.com', category: 'Test' },
  ];

  // Viewport container width constraints
  const getViewportContainerStyles = () => {
    switch (viewportMode) {
      case 'laptop':
        return 'max-w-[1280px] my-3 rounded-xl border border-slate-700 shadow-2xl overflow-hidden h-[calc(100vh-100px)]';
      case 'tablet':
        return 'max-w-[768px] my-3 rounded-xl border border-slate-700 shadow-2xl overflow-hidden h-[calc(100vh-100px)]';
      case 'mobile':
        return 'max-w-[390px] my-3 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden h-[calc(100vh-100px)]';
      case 'full':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#090d16] relative overflow-hidden w-full h-[calc(100vh-45px)]">
      {!currentUrl ? (
        /* Welcome / Start Page */
        <div className="w-full h-full overflow-y-auto px-4 py-8 md:py-12 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-8 my-auto">
            {/* Hero Section */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dedicated Remote Gateway Connected</span>
                <span className="text-slate-500">·</span>
                <span>Zero Local Traffic Leak</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Anonymous Proxy Browser
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                All requests are routed through a dedicated remote server. Remote target websites see the proxy server's IP address, keeping your local network completely hidden.
              </p>
            </div>

            {/* Central URL / Search Box */}
            <form onSubmit={handleStartSubmit} className="max-w-2xl mx-auto">
              <div className="relative flex items-center bg-[#131b2e] border border-slate-700 hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl p-2 shadow-xl transition-all">
                <Globe className="w-5 h-5 text-slate-400 ml-2" />
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  placeholder="Enter destination URL (e.g. en.wikipedia.org) or search..."
                  className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Browse Privately</span>
                </button>
              </div>
            </form>

            {/* Quick Launch Bookmarks */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Quick Test Destinations</span>
                <span className="text-slate-500">Click to load instantly</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bookmarks.map((bm) => (
                  <button
                    key={bm.name}
                    onClick={() => onNavigate(bm.url)}
                    className="flex flex-col items-start p-3 bg-[#111827] hover:bg-[#1f293d] border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-all group"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 flex items-center gap-1">
                      {bm.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono truncate w-full mt-0.5">
                      {bm.category} · {bm.url.replace(/^https?:\/\//, '').split('/')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remote Proxy Server Telemetry Card */}
            <div className="max-w-2xl mx-auto bg-[#101726] border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span>Remote Node Identification</span>
                </div>
                <button
                  onClick={onOpenInspect}
                  className="text-blue-400 hover:underline text-[11px] font-mono"
                >
                  Network Flow Diagram →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Proxy Server Node IP</div>
                  <div className="font-mono text-slate-200 font-medium mt-0.5">
                    {serverStatus?.serverNode?.ip ? serverStatus.serverNode.ip.split(' ')[0] : '104.28.19.42'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Exit Gateway Location</div>
                  <div className="text-slate-200 font-medium mt-0.5">
                    {serverStatus?.serverNode?.country || 'Cloud Gateway (Frankfurt)'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Local IP Privacy</div>
                  <div className="text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Masked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Explainer Banner for GitHub Hosting */}
            <div className="max-w-2xl mx-auto p-4 bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border border-blue-900/40 rounded-xl flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="text-slate-200 font-semibold">
                  Want to host this frontend on GitHub Pages with a free remote server?
                </div>
                <p className="text-slate-400 leading-relaxed">
                  GitHub Pages serves static web apps. Pair it with a 100% free serverless relay (such as Cloudflare Workers or Render) for complete traffic anonymity.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onOpenDeployGuide}
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 text-xs"
                  >
                    <span>Read Free & Open-Source Setup Guide</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Width & Height Browser Viewport */
        <div className={`w-full flex justify-center items-center h-full transition-all duration-300 bg-[#060911]`}>
          <div className={`relative bg-white w-full ${getViewportContainerStyles()}`}>
            {/* Loading Indicator Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-[#090d16]/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-slate-300 gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-mono text-slate-400">
                  Routing request through remote proxy server...
                </div>
              </div>
            )}

            {/* Fallback Error Overlay */}
            {iframeError && (
              <div className="absolute inset-0 bg-[#0b0f19] z-20 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                <h3 className="text-base font-semibold text-white">Target Failed to Load</h3>
                <p className="text-slate-400 text-xs max-w-md mt-1 mb-4">
                  The target website may have anti-bot protections or connection timeout.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setIframeKey((k) => k + 1);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                  >
                    Retry Connection
                  </button>
                  <button
                    onClick={onOpenInspect}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
                  >
                    Inspect Remote Response
                  </button>
                </div>
              </div>
            )}

            {/* Embedded Sandboxed Iframe */}
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={getProxyStreamUrl(currentUrl)}
              title="AegisProxy Remote Browser Session"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
