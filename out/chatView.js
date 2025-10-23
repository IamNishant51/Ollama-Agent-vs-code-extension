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
    _extensionUri;
    client;
    static viewType = 'ollamaAgent.chatView';
    _view;
    constructor(_extensionUri, client) {
        this._extensionUri = _extensionUri;
        this.client = client;
    }
    reveal() {
        this._view?.show?.(true);
    }
    prefill(text) {
        this._view?.webview.postMessage({ type: 'prefill', text });
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        const webview = webviewView.webview;
        webview.options = {
            enableScripts: true
        };
        webview.html = this.getHtmlForWebview(webview);
        webview.onDidReceiveMessage(async (msg) => {
            switch (msg.type) {
                case 'requestModels': {
                    try {
                        const models = await this.client.listModels();
                        webview.postMessage({ type: 'models', models });
                    }
                    catch (e) {
                        webview.postMessage({ type: 'error', message: String(e?.message || e) });
                    }
                    break;
                }
                case 'startChat': {
                    const models = msg.models || [];
                    const prompt = msg.prompt || '';
                    const useChat = !!msg.useChat;
                    if (!models.length || !prompt) {
                        return;
                    }
                    for (const m of models) {
                        webview.postMessage({ type: 'chatStart', model: m });
                        try {
                            const onToken = (t) => webview.postMessage({ type: 'chatChunk', model: m, text: t });
                            if (useChat) {
                                const messages = [{ role: 'user', content: prompt }];
                                await this.client.chat(m, messages, true, onToken);
                            }
                            else {
                                await this.client.generate(m, prompt, true, onToken);
                            }
                            webview.postMessage({ type: 'chatDone', model: m });
                        }
                        catch (e) {
                            webview.postMessage({ type: 'chatError', model: m, message: String(e?.message || e) });
                        }
                    }
                    break;
                }
                case 'insertText': {
                    const text = msg.text || '';
                    const editor = vscode.window.activeTextEditor;
                    if (editor && text) {
                        await editor.edit((ed) => ed.insert(editor.selection.active, text));
                    }
                    break;
                }
                case 'applyEdits': {
                    await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', msg.payload);
                    break;
                }
                case 'openFile': {
                    try {
                        const uri = vscode.Uri.parse(msg.uri);
                        const doc = await vscode.workspace.openTextDocument(uri);
                        await vscode.window.showTextDocument(doc, { preview: false });
                    }
                    catch (e) {
                        vscode.window.showErrorMessage('Failed to open file');
                    }
                    break;
                }
            }
        });
    }
    getHtmlForWebview(webview) {
        const nonce = getNonce();
        const styles = `
      :root { color-scheme: dark; }
      body { font-family: var(--vscode-font-family); margin: 0; color: var(--vscode-foreground); background: var(--vscode-sideBar-background); }
      .container { padding: 8px; display: flex; flex-direction: column; gap: 8px; height: 100vh; box-sizing: border-box; }
      .row { display: flex; gap: 8px; align-items: center; }
      select, textarea, button, input { width: 100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 6px; }
      button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
      button:hover { background: var(--vscode-button-hoverBackground); }
      .chat { flex: 1; overflow: auto; border: 1px solid var(--vscode-input-border); border-radius: 6px; padding: 8px; background: var(--vscode-editor-background); }
      .msg { white-space: pre-wrap; font-family: var(--vscode-editor-font-family); }
      .model { opacity: 0.8; font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 6px; }
    `;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ollama Agent</title>
<style>${styles}</style>
</head>
<body>
  <div class="container">
    <div class="row">
      <select id="models" multiple size="4" aria-label="Models"></select>
    </div>
    <div class="row">
      <textarea id="prompt" rows="4" placeholder="Ask something or describe a code change..."></textarea>
    </div>
    <div class="row">
      <button id="send">Send</button>
      <label style="display:flex; gap:6px; align-items:center; width:auto;">
        <input type="checkbox" id="useChat" checked /> Chat API
      </label>
    </div>
    <div id="chat" class="chat" aria-live="polite"></div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const modelsEl = document.getElementById('models');
    const promptEl = document.getElementById('prompt');
    const chatEl = document.getElementById('chat');
    const sendBtn = document.getElementById('send');
    const useChatEl = document.getElementById('useChat');

    vscode.postMessage({ type: 'requestModels' });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'prefill') {
        promptEl.value = msg.text || '';
      }
      if (msg.type === 'models') {
        modelsEl.innerHTML = '';
        (msg.models || []).forEach((m) => {
          const opt = document.createElement('option');
          opt.value = m; opt.textContent = m; modelsEl.appendChild(opt);
        });
      }
      if (msg.type === 'chatStart') {
        const header = document.createElement('div');
        header.className = 'model';
        header.textContent = 'Model: ' + msg.model;
        chatEl.appendChild(header);
      }
      if (msg.type === 'chatChunk') {
        const last = chatEl.lastElementChild;
        let target;
        if (!last || !last.classList.contains('msg')) {
          target = document.createElement('div');
          target.className = 'msg';
          chatEl.appendChild(target);
        } else {
          target = last;
        }
        target.textContent += msg.text;
        chatEl.scrollTop = chatEl.scrollHeight;
      }
      if (msg.type === 'chatDone') {
        const sep = document.createElement('hr');
        chatEl.appendChild(sep);
      }
      if (msg.type === 'error' || msg.type === 'chatError') {
        const err = document.createElement('div');
        err.className = 'msg';
        err.style.color = 'var(--vscode-editorError-foreground)';
        err.textContent = 'Error: ' + msg.message;
        chatEl.appendChild(err);
      }
    });

    sendBtn.addEventListener('click', () => {
      const selected = Array.from(modelsEl.selectedOptions).map(o => o.value);
      const prompt = promptEl.value.trim();
      if (!selected.length || !prompt) {
        return;
      }
      vscode.postMessage({ type: 'startChat', models: selected, prompt, useChat: useChatEl.checked });
    });
  </script>
</body>
</html>`;
        return html;
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