import * as vscode from 'vscode';
import { OllamaClient } from './ollamaClient.js';
import { OllamaChatViewProvider } from './chatView.js';
import { OllamaChatPanel } from './chatPanel';

let chatProvider: OllamaChatViewProvider | undefined;

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
