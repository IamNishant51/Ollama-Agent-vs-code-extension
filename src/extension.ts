import * as vscode from 'vscode';
import { OllamaClient } from './ollamaClient.js';
import { OllamaChatViewProvider } from './chatView.js';
import { OllamaChatPanel } from './chatPanel';

let chatProvider: OllamaChatViewProvider | undefined;

class EditPreviewProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this._onDidChange.event;
  private store = new Map<string, string>();

  set(uri: vscode.Uri, content: string) {
    this.store.set(uri.toString(), content);
    this._onDidChange.fire(uri);
  }

  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
    return this.store.get(uri.toString()) ?? '';
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('ollamaAgent');
  const host = config.get<string>('host', 'localhost');
  const port = config.get<number>('port', 11434);
  const systemPrompt = config.get<string>('systemPrompt', 'You are a helpful coding assistant.');

  const client = new OllamaClient(host, port, systemPrompt);

  chatProvider = new OllamaChatViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(OllamaChatViewProvider.viewType, chatProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  const chatPanel = new OllamaChatPanel(context.extensionUri, client);

  // Register preview content provider for diffs
  const previewProvider = new EditPreviewProvider();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('ollama-edit', previewProvider)
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ollamaAgent.chat', async () => {
      if (chatPanel.isVisible()) {
        chatPanel.close();
      } else {
        chatPanel.show(vscode.ViewColumn.Beside);
      }
    })
  );

  // Preview edits before applying: opens diffs for each file and offers Apply/Discard
  context.subscriptions.push(
    vscode.commands.registerCommand('ollamaAgent.previewEdits', async (payload: any) => {
      if (!payload || !Array.isArray(payload.changes)) {
        vscode.window.showWarningMessage('No edits to preview.');
        return;
      }
      const byFile = new Map<string, any[]>();
      for (const ch of payload.changes) {
        if (!ch || !ch.uri) {
          continue;
        }
        const arr = byFile.get(ch.uri) || [];
        arr.push(ch);
        byFile.set(ch.uri, arr);
      }
      const sessionId = String(Date.now());

      const openDiffs: vscode.Uri[] = [];
      for (const [uriStr, changes] of byFile.entries()) {
        const fileUri = vscode.Uri.parse(uriStr);
        // read original content if exists
        let original = '';
        try {
          const data = await vscode.workspace.fs.readFile(fileUri);
          original = Buffer.from(data).toString('utf8');
        } catch {
          original = '';
        }
        const modified = applyChangesToContent(original, changes);
        const left = vscode.Uri.parse(`ollama-edit://preview/original${fileUri.path}?s=${sessionId}`);
        const right = vscode.Uri.parse(`ollama-edit://preview/modified${fileUri.path}?s=${sessionId}`);
        previewProvider.set(left, original);
        previewProvider.set(right, modified);
        await vscode.commands.executeCommand('vscode.diff', left, right, `Preview: ${fileUri.fsPath}`);
        openDiffs.push(right);
      }

      const choice = await vscode.window.showInformationMessage(
        `Previewing ${byFile.size} file${byFile.size === 1 ? '' : 's'} to edit.`,
        { modal: false },
        'Apply All',
        'Discard'
      );
      if (choice === 'Apply All') {
        await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', payload);
      } else if (choice === 'Discard') {
        // no-op; diffs remain open for review
      }
    })
  );

  // Status bar shortcut to open the chat panel on the right
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  item.text = '$(comment-discussion) Ollama';
  item.tooltip = 'Open Ollama Chat';
  item.command = 'ollamaAgent.chat';
  item.show();
  context.subscriptions.push(item);

  // Optional: show a one-time welcome tip to open chat
  const shown = context.globalState.get('ollamaAgent.welcomeShown');
  if (!shown) {
    vscode.window
      .showInformationMessage('Ollama Agent is ready. Open the chat on the right?', 'Open Chat')
      .then((choice) => {
        if (choice === 'Open Chat') {
          vscode.commands.executeCommand('ollamaAgent.chat');
        }
      });
    context.globalState.update('ollamaAgent.welcomeShown', true);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('ollamaAgent.askSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('Open a file and select code to ask about.');
        return;
      }
      const selection = editor.document.getText(editor.selection) || editor.document.getText();
      chatPanel.prefill(`Please help with this code:\n\n${selection}`);
      chatPanel.show(vscode.ViewColumn.Beside);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ollamaAgent.generateCode', async () => {
      const prompt = await vscode.window.showInputBox({ placeHolder: 'Describe the code to generate' });
      if (!prompt) {
        return;
      }
      const models = await client.listModels();
      const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
      if (!chosen) {
        return;
      }
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor to insert code.');
        return;
      }
      const chunks: string[] = [];
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Generating with ${chosen}` },
        async () => {
          await client.generate(chosen, prompt, true, (t: string) => chunks.push(t));
        }
      );
      await editor.edit((edit) => {
        edit.insert(editor.selection.active, chunks.join(''));
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ollamaAgent.applyWorkspaceEdit', async (payload: any) => {
      // payload: { changes: Array<{ uri: string, range?: { start: {line:number, character:number}, end:{line:number, character:number}}, newText?: string, create?: boolean }> }
      if (!payload || !Array.isArray(payload.changes)) {
        return;
      }
      const we = new vscode.WorkspaceEdit();
      for (const change of payload.changes) {
        const uri = vscode.Uri.parse(change.uri);
        if (change.create) {
          we.createFile(uri, { ignoreIfExists: true });
        }
        if (typeof change.newText === 'string') {
          if (change.range) {
            const r = new vscode.Range(
              new vscode.Position(change.range.start.line, change.range.start.character),
              new vscode.Position(change.range.end.line, change.range.end.character)
            );
            we.replace(uri, r, change.newText);
          } else {
            we.insert(uri, new vscode.Position(0, 0), change.newText);
          }
        }
      }
      await vscode.workspace.applyEdit(we);
    })
  );
}

export function deactivate() {}

function applyChangesToContent(original: string, changes: any[]): string {
  // apply range-based or full replacements; handle create/newText with no range
  // Normalize line endings to \n
  let text = original.replace(/\r\n/g, '\n');
  const withRanges = changes.filter((c) => c && typeof c.newText === 'string' && c.range);
  const withoutRanges = changes.filter((c) => c && typeof c.newText === 'string' && !c.range);
  if (withRanges.length > 0) {
    // convert ranges to offsets and apply from end to start
    const lines = text.split('\n');
    function off(pos: { line: number; character: number }) {
      let o = 0;
      for (let i = 0; i < pos.line; i++) {
        o += (lines[i] ?? '').length + 1; // +1 for \n
      }
      return o + pos.character;
    }
    const edits = withRanges
      .map((c) => {
        const s = off(c.range.start);
        const e = off(c.range.end);
        return { start: Math.max(0, s), end: Math.max(0, e), text: String(c.newText) };
      })
      .sort((a, b) => b.start - a.start);
    for (const ed of edits) {
      const before = text.slice(0, ed.start);
      const after = text.slice(ed.end);
      text = before + ed.text + after;
    }
  } else if (withoutRanges.length > 0) {
    // if no ranges specified, take the first and replace whole file
    text = String(withoutRanges[0].newText);
  }
  return text;
}
