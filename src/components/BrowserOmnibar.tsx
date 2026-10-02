import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Shield,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  X,
  ExternalLink,
  Search,
  Globe
} from 'lucide-react';
import { ViewportMode, ProxySettings, ServerStatusResponse } from '../types/browser';

interface BrowserOmnibarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  onReload: () => void;
  onGoHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  isLoading: boolean;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenInspect: () => void;
  settings: ProxySettings;
  serverStatus: ServerStatusResponse | null;
}

export const BrowserOmnibar: React.FC<BrowserOmnibarProps> = ({
  currentUrl,
  onNavigate,
  onReload,
  onGoHome,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  isLoading,
  viewportMode,
  onViewportChange,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenInspect,
  settings,
  serverStatus,
}) => {
  const [inputVal, setInputVal] = useState(currentUrl);
  const [isFocused, setIsFocused] = useState(false);
  const [showSecurityPopover, setShowSecurityPopover] = useState(false);

  useEffect(() => {
    setInputVal(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // If it looks like a search query rather than a URL
    if (!trimmed.includes('.') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
      onNavigate(searchUrl);
      return;
    }

    let formatted = trimmed;
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    onNavigate(formatted);
  };

  const getCleanDomain = (url: string) => {
    try {
      if (!url) return '';
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      return parsed.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="relative z-30 bg-[#0f172a] border-b border-slate-800 text-slate-200 select-none shadow-md">
      {/* Top Controls Row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            title="Go Back"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            title="Go Forward"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            title={isLoading ? 'Stop loading' : 'Reload page'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={onGoHome}
            title="New Tab / Start Page"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Address Omnibar Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-4xl relative flex items-center">
          <div
            className={`w-full flex items-center bg-[#090d16] border rounded-lg transition-all ${
              isFocused
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-inner'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {/* Security Indicator Button */}
            <button
              type="button"
              onClick={() => setShowSecurityPopover(!showSecurityPopover)}
              title="Remote Proxy Security Status"
              className="px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border-r border-slate-800/80"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline font-medium text-[11px]">Proxied</span>
            </button>

            {/* Input Element */}
            <div className="flex-1 flex items-center relative px-2.5 py-1.5">
              {!inputVal && !isFocused && (
                <div className="absolute left-3 flex items-center gap-2 pointer-events-none text-slate-500 text-xs">
                  <Search className="w-3.5 h-3.5" />
                  <span>Enter target URL (e.g. en.wikipedia.org) or search query...</span>
                </div>
              )}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-transparent focus:outline-none font-mono"
                spellCheck={false}
                autoCapitalize="off"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="p-1 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action buttons inside omnibar */}
            <div className="flex items-center pr-1.5 gap-1">
              <button
                type="button"
                onClick={onOpenInspect}
                title="Inspect Remote Headers & Framing Protection"
                className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors hidden md:inline-flex items-center gap-1"
              >
                <span>Inspect</span>
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
              >
                Go
              </button>
            </div>
          </div>

          {/* Security Status Popover */}
          {showSecurityPopover && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-[#131b2e] border border-slate-700 rounded-xl p-4 shadow-2xl z-50 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Remote Gateway Tunnel Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecurityPopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-slate-300 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Target Origin</span>
                  <span className="font-mono text-[11px] text-white truncate max-w-[150px]">
                    {getCleanDomain(currentUrl) || 'Start Page'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Routing Node</span>
                  <span className="font-mono text-[11px] text-blue-400">
                    {serverStatus?.serverNode?.ip ? serverStatus.serverNode.ip.split(' ')[0] : 'Remote Cloud Server'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Your Local IP</span>
                  <span className="text-emerald-400 font-medium">Masked & Isolated</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Client Headers</span>
                  <span className="text-slate-200">X-Forwarded-For Stripped</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Framing Protection</span>
                  <span className="text-slate-200">X-Frame-Options Bypassed</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityPopover(false);
                    onOpenInspect();
                  }}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  View Full Header Inspector →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityPopover(false);
                    onOpenSettings();
                  }}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Proxy Config
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Viewport Dimension Switcher */}
        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onViewportChange('full')}
            title="Desktop 100% Full Viewport"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'full' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewportChange('laptop')}
            title="Laptop View (1280px)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'laptop' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewportChange('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'tablet' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewportChange('mobile')}
            title="Mobile View (390px)"
            className={`p-1.5 rounded transition-colors ${
              viewportMode === 'mobile' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            title="Proxy Gateway & Privacy Settings"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Immersive Browser View'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-3/4 transition-all duration-300" />
        </div>
      )}
    </div>
  );
};
