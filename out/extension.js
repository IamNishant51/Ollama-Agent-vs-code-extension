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
const indexer_1 = require("./indexer");
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
    // Create status bar item for quick access (like Copilot)
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ollamaAgent.chat';
    statusBarItem.text = '$(comment-discussion) Ollama';
    statusBarItem.tooltip = 'Open Ollama Agent Chat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    chatProvider = new chatView_js_1.OllamaChatViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatView_js_1.OllamaChatViewProvider.viewType, chatProvider, {
        webviewOptions: { retainContextWhenHidden: true }
    }));
    const chatPanel = new chatPanel_1.OllamaChatPanel(context.extensionUri, client);
    // Shared in-memory store for chat history across views (persisted in globalState)
    let latestThreadsState = context.globalState.get('ollamaAgent.threadsState');
    // Build initial project index in background
    const enableIndex = vscode.workspace.getConfiguration('ollamaAgent').get('enableProjectIndex', true);
    if (enableIndex && vscode.workspace.workspaceFolders?.length) {
        indexer_1.ProjectIndexer.build().then(() => {
            console.log('[ollama-agent] ' + indexer_1.ProjectIndexer.getStats());
        });
    }
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
    // Explain on hover (experimental)
    const enableHover = vscode.workspace.getConfiguration('ollamaAgent').get('enableExplainOnHover', false);
    if (enableHover) {
        context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: 'file' }, {
            async provideHover(doc, pos, token) {
                try {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    const range = doc.getWordRangeAtPosition(pos) || new vscode.Range(pos, pos);
                    const word = doc.getText(range);
                    const contextRange = new vscode.Range(new vscode.Position(Math.max(0, pos.line - 20), 0), new vscode.Position(Math.min(doc.lineCount - 1, pos.line + 20), 0));
                    const around = doc.getText(contextRange).slice(0, 2000);
                    const models = await client.listModels();
                    const model = models[0];
                    if (!model) {
                        return;
                    }
                    const prompt = `Explain the symbol "${word}" in the following code. Be concise (<= 6 lines).\n\n${around}`;
                    const p = client.generate(model, prompt, false);
                    const text = await promiseWithTimeout(p, 1200).catch(() => '');
                    if (!text) {
                        return;
                    }
                    return new vscode.Hover(text.trim());
                }
                catch {
                    return;
                }
            }
        }));
    }
    // Code actions: AI Fix problem for diagnostics
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new (class {
        provideCodeActions(document, range, context) {
            const actions = [];
            for (const diag of context.diagnostics) {
                if (!diag.range.intersection(range)) {
                    continue;
                }
                const action = new vscode.CodeAction('AI: Fix this problem', vscode.CodeActionKind.QuickFix);
                action.command = { command: 'ollamaAgent.fixProblemHere', title: 'AI: Fix this problem', arguments: [document.uri.toString(), diag.range, diag.message] };
                action.diagnostics = [diag];
                action.isPreferred = true;
                actions.push(action);
            }
            return actions;
        }
    })()));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.fixProblemHere', async (uriStr, range, message) => {
        const uri = vscode.Uri.parse(uriStr);
        const doc = await vscode.workspace.openTextDocument(uri);
        const text = doc.getText(range);
        const instruction = `Fix this specific problem reported by the tool: ${message}. Update only the selected code.`;
        // Reuse inlineEdit pipeline
        await vscode.window.showTextDocument(doc);
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        await editor.edit(() => { }); // ensure editor visible
        editor.selection = new vscode.Selection(range.start, range.end);
        await vscode.commands.executeCommand('ollamaAgent.inlineEdit', instruction);
    }));
    // Docstring completion (experimental): when starting '/**', offer JSDoc generated by AI
    const enableDocStrings = vscode.workspace.getConfiguration('ollamaAgent').get('enableDocstringCompletion', false);
    if (enableDocStrings) {
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ scheme: 'file' }], {
            async provideCompletionItems(doc, pos, token, ctx) {
                try {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    const line = doc.lineAt(pos.line).text.substring(0, pos.character);
                    // Trigger when the user starts a JSDoc block comment like "/**"
                    // Regex: match a literal "/**" possibly followed by spaces at end of the current line
                    if (!/\/\*\*\s*$/.test(line)) {
                        return;
                    }
                    // capture next ~30 lines as target function/class context
                    const after = doc.getText(new vscode.Range(pos, new vscode.Position(Math.min(doc.lineCount - 1, pos.line + 30), 0))).slice(0, 2000);
                    const models = await client.listModels();
                    const model = models[0];
                    if (!model) {
                        return;
                    }
                    const prompt = `Write a JSDoc-style docstring for the following code. Output only the comment block starting with /** and ending with */.\n\n${after}`;
                    const p = client.generate(model, prompt, false);
                    const out = String(await promiseWithTimeout(p, 1800).catch(() => ''));
                    if (!out.trim().startsWith('/**')) {
                        return;
                    }
                    const item = new vscode.CompletionItem('AI Docstring', vscode.CompletionItemKind.Snippet);
                    item.insertText = out.trim();
                    item.detail = 'Ollama Agent';
                    item.preselect = true;
                    return [item];
                }
                catch {
                    return;
                }
            }
        }, '*', '/'));
    }
    // Extract Function
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.extractFunction', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (editor.selection.isEmpty) {
            vscode.window.showInformationMessage('Select code to extract.');
            return;
        }
        const name = await vscode.window.showInputBox({ placeHolder: 'Function name (e.g., computeTotal)' });
        if (!name) {
            return;
        }
        const instruction = `Extract the selected code into a new function named ${name}. Replace the selection with a call to ${name}. Ensure imports/types and return values are correct.`;
        await vscode.commands.executeCommand('ollamaAgent.inlineEdit', instruction);
    }));
    // Translate Selection
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.translateSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (editor.selection.isEmpty) {
            vscode.window.showInformationMessage('Select text to translate.');
            return;
        }
        const lang = await vscode.window.showQuickPick(['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Portuguese', 'Russian'], { placeHolder: 'Translate selection to…' });
        if (!lang) {
            return;
        }
        const instruction = `Translate the selected text into ${lang}. Return only the translated text, preserving code blocks and not altering identifiers.`;
        await vscode.commands.executeCommand('ollamaAgent.inlineEdit', instruction);
    }));
    // Generate README from project index
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.generateReadme', async () => {
        try {
            const ws = vscode.workspace.workspaceFolders?.[0];
            if (!ws) {
                vscode.window.showErrorMessage('Open a workspace to generate README.');
                return;
            }
            // Build a deeper snapshot using chat panel helper-equivalent logic
            // Fallback to indexer summary for stats
            await indexer_1.ProjectIndexer.build(2000, 200);
            const stats = indexer_1.ProjectIndexer.getStats();
            const snapshot = indexer_1.ProjectIndexer.summary(true).slice(0, 70000);
            const models = await client.listModels();
            const model = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
            if (!model) {
                return;
            }
            const style = await vscode.window.showQuickPick(['General', 'Technical (Functionality/API)', 'Product/Showcase', 'Library/Package', 'CLI Tool', 'Backend Service'], { placeHolder: 'README style' }) || 'General';
            const placement = await vscode.window.showQuickPick(['GitHub', 'VS Code Marketplace', 'Internal Wiki', 'Website'], { placeHolder: 'Target placement' }) || 'GitHub';
            const notes = await vscode.window.showInputBox({ placeHolder: 'Additional notes to emphasize (optional)' }) || '';
            const prompt = `You are generating a complete README.md for this repository.\nRules:\n- Output ONLY Markdown. No meta commentary.\n- Tailor for ${placement}. Style: ${style}.\n- Include: Title, Overview, Features, Installation, Setup (env vars), Scripts, Usage examples, Configuration, Development, Testing, Troubleshooting.\n- Use fenced code blocks for commands. Use relative file links. Infer missing details.\n${notes ? `- Additional notes: ${notes}` : ''}\n\nREPO STATS:\n${stats}\n\nREPO SNAPSHOT (truncated):\n${snapshot}`;
            let out = '';
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating README' }, async () => {
                await client.generate(model, prompt, true, (t) => { out += t; });
            });
            const readmeUri = vscode.Uri.joinPath(ws.uri, 'README.md');
            let original = '';
            try {
                original = Buffer.from(await vscode.workspace.fs.readFile(readmeUri)).toString('utf8');
            }
            catch {
                original = '';
            }
            const payload = { changes: [{ uri: readmeUri.toString(), newText: out }] };
            await vscode.commands.executeCommand('ollamaAgent.previewEdits', payload);
        }
        catch (e) {
            vscode.window.showErrorMessage('Failed to generate README: ' + String(e?.message || e));
        }
    }));
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
    // CodeLens provider for inline brushes
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: 'file' }, new (class {
        onDidChangeCodeLenses;
        provideCodeLenses(document, _token) {
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
            const lenses = [];
            lenses.push(new vscode.CodeLens(range, { title: 'AI: Simplify', command: 'ollamaAgent.brush.simplify' }));
            lenses.push(new vscode.CodeLens(range, { title: 'AI: Add Types', command: 'ollamaAgent.brush.addTypes' }));
            lenses.push(new vscode.CodeLens(range, { title: 'AI: Optimize', command: 'ollamaAgent.brush.optimize' }));
            return lenses;
        }
    })()));
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
    // Add file near current file
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.addFileHere', async () => {
        const editor = vscode.window.activeTextEditor;
        const ws = vscode.workspace.workspaceFolders?.[0];
        if (!editor && !ws) {
            vscode.window.showErrorMessage('Open a file or a workspace first.');
            return;
        }
        const baseDir = editor ? vscode.Uri.joinPath(editor.document.uri, '..') : ws.uri;
        const relBase = vscode.workspace.asRelativePath(baseDir) || '';
        const suggested = relBase && relBase !== '.' ? relBase + '/new-file.ts' : 'new-file.ts';
        const relPath = await vscode.window.showInputBox({ placeHolder: 'path/to/file.ext', value: suggested, title: 'New file path (relative to workspace)' });
        if (!relPath) {
            return;
        }
        const target = vscode.Uri.joinPath(ws?.uri ?? baseDir, relPath.replace(/^\/+/, ''));
        await vscode.workspace.fs.writeFile(target, Buffer.from(''));
        const doc = await vscode.workspace.openTextDocument(target);
        await vscode.window.showTextDocument(doc, { preview: false });
    }));
    // Add file with AI-generated content
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.addFileAI', async () => {
        const editor = vscode.window.activeTextEditor;
        const ws = vscode.workspace.workspaceFolders?.[0];
        if (!editor && !ws) {
            vscode.window.showErrorMessage('Open a file or a workspace first.');
            return;
        }
        const baseDir = editor ? vscode.Uri.joinPath(editor.document.uri, '..') : ws.uri;
        const relBase = vscode.workspace.asRelativePath(baseDir) || '';
        const suggested = relBase && relBase !== '.' ? relBase + '/new-file.ts' : 'new-file.ts';
        const relPath = await vscode.window.showInputBox({ placeHolder: 'path/to/file.ext', value: suggested, title: 'New file path (relative to workspace)' });
        if (!relPath) {
            return;
        }
        const description = await vscode.window.showInputBox({ placeHolder: 'Describe contents (e.g., a React component, an Express route, etc.)', title: 'Describe new file' });
        if (description === undefined) {
            return;
        }
        const models = await client.listModels();
        const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
        if (!chosen) {
            return;
        }
        const ext = relPath.split('.').pop() || '';
        const prompt = `Create a complete ${ext.toUpperCase()} source file based on this description. Output ONLY the file content with no backticks.\n\nDescription:\n${description}`;
        let out = '';
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating file content' }, async () => {
            await client.generate(chosen, prompt, true, (t) => { out += t; });
        });
        const target = vscode.Uri.joinPath(ws?.uri ?? baseDir, relPath.replace(/^\/+/, ''));
        await vscode.workspace.fs.writeFile(target, Buffer.from(out, 'utf8'));
        const doc = await vscode.workspace.openTextDocument(target);
        await vscode.window.showTextDocument(doc, { preview: false });
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
    // Project Index commands
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.indexProject', async () => {
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Building project index…' }, async () => {
            await indexer_1.ProjectIndexer.build();
        });
        vscode.window.showInformationMessage(indexer_1.ProjectIndexer.getStats());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.showIndexStats', async () => {
        vscode.window.showInformationMessage(indexer_1.ProjectIndexer.getStats());
    }));
    // Brushes
    const runBrush = async (instruction) => {
        await vscode.commands.executeCommand('ollamaAgent.inlineEdit', instruction);
    };
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.brush.simplify', () => runBrush('Simplify the selected code while preserving behavior.')), vscode.commands.registerCommand('ollamaAgent.brush.addTypes', () => runBrush('Add comprehensive static types and JSDoc/TS types to the selected code.')), vscode.commands.registerCommand('ollamaAgent.brush.optimize', () => runBrush('Optimize performance and memory usage of the selected code without changing external behavior.')));
    // PR helpers
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.prSummary', async () => {
        try {
            const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!cwd) {
                vscode.window.showErrorMessage('Open a git workspace.');
                return;
            }
            let diff = '';
            try {
                diff = (await exec('git --no-pager diff --cached', { cwd })).stdout;
            }
            catch { }
            if (!diff.trim()) {
                try {
                    diff = (await exec('git --no-pager diff', { cwd })).stdout;
                }
                catch { }
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
            const prompt = `Summarize the following git diff as a PR description. Include an overview, key changes, risks, and testing notes. Be concise.\n\n${diff.slice(0, 200000)}`;
            let out = '';
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating PR summary' }, async () => {
                await client.generate(chosen, prompt, true, (t) => { out += t; });
            });
            const doc = await vscode.workspace.openTextDocument({ content: out.trim(), language: 'markdown' });
            await vscode.window.showTextDocument(doc, { preview: false });
        }
        catch (e) {
            vscode.window.showErrorMessage('PR summary failed: ' + String(e?.message || e));
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.prReviewComments', async () => {
        try {
            const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!cwd) {
                vscode.window.showErrorMessage('Open a git workspace.');
                return;
            }
            let diff = '';
            try {
                diff = (await exec('git --no-pager diff --cached', { cwd })).stdout;
            }
            catch { }
            if (!diff.trim()) {
                try {
                    diff = (await exec('git --no-pager diff', { cwd })).stdout;
                }
                catch { }
            }
            if (!diff.trim()) {
                vscode.window.showInformationMessage('No git changes to review.');
                return;
            }
            const models = await client.listModels();
            const chosen = await vscode.window.showQuickPick(models, { placeHolder: 'Select a model' });
            if (!chosen) {
                return;
            }
            const prompt = `From the git diff below, generate actionable code review comments. Prefer line-anchored notes (filename:line) with suggestions. Group by file.\n\n${diff.slice(0, 200000)}`;
            let out = '';
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating review comments' }, async () => {
                await client.generate(chosen, prompt, true, (t) => { out += t; });
            });
            const doc = await vscode.workspace.openTextDocument({ content: out.trim(), language: 'markdown' });
            await vscode.window.showTextDocument(doc, { preview: false });
        }
        catch (e) {
            vscode.window.showErrorMessage('PR review failed: ' + String(e?.message || e));
        }
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
            // Push saved threads/settings to chat panel immediately after opening
            try {
                if (!latestThreadsState) {
                    latestThreadsState = context.globalState.get('ollamaAgent.threadsState');
                }
                if (latestThreadsState) {
                    chatPanel.postMessage({ type: 'threadsState', ...latestThreadsState });
                }
            }
            catch { }
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
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.openReadmeMode', async () => {
        chatPanel.show(vscode.ViewColumn.Beside);
        chatPanel.openReadmeGenerator();
    }));
    // Relay thread updates from the chat webview to the left view and persist
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.threadsUpdate', async (payload) => {
        try {
            latestThreadsState = {
                threads: payload?.threads || [],
                currentId: payload?.currentId || '',
                historyOpen: payload?.historyOpen,
                autoHideHistory: payload?.autoHideHistory,
                compactTables: payload?.compactTables,
                stripedTables: payload?.stripedTables,
            };
            await context.globalState.update('ollamaAgent.threadsState', latestThreadsState);
            // push to left panel if visible
            try {
                chatProvider?.postMessage?.({ type: 'threadsState', ...latestThreadsState });
            }
            catch { }
            // also push to chat panel webview if visible
            try {
                chatPanel.postMessage({ type: 'threadsState', ...(latestThreadsState || { threads: [], currentId: '' }) });
            }
            catch { }
        }
        catch { }
    }));
    // Left panel requests current threads
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.requestThreads', async () => {
        if (!latestThreadsState) {
            latestThreadsState = context.globalState.get('ollamaAgent.threadsState');
        }
        const payload = latestThreadsState || { threads: [], currentId: '' };
        try {
            chatProvider?.postMessage?.({ type: 'threadsState', ...payload });
        }
        catch { }
        try {
            chatPanel.postMessage({ type: 'threadsState', ...payload });
        }
        catch { }
    }));
    // Actions from left view to control chat webview threads
    context.subscriptions.push(vscode.commands.registerCommand('ollamaAgent.switchThread', async (id) => {
        chatPanel.show(vscode.ViewColumn.Beside);
        chatPanel.postMessage({ type: 'switchThread', id });
    }), vscode.commands.registerCommand('ollamaAgent.deleteThread', async (id) => {
        chatPanel.show(vscode.ViewColumn.Beside);
        chatPanel.postMessage({ type: 'deleteThread', id });
    }), vscode.commands.registerCommand('ollamaAgent.newChatThread', async () => {
        chatPanel.show(vscode.ViewColumn.Beside);
        chatPanel.postMessage({ type: 'newThread' });
    }));
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
        try {
            // Notify chat webview to conclude the apply overlay lifecycle
            chatPanel.postMessage({ type: 'agentActivity', id: `saved-${Date.now()}`, text: 'Saved changes' });
        }
        catch { }
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