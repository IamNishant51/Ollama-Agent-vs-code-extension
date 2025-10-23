import * as vscode from 'vscode';

export class OllamaChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ollamaAgent.chatView';

  private _view?: vscode.WebviewView;
  private _autoOpenedPanel = false;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  reveal() {
    this._view?.show?.(true);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
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
        case 'runCommand': {
          try {
            const id = String(msg.command || '');
            const args = Array.isArray(msg.args) ? msg.args : msg.arg !== undefined ? [msg.arg] : [];
            if (id) {
              await vscode.commands.executeCommand(id, ...args);
            }
          } catch (e) {}
          break;
        }
        case 'requestSettings': {
          const cfg = vscode.workspace.getConfiguration('ollamaAgent');
          const systemPrompt = cfg.get<string>('systemPrompt', 'You are a helpful coding assistant.');
          const provider = cfg.get<string>('provider', 'ollama');
          const mode = cfg.get<string>('mode', 'read');
          const hasOpenAIKey = !!(await this._context.secrets.get('ollamaAgent.openaiKey'));
          const hasAnthropicKey = !!(await this._context.secrets.get('ollamaAgent.anthropicKey'));
          const hasOtherKey = !!(await this._context.secrets.get('ollamaAgent.otherKey'));
          const hasProviderKey = provider === 'openai' ? hasOpenAIKey : provider === 'anthropic' ? hasAnthropicKey : provider === 'other' ? hasOtherKey : true;
          webview.postMessage({ type: 'settings', systemPrompt, provider, mode, hasProviderKey });
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
          if (mode === 'read' || mode === 'agent') {
            await cfg.update('mode', mode, vscode.ConfigurationTarget.Global);
          }
          webview.postMessage({ type: 'saved', what: 'config' });
          break;
        }
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
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
      <div class="row"><span class="label">Open Chat</span><button class="btn primary" id="open">Open</button></div>
    </div>

    <div class="section">
      <div class="row"><span class="label">Quick Actions</span></div>
      <div class="grid">
        <button class="btn" id="qa-explain">Explain Selection</button>
        <button class="btn" id="qa-edit">Inline Edit…</button>
        <button class="btn" id="qa-tests">Generate Tests</button>
        <button class="btn" id="qa-problems">Analyze Problems</button>
        <button class="btn" id="qa-commit">Commit Message</button>
        <button class="btn" id="qa-cmd">Explain Command…</button>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Provider</span>
        <div style="position:relative; min-width: 200px; flex:1;">
          <select id="provider" style="appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:32px; border-radius:999px;">
            <option value="ollama">Ollama (local)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="other">Other</option>
          </select>
          <span style="position:absolute; right:10px; top:50%; transform: translateY(-50%); font-size:10px; opacity:.8; pointer-events:none;">▼</span>
        </div>
      </div>
      <div class="row">
        <span class="label">Mode</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <label style="display:flex; gap:6px; align-items:center;"><input type="radio" name="mode" value="read" checked> Read (plan only)</label>
          <label style="display:flex; gap:6px; align-items:center;"><input type="radio" name="mode" value="agent"> Agent (auto-apply edits)</label>
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

    document.getElementById('qa-explain')?.addEventListener('click', () => {
      vscode.postMessage({ type: 'runCommand', command: 'ollamaAgent.explainSelection' });
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

    function refreshState(s) {
      if (!s) return;
      if (s.provider) document.getElementById('provider').value = s.provider;
      if (typeof s.systemPrompt === 'string') document.getElementById('systemPrompt').value = s.systemPrompt;
      // mode radios
      const modes = document.querySelectorAll('input[name="mode"]');
      modes.forEach((el) => { if (el.value === (s.mode || 'read')) el.checked = true; });
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
      const m = document.querySelector('input[name="mode"]:checked');
      const mode = m ? m.value : 'read';
      vscode.postMessage({ type: 'saveConfig', provider, systemPrompt, mode });
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

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
