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

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
