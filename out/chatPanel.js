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
exports.OllamaChatPanel = void 0;
const vscode = __importStar(require("vscode"));
class OllamaChatPanel {
    extensionUri;
    client;
    panel;
    pendingPrefill;
    constructor(extensionUri, client) {
        this.extensionUri = extensionUri;
        this.client = client;
    }
    show(column = vscode.ViewColumn.Beside) {
        if (this.panel) {
            this.panel.reveal(column, true);
            if (this.pendingPrefill) {
                this.panel.webview.postMessage({ type: 'prefill', text: this.pendingPrefill });
                this.pendingPrefill = undefined;
            }
            return;
        }
        this.panel = vscode.window.createWebviewPanel('ollamaAgent.chatPanel', 'Ollama Chat', { viewColumn: column, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        this.panel.onDidDispose(() => (this.panel = undefined));
        this.panel.webview.html = this.getHtml(this.panel.webview);
        if (this.pendingPrefill) {
            this.panel.webview.postMessage({ type: 'prefill', text: this.pendingPrefill });
            this.pendingPrefill = undefined;
        }
        this.panel.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.type) {
                case 'requestModels': {
                    try {
                        const models = await this.client.listModels();
                        this.panel?.webview.postMessage({ type: 'models', models });
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: String(e?.message || e) });
                    }
                    break;
                }
                case 'requestConfig': {
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const mode = cfg.get('mode', 'read');
                    this.panel?.webview.postMessage({ type: 'config', mode });
                    break;
                }
                case 'previewEdits': {
                    try {
                        await vscode.commands.executeCommand('ollamaAgent.previewEdits', msg.payload);
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: String(e?.message || e) });
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
                        this.panel?.webview.postMessage({ type: 'chatStart', model: m });
                        try {
                            const onToken = (t) => this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: t });
                            if (useChat) {
                                const messages = [{ role: 'user', content: prompt }];
                                await this.client.chat(m, messages, true, onToken);
                            }
                            else {
                                await this.client.generate(m, prompt, true, onToken);
                            }
                            this.panel?.webview.postMessage({ type: 'chatDone', model: m });
                        }
                        catch (e) {
                            this.panel?.webview.postMessage({ type: 'chatError', model: m, message: String(e?.message || e) });
                        }
                    }
                    break;
                }
                case 'insertText': {
                    const text = msg.text || '';
                    const editor = vscode.window.activeTextEditor;
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const mode = cfg.get('mode', 'read');
                    if (mode !== 'agent') {
                        vscode.window.showInformationMessage('Read mode: editing is disabled. Switch to Agent mode to allow changes.');
                        break;
                    }
                    if (editor && text) {
                        await editor.edit((ed) => ed.insert(editor.selection.active, text));
                    }
                    break;
                }
                case 'applyEdits': {
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const mode = cfg.get('mode', 'read');
                    if (mode !== 'agent') {
                        vscode.window.showInformationMessage('Read mode: editing is disabled. Switch to Agent mode to apply edits.');
                        break;
                    }
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
    prefill(text) {
        if (this.panel) {
            this.panel.webview.postMessage({ type: 'prefill', text });
        }
        else {
            this.pendingPrefill = text;
        }
    }
    getHtml(webview) {
        const nonce = getNonce();
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.js'));
        const cacheBust = String(Date.now());
        const styles = `
      :root { color-scheme: dark; }
      body { font-family: var(--vscode-font-family); margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); display:flex; height:100vh; }
      .panel { display:flex; flex-direction:column; width:100%; }
      .toolbar { display:flex; gap:8px; align-items:center; padding:8px; border-bottom: 1px solid var(--vscode-panel-border); background: var(--vscode-editor-background); position:sticky; top:0; z-index:2; }
      .toolbar .title { font-weight:600; }
      .select { min-width: 220px; }
      .content { flex:1; overflow:auto; padding: 12px; display:flex; flex-direction:column; gap:12px; }
      .composer { display:flex; gap:8px; padding:8px; border-top:1px solid var(--vscode-panel-border); background: var(--vscode-editor-background); }
      .prompt { flex:1; min-height: 64px; resize: vertical; }
      .send { width:auto; }

      /* Chat bubbles */
      .bubble { max-width: 90%; padding:10px 12px; border-radius:10px; line-height:1.4; white-space:pre-wrap; }
      .assistant { background: color-mix(in srgb, var(--vscode-editor-foreground) 10%, transparent); border: 1px solid var(--vscode-input-border); align-self:flex-start; }
      .user { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); align-self:flex-end; }
      .meta { font-size: 11px; opacity: .8; margin-bottom: 4px; }
      .msg { display:flex; flex-direction:column; gap:4px; }
      .code { background: var(--vscode-editor-background); border: 1px solid var(--vscode-input-border); border-radius:6px; padding:8px; font-family: var(--vscode-editor-font-family); overflow:auto; }

      .tag { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-radius: 999px; padding: 2px 8px; font-size: 11px; }
      .spacer { flex:1; }
    `;
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ollama Chat</title>
<style>${styles}</style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}?v=${cacheBust}"></script>
</body>
</html>`;
    }
    isVisible() {
        return !!this.panel && this.panel.visible === true;
    }
    close() {
        this.panel?.dispose();
    }
}
exports.OllamaChatPanel = OllamaChatPanel;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=chatPanel.js.map