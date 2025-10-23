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
const child_process_1 = require("child_process");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
async function promiseWithTimeout(p, ms) {
    return await Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
    ]);
}
let chatProvider;
class EditPreviewProvider {
    _onDidChange = new vscode.EventEmitter();
    onDidChange = this._onDidChange.event;
    store = new Map();
    set(uri, content) {
        this.store.set(uri.toString(), content);
        this._onDidChange.fire(uri);
    }
    provideTextDocumentContent(uri) {
        return this.store.get(uri.toString()) ?? '';
    }
}
function activate(context) {
    const config = vscode.workspace.getConfiguration('ollamaAgent');
    const host = config.get('host', 'localhost');
    const port = config.get('port', 11434);
    const systemPrompt = config.get('systemPrompt', 'You are a helpful coding assistant.');
    const client = new ollamaClient_js_1.OllamaClient(host, port, systemPrompt);
    chatProvider = new chatView_js_1.OllamaChatViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatView_js_1.OllamaChatViewProvider.viewType, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
    }));
    const chatPanel = new chatPanel_1.OllamaChatPanel(context.extensionUri, client);
    // Register preview content provider for diffs
    const previewProvider = new EditPreviewProvider();
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('ollama-edit', previewProvider));
    // Optional inline completions (experimental)
    const enableInline = vscode.workspace.getConfiguration('ollamaAgent').get('enableInlineCompletions', false);
    if (enableInline) {
        let cachedModel;
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file' }, {
            provideInlineCompletionItems: async (doc, pos, ctx, token) => {
                try {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    // Choose a model lazily
                    if (!cachedModel) {
                        const models = await client.listModels();
                        cachedModel = models[0];
                    }
                    if (!cachedModel) {
                        return;
                    }
                    // Gather small context around cursor
                    const range = new vscode.Range(new vscode.Position(Math.max(0, pos.line - 40), 0), pos);
                    const before = doc.getText(range);
                    const lang = doc.languageId;
                    const prompt = `Continue the following ${lang} code. Output only the next completion snippet (<= 80 characters) without newlines if possible, no backticks, no explanations.\n\n${before}`;
                    const p = client.generate(cachedModel, prompt, false);
                    const result = await promiseWithTimeout(p, 1500).catch(() => '');
                    const text = String(result || '').split('\n')[0].slice(0, 80);
                    if (!text.trim()) {
                        return;
                    }
                    const item = { insertText: text };
                    return { items: [item] };
                }
                catch {
                    return;
                }
            }
        }));
    }
    // Generate unit tests for current file
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.generateTests', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Open a source file to generate tests.');
            return;
        }
        const doc = editor.document;
        const code = doc.getText();
        const lang = doc.languageId;
        const baseName = doc.uri.path.split('/').pop() || 'file';
        const ext = baseName.includes('.') ? baseName.split('.').pop() : 'ts';
        const testExt = ext === 'js' ? 'test.js' : ext === 'jsx' ? 'test.jsx' : ext === 'tsx' ? 'test.tsx' : 'test.ts';
        const testName = baseName.replace(/\.[^.]+$/, '') + '.' + testExt;
        const wsRel = vscode.workspace.asRelativePath(doc.uri);
        const instr = `Write unit tests for the following ${lang} code from ${wsRel}. Prefer Jest (and React Testing Library if React). Return ONLY the test file content with no backticks.`;
        const models = await client.listModels();
        const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
        if (!chosen) {
            return;
        }
        let out = '';
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Generating tests with ${chosen}` }, async () => {
            await client.generate(chosen, `${instr}\n\nCODE:\n${code}`, true, (t) => { out += t; });
        });
        const folder = vscode.Uri.joinPath(vscode.Uri.parse(doc.uri.toString()).with({ path: doc.uri.path.replace(/\/[\w.-]+$/, '/') }));
        const testRel = (vscode.workspace.asRelativePath(folder) || '') + testName;
        const payload = { changes: [{ uri: testRel, newText: out, create: true }] };
        await vscode.commands.executeCommand('ollamaAgent.previewEdits', payload);
    }));
    // Generate Conventional Commit message from staged or working diff
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.generateCommitMessage', async () => {
        try {
            const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!cwd) {
                vscode.window.showErrorMessage('Open a git workspace.');
                return;
            }
            let diff = '';
            try {
                diff = (await exec('git diff --cached', { cwd })).stdout;
            }
            catch {
                diff = '';
            }
            if (!diff.trim()) {
                try {
                    diff = (await exec('git diff', { cwd })).stdout;
                }
                catch {
                    diff = '';
                }
            }
            if (!diff.trim()) {
                vscode.window.showInformationMessage('No git changes to summarize.');
                return;
            }
            const models = await client.listModels();
            const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
            if (!chosen) {
                return;
            }
            const prompt = `You are a Conventional Commits assistant. From the git diff below, write a concise commit message with a type (feat, fix, refactor, docs, chore, test), a short imperative subject (max ~72 char), and an optional body with bullets. Output SUBJECT on the first line, then a blank line, then BODY.\n\nDIFF:\n${diff}`;
            let msg = '';
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating commit message' }, async () => {
                await client.generate(chosen, prompt, true, (t) => { msg += t; });
            });
            msg = msg.trim();
            await vscode.env.clipboard.writeText(msg);
            vscode.window.showInformationMessage('Commit message copied to clipboard.', 'Open SCM').then((choice) => {
                if (choice === 'Open SCM') {
                    vscode.commands.executeCommand('workbench.view.scm');
                }
            });
        }
        catch (e) {
            vscode.window.showErrorMessage('Commit message generation failed: ' + String(e?.message || e));
        }
    }));
    // Analyze current file problems and ask AI for fixes
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.analyzeProblems', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to analyze problems.');
            return;
        }
        const doc = editor.document;
        const diags = vscode.languages.getDiagnostics(doc.uri);
        if (!diags.length) {
            vscode.window.showInformationMessage('No problems found in current file.');
            return;
        }
        const summary = diags.slice(0, 50).map(d => `L${d.range.start.line + 1}:${d.range.start.character + 1} ${d.severity}: ${d.message}`).join('\n');
        const pre = `Fix the following problems reported by the linter/TypeScript for ${vscode.workspace.asRelativePath(doc.uri)}. Provide specific code edits.\n\nPROBLEMS:\n${summary}\n\nCODE:\n`;
        const code = doc.getText();
        chatPanel.prefill(pre + code);
        chatPanel.show(vscode.ViewColumn.Beside);
    }));
    // Explain a shell command (from selection or input)
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.explainCommand', async () => {
        const editor = vscode.window.activeTextEditor;
        const selected = editor?.document.getText(editor.selection) || '';
        const cmd = selected.trim() || await vscode.window.showInputBox({ placeHolder: 'Enter a shell command to explain' });
        if (!cmd) {
            return;
        }
        chatPanel.prefill(`Explain what this shell command does, step by step, including flags and potential risks:\n\n${cmd}`);
        chatPanel.show(vscode.ViewColumn.Beside);
    }));
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.chat', async () => {
        if (chatPanel.isVisible()) {
            chatPanel.close();
        }
        else {
            chatPanel.show(vscode.ViewColumn.Beside);
        }
    }));
    // Preview edits before applying: opens diffs for each file and offers Apply/Discard
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.previewEdits', async (payload) => {
        if (!payload || !Array.isArray(payload.changes)) {
            vscode.window.showWarningMessage('No edits to preview.');
            return;
        }
        const byFile = new Map();
        for (const ch of payload.changes) {
            if (!ch || !ch.uri) {
                continue;
            }
            const arr = byFile.get(ch.uri) || [];
            arr.push(ch);
            byFile.set(ch.uri, arr);
        }
        const sessionId = String(Date.now());
        const openDiffs = [];
        for (const [uriStr, changes] of byFile.entries()) {
            const fileUri = vscode.Uri.parse(uriStr);
            // read original content if exists
            let original = '';
            try {
                const data = await vscode.workspace.fs.readFile(fileUri);
                original = Buffer.from(data).toString('utf8');
            }
            catch {
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
        const choice = await vscode.window.showInformationMessage(`Previewing ${byFile.size} file${byFile.size === 1 ? '' : 's'} to edit.`, { modal: false }, 'Apply All', 'Discard');
        if (choice === 'Apply All') {
            await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', payload);
        }
        else if (choice === 'Discard') {
            // no-op; diffs remain open for review
        }
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
        chatPanel.prefill(`Please help with this code:\n\n${selection}`);
        chatPanel.show(vscode.ViewColumn.Beside);
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
    // Inline edit: rewrite the current selection or file by instruction and preview a diff
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.inlineEdit', async (instructionArg) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Open a file to edit.');
            return;
        }
        const instruction = instructionArg || await vscode.window.showInputBox({
            placeHolder: 'Describe how to change the selected code (e.g., "convert to async/await")',
            prompt: 'Inline Edit with AI',
        });
        if (!instruction) {
            return;
        }
        const models = await client.listModels();
        const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
        if (!chosen) {
            return;
        }
        const sel = editor.selection;
        const hasSelection = !sel.isEmpty;
        const original = hasSelection ? editor.document.getText(sel) : editor.document.getText();
        const fileLang = editor.document.languageId;
        const sys = `You are a precise code refactoring engine. Apply the user's instruction to the provided code. Output ONLY the updated code with no backticks and no explanation. Preserve formatting when possible. Language: ${fileLang}.`;
        const prompt = `${sys}\n\nInstruction:\n${instruction}\n\nCode:\n${original}`;
        let result = '';
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Applying edit with ${chosen}` }, async () => {
            await client.generate(chosen, prompt, true, (t) => { result += t; });
        });
        // Build a WorkspaceEdit-style payload and open preview
        const uriStr = editor.document.uri.toString();
        const payload = { changes: [] };
        if (hasSelection) {
            payload.changes.push({
                uri: uriStr,
                range: {
                    start: { line: sel.start.line, character: sel.start.character },
                    end: { line: sel.end.line, character: sel.end.character },
                },
                newText: result,
            });
        }
        else {
            payload.changes.push({ uri: uriStr, newText: result });
        }
        await vscode.commands.executeCommand('ollamaAgent.previewEdits', payload);
    }));
    // Explain selection: stream explanation into the chat panel
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.explainSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file and select code to explain.');
            return;
        }
        const selection = editor.document.getText(editor.selection) || editor.document.getText();
        const pre = `Explain this code clearly and concisely. Include what it does, complexity, and potential pitfalls.\n\n`;
        chatPanel.prefill(pre + selection);
        chatPanel.show(vscode.ViewColumn.Beside);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.applyWorkspaceEdit', async (payload) => {
        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
        const mode = cfg.get('mode', 'read');
        if (mode !== 'agent') {
            vscode.window.showInformationMessage('Read mode: editing is disabled. Switch to Agent mode to apply edits.');
            return;
        }
        // payload: { changes: Array<{ uri: string, range?: { start: {line:number, character:number}, end:{line:number, character:number}}, newText?: string, create?: boolean }> }
        if (!payload || !Array.isArray(payload.changes)) {
            return;
        }
        const wsFolder = vscode.workspace.workspaceFolders?.[0];
        function resolveUri(u) {
            try {
                const parsed = vscode.Uri.parse(u);
                if (parsed.scheme) {
                    return parsed;
                }
            }
            catch { }
            if (wsFolder) {
                return vscode.Uri.joinPath(wsFolder.uri, u.replace(/^\/+/, ''));
            }
            return vscode.Uri.file(u);
        }
        const we = new vscode.WorkspaceEdit();
        for (const change of payload.changes) {
            const uri = resolveUri(change.uri);
            if (change.create) {
                we.createFile(uri, { ignoreIfExists: true });
            }
            if (typeof change.newText === 'string') {
                if (change.range) {
                    const r = new vscode.Range(new vscode.Position(change.range.start.line, change.range.start.character), new vscode.Position(change.range.end.line, change.range.end.character));
                    we.replace(uri, r, change.newText);
                }
                else {
                    // Replace entire file if range not provided
                    try {
                        const data = await vscode.workspace.fs.readFile(uri);
                        const content = Buffer.from(data).toString('utf8');
                        const lines = content.split(/\r?\n/);
                        const end = new vscode.Position(Math.max(0, lines.length - 1), Math.max(0, (lines[lines.length - 1] || '').length));
                        const full = new vscode.Range(new vscode.Position(0, 0), end);
                        we.replace(uri, full, change.newText);
                    }
                    catch {
                        // If file doesn't exist, create and insert
                        we.createFile(uri, { ignoreIfExists: true });
                        we.insert(uri, new vscode.Position(0, 0), change.newText);
                    }
                }
            }
        }
        await vscode.workspace.applyEdit(we);
    }));
}
function deactivate() { }
function applyChangesToContent(original, changes) {
    // apply range-based or full replacements; handle create/newText with no range
    // Normalize line endings to \n
    let text = original.replace(/\r\n/g, '\n');
    const withRanges = changes.filter((c) => c && typeof c.newText === 'string' && c.range);
    const withoutRanges = changes.filter((c) => c && typeof c.newText === 'string' && !c.range);
    if (withRanges.length > 0) {
        // convert ranges to offsets and apply from end to start
        const lines = text.split('\n');
        function off(pos) {
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
    }
    else if (withoutRanges.length > 0) {
        // if no ranges specified, take the first and replace whole file
        text = String(withoutRanges[0].newText);
    }
    return text;
}
//# sourceMappingURL=extension.js.map