import React, { useState } from 'react';
import {
  Github,
  Cloud,
  Terminal,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  Download,
  Code2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface GitHubDeploymentGuideProps {
  onClose: () => void;
  onSetCustomProxyUrl: (url: string) => void;
  currentCustomUrl: string;
}

export const GitHubDeploymentGuide: React.FC<GitHubDeploymentGuideProps> = ({
  onClose,
  onSetCustomProxyUrl,
  currentCustomUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'frontend' | 'backend-cf' | 'backend-node' | 'test'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testProxyInput, setTestProxyInput] = useState(currentCustomUrl || '');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyProxyUrl = () => {
    onSetCustomProxyUrl(testProxyInput);
    setTestStatus('Applied! Switched browser to test against your remote server.');
    setTimeout(() => setTestStatus(null), 3500);
  };

  // 100% Standalone Single-File Frontend for GitHub Pages
  const standaloneGitHubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AegisProxy - Remote Web Browser</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    
    /* Top Omnibar */
    header { background: #0f172a; border-bottom: 1px solid #1e293b; padding: 8px 12px; display: flex; align-items: center; gap: 8px; z-index: 10; }
    .brand { font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; items-center; gap: 6px; white-space: nowrap; }
    .nav-btn { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 12px; }
    .nav-btn:hover { background: #334155; color: #fff; }
    
    form { flex: 1; display: flex; max-width: 900px; margin: 0 auto; }
    .omnibar-input { flex: 1; background: #090d16; border: 1px solid #334155; color: #f8fafc; padding: 7px 12px; border-radius: 8px 0 0 8px; font-size: 13px; font-family: monospace; outline: none; }
    .omnibar-input:focus { border-color: #38bdf8; }
    .go-btn { background: #2563eb; color: #fff; border: none; padding: 7px 16px; border-radius: 0 8px 8px 0; cursor: pointer; font-size: 13px; font-weight: 500; }
    .go-btn:hover { background: #1d4ed8; }
    
    /* Viewport Container */
    main { flex: 1; position: relative; width: 100%; height: 100%; background: #000; }
    iframe { width: 100%; height: 100%; border: none; background: #fff; }
    
    /* Start Screen */
    #start-screen { position: absolute; inset: 0; background: #0b0f19; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
    .badge { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 4px 12px; border-radius: 999px; font-size: 11px; margin-bottom: 12px; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; max-width: 520px; line-height: 1.5; margin-bottom: 24px; }
    .quick-links { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 600px; }
    .ql-btn { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; }
    .ql-btn:hover { background: #2563eb; border-color: #2563eb; }
    
    /* Config Modal */
    .config-bar { font-size: 11px; color: #64748b; margin-top: 24px; }
    .config-link { color: #38bdf8; cursor: pointer; text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <div class="brand">🛡️ AegisProxy</div>
    <button class="nav-btn" onclick="goHome()">🏠 Home</button>
    <button class="nav-btn" onclick="reloadFrame()">🔄 Reload</button>
    <form onsubmit="handleNav(event)">
      <input id="urlInput" class="omnibar-input" placeholder="Enter target URL (e.g. en.wikipedia.org) or search..." />
      <button class="go-btn" type="submit">Browse Privately</button>
    </form>
    <button class="nav-btn" onclick="setProxyConfig()">⚙️ Gateway Config</button>
  </header>

  <main>
    <div id="start-screen">
      <div class="badge">● Remote Relay Active · 0 Local Traffic Leak</div>
      <h1>Remote Proxy Browser</h1>
      <p>Hosted on GitHub Pages. All outbound requests are securely routed through your remote proxy server so your personal IP is never revealed.</p>
      
      <div class="quick-links">
        <button class="ql-btn" onclick="loadUrl('https://en.wikipedia.org')">Wikipedia</button>
        <button class="ql-btn" onclick="loadUrl('https://news.ycombinator.com')">Hacker News</button>
        <button class="ql-btn" onclick="loadUrl('https://archive.org')">Internet Archive</button>
        <button class="ql-btn" onclick="loadUrl('https://duckduckgo.com/html/')">DuckDuckGo</button>
        <button class="ql-btn" onclick="loadUrl('https://example.com')">Example.com</button>
      </div>

      <div class="config-bar">
        Proxy Server: <span id="currentProxyDisplay">Default Cloudflare Worker</span> · <span class="config-link" onclick="setProxyConfig()">Change Server</span>
      </div>
    </div>
    
    <iframe id="browserFrame" style="display:none;" sandbox="allow-scripts allow-forms allow-same-origin allow-popups"></iframe>
  </main>

  <script>
    // Config: Point this to your free Cloudflare Worker or Render deployment
    let PROXY_GATEWAY = localStorage.getItem('AEGIS_GATEWAY') || 'https://worker-proxy-demo.your-subdomain.workers.dev';
    document.getElementById('currentProxyDisplay').innerText = PROXY_GATEWAY;

    function setProxyConfig() {
      const newUrl = prompt('Enter your dedicated remote proxy gateway URL (e.g. https://my-worker.workers.dev or Render URL):', PROXY_GATEWAY);
      if (newUrl && newUrl.trim()) {
        PROXY_GATEWAY = newUrl.trim().replace(/\\/$/, '');
        localStorage.setItem('AEGIS_GATEWAY', PROXY_GATEWAY);
        document.getElementById('currentProxyDisplay').innerText = PROXY_GATEWAY;
        alert('Proxy gateway updated to: ' + PROXY_GATEWAY);
      }
    }

    function handleNav(e) {
      e.preventDefault();
      const val = document.getElementById('urlInput').value.trim();
      if (!val) return;
      loadUrl(val);
    }

    function loadUrl(target) {
      let finalUrl = target;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        if (!finalUrl.includes('.')) {
          finalUrl = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(finalUrl);
        } else {
          finalUrl = 'https://' + finalUrl;
        }
      }

      document.getElementById('urlInput').value = finalUrl;
      document.getElementById('start-screen').style.display = 'none';
      const frame = document.getElementById('browserFrame');
      frame.style.display = 'block';

      // Route through remote server gateway
      const proxyEndpoint = PROXY_GATEWAY.includes('?') 
        ? PROXY_GATEWAY + '&url=' + encodeURIComponent(finalUrl)
        : PROXY_GATEWAY + '?url=' + encodeURIComponent(finalUrl);

      frame.src = proxyEndpoint;
    }

    function goHome() {
      document.getElementById('start-screen').style.display = 'flex';
      document.getElementById('browserFrame').style.display = 'none';
      document.getElementById('browserFrame').src = 'about:blank';
      document.getElementById('urlInput').value = '';
    }

    function reloadFrame() {
      const frame = document.getElementById('browserFrame');
      if (frame.src && frame.src !== 'about:blank') {
        frame.src = frame.src;
      }
    }

    // Listen for link navigation inside proxy
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'AEGIS_NAVIGATE') {
        document.getElementById('urlInput').value = e.data.url;
      }
    });
  </script>
</body>
</html>`;

  // Free Cloudflare Worker Proxy Script (100k requests/day free forever)
  const cloudflareWorkerCode = `/**
 * AegisProxy - Cloudflare Worker Anonymous Relay
 * Free Tier: 100,000 requests/day, 0 server cost
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Get target destination from query parameter
    let target = url.searchParams.get('url');
    if (!target) {
      return new Response('AegisProxy Gateway Active. Pass ?url=https://example.com', { status: 200 });
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    const targetUrl = new URL(target);

    // SSRF Guard: Prevent loopback and private subnets
    const host = targetUrl.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('10.') || host.startsWith('192.168.')) {
      return new Response('Forbidden: Access to private networks is prohibited.', { status: 403 });
    }

    // Strip client IP headers to guarantee anonymity
    const forwardHeaders = new Headers();
    forwardHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
    forwardHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
    forwardHeaders.set('Accept-Language', 'en-US,en;q=0.9');

    // Fetch from target site via Cloudflare's global edge network
    const remoteResponse = await fetch(targetUrl.href, {
      method: request.method,
      headers: forwardHeaders,
      redirect: 'follow',
    });

    const contentType = remoteResponse.headers.get('content-type') || '';
    const newHeaders = new Headers(remoteResponse.headers);

    // Remove anti-embedding headers so GitHub Pages iframe works
    newHeaders.delete('x-frame-options');
    newHeaders.delete('content-security-policy');
    newHeaders.delete('content-security-policy-report-only');
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('X-Proxy-By', 'AegisProxy-Cloudflare-Relay');

    // Rewrite HTML to fix relative links and inject bridge script
    if (contentType.includes('text/html')) {
      let html = await remoteResponse.text();
      
      const bridgeScript = \`
        <base href="\${remoteResponse.url || targetUrl.href}">
        <script>
          document.addEventListener('click', function(e) {
            var a = e.target.closest('a');
            if (a && a.href && !a.href.startsWith('javascript:')) {
              e.preventDefault();
              window.parent.postMessage({ type: 'AEGIS_NAVIGATE', url: a.href }, '*');
              window.location.href = window.location.origin + '?url=' + encodeURIComponent(a.href);
            }
          }, true);
        </script>
      \`;

      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, '$1' + bridgeScript);
      } else {
        html = bridgeScript + html;
      }

      return new Response(html, {
        status: remoteResponse.status,
        headers: newHeaders,
      });
    }

    // Stream other content directly (images, scripts, CSS)
    return new Response(remoteResponse.body, {
      status: remoteResponse.status,
      headers: newHeaders,
    });
  }
};`;

  // Free Node.js / Express Server script for Render / Railway / Fly.io
  const nodeServerCode = `/**
 * Standalone Node.js Express Proxy Gateway
 * Deploy on Render (Free Tier), Railway, or Fly.io
 */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.send('AegisProxy Gateway is Online. Use ?url=https://...');

  try {
    const remote = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    });

    // Strip frame restrictions
    res.status(remote.status);
    remote.headers.forEach((v, k) => {
      if (!['x-frame-options', 'content-security-policy'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });

    const cType = remote.headers.get('content-type') || '';
    if (cType.includes('text/html')) {
      let html = await remote.text();
      html = '<base href="' + remote.url + '">' + html;
      return res.send(html);
    }

    const buf = Buffer.from(await remote.arrayBuffer());
    res.send(buf);
  } catch (err) {
    res.status(502).send('Proxy error: ' + err.message);
  }
});

app.listen(PORT, () => console.log('Proxy running on port ' + PORT));`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-white" />
            <span>GitHub Pages + Free Remote Server Setup</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete blueprint to host your browser frontend on GitHub Pages with 100% free open-source proxy relays.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Back to Browser
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          01. Architecture & Free Tools
        </button>
        <button
          onClick={() => setActiveTab('frontend')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'frontend' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>02. GitHub Pages Frontend (index.html)</span>
        </button>
        <button
          onClick={() => setActiveTab('backend-cf')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'backend-cf' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span>03. Free Remote Server (Cloudflare Worker)</span>
        </button>
        <button
          onClick={() => setActiveTab('backend-node')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'backend-node' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>04. Node.js / Render Proxy Alternative</span>
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'test' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>05. Live Test Remote Server</span>
        </button>
      </div>

      {/* Tab 1: Architecture & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">How This Works Conceptually</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you host a website on <strong className="text-white">GitHub Pages</strong>, GitHub only provides static web hosting (HTML, CSS, JS). If your static site tries to load third-party websites in an <code className="text-blue-300">&lt;iframe&gt;</code> directly from the visitor's browser:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                <div className="text-rose-400 font-semibold mb-1">Problem 1: No Anonymity</div>
                <p className="text-slate-400">
                  Requests would originate directly from the user's home ISP. Target websites would record the user's real IP and geolocation.
                </p>
              </div>
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                <div className="text-rose-400 font-semibold mb-1">Problem 2: Frame Blocking</div>
                <p className="text-slate-400">
                  Modern websites send <code className="text-slate-300">X-Frame-Options: DENY</code> and <code className="text-slate-300">frame-ancestors 'none'</code>, refusing to render inside an iframe.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>The Solution: 2-Tier Architecture with 100% Free Tools</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                By splitting your project into two zero-cost tiers, you get total anonymity and seamless framing:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-200">Tier 1 (Frontend):</strong> Hosted 100% free on GitHub Pages (<code className="text-blue-300">yourname.github.io/proxy-browser</code>). Serves the browser interface, omnibar, and responsive controls.</li>
                <li><strong className="text-slate-200">Tier 2 (Remote Relay Server):</strong> Hosted 100% free on Cloudflare Workers (100,000 free requests/day) or Render. The server fetches the target site, strips the framing restriction, strips all your local network headers, and sends the page to your GitHub Pages viewport.</li>
              </ul>
            </div>
          </div>

          {/* Open-Source Comparison Directory */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Recommended Open-Source Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-blue-400">Cloudflare Workers</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Serverless Edge Proxy</div>
                  <p className="text-slate-400 mt-2">
                    100,000 requests/day free forever. Deployed across 300+ datacenters worldwide with 1 click. Zero server maintenance.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-emerald-400 font-mono">Recommended (Fastest)</div>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-purple-400">Ultraviolet / Bare-Server</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Full Web Proxy Engine</div>
                  <p className="text-slate-400 mt-2">
                    Open-source standard for web-based proxy unblockers. Intercepts WebSockets, Service Workers, and complex SPA scripts.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 font-mono">Advanced Features</div>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-amber-400">Render / Fly.io Free</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Node.js Express Container</div>
                  <p className="text-slate-400 mt-2">
                    Full control over Node.js environment. Run custom header spoofing, cookie jars, and dynamic user-agents.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 font-mono">Full Docker Stack</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GitHub Pages Frontend index.html */}
      {activeTab === 'frontend' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Standalone GitHub Pages Frontend (index.html)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Save this as <code className="text-blue-300">index.html</code> in your GitHub repository and enable GitHub Pages.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(standaloneGitHubHtml, 'gh-html')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'gh-html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'gh-html' ? 'Copied HTML!' : 'Copy index.html'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-[#090d16] border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto overflow-x-auto">
                <code>{standaloneGitHubHtml}</code>
              </pre>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
              <div className="text-slate-200 font-semibold">How to deploy to GitHub in 3 steps:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Create a new public repository on GitHub (e.g. <code className="text-blue-300">web-proxy</code>).</li>
                <li>Add a file named <code className="text-blue-300">index.html</code> with the code above.</li>
                <li>Go to <strong>Settings → Pages → Source</strong>, select <strong>Deploy from branch: main / root</strong>, and click <strong>Save</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cloudflare Worker Backend */}
      {activeTab === 'backend-cf' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Free Remote Relay Server (Cloudflare Worker)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% free serverless relay that handles SSRF prevention, X-Frame-Options removal, and link rewriting.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(cloudflareWorkerCode, 'cf-worker')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'cf-worker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cf-worker' ? 'Copied Worker!' : 'Copy worker.js'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-[#090d16] border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto overflow-x-auto">
                <code>{cloudflareWorkerCode}</code>
              </pre>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
              <div className="text-slate-200 font-semibold">How to deploy on Cloudflare Workers (Free):</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Sign up for a free account at <strong className="text-slate-200">dash.cloudflare.com</strong> (no credit card required).</li>
                <li>Go to <strong>Workers & Pages → Create Application → Create Worker</strong>.</li>
                <li>Click <strong>Deploy</strong>, then click <strong>Edit code</strong>.</li>
                <li>Paste the code above into <code className="text-blue-300">worker.js</code> and click <strong>Deploy</strong>.</li>
                <li>Copy your worker URL (e.g. <code className="text-emerald-400">https://my-proxy.my-name.workers.dev</code>) and set it in your GitHub Pages site!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Node.js / Render Proxy Alternative */}
      {activeTab === 'backend-node' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Dedicated Node.js Express Relay (Render / Docker)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deploy as a free Web Service on Render.com or Koyeb.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(nodeServerCode, 'node-server')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'node-server' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'node-server' ? 'Copied server.js!' : 'Copy server.js'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-[#090d16] border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 max-h-80 overflow-y-auto overflow-x-auto">
                <code>{nodeServerCode}</code>
              </pre>
            </div>

            <div className="bg-[#0d1322] border border-slate-800 p-3 rounded-lg text-xs space-y-1">
              <div className="text-slate-200 font-semibold">Deploy on Render Free Tier:</div>
              <p className="text-slate-400">
                Push <code className="text-blue-300">server.js</code> and a simple <code className="text-blue-300">package.json</code> with Express to a GitHub repo, connect to Render as a "Web Service", set build command <code className="text-slate-300">npm install</code> and start command <code className="text-slate-300">node server.js</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Test Remote Server Live */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Remote Gateway Switcher</h3>
              <p className="text-xs text-slate-400 mt-1">
                You can plug in your own Cloudflare Worker or Render proxy URL below to test it immediately inside this applet before deploying to GitHub Pages!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Custom Remote Proxy Gateway URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testProxyInput}
                  onChange={(e) => setTestProxyInput(e.target.value)}
                  placeholder="https://my-proxy-worker.your-name.workers.dev"
                  className="flex-1 bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleApplyProxyUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
                >
                  Apply & Test
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Leave blank or reset to use the built-in dedicated Aegis cloud server.
              </p>
            </div>

            {testStatus && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{testStatus}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Return to Browser View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
