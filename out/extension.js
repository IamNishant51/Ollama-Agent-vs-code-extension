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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollamaClient_js_1 = require("./ollamaClient.js");
const chatView_js_1 = require("./chatView.js");
const chatPanel_1 = require("./chatPanel");
let chatProvider;
function activate(context) {
    const config = vscode.workspace.getConfiguration('ollamaAgent');
    const host = config.get('host', 'localhost');
    const port = config.get('port', 11434);
    const systemPrompt = config.get('systemPrompt', 'You are a helpful coding assistant.');
    const client = new ollamaClient_js_1.OllamaClient(host, port, systemPrompt);
    chatProvider = new chatView_js_1.OllamaChatViewProvider(context.extensionUri, client);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatView_js_1.OllamaChatViewProvider.viewType, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
    }));
    const chatPanel = new chatPanel_1.OllamaChatPanel(context.extensionUri, client);
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.chat', async () => {
        chatPanel.show(vscode.ViewColumn.Beside);
    }));
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
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.askSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file and select code to ask about.');
            return;
        }
        const selection = editor.document.getText(editor.selection) || editor.document.getText();
        chatProvider?.prefill(`Please help with this code:\n\n${selection}`);
        await vscode.commands.executeCommand('workbench.view.extension.ollamaAgent');
        chatProvider?.reveal();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.generateCode', async () => {
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
        const chunks = [];
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Generating with ${chosen}` }, async () => {
            await client.generate(chosen, prompt, true, (t) => chunks.push(t));
        });
        await editor.edit((edit) => {
            edit.insert(editor.selection.active, chunks.join(''));
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.applyWorkspaceEdit', async (payload) => {
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
                    const r = new vscode.Range(new vscode.Position(change.range.start.line, change.range.start.character), new vscode.Position(change.range.end.line, change.range.end.character));
                    we.replace(uri, r, change.newText);
                }
                else {
                    we.insert(uri, new vscode.Position(0, 0), change.newText);
                }
            }
        }
        await vscode.workspace.applyEdit(we);
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map