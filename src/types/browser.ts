export interface ProxyServerInfo {
  ip: string;
  country?: string;
  city?: string;
  provider?: string;
  uptime: number;
  environment: string;
}

export interface ClientNodeInfo {
  detectedIp: string;
  isProxied: boolean;
  userLocalNetworkExposed: boolean;
  anonymityLevel: string;
}

export interface ServerStatusResponse {
  success: boolean;
  serverNode: ProxyServerInfo;
  clientNode: ClientNodeInfo;
  supportedModes: string[];
}

export interface InspectionData {
  success: boolean;
  url: string;
  status: number;
  statusText: string;
  contentType: string;
  latencyMs: number;
  wouldBlockIframeNormally: boolean;
  framingBarrier: string;
  aegisBypassSolution: string;
  remoteHeaders: Record<string, string>;
}

export type ViewportMode = 'full' | 'laptop' | 'tablet' | 'mobile';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  favicon?: string;
}

export interface ProxySettings {
  mode: 'built-in' | 'custom';
  customGatewayUrl: string;
  userAgent: string;
  disableScripts: boolean;
  stripCookies: boolean;
  referrerPolicy: 'no-referrer' | 'origin' | 'same-origin';
}
