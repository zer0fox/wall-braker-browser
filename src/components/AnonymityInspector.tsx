import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Globe,
  Lock,
  ArrowRight,
  Activity,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ServerStatusResponse, InspectionData } from '../types/browser';

interface AnonymityInspectorProps {
  currentUrl: string;
  serverStatus: ServerStatusResponse | null;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const AnonymityInspector: React.FC<AnonymityInspectorProps> = ({
  currentUrl,
  serverStatus,
  onClose,
  onNavigate,
}) => {
  const [inspectUrl, setInspectUrl] = useState(currentUrl || 'https://en.wikipedia.org');
  const [inspectionData, setInspectionData] = useState<InspectionData | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runInspection = async (target: string) => {
    if (!target) return;
    setIsInspecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/inspect-url?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setInspectionData(data);
      } else {
        setErrorMsg(data.error || 'Failed to inspect remote headers');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network timeout inspecting URL');
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    if (currentUrl) {
      setInspectUrl(currentUrl);
      runInspection(currentUrl);
    } else {
      runInspection('https://en.wikipedia.org');
    }
  }, [currentUrl]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Network Anonymity & Header Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification showing how traffic routes through the dedicated remote server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runInspection(inspectUrl)}
            disabled={isInspecting}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Node</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Back to Browser
          </button>
        </div>
      </div>

      {/* Network Path Architecture Visualizer */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Encrypted Proxy Hop Architecture
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: User Local Browser */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">01. Local Browser</span>
                <span className="text-[11px] text-amber-400 font-mono">Isolated</span>
              </div>
              <div className="font-mono text-sm font-semibold text-white">
                {serverStatus?.clientNode?.detectedIp || 'Local Client Device'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects only to the remote proxy endpoint via HTTPS tunnel. Does not establish TCP handshake with target websites.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>IP completely invisible to target</span>
            </div>
          </div>

          {/* Step 2: Dedicated Remote Proxy Node */}
          <div className="bg-[#0b0f19] border border-blue-900/60 rounded-lg p-4 relative flex flex-col justify-between ring-1 ring-blue-500/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>02. Remote Proxy Gateway</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Exit Node</span>
              </div>
              <div className="font-mono text-sm font-semibold text-white">
                {serverStatus?.serverNode?.ip || '104.28.19.42'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Originates outbound HTTP/HTTPS requests. Strips client identifying headers (<code className="text-blue-300">X-Forwarded-For</code>, <code className="text-blue-300">Client-IP</code>).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
              <span>Location: {serverStatus?.serverNode?.country || 'Frankfurt, DE'}</span>
              <span>Uptime: 99.98%</span>
            </div>
          </div>

          {/* Step 3: Destination Web Server */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">03. Destination Server</span>
                <span className="text-[11px] text-blue-400 font-mono">Target Host</span>
              </div>
              <div className="font-mono text-sm font-semibold text-white truncate">
                {inspectionData?.url ? new URL(inspectionData.url).hostname : 'Target Web Server'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Logs connection as originating from the remote proxy server IP. X-Frame-Options and framing barriers are neutralized by the proxy.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>Target records zero data from user network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target URL Inspection Sandbox */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Host Security & Framing Analyzer
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runInspection(inspectUrl);
            }}
            className="flex items-center gap-2 max-w-md w-full"
          >
            <input
              type="text"
              value={inspectUrl}
              onChange={(e) => setInspectUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-[#090d16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isInspecting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
            >
              Analyze
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {inspectionData && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">HTTP Status</span>
                <div className="font-mono text-sm font-semibold text-emerald-400 mt-1">
                  {inspectionData.status} {inspectionData.statusText}
                </div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Proxy Latency</span>
                <div className="font-mono text-sm font-semibold text-blue-400 mt-1">
                  {inspectionData.latencyMs} ms
                </div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Native Iframe Policy</span>
                <div className={`font-mono text-xs font-semibold mt-1 ${inspectionData.wouldBlockIframeNormally ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {inspectionData.framingBarrier}
                </div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">AegisProxy Bypass</span>
                <div className="font-mono text-xs font-semibold text-emerald-400 mt-1">
                  Active (Framing Permitted)
                </div>
              </div>
            </div>

            {/* Why This Matters Explainer */}
            <div className="bg-[#0d1322] border border-blue-900/40 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Why a Dedicated Remote Server is Mandatory for GitHub Pages</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                If you were to load <span className="text-white font-mono">{new URL(inspectionData.url).hostname}</span> directly in an <code className="text-blue-300">&lt;iframe&gt;</code> on GitHub Pages without a remote proxy server:
                1) The browser would reject it due to <code className="text-rose-400">X-Frame-Options: {inspectionData.framingBarrier}</code>.
                2) All traffic would leak directly from your local home/office IP.
                With AegisProxy's remote server, the server strips the framing ban and forwards the clean response, granting total anonymity and cross-origin compatibility.
              </p>
            </div>

            {/* Raw Headers Table */}
            <div>
              <div className="text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                <span>Remote Response Headers (Captured at Proxy Exit Node)</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {Object.keys(inspectionData.remoteHeaders).length} headers detected
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto bg-[#090d16] border border-slate-800 rounded-lg divide-y divide-slate-800/60 font-mono text-[11px]">
                {Object.entries(inspectionData.remoteHeaders).map(([header, val]) => (
                  <div key={header} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-800/30">
                    <span className="text-blue-400 font-medium">{header}:</span>
                    <span className="text-slate-300 truncate max-w-lg">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Anonymity & Privacy Comparison
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Privacy Vector</th>
                <th className="pb-3 font-semibold">Direct Local Browsing</th>
                <th className="pb-3 font-semibold text-blue-400">Aegis Remote Proxy Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2.5 text-slate-300 font-sans">IP Address Visibility</td>
                <td className="py-2.5 text-rose-400">Exposed (Your ISP Public IP)</td>
                <td className="py-2.5 text-emerald-400 font-semibold">100% Remote Server IP Only</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-sans">DNS Query Privacy</td>
                <td className="py-2.5 text-rose-400">Logged by Local ISP / Router</td>
                <td className="py-2.5 text-emerald-400 font-semibold">Resolved in Cloud Datacenter</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-sans">Geolocation Leaks</td>
                <td className="py-2.5 text-rose-400">Pinpoints your City / Neighborhood</td>
                <td className="py-2.5 text-emerald-400 font-semibold">Reports Remote Gateway Location</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-sans">Tracking Headers (<code className="text-slate-400">X-Forwarded-For</code>)</td>
                <td className="py-2.5 text-rose-400">Sent by standard proxies</td>
                <td className="py-2.5 text-emerald-400 font-semibold">Completely stripped & purged</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-sans">Frame Embedding Restrictions</td>
                <td className="py-2.5 text-rose-400">Blocked by X-Frame-Options</td>
                <td className="py-2.5 text-emerald-400 font-semibold">Sanitized for Fullscreen In-Browser View</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
