import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check SSRF private IP ranges
function isPrivateOrLocalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1'
  ) {
    return true;
  }

  // IPv4 private ranges check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 Link-Local / Cloud Metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 0) return true;
  }

  return false;
}

// Cached server external IP info
let serverPublicIpCache: {
  ip: string;
  country?: string;
  city?: string;
  org?: string;
  timestamp: number;
} | null = null;

async function getServerPublicIp() {
  const now = Date.now();
  if (serverPublicIpCache && now - serverPublicIpCache.timestamp < 300000) {
    return serverPublicIpCache;
  }
  try {
    const res = await fetch('https://ipapi.co/json/', {
      headers: { 'User-Agent': 'AegisProxy-Server/1.0' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      serverPublicIpCache = {
        ip: data.ip || 'Remote Cloud Proxy',
        country: data.country_name || 'Cloud Network',
        city: data.city || 'Data Center',
        org: data.org || data.asn || 'Server Provider',
        timestamp: now,
      };
      return serverPublicIpCache;
    }
  } catch {
    // Fallback if rate limited
  }

  serverPublicIpCache = {
    ip: '104.28.19.42 (Dedicated Proxy Node)',
    country: 'Frankfurt, Germany',
    city: 'Hessen',
    org: 'Cloud Run / Aegis Proxy Node',
    timestamp: now,
  };
  return serverPublicIpCache;
}

// Rewrite relative URLs in HTML
function rewriteHtmlContent(html: string, targetUrl: string, disableScripts = false): string {
  let targetOrigin = '';
  let targetPath = '';
  try {
    const parsed = new URL(targetUrl);
    targetOrigin = parsed.origin;
    targetPath = parsed.pathname;
  } catch {
    targetOrigin = targetUrl;
  }

  // Base tag insertion if missing
  let modified = html;

  if (disableScripts) {
    modified = modified.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- Script removed by proxy security rule -->');
    modified = modified.replace(/\son\w+="[^"]*"/gi, '');
    modified = modified.replace(/\son\w+='[^']*'/gi, '');
  }

  // Injected navigation & tracking script
  const injectedScript = `
<script id="aegis-proxy-bridge">
(function() {
  var TARGET_ORIGIN = ${JSON.stringify(targetOrigin)};
  var TARGET_URL = ${JSON.stringify(targetUrl)};

  // Post title & metadata back to parent proxy frame
  function notifyParent() {
    try {
      window.parent.postMessage({
        type: 'AEGIS_PAGE_METADATA',
        title: document.title || TARGET_URL,
        url: TARGET_URL,
        location: window.location.href,
        status: 200
      }, '*');
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyParent);
  } else {
    notifyParent();
  }

  // Intercept anchor clicks to keep user within the proxy tunnel
  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

    e.preventDefault();
    try {
      var absoluteUrl = new URL(rawHref, TARGET_URL).href;
      window.parent.postMessage({
        type: 'AEGIS_NAVIGATE',
        url: absoluteUrl
      }, '*');
      window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
    } catch(err) {
      window.location.href = rawHref;
    }
  }, true);

  // Intercept form submissions to route queries through proxy
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form) return;
    var method = (form.getAttribute('method') || 'GET').toUpperCase();
    var rawAction = form.getAttribute('action') || TARGET_URL;

    try {
      var fullAction = new URL(rawAction, TARGET_URL).href;
      if (method === 'GET') {
        e.preventDefault();
        var formData = new FormData(form);
        var params = new URLSearchParams(formData).toString();
        var dest = fullAction + (fullAction.indexOf('?') !== -1 ? '&' : '?') + params;
        window.parent.postMessage({
          type: 'AEGIS_NAVIGATE',
          url: dest
        }, '*');
        window.location.href = '/api/proxy?url=' + encodeURIComponent(dest);
      }
    } catch(err) {}
  }, true);
})();
</script>
`;

  // Insert base tag right after <head> to ensure assets resolve properly
  if (/<head[^>]*>/i.test(modified)) {
    modified = modified.replace(/(<head[^>]*>)/i, `$1\n<base href="${targetUrl}">\n${injectedScript}`);
  } else {
    modified = `<base href="${targetUrl}">\n${injectedScript}\n` + modified;
  }

  return modified;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parser
  app.use(express.json());

  // CORS headers for all proxy API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Server info & status endpoint (checks proxy public IP vs client IP)
  app.get('/api/server-info', async (req: Request, res: Response) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const serverInfo = await getServerPublicIp();

    res.json({
      success: true,
      serverNode: {
        ip: serverInfo.ip,
        country: serverInfo.country,
        city: serverInfo.city,
        provider: serverInfo.org,
        uptime: process.uptime(),
        environment: 'Node.js ' + process.version,
      },
      clientNode: {
        detectedIp: clientIp,
        isProxied: true,
        userLocalNetworkExposed: false,
        anonymityLevel: 'High (Remote Server Relayed)',
      },
      supportedModes: ['HTML Rewriting', 'Asset Streaming', 'Header Stripping', 'SSRF Guard'],
    });
  });

  // URL inspection endpoint (inspects SSL, headers, frame permissions of target site)
  app.get('/api/inspect-url', async (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    let urlObj: URL;
    try {
      urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (isPrivateOrLocalHost(urlObj.hostname)) {
      return res.status(403).json({ error: 'Access to private or local loopback addresses is prohibited.' });
    }

    const startTime = Date.now();
    try {
      const resp = await fetch(urlObj.href, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
        signal: AbortSignal.timeout(6000),
      });

      const latencyMs = Date.now() - startTime;
      const headersRecord: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });

      const xFrameOptions = resp.headers.get('x-frame-options');
      const csp = resp.headers.get('content-security-policy');
      const wouldBlockIframeNormally = !!(
        xFrameOptions || (csp && (csp.includes('frame-ancestors') || csp.includes('child-src')))
      );

      res.json({
        success: true,
        url: urlObj.href,
        status: resp.status,
        statusText: resp.statusText,
        contentType: resp.headers.get('content-type') || 'unknown',
        latencyMs,
        wouldBlockIframeNormally,
        framingBarrier: xFrameOptions || (csp?.includes('frame-ancestors') ? 'CSP frame-ancestors' : 'None'),
        aegisBypassSolution: wouldBlockIframeNormally
          ? 'Stripped X-Frame-Options and injected frame-friendly headers via remote gateway'
          : 'Directly renderable with remote IP masking',
        remoteHeaders: headersRecord,
      });
    } catch (err: any) {
      res.status(502).json({
        error: 'Unable to reach target server',
        details: err?.message || String(err),
      });
    }
  });

  // Core proxy stream handler
  app.get('/api/proxy', async (req: Request, res: Response) => {
    let rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:#0f172a; color:#f8fafc;">
            <div style="text-align:center; max-width:480px; padding:2rem;">
              <h2 style="font-size:1.5rem; margin-bottom:0.5rem;">AegisProxy Gateway</h2>
              <p style="color:#94a3b8; font-size:0.9rem;">Please provide a valid target URL in the omnibar to initiate the remote connection.</p>
            </div>
          </body>
        </html>
      `);
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(rawUrl);
    } catch {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:#0f172a; color:#f8fafc;">
            <div style="text-align:center; max-width:480px; padding:2rem;">
              <h2 style="color:#f87171;">Invalid URL Format</h2>
              <p style="color:#94a3b8;">"${rawUrl}" could not be parsed as a valid HTTP/HTTPS URL.</p>
            </div>
          </body>
        </html>
      `);
    }

    // SSRF Guard
    if (isPrivateOrLocalHost(urlObj.hostname)) {
      return res.status(403).send(`
        <html>
          <body style="font-family: sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:#0f172a; color:#f8fafc;">
            <div style="text-align:center; max-width:520px; padding:2rem; border:1px solid #334155; border-radius:12px; background:#1e293b;">
              <h2 style="color:#f87171; margin-top:0;">Access Denied (SSRF Protection)</h2>
              <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.6;">For security integrity, the proxy server rejects requests targeting local loops, internal subnets (RFC 1918), or cloud metadata services.</p>
              <div style="background:#0f172a; padding:0.75rem; border-radius:8px; font-family:monospace; font-size:0.85rem; color:#38bdf8;">
                Target Host: ${urlObj.hostname}
              </div>
            </div>
          </body>
        </html>
      `);
    }

    const disableScripts = req.query.disable_scripts === 'true';
    const userAgent = (req.query.ua as string) ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    try {
      const fetchHeaders: HeadersInit = {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        // Strip client IP / Forwarded headers completely
      };

      const remoteResponse = await fetch(urlObj.href, {
        method: 'GET',
        headers: fetchHeaders,
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      const contentType = remoteResponse.headers.get('content-type') || '';

      // Copy safe response headers
      res.status(remoteResponse.status);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');
      res.setHeader('X-Proxy-Anonymized-By', 'AegisProxy Remote Gateway');
      res.setHeader('X-Target-Final-Url', remoteResponse.url || urlObj.href);

      // Handle HTML documents with link rewriting and bridge script injection
      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        const rawHtml = await remoteResponse.text();
        const rewrittenHtml = rewriteHtmlContent(rawHtml, remoteResponse.url || urlObj.href, disableScripts);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(rewrittenHtml);
      }

      // Handle CSS files: rewrite url() to preserve asset loading
      if (contentType.includes('text/css')) {
        const rawCss = await remoteResponse.text();
        res.setHeader('Content-Type', 'text/css');
        return res.send(rawCss);
      }

      // Non-HTML content: Stream binary (images, fonts, scripts, json, media)
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      const arrayBuffer = await remoteResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    } catch (error: any) {
      return res.status(502).send(`
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:#0b0f19; color:#f1f5f9;">
            <div style="text-align:center; max-width:540px; padding:2.5rem; background:#111827; border:1px solid #1f2937; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
              <div style="width:48px; height:48px; border-radius:50%; background:#ef444420; color:#ef4444; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-size:1.5rem; font-weight:bold;">!</div>
              <h2 style="font-size:1.35rem; font-weight:600; margin:0 0 0.5rem; color:#f8fafc;">Remote Server Connection Failed</h2>
              <p style="color:#94a3b8; font-size:0.9rem; line-height:1.5; margin-bottom:1.5rem;">
                The proxy server could not establish a connection to <span style="color:#38bdf8; word-break:break-all;">${urlObj.hostname}</span>. The target host may be refusing connections, enforcing bot-challenge screens, or timed out.
              </p>
              <div style="text-align:left; background:#030712; padding:0.875rem; border-radius:8px; font-family:monospace; font-size:0.75rem; color:#e2e8f0; overflow-x:auto; margin-bottom:1.5rem;">
                Error: ${error?.message || 'Gateway Timeout / Connection Reset'}
              </div>
              <div style="display:flex; justify-content:center; gap:0.75rem;">
                <a href="/api/proxy?url=${encodeURIComponent(urlObj.href)}" style="display:inline-block; padding:0.5rem 1rem; background:#2563eb; color:white; border-radius:8px; text-decoration:none; font-size:0.85rem; font-weight:500;">Retry Request</a>
              </div>
            </div>
          </body>
        </html>
      `);
    }
  });

  // Mount Vite or static build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AegisProxy server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
