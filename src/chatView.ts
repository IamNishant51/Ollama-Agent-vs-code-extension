import * as vscode from 'vscode';
import { OllamaClient, OllamaMessage } from './ollamaClient';

export class OllamaChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ollamaAgent.chatView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private readonly client: OllamaClient) {}

  reveal() {
    this._view?.show?.(true);
  }

  prefill(text: string) {
    this._view?.webview.postMessage({ type: 'prefill', text });
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
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
          } catch (e: any) {
            webview.postMessage({ type: 'error', message: String(e?.message || e) });
          }
          break;
        }
        case 'startChat': {
          const models: string[] = msg.models || [];
          const prompt: string = msg.prompt || '';
          const useChat: boolean = !!msg.useChat;
          if (!models.length || !prompt) {
            return;
          }
          for (const m of models) {
            webview.postMessage({ type: 'chatStart', model: m });
            try {
              const onToken = (t: string) => webview.postMessage({ type: 'chatChunk', model: m, text: t });
              if (useChat) {
                const messages: OllamaMessage[] = [{ role: 'user', content: prompt }];
                await this.client.chat(m, messages, true, onToken);
              } else {
                await this.client.generate(m, prompt, true, onToken);
              }
              webview.postMessage({ type: 'chatDone', model: m });
            } catch (e: any) {
              webview.postMessage({ type: 'chatError', model: m, message: String(e?.message || e) });
            }
          }
          break;
        }
        case 'insertText': {
          const text: string = msg.text || '';
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
          } catch (e) {
            vscode.window.showErrorMessage('Failed to open file');
          }
          break;
        }
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    const styles = `
      :root { color-scheme: dark; }
      body { font-family: var(--vscode-font-family); margin: 0; color: var(--vscode-foreground); background: var(--vscode-sideBar-background); height:100vh; display:flex; }
      .panel { display:flex; flex-direction:column; width:100%; }
      .toolbar { display:flex; gap:8px; align-items:center; padding:8px; border-bottom: 1px solid var(--vscode-panel-border); background: var(--vscode-sideBar-background); position:sticky; top:0; z-index:2; }
      .title { font-weight:600; }
      .select { min-width: 220px; }
      .content { flex:1; overflow:auto; padding: 12px; display:flex; flex-direction:column; gap:12px; }
      .composer { display:flex; gap:8px; padding:8px; border-top:1px solid var(--vscode-panel-border); background: var(--vscode-sideBar-background); }
      .prompt { flex:1; min-height: 64px; resize: vertical; width:100%; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 6px; }
      .send { width:auto; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius:4px; padding:6px 10px; cursor: pointer; }
      .send:hover { background: var(--vscode-button-hoverBackground); }
      select { background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 6px; }

      .bubble { max-width: 90%; padding:10px 12px; border-radius:10px; line-height:1.4; white-space:pre-wrap; }
      .assistant { background: color-mix(in srgb, var(--vscode-editor-foreground) 10%, transparent); border: 1px solid var(--vscode-input-border); align-self:flex-start; }
      .user { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); align-self:flex-end; }
      .meta { font-size: 11px; opacity: .8; margin-bottom: 4px; }
      .msg { display:flex; flex-direction:column; gap:4px; }
      .tag { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-radius: 999px; padding: 2px 8px; font-size: 11px; }
      .spacer { flex:1; }
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
  <div class="panel">
    <div class="toolbar">
      <span class="title">Ollama</span>
      <select id="models" class="select" multiple size="1" aria-label="Models"></select>
      <span id="status" class="tag">Ready</span>
      <span class="spacer"></span>
      <label style="display:flex;gap:6px;align-items:center;">
        <input type="checkbox" id="useChat" checked /> Chat API
      </label>
    </div>
    <div id="chat" class="content" aria-live="polite"></div>
    <div class="composer">
      <textarea id="prompt" class="prompt" placeholder="Ask anything about your codebase..."></textarea>
      <button id="send" class="send">Send</button>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
  const modelsEl = document.getElementById('models');
  const promptEl = document.getElementById('prompt');
  const chatEl = document.getElementById('chat');
  const sendBtn = document.getElementById('send');
  const useChatEl = document.getElementById('useChat');
  const statusEl = document.getElementById('status');

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
      let lastAssistant;
      if (msg.type === 'chatStart') {
        statusEl.textContent = 'Streaming';
        const wrap = document.createElement('div');
        wrap.className = 'msg';
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = msg.model;
        const bubble = document.createElement('div');
        bubble.className = 'bubble assistant';
        wrap.appendChild(meta);
        wrap.appendChild(bubble);
        chatEl.appendChild(wrap);
        lastAssistant = bubble;
      }
      if (msg.type === 'chatChunk') {
        if (!lastAssistant) {
          const bubble = document.createElement('div');
          bubble.className = 'bubble assistant';
          chatEl.appendChild(bubble);
          lastAssistant = bubble;
        }
        lastAssistant.textContent += msg.text;
        chatEl.scrollTop = chatEl.scrollHeight;
      }
      if (msg.type === 'chatDone') {
        statusEl.textContent = 'Ready';
      }
      if (msg.type === 'error' || msg.type === 'chatError') {
        statusEl.textContent = 'Error';
        const errWrap = document.createElement('div');
        errWrap.className = 'msg';
        const bubble = document.createElement('div');
        bubble.className = 'bubble assistant';
        bubble.style.color = 'var(--vscode-editorError-foreground)';
        bubble.textContent = 'Error: ' + msg.message;
        errWrap.appendChild(bubble);
        chatEl.appendChild(errWrap);
      }
    });

    function addUserMessage(text) {
      const wrap = document.createElement('div');
      wrap.className = 'msg';
      const bubble = document.createElement('div');
      bubble.className = 'bubble user';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      chatEl.appendChild(wrap);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    function send() {
      const selected = Array.from(modelsEl.selectedOptions).map(o => o.value);
      const prompt = promptEl.value.trim();
      if (!selected.length || !prompt) {
        return;
      }
      addUserMessage(prompt);
      promptEl.value = '';
      vscode.postMessage({ type: 'startChat', models: selected, prompt, useChat: useChatEl.checked });
    }

    sendBtn.addEventListener('click', send);
    promptEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        send();
      }
    });
  </script>
</body>
</html>`;
    return html;
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
