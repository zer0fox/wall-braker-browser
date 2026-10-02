/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Github,
  Activity,
  SlidersHorizontal,
  Server,
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';
import { BrowserOmnibar } from './components/BrowserOmnibar';
import { BrowserViewport } from './components/BrowserViewport';
import { AnonymityInspector } from './components/AnonymityInspector';
import { GitHubDeploymentGuide } from './components/GitHubDeploymentGuide';
import { ProxySettingsModal } from './components/ProxySettingsModal';
import {
  ViewportMode,
  ProxySettings,
  ServerStatusResponse,
} from './types/browser';

export default function App() {
  // Navigation & History State
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Layout & View State
  const [activeTab, setActiveTab] = useState<'browser' | 'inspector' | 'guide'>('browser');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('full');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Server & Anonymity Info
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);

  // Proxy Configuration State
  const [settings, setSettings] = useState<ProxySettings>(() => {
    const saved = localStorage.getItem('AEGIS_SETTINGS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      mode: 'built-in',
      customGatewayUrl: '',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      disableScripts: false,
      stripCookies: true,
      referrerPolicy: 'no-referrer',
    };
  });

  // Fetch remote server node info on mount
  const fetchServerInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/server-info');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchServerInfo();
  }, [fetchServerInfo]);

  // Save settings updates
  const handleSaveSettings = (newSettings: ProxySettings) => {
    setSettings(newSettings);
    localStorage.setItem('AEGIS_SETTINGS', JSON.stringify(newSettings));
  };

  // Navigation handlers
  const handleNavigate = (url: string) => {
    if (!url) return;
    setActiveTab('browser');

    // Update history stack
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(url);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    // Force reload by triggering a subtle refresh
    const temp = currentUrl;
    setCurrentUrl('');
    setTimeout(() => setCurrentUrl(temp), 50);
  };

  const handleGoHome = () => {
    setCurrentUrl('');
    setActiveTab('browser');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Navigation) - Zone 3 (Action) */}
      <header className="h-11 bg-[#0f172a] border-b border-slate-800/80 px-4 flex items-center justify-between z-40 shrink-0">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoHome}
            className="text-sm font-bold tracking-tight text-white hover:text-blue-400 flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>AegisProxy</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pl-2 border-l border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Node: {serverStatus?.serverNode?.ip ? serverStatus.serverNode.ip.split(' ')[0] : '104.28.19.42'}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented View Selectors */}
        <nav className="flex items-center gap-1 bg-[#090d16] p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'browser'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Browser View
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'inspector'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Anonymity Inspector
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Setup Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Configure Proxy & Privacy Sandbox"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gateway</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Deploy to GitHub</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-44px)] overflow-hidden">
        {activeTab === 'browser' && (
          <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
            <BrowserOmnibar
              currentUrl={currentUrl}
              onNavigate={handleNavigate}
              onReload={handleReload}
              onGoHome={handleGoHome}
              canGoBack={historyIndex > 0}
              canGoForward={historyIndex < history.length - 1}
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
              isLoading={isLoading}
              viewportMode={viewportMode}
              onViewportChange={setViewportMode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenInspect={() => setActiveTab('inspector')}
              settings={settings}
              serverStatus={serverStatus}
            />
            <BrowserViewport
              currentUrl={currentUrl}
              onNavigate={handleNavigate}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              viewportMode={viewportMode}
              settings={settings}
              serverStatus={serverStatus}
              onOpenDeployGuide={() => setActiveTab('guide')}
              onOpenInspect={() => setActiveTab('inspector')}
            />
          </div>
        )}

        {activeTab === 'inspector' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090d16]">
            <AnonymityInspector
              currentUrl={currentUrl}
              serverStatus={serverStatus}
              onClose={() => setActiveTab('browser')}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090d16]">
            <GitHubDeploymentGuide
              onClose={() => setActiveTab('browser')}
              onSetCustomProxyUrl={(customUrl) => {
                handleSaveSettings({
                  ...settings,
                  mode: customUrl ? 'custom' : 'built-in',
                  customGatewayUrl: customUrl,
                });
                setActiveTab('browser');
              }}
              currentCustomUrl={settings.customGatewayUrl}
            />
          </div>
        )}
      </main>

      {/* Proxy Settings Modal */}
      {isSettingsOpen && (
        <ProxySettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
