import React from 'react';
import { 
  Globe, MessageSquare, Wifi, UserCheck, Mail, Phone, Coins
} from 'lucide-react';
import { QRConfig, QRContentMode } from '../types';

interface ContentTabProps {
  config: QRConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRConfig>>;
}

export const ContentTab: React.FC<ContentTabProps> = ({ config, setConfig }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase mb-3">
          Select Data Type
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-white/5">
          {[
            { id: 'url', label: 'URL', icon: Globe },
            { id: 'text', label: 'Text', icon: MessageSquare },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'vcard', label: 'vCard', icon: UserCheck },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'sms', label: 'SMS', icon: MessageSquare },
            { id: 'phone', label: 'Phone', icon: Phone },
            { id: 'pix', label: 'Pix Pay', icon: Coins }
          ].map(modeOpt => (
            <button
              key={modeOpt.id}
              onClick={() => setConfig(prev => ({ ...prev, mode: modeOpt.id as QRContentMode }))}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg gap-1 transition-all duration-200 cursor-pointer ${
                config.mode === modeOpt.id
                  ? 'bg-indigo-600 font-semibold text-white'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <modeOpt.icon className="h-4.5 w-4.5" />
              <span className="text-[10px]">{modeOpt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subform: URL */}
      {config.mode === 'url' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Website URL address</label>
          <input
            type="text"
            value={config.url}
            onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
            placeholder="e.g. google.com or creative.studio"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      )}

      {/* Subform: Text */}
      {config.mode === 'text' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Raw Plain Text</label>
          <textarea
            value={config.text}
            onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Type any custom text payload..."
            rows={4}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
          />
        </div>
      )}

      {/* Subform: Wi-Fi */}
      {config.mode === 'wifi' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">WIFI SSID (Name)</label>
            <input
              type="text"
              title="WIFI SSID (Name)"
              placeholder="Enter Wi-Fi SSID"
              value={config.wifi.ssid}
              onChange={(e) => setConfig(prev => ({ ...prev, wifi: { ...prev.wifi, ssid: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
            <input
              type="password"
              title="Password"
              placeholder="Enter Wi-Fi Password"
              value={config.wifi.password}
              onChange={(e) => setConfig(prev => ({ ...prev, wifi: { ...prev.wifi, password: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Security Protocol</label>
            <select
              title="Security Protocol"
              value={config.wifi.security}
              onChange={(e: any) => setConfig(prev => ({ ...prev, wifi: { ...prev.wifi, security: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="WPA">WPA / WPA2 (Recommended)</option>
              <option value="WEP">WEP (Legacy)</option>
              <option value="nopass">Unsecured (Open)</option>
            </select>
          </div>
          <div className="flex items-center pt-8 pl-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.wifi.hidden}
                onChange={(e) => setConfig(prev => ({ ...prev, wifi: { ...prev.wifi, hidden: e.target.checked } }))}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-white/10 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300">Hidden Network Broadcast</span>
            </label>
          </div>
        </div>
      )}

      {/* Subform: Contact vCard */}
      {config.mode === 'vcard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">First Name</label>
            <input
              type="text"
              value={config.vcard.name}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, name: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Last Name</label>
            <input
              type="text"
              value={config.vcard.lastName}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, lastName: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Organization</label>
            <input
              type="text"
              value={config.vcard.organization}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, organization: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Job Title</label>
            <input
              type="text"
              value={config.vcard.title}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, title: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</label>
            <input
              type="text"
              value={config.vcard.phone}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, phone: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              value={config.vcard.email}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, email: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Website URL (vCard)</label>
            <input
              type="text"
              value={config.vcard.url}
              onChange={(e) => setConfig(prev => ({ ...prev, vcard: { ...prev.vcard, url: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Subform: Email */}
      {config.mode === 'email' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Recipient Email address</label>
            <input
              type="email"
              value={config.email.email}
              onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, email: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Subject line</label>
            <input
              type="text"
              value={config.email.subject}
              onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, subject: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Message Body</label>
            <textarea
              value={config.email.body}
              onChange={(e) => setConfig(prev => ({ ...prev, email: { ...prev.email, body: e.target.value } }))}
              rows={3}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Subform: SMS */}
      {config.mode === 'sms' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Phone Number</label>
            <input
              type="text"
              value={config.sms.phone}
              onChange={(e) => setConfig(prev => ({ ...prev, sms: { ...prev.sms, phone: e.target.value } }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">SMS Text message (Pre-filled)</label>
            <textarea
              value={config.sms.message}
              onChange={(e) => setConfig(prev => ({ ...prev, sms: { ...prev.sms, message: e.target.value } }))}
              rows={3}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Subform: Phone */}
      {config.mode === 'phone' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Phone Number</label>
          <input
            type="text"
            value={config.phone}
            onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none font-mono"
          />
        </div>
      )}

      {/* Subform: Pix Payment */}
      {config.mode === 'pix' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-xl flex items-start gap-3">
            <Coins className="h-5 w-5 text-pink-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-200">Pix Instant Payments (Brazil)</h4>
              <p className="text-[10px] text-pink-300/80 mt-1 leading-relaxed">
                Generates a static EMV-compliant &quot;Copia e Cola&quot; BR Code. When scanned, this payload starts an immediate instant transfer in standard Brazilian banking platforms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pix Key Type</label>
              <select
                value={config.pix.keyType}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, keyType: e.target.value as any } }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="cpf_cnpj">CPF or CNPJ Tax ID</option>
                <option value="email">Email Address</option>
                <option value="phone">Cell Phone (+55...)</option>
                <option value="evp">Random Key / EVP Chave Aleatória</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pix Key value (Chave Pix)</label>
              <input
                type="text"
                value={config.pix.key}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, key: e.target.value } }))}
                placeholder="Key value..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Receiver Name (Nome Beneficiário)</label>
              <input
                type="text"
                value={config.pix.receiverName}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, receiverName: e.target.value } }))}
                placeholder="Full Name"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Receiver City (Cidade)</label>
              <input
                type="text"
                value={config.pix.receiverCity}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, receiverCity: e.target.value } }))}
                placeholder="SAO PAULO"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amount (R$)</label>
              <input
                type="text"
                value={config.pix.amount}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, amount: e.target.value } }))}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Transaction ID / Reference (TxID)</label>
              <input
                type="text"
                value={config.pix.txid}
                onChange={(e) => setConfig(prev => ({ ...prev, pix: { ...prev.pix, txid: e.target.value } }))}
                placeholder="***"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
