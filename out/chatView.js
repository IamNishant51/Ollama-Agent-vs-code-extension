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
        webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri, vscode.Uri.joinPath(this._context.extensionUri, 'media')]
        };
        webview.html = this.getHtmlForWebview(webview);
        // Note: Avoid auto-opening the chat panel here to prevent concurrent webview initialization
        // which can sometimes cause service worker registration races on some systems.
        webview.onDidReceiveMessage(async (msg) => {
            switch (msg?.type) {
                case 'openChatPanel':
                    vscode.commands.executeCommand('ollamaAgent.chat');
                    break;
                case 'runCommand': {
                    try {
                        const id = String(msg.command || '');
                        const args = Array.isArray(msg.args) ? msg.args : msg.arg !== undefined ? [msg.arg] : [];
                        if (id) {
                            await vscode.commands.executeCommand(id, ...args);
                        }
                    }
                    catch (e) { }
                    break;
                }
                case 'requestSettings': {
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const systemPrompt = cfg.get('systemPrompt', 'You are a helpful coding assistant.');
                    const provider = cfg.get('provider', 'ollama');
                    const mode = cfg.get('mode', 'read');
                    const hasOpenAIKey = !!(await this._context.secrets.get('ollamaAgent.openaiKey'));
                    const hasAnthropicKey = !!(await this._context.secrets.get('ollamaAgent.anthropicKey'));
                    const hasOtherKey = !!(await this._context.secrets.get('ollamaAgent.otherKey'));
                    const hasProviderKey = provider === 'openai' ? hasOpenAIKey : provider === 'anthropic' ? hasAnthropicKey : provider === 'other' ? hasOtherKey : true;
                    webview.postMessage({ type: 'settings', systemPrompt, provider, mode, hasProviderKey });
                    break;
                }
                case 'requestThreads': {
                    // Ask extension to send current threads to this view
                    await vscode.commands.executeCommand('ollamaAgent.requestThreads');
                    break;
                }
                case 'switchThread': {
                    await vscode.commands.executeCommand('ollamaAgent.switchThread', msg.id);
                    break;
                }
                case 'deleteThread': {
                    await vscode.commands.executeCommand('ollamaAgent.deleteThread', msg.id);
                    break;
                }
                case 'newThread': {
                    await vscode.commands.executeCommand('ollamaAgent.newChatThread');
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
                    const { provider, systemPrompt, mode } = msg;
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    if (provider) {
                        await cfg.update('provider', provider, vscode.ConfigurationTarget.Global);
                    }
                    if (typeof systemPrompt === 'string') {
                        await cfg.update('systemPrompt', systemPrompt, vscode.ConfigurationTarget.Global);
                    }
                    if (mode === 'read' || mode === 'agent' || mode === 'combine') {
                        await cfg.update('mode', mode, vscode.ConfigurationTarget.Global);
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
      *, *::before, *::after { box-sizing: border-box; }
      html, body { height: 100%; }
      body {
        font-family: Inter, 'Segoe UI', sans-serif;
        margin: 0;
        color: #e6e6e6;
        background: #0e0e0e;
        height: 100%;
        display: flex;
        overflow: hidden; /* let inner content manage scrolling */
      }
      .wrap {
        padding: 16px;
        display: flex; flex-direction: column; gap: 14px;
        height: 100%;
        min-height: 0;
        overflow: auto; /* scroll only inner content */
        backdrop-filter: blur(12px);
        background: rgba(20, 20, 20, 0.6);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .title { font-weight: 600; font-size: 14px; color: #fff; }
      .hint { opacity: .8; font-size: 12px; }

      .section {
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(25,25,25,0.7);
        border-radius: 12px;
        padding: 12px;
        display: flex; flex-direction: column; gap: 10px;
      }
      .section-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: none;
        color: #e6e6e6;
        font-size: 13px;
        font-weight: 600;
        padding: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        text-align: left;
      }
      .section-toggle:hover {
        background: rgba(255,255,255,0.05);
        border-radius: 6px;
      }
      .history-list { display: flex; flex-direction: column; gap: 6px; }
      .history-item { display:flex; align-items:center; gap:8px; justify-content: space-between; padding:8px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; }
      .history-title { flex:1; background: transparent; border:none; color:#e6e6e6; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .history-actions { display:flex; gap:6px; }
      .toggle-icon {
        display: inline-block;
        transition: transform 0.3s ease;
        font-size: 10px;
      }
      .toggle-icon.expanded {
        transform: rotate(90deg);
      }
      .collapsible {
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .row { display:flex; gap:10px; align-items:flex-start; flex-wrap: wrap; }
      .label { flex: 0 0 120px; max-width: 120px; font-size: 12px; opacity: .85; }

      select, textarea, input[type=text], input[type=password] {
        width: 100%;
        background: rgba(30,30,30,0.9);
        border: 1px solid rgba(255,255,255,0.12);
        color: #e6e6e6;
        border-radius: 10px;
        padding: 8px 10px;
      }
      textarea { min-height: 90px; resize: vertical; border-radius: 12px; }

      .btn {
        background: rgba(255,255,255,0.08);
        color: #e6e6e6;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 8px 12px;
        cursor: pointer;
        transition: all .2s ease;
      }
      .btn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
      .btn.primary { background: linear-gradient(135deg, #1a73e8, #1559b3); color:#fff; border:none; }

  .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
  @media (max-width: 520px) { .grid { grid-template-columns: 1fr; } }

      .subtle { opacity: .75; font-size: 12px; }
      .spacer { flex: 1; }
      /* Responsive adjustments */
      @media (max-width: 900px) {
        .label { flex: 1 1 100%; max-width: 100%; }
        .row > *:not(.label) { flex: 1 1 100%; }
      }
      @media (max-width: 480px) {
        .wrap { padding: 12px; }
        .section { padding: 10px; }
        .btn { width: 100%; }
      }
    `;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ollama Agent</title>
  <style>${styles}</style>
</head>
<body>
  <div class="wrap">
    <div class="title">Ollama</div>
    <div class="hint">Open the chat on the right, and manage keys and settings here.</div>

    <div class="section">
      <div class="row"><span class="label">Open Chat</span><button class="btn primary" id="open">Open</button></div>
    </div>

    <div class="section">
      <button class="section-toggle" id="hist-toggle">
        <span class="toggle-icon">▶</span>
        <span class="label">History</span>
      </button>
      <div class="collapsible" id="hist-wrap" style="display: none;">
        <div class="row"><button class="btn primary" id="hist-new">New Chat</button></div>
        <div class="history-list" id="hist-list"></div>
      </div>
    </div>

    <div class="section">
      <button class="section-toggle" id="qa-toggle">
        <span class="toggle-icon">▶</span>
        <span class="label">Quick Actions</span>
      </button>
      <div class="grid collapsible" id="qa-grid" style="display: none;">
        <button class="btn" id="qa-explain">Explain Selection</button>
        <button class="btn" id="qa-readme">README Generator</button>
        <button class="btn" id="qa-brush-simplify">Brush: Simplify</button>
        <button class="btn" id="qa-brush-types">Brush: Add Types</button>
        <button class="btn" id="qa-brush-optimize">Brush: Optimize</button>
        <button class="btn" id="qa-edit">Inline Edit…</button>
        <button class="btn" id="qa-tests">Generate Tests</button>
        <button class="btn" id="qa-problems">Analyze Problems</button>
        <button class="btn" id="qa-commit">Commit Message</button>
        <button class="btn" id="qa-cmd">Explain Command…</button>
        <button class="btn" id="qa-add-file">Add File Here</button>
        <button class="btn" id="qa-add-file-ai">Add File (AI)</button>
        <button class="btn" id="qa-pr-summary">PR Summary</button>
        <button class="btn" id="qa-pr-review">PR Review</button>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Provider</span>
        <div style="position:relative; min-width: 200px; flex:1;">
          <select id="provider" style="appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:32px; border-radius:999px;">
            <option value="ollama">Ollama (local)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="google">Google (Gemini)</option>
            <option value="other">Other</option>
          </select>
          <span style="position:absolute; right:10px; top:50%; transform: translateY(-50%); font-size:10px; opacity:.8; pointer-events:none;">▼</span>
        </div>
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
  <div class="row"><span class="spacer"></span><button class="btn primary" id="saveConfig">Save Settings</button></div>
    </div>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('open')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'openChatPanel' });
    });

    // History UI state and rendering
    const histToggle = document.getElementById('hist-toggle');
    const histWrap = document.getElementById('hist-wrap');
    const histList = document.getElementById('hist-list');
    document.getElementById('hist-new')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'newThread' });
    });
    histToggle?.addEventListener('click', () => {
      const icon = histToggle.querySelector('.toggle-icon');
      const isHidden = histWrap.style.display === 'none';
      histWrap.style.display = isHidden ? 'block' : 'none';
      if (isHidden) { icon?.classList.add('expanded'); } else { icon?.classList.remove('expanded'); }
    });
    function renderHistory(state) {
      if (!histList) return;
      histList.innerHTML = '';
      const threads = state?.threads || [];
      const currentId = state?.currentId || '';
      if (!threads.length) {
        const empty = document.createElement('div');
        empty.className = 'subtle';
        empty.textContent = 'No conversations yet';
        histList.appendChild(empty);
        return;
      }
      threads.forEach(t => {
        const item = document.createElement('div');
        item.className = 'history-item' + (t.id === currentId ? ' active' : '');
        const titleBtn = document.createElement('button');
        titleBtn.className = 'history-title';
        titleBtn.textContent = t.title || 'New chat';
        titleBtn.title = t.title || 'New chat';
        titleBtn.addEventListener('click', () => vscode.postMessage({ type: 'switchThread', id: t.id }));
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        const del = document.createElement('button');
        del.className = 'btn';
        del.textContent = 'Delete';
        del.addEventListener('click', () => vscode.postMessage({ type: 'deleteThread', id: t.id }));
        actions.appendChild(del);
        item.appendChild(titleBtn);
        item.appendChild(actions);
        histList.appendChild(item);
      });
    }

    // Toggle Quick Actions section
    document.getElementById('qa-toggle')?.addEventListener('click', () => {
      const grid = document.getElementById('qa-grid');
      const icon = document.querySelector('.toggle-icon');
      if (grid && icon) {
        const isHidden = grid.style.display === 'none';
        grid.style.display = isHidden ? 'grid' : 'none';
        if (isHidden) {
          icon.classList.add('expanded');
        } else {
          icon.classList.remove('expanded');
        }
      }
    });

    document.getElementById('qa-explain')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.explainSelection' });
    });
    document.getElementById('qa-readme')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.openReadmeMode' });
    });
    document.getElementById('qa-brush-simplify')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.brush.simplify' });
    });
    document.getElementById('qa-brush-types')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.brush.addTypes' });
    });
    document.getElementById('qa-brush-optimize')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.brush.optimize' });
    });
    document.getElementById('qa-edit')?.addEventListener('click', () => {
      const instr = prompt('Inline edit instruction (e.g., "add docs" or "optimize code")') || '';
      if (instr.trim()) vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.inlineEdit', args: [instr.trim()] });
    });
    document.getElementById('qa-tests')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.generateTests' });
    });
    document.getElementById('qa-problems')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.analyzeProblems' });
    });
    document.getElementById('qa-commit')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.generateCommitMessage' });
    });
    document.getElementById('qa-cmd')?.addEventListener('click', () => {
      const cmd = prompt('Paste a shell command to explain') || '';
      if (cmd.trim()) vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.explainCommand' });
    });
    document.getElementById('qa-add-file')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.addFileHere' });
    });
    document.getElementById('qa-add-file-ai')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.addFileAI' });
    });
    document.getElementById('qa-pr-summary')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.prSummary' });
    });
    document.getElementById('qa-pr-review')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.prReviewComments' });
    });

    function refreshState(s) {
      if (!s) return;
      if (s.provider) document.getElementById('provider').value = s.provider;
      if (typeof s.systemPrompt === 'string') document.getElementById('systemPrompt').value = s.systemPrompt;
      // mode radios
      const modes = document.querySelectorAll('input[name="mode"]');
      modes.forEach((el) => { if (el.value === (s.mode || 'read')) el.checked = true; });
      
      // Only disable save/delete buttons for Ollama, not the input field
      const isOllama = s.provider === 'ollama';
      document.getElementById('saveKey').disabled = isOllama;
      document.getElementById('delKey').disabled = isOllama;
      document.getElementById('keysState').textContent =
        isOllama ? 'No API key required for Ollama (local).' :
        ('Key status: ' + (s.hasProviderKey ? 'Saved' : 'Not set'));
    }

    // Auto-detect provider from API key format
    function detectProvider(apiKey) {
      if (!apiKey) return null;
      if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) return 'openai';
      if (apiKey.startsWith('sk-ant-')) return 'anthropic';
      if (apiKey.startsWith('AIzaSy')) return 'google'; // Gemini
      return 'other';
    }

    // Handle API key paste with auto-detection
    const apiKeyInput = document.getElementById('apiKey');
    apiKeyInput?.addEventListener('paste', (e) => {
      setTimeout(() => {
        const pastedKey = apiKeyInput.value;
        const detectedProvider = detectProvider(pastedKey);
        if (detectedProvider) {
          const providerSelect = document.getElementById('provider');
          if (providerSelect.querySelector(\`option[value="\${detectedProvider}"]\`)) {
            providerSelect.value = detectedProvider;
          }
        }
      }, 10);
    });

    apiKeyInput?.addEventListener('input', (e) => {
      const key = e.target.value;
      if (key.length > 10) {
        const detectedProvider = detectProvider(key);
        if (detectedProvider) {
          const providerSelect = document.getElementById('provider');
          if (providerSelect.querySelector(\`option[value="\${detectedProvider}"]\`)) {
            providerSelect.value = detectedProvider;
          }
        }
      }
    });

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
      const m = document.querySelector('input[name="mode"]:checked');
      const mode = m ? m.value : 'read';
      vscode.postMessage({ type: 'saveConfig', provider, systemPrompt, mode });
    });

    window.addEventListener('message', (ev) => {
      const msg = ev.data || {};
      if (msg.type === 'settings') refreshState(msg);
      if (msg.type === 'threadsState') renderHistory(msg);
      if (msg.type === 'saved' || msg.type === 'deleted') {
        vscode.postMessage({ type: 'requestSettings' });
      }
    });

    vscode.postMessage({ type: 'requestSettings' });
    vscode.postMessage({ type: 'requestThreads' });
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