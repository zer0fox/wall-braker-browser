import React, { useState } from 'react';
import {
  X,
  Shield,
  Sliders,
  Server,
  Globe,
  Check,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { ProxySettings } from '../types/browser';

interface ProxySettingsModalProps {
  settings: ProxySettings;
  onSave: (newSettings: ProxySettings) => void;
  onClose: () => void;
}

export const ProxySettingsModal: React.FC<ProxySettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProxySettings>({ ...settings });

  const uaPresets = [
    {
      name: 'Chrome 128 (Windows 10/11)',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    },
    {
      name: 'Safari 17.5 (macOS Sonoma)',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    },
    {
      name: 'Firefox 129 (Linux x86_64)',
      ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
    },
    {
      name: 'Mobile Safari (iPhone iOS 17)',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    },
    {
      name: 'Mobile Chrome (Android 14)',
      ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    },
  ];

  const handleReset = () => {
    setFormData({
      mode: 'built-in',
      customGatewayUrl: '',
      userAgent: uaPresets[0].ua,
      disableScripts: false,
      stripCookies: true,
      referrerPolicy: 'no-referrer',
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Proxy Gateway & Privacy Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Gateway Routing Mode */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Remote Gateway Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'built-in' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.mode === 'built-in'
                    ? 'border-blue-500 bg-blue-950/30 text-white'
                    : 'border-slate-800 bg-[#0b0f19] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-medium text-slate-200">Built-in Dedicated Gateway</div>
                <div className="text-[11px] text-slate-500 mt-1">Routes via Aegis Cloud Node</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'custom' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.mode === 'custom'
                    ? 'border-blue-500 bg-blue-950/30 text-white'
                    : 'border-slate-800 bg-[#0b0f19] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-medium text-slate-200">Custom Remote Relay</div>
                <div className="text-[11px] text-slate-500 mt-1">Use your Cloudflare / Render URL</div>
              </button>
            </div>

            {formData.mode === 'custom' && (
              <div className="mt-2 space-y-1">
                <span className="text-slate-400 text-[11px]">Your Remote Relay Endpoint:</span>
                <input
                  type="text"
                  value={formData.customGatewayUrl}
                  onChange={(e) => setFormData({ ...formData, customGatewayUrl: e.target.value })}
                  placeholder="https://my-proxy-worker.workers.dev"
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* User-Agent Spoofing */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Outbound User-Agent Identity</label>
            <div className="space-y-1.5">
              {uaPresets.map((preset) => (
                <label
                  key={preset.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#0b0f19] border border-slate-800/80 hover:border-slate-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="ua_preset"
                    checked={formData.userAgent === preset.ua}
                    onChange={() => setFormData({ ...formData, userAgent: preset.ua })}
                    className="accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 font-medium text-[11px]">{preset.name}</div>
                    <div className="text-slate-500 font-mono text-[10px] truncate">{preset.ua}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Security & Sandbox Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 block">Security & Sandbox Policies</label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.disableScripts}
                onChange={(e) => setFormData({ ...formData, disableScripts: e.target.checked })}
                className="mt-0.5 accent-blue-600 rounded"
              />
              <div>
                <span className="text-slate-200 font-medium">Strip Target JavaScript (Hardened Read-Mode)</span>
                <p className="text-slate-500 text-[11px]">
                  Removes all client-side scripts to prevent tracking beacons, fingerprinting, or cryptominers.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stripCookies}
                onChange={(e) => setFormData({ ...formData, stripCookies: e.target.checked })}
                className="mt-0.5 accent-blue-600 rounded"
              />
              <div>
                <span className="text-slate-200 font-medium">Enforce Cookie Isolation</span>
                <p className="text-slate-500 text-[11px]">
                  Prevents cross-site cookie persistence between browsing sessions.
                </p>
              </div>
            </label>

            <div className="pt-2">
              <span className="text-slate-300 font-medium block mb-1">Referrer Header Policy:</span>
              <select
                value={formData.referrerPolicy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referrerPolicy: e.target.value as 'no-referrer' | 'origin' | 'same-origin',
                  })
                }
                className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="no-referrer">Strict No-Referrer (Never send origin or referrer)</option>
                <option value="origin">Origin Only (Send domain only, strip full path)</option>
                <option value="same-origin">Same-Origin Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1322] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
