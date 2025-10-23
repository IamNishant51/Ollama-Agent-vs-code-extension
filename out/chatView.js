"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class OllamaChatViewProvider {
    _context;
    static viewType = 'ollamaAgent.chatView';
    _view;
    _autoOpenedPanel = false;
    constructor(_context) {
        this._context = _context;
    }
    reveal() {
        this._view?.show?.(true);
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        const webview = webviewView.webview;
        webview.options = { enableScripts: true };
        webview.html = this.getHtmlForWebview(webview);
        // Open the right-side chat panel once when this launcher view first resolves.
        if (!this._autoOpenedPanel) {
            this._autoOpenedPanel = true;
            setTimeout(() => vscode.commands.executeCommand('ollamaAgent.chat'), 50);
        }
        webview.onDidReceiveMessage(async (msg) => {
            switch (msg?.type) {
                case 'openChatPanel':
                    vscode.commands.executeCommand('ollamaAgent.chat');
                    break;
                case 'requestSettings': {
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const systemPrompt = cfg.get('systemPrompt', 'You are a helpful coding assistant.');
                    const provider = cfg.get('provider', 'ollama');
                    const hasOpenAIKey = !!(await this._context.secrets.get('ollamaAgent.openaiKey'));
                    const hasAnthropicKey = !!(await this._context.secrets.get('ollamaAgent.anthropicKey'));
                    const hasOtherKey = !!(await this._context.secrets.get('ollamaAgent.otherKey'));
                    const hasProviderKey = provider === 'openai' ? hasOpenAIKey : provider === 'anthropic' ? hasAnthropicKey : provider === 'other' ? hasOtherKey : true;
                    webview.postMessage({ type: 'settings', systemPrompt, provider, hasProviderKey });
                    break;
                }
                case 'saveSecret': {
                    const { which, value } = msg; // which: 'openai' | 'anthropic'
                    if (which === 'openai') {
                        await this._context.secrets.store('ollamaAgent.openaiKey', value || '');
                    }
                    if (which === 'anthropic') {
                        await this._context.secrets.store('ollamaAgent.anthropicKey', value || '');
                    }
                    if (which === 'other') {
                        await this._context.secrets.store('ollamaAgent.otherKey', value || '');
                    }
                    webview.postMessage({ type: 'saved', what: 'secret', which });
                    break;
                }
                case 'deleteSecret': {
                    const { which } = msg;
                    if (which === 'openai') {
                        await this._context.secrets.delete('ollamaAgent.openaiKey');
                    }
                    if (which === 'anthropic') {
                        await this._context.secrets.delete('ollamaAgent.anthropicKey');
                    }
                    if (which === 'other') {
                        await this._context.secrets.delete('ollamaAgent.otherKey');
                    }
                    webview.postMessage({ type: 'deleted', what: 'secret', which });
                    break;
                }
                case 'saveConfig': {
                    const { provider, systemPrompt } = msg;
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    if (provider) {
                        await cfg.update('provider', provider, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof systemPrompt === 'string') {
                        await cfg.update('systemPrompt', systemPrompt, vscode.ConfigurationTarget.Global);
                    }
                    webview.postMessage({ type: 'saved', what: 'config' });
                    break;
                }
            }
        });
    }
    getHtmlForWebview(webview) {
        const nonce = getNonce();
        const styles = `
      :root { color-scheme: dark; }
      body { font-family: var(--vscode-font-family); margin: 0; color: var(--vscode-foreground); background: var(--vscode-sideBar-background); height:100%; }
      .wrap { padding: 16px; display:flex; flex-direction:column; gap: 12px; }
      .title { font-weight:600; font-size: 13px; }
      .hint { opacity: .8; font-size: 12px; }
      .section { border: 1px solid var(--vscode-panel-border); background: color-mix(in srgb, var(--vscode-sideBar-background) 85%, var(--vscode-editor-foreground) 5%); border-radius:8px; padding: 12px; display:flex; flex-direction:column; gap:8px; }
      .row { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }
      .label { width: 120px; font-size: 12px; opacity: .9; }
      input[type=text], input[type=password], select, textarea { width: 100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 6px; }
      textarea { min-height: 80px; resize: vertical; }
      .btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; }
      .btn:hover { background: var(--vscode-button-hoverBackground); }
      .subtle { opacity: .7; font-size: 12px; }
      @media (max-width: 700px) { .label { width: 100%; } }
    `;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ollama Agent</title>
  <style>${styles}</style>
</head>
<body>
  <div class="wrap">
    <div class="title">Ollama</div>
    <div class="hint">Open the chat on the right, and manage keys and settings here.</div>

    <div class="section">
      <div class="row"><span class="label">Open Chat</span><button class="btn" id="open">Open</button></div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Provider</span>
        <select id="provider">
          <option value="ollama">Ollama (local)</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="row">
        <span class="label">API Key</span>
        <input id="apiKey" type="password" placeholder="Paste API key here" />
        <button class="btn" id="saveKey">Save</button>
        <button class="btn" id="delKey">Remove</button>
      </div>
      <div class="subtle" id="keysState"></div>
    </div>

    <div class="section">
      <div class="row"><span class="label">System Prompt</span></div>
      <textarea id="systemPrompt" placeholder="You are a helpful coding assistant."></textarea>
      <div class="row"><span class="spacer"></span><button class="btn" id="saveConfig">Save Settings</button></div>
    </div>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('open')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'openChatPanel' });
    });

    function refreshState(s) {
      if (!s) return;
      if (s.provider) document.getElementById('provider').value = s.provider;
      if (typeof s.systemPrompt === 'string') document.getElementById('systemPrompt').value = s.systemPrompt;
      document.getElementById('apiKey').disabled = (s.provider === 'ollama');
      document.getElementById('saveKey').disabled = (s.provider === 'ollama');
      document.getElementById('delKey').disabled = (s.provider === 'ollama');
      document.getElementById('keysState').textContent =
        (s.provider === 'ollama') ? 'No API key required for Ollama (local).' :
        ('Key status: ' + (s.hasProviderKey ? 'Saved' : 'Not set'));
    }

    document.getElementById('saveKey')?.addEventListener('click', () => {
      const provider = (document.getElementById('provider') || {}).value;
      const v = (document.getElementById('apiKey') || {}).value || '';
      vscode.postMessage({ type: 'saveSecret', which: provider, value: v });
    });
    document.getElementById('delKey')?.addEventListener('click', () => {
      const provider = (document.getElementById('provider') || {}).value;
      vscode.postMessage({ type: 'deleteSecret', which: provider });
    });

    document.getElementById('saveConfig')?.addEventListener('click', () => {
      const provider = (document.getElementById('provider') || {}).value;
      const systemPrompt = (document.getElementById('systemPrompt') || {}).value;
      vscode.postMessage({ type: 'saveConfig', provider, systemPrompt });
    });

    window.addEventListener('message', (ev) => {
      const msg = ev.data || {};
      if (msg.type === 'settings') refreshState(msg);
      if (msg.type === 'saved' || msg.type === 'deleted') {
        vscode.postMessage({ type: 'requestSettings' });
      }
    });

    vscode.postMessage({ type: 'requestSettings' });
  </script>
</body>
</html>`;
    }
}
exports.OllamaChatViewProvider = OllamaChatViewProvider;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=chatView.js.map