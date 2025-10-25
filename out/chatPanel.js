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
    controller;
    currentModel;
    currentPrompt;
    currentUseChat = true;
    isPaused = false;
    wasStopped = false;
    abortedForTool = false;
    assistantBuffer = '';
    convo = [];
    lastActiveEditor;
    constructor(extensionUri, client) {
        this.extensionUri = extensionUri;
        this.client = client;
        // Track the last active editor
        this.lastActiveEditor = vscode.window.activeTextEditor;
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.lastActiveEditor = editor;
                // Auto-attach new file when switching (like Cursor)
                if (this.panel && this.panel.visible) {
                    this.autoAttachCurrentFile();
                }
            }
        });
    }
    // Allow extension to post messages into the chat webview
    postMessage(msg) {
        this.panel?.webview.postMessage(msg);
    }
    // Automatically attach the currently open file as context (like Cursor)
    autoAttachCurrentFile() {
        const editor = this.lastActiveEditor || vscode.window.activeTextEditor;
        console.log('autoAttachCurrentFile called - editor:', editor?.document.fileName);
        if (!editor) {
            console.log('No editor found, skipping auto-attach');
            return; // No file open, nothing to attach
        }
        const document = editor.document;
        const fileName = vscode.workspace.asRelativePath(document.uri);
        const fileExtension = document.uri.fsPath.split('.').pop() || '';
        console.log('File details - scheme:', document.uri.scheme, 'isUntitled:', document.isUntitled, 'fileName:', fileName);
        // Don't attach if it's an untitled file or output/debug console
        if (document.isUntitled || document.uri.scheme !== 'file') {
            console.log('Skipping non-file or untitled document');
            return;
        }
        console.log('Sending autoAttachFile message for:', fileName);
        // Send the file name to webview to add as attached context
        this.panel?.webview.postMessage({
            type: 'autoAttachFile',
            fileName: fileName,
            fileExtension: fileExtension
        });
    }
    show(column = vscode.ViewColumn.Beside) {
        if (this.panel) {
            this.panel.reveal(column, true);
            if (this.pendingPrefill) {
                this.panel.webview.postMessage({ type: 'prefill', text: this.pendingPrefill });
                this.pendingPrefill = undefined;
            }
            // Auto-attach current file as context
            this.autoAttachCurrentFile();
            return;
        }
        this.panel = vscode.window.createWebviewPanel('ollamaAgent.chatPanel', 'Ollama Chat', { viewColumn: column, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'media'),
                this.extensionUri
            ]
        });
        this.panel.onDidDispose(() => (this.panel = undefined));
        this.panel.webview.html = this.getHtml(this.panel.webview);
        console.log('Webview created, setting up delayed auto-attach');
        if (this.pendingPrefill) {
            this.panel.webview.postMessage({ type: 'prefill', text: this.pendingPrefill });
            this.pendingPrefill = undefined;
        }
        // Auto-attach current file as context after webview is ready
        setTimeout(() => {
            console.log('Delayed auto-attach triggered');
            this.autoAttachCurrentFile();
        }, 500); // Increased delay to ensure webview is ready
        this.panel.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.type) {
                case 'stop': {
                    if (this.controller) {
                        // Abort current generation and prevent resume
                        try {
                            this.controller.abort();
                        }
                        catch { }
                        this.controller = undefined;
                    }
                    // Clear current prompt so resume cannot continue
                    this.currentPrompt = undefined;
                    this.isPaused = false;
                    this.wasStopped = true;
                    // Notify webview that chat is done/stopped
                    this.panel?.webview.postMessage({ type: 'chatDone', model: this.currentModel });
                    break;
                }
                case 'threadsUpdate': {
                    try {
                        // Relay to extension so it can update left view and persist
                        await vscode.commands.executeCommand('ollamaAgent.threadsUpdate', {
                            threads: msg.threads || [],
                            currentId: msg.currentId || ''
                        });
                    }
                    catch { }
                    break;
                }
                case 'startReadme': {
                    try {
                        const model = msg.model || '';
                        const style = msg.style || 'General';
                        const placement = msg.placement || 'GitHub';
                        const notes = msg.notes || '';
                        const deep = !!msg.deep;
                        const chosen = model || (await this.client.listModels())[0];
                        if (!chosen) {
                            this.panel?.webview.postMessage({ type: 'error', message: 'No model available.' });
                            return;
                        }
                        const { stats, snapshot } = await this.collectRepoSnapshot(deep ? 1200000 : 600000);
                        const instr = `You are generating a complete, production-quality README.md for this repository.
Requirements:
- Output ONLY Markdown for README.md. No meta commentary, no caveats, no apologies.
- Tailor the tone and structure for: ${placement}.
- Style: ${style}. Focus on what's most useful for that style.
- Include: Title, Overview, Key Features, Installation, Setup (env vars), Scripts, Usage (commands + examples), Configuration, Development, Testing, Troubleshooting, and optional Roadmap.
- Use fenced code blocks for commands. Use relative links to files (e.g., src/index.ts). Infer sensible defaults if details are missing.
${notes ? `- Additional notes to honor: ${notes}` : ''}

REPO STATS:
${stats}

REPO SNAPSHOT (truncated):
${snapshot}`;
                        const m = chosen;
                        this.panel?.webview.postMessage({ type: 'chatStart', model: m });
                        let out = '';
                        const onToken = (t) => {
                            out += t;
                            this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: t });
                        };
                        await this.client.generate(m, instr, true, onToken);
                        this.panel?.webview.postMessage({ type: 'chatDone', model: m });
                        // Open a preview to apply README.md
                        const ws = vscode.workspace.workspaceFolders?.[0];
                        if (ws) {
                            const readmeRel = 'README.md';
                            const payload = { changes: [{ uri: readmeRel, newText: out }] };
                            await vscode.commands.executeCommand('ollamaAgent.previewEdits', payload);
                        }
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: 'README generation failed: ' + String(e?.message || e) });
                    }
                    break;
                }
                case 'runCommand': {
                    try {
                        const id = String(msg.command || '');
                        const args = Array.isArray(msg.args) ? msg.args : msg.arg !== undefined ? [msg.arg] : [];
                        if (!id) {
                            return;
                        }
                        await vscode.commands.executeCommand(id, ...args);
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: String(e?.message || e) });
                    }
                    break;
                }
                case 'pickFiles': {
                    try {
                        const ws = vscode.workspace.workspaceFolders?.[0];
                        if (!ws) {
                            this.panel?.webview.postMessage({ type: 'error', message: 'No workspace folder open' });
                            break;
                        }
                        // Find all files in workspace (excluding common ignore patterns) - Cursor-style
                        const allFiles = await vscode.workspace.findFiles('**/*', '{**/node_modules/**,**/.git/**,**/dist/**,**/out/**,**/build/**,**/.next/**,**/*.min.*,**/*.lock,**/*.png,**/*.jpg,**/*.jpeg,**/*.gif,**/*.svg,**/*.ico,**/*.pdf,**/*.zip,**/*.jar,**/*.exe}', 500);
                        if (!allFiles || allFiles.length === 0) {
                            this.panel?.webview.postMessage({ type: 'error', message: 'No files found in workspace' });
                            break;
                        }
                        // Convert to relative paths and create quick pick items
                        const items = allFiles.map(uri => {
                            const relativePath = vscode.workspace.asRelativePath(uri);
                            return {
                                label: relativePath,
                                description: uri.fsPath
                            };
                        });
                        // Show quick pick with multi-select (like Cursor)
                        const selected = await vscode.window.showQuickPick(items, {
                            canPickMany: true,
                            placeHolder: 'Select files to add as context (type to filter)',
                            matchOnDescription: true
                        });
                        if (selected && selected.length) {
                            const files = selected.map(item => item.label);
                            this.panel?.webview.postMessage({ type: 'filesPicked', files });
                        }
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: 'File picker failed: ' + String(e?.message || e) });
                    }
                    break;
                }
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
                    const host = cfg.get('host', 'http://localhost');
                    const port = cfg.get('port', 11434);
                    const apiKey = cfg.get('apiKey', '');
                    this.panel?.webview.postMessage({ type: 'config', mode, host, port, apiKey });
                    break;
                }
                case 'updateConfig': {
                    try {
                        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                        // Support both top-level fields and nested { config: { ... } }
                        const payload = typeof msg.config === 'object' && msg.config ? msg.config : msg;
                        if (payload.mode !== undefined) {
                            await cfg.update('mode', payload.mode, vscode.ConfigurationTarget.Global);
                        }
                        if (payload.host !== undefined) {
                            await cfg.update('host', payload.host, vscode.ConfigurationTarget.Global);
                        }
                        if (payload.port !== undefined) {
                            await cfg.update('port', payload.port, vscode.ConfigurationTarget.Global);
                        }
                        if (payload.apiKey !== undefined) {
                            await cfg.update('apiKey', payload.apiKey, vscode.ConfigurationTarget.Global);
                        }
                        // Note: Connection settings will take effect after reloading the window
                        this.panel?.webview.postMessage({ type: 'configSaved' });
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({ type: 'error', message: 'Failed to save settings: ' + String(e?.message || e) });
                    }
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
                    let prompt = msg.prompt || '';
                    const useChat = !!msg.useChat;
                    const attachedFiles = msg.attachedFiles || [];
                    if (!models.length || !prompt) {
                        return;
                    }
                    this.wasStopped = false;
                    // If there are attached files, read them and prepend to the prompt
                    if (attachedFiles.length > 0) {
                        const ws = vscode.workspace.workspaceFolders?.[0];
                        if (ws) {
                            let filesContext = '';
                            for (const fileName of attachedFiles) {
                                try {
                                    // Try to find the file in the workspace
                                    const files = await vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules/**', 5);
                                    if (files.length > 0) {
                                        const doc = await vscode.workspace.openTextDocument(files[0]);
                                        const content = doc.getText();
                                        const relativePath = vscode.workspace.asRelativePath(files[0]);
                                        filesContext += `\n\n<file path="${relativePath}">\n${content}\n</file>\n`;
                                    }
                                }
                                catch (e) {
                                    console.error(`Failed to read attached file ${fileName}:`, e);
                                }
                            }
                            if (filesContext) {
                                prompt = `${filesContext}\n\n${prompt}`;
                            }
                        }
                    }
                    // Slash recipes: quick actions routed to commands
                    const slash = prompt.trim().match(/^\/(\w+)(?:\s+[\s\S]*)?$/i);
                    if (slash) {
                        const cmd = slash[1].toLowerCase();
                        if (cmd === 'explain') {
                            await vscode.commands.executeCommand('ollamaAgent.explainSelection');
                            return;
                        }
                        if (cmd === 'tests' || cmd === 'test') {
                            await vscode.commands.executeCommand('ollamaAgent.generateTests');
                            return;
                        }
                        if (cmd === 'commit') {
                            await vscode.commands.executeCommand('ollamaAgent.generateCommitMessage');
                            return;
                        }
                        if (cmd === 'fix') {
                            await vscode.commands.executeCommand('ollamaAgent.inlineEdit', 'Fix issues and obvious bugs in this code.');
                            return;
                        }
                        if (cmd === 'doc' || cmd === 'docs') {
                            await vscode.commands.executeCommand('ollamaAgent.inlineEdit', 'Add comprehensive docstrings and comments.');
                            return;
                        }
                    }
                    // Only handle the first model for pause/resume tracking
                    const m = models[0];
                    this.currentModel = m;
                    this.currentPrompt = prompt;
                    this.currentUseChat = useChat;
                    this.isPaused = false;
                    this.abortedForTool = false;
                    this.controller?.abort();
                    this.controller = new AbortController();
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const mode = cfg.get('mode', 'read');
                    if (mode === 'agent') {
                        // Quick intent: handle simple direct file operations deterministically
                        // IMPORTANT: Only consider the user's instruction text, not embedded file contents
                        const direct = await this.inferDirectEditsFromPrompt(msg.prompt || '');
                        if (direct) {
                            this.panel?.webview.postMessage({ type: 'chatStart', model: m });
                            this.panel?.webview.postMessage({ type: 'agentActivity', id: `apply-${Date.now()}`, text: `Applying requested changes to ${direct.summary}…` });
                            await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', { changes: direct.changes });
                            // Open the first edited file to show the result
                            const first = direct.changes[0];
                            if (first?.uri) {
                                try {
                                    const ws = vscode.workspace.workspaceFolders?.[0];
                                    let uri = vscode.Uri.parse(first.uri);
                                    if (!uri.scheme && ws) {
                                        uri = vscode.Uri.joinPath(ws.uri, first.uri.replace(/^\/+/, ''));
                                    }
                                    const doc = await vscode.workspace.openTextDocument(uri);
                                    await vscode.window.showTextDocument(doc, { preview: false });
                                }
                                catch { }
                            }
                            // Provide a concise assistant summary to populate the bubble
                            this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: `✅ Applied changes to ${direct.summary}.` });
                            this.panel?.webview.postMessage({ type: 'chatDone', model: m });
                            return;
                        }
                        if (useChat) {
                            await this.runAgentConversation(m, prompt);
                            break;
                        }
                    }
                    // Normal streaming (non-agent, or agent without chat)
                    this.panel?.webview.postMessage({ type: 'chatStart', model: m });
                    try {
                        const onToken = (t) => this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: t });
                        if (useChat) {
                            const messages = [{ role: 'user', content: prompt }];
                            await this.client.chat(m, messages, true, onToken, this.controller.signal);
                        }
                        else {
                            await this.client.generate(m, prompt, true, onToken, this.controller.signal);
                        }
                        this.panel?.webview.postMessage({ type: 'chatDone', model: m });
                    }
                    catch (e) {
                        if (this.isPaused || this.wasStopped) {
                            // Swallow abort error
                        }
                        else {
                            this.panel?.webview.postMessage({ type: 'chatError', model: m, message: String(e?.message || e) });
                        }
                    }
                    break;
                }
                case 'pause': {
                    if (this.controller) {
                        this.isPaused = true;
                        this.controller.abort();
                    }
                    break;
                }
                case 'resume': {
                    if (!this.currentModel || !this.currentPrompt) {
                        break;
                    }
                    const m = this.currentModel;
                    const useChat = this.currentUseChat;
                    this.isPaused = false;
                    this.wasStopped = false;
                    this.controller = new AbortController();
                    this.panel?.webview.postMessage({ type: 'chatResume', model: m });
                    try {
                        const onToken = (t) => this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: t });
                        if (useChat) {
                            const messages = [
                                { role: 'user', content: this.currentPrompt },
                                { role: 'user', content: 'Continue' }
                            ];
                            await this.client.chat(m, messages, true, onToken, this.controller.signal);
                        }
                        else {
                            const cont = this.currentPrompt + '\n\nContinue';
                            await this.client.generate(m, cont, true, onToken, this.controller.signal);
                        }
                        this.panel?.webview.postMessage({ type: 'chatDone', model: m });
                    }
                    catch (e) {
                        if (this.isPaused || this.wasStopped) {
                            // ignore
                        }
                        else {
                            this.panel?.webview.postMessage({ type: 'chatError', model: m, message: String(e?.message || e) });
                        }
                    }
                    break;
                }
                case 'insertText': {
                    const text = msg.text || '';
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const effectiveMode = cfg.get('mode', 'read');
                    console.log('insertText received - uiMode:', msg.mode, 'effectiveMode:', effectiveMode, 'text length:', text.length);
                    const editor = this.lastActiveEditor || vscode.window.activeTextEditor;
                    if (effectiveMode !== 'agent') {
                        vscode.window.showInformationMessage('Read mode: editing is disabled. Switch to Agent mode to allow changes.');
                        break;
                    }
                    if (!editor) {
                        vscode.window.showWarningMessage('No active editor. Please open a file first.');
                        break;
                    }
                    if (text) {
                        await this.directInsertCode(editor, text);
                    }
                    break;
                }
                case 'applyCode': {
                    const snippet = msg.text || '';
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const previewAlways = cfg.get('applyPreviewAlways', true);
                    const largeThreshold = cfg.get('largeFileThresholdBytes', 200000);
                    const effectiveMode = cfg.get('mode', 'read');
                    console.log('applyCode received - uiMode:', msg.mode, 'effectiveMode:', effectiveMode, 'text length:', snippet.length);
                    const editor = this.lastActiveEditor || vscode.window.activeTextEditor;
                    if (effectiveMode !== 'agent') {
                        vscode.window.showInformationMessage('Read mode: editing is disabled. Switch to Agent mode to apply changes.');
                        break;
                    }
                    if (!editor) {
                        vscode.window.showWarningMessage('No active editor. Please open a file first.');
                        break;
                    }
                    if (!snippet) {
                        break;
                    }
                    // Smart merge using AI: read current file, ask model to integrate snippet, write back
                    const document = editor.document;
                    const filePath = vscode.workspace.asRelativePath(document.uri);
                    const language = document.languageId;
                    const original = document.getText();
                    // Start UI feedback
                    let resolvedModel = '';
                    try {
                        const incoming = String(msg.model || '').trim();
                        const isAuto = /^auto(?::.*)?$/i.test(incoming);
                        resolvedModel = isAuto ? '' : incoming;
                        if (!resolvedModel) {
                            resolvedModel = this.currentModel || (await this.client.listModels())[0] || '';
                        }
                    }
                    catch { }
                    const modelLabel = resolvedModel || 'model';
                    this.panel?.webview.postMessage({ type: 'chatStart', model: modelLabel });
                    this.panel?.webview.postMessage({ type: 'agentActivity', id: `read-${Date.now()}`, text: `Reading ${filePath}…` });
                    try {
                        const model = resolvedModel || (await this.client.listModels())[0];
                        if (!model) {
                            throw new Error('No model available');
                        }
                        this.panel?.webview.postMessage({ type: 'agentActivity', id: `gen-${Date.now()}`, text: `Merging snippet into ${filePath}…` });
                        const prompt = `You are a careful code editor. Merge the provided snippet into the current file.

CURRENT FILE (${filePath}, language=${language}):
-----BEGIN FILE-----
${original}
-----END FILE-----

SNIPPET TO INTEGRATE:
-----BEGIN SNIPPET-----
${snippet}
-----END SNIPPET-----

REQUIREMENTS:
- Integrate the snippet into the correct place(s).
- Add or adjust imports/uses/registrations if needed; avoid duplicates.
- Preserve file style and structure; do not duplicate existing code.
- If the snippet conflicts with existing code, refactor minimally to integrate.
- Output ONLY the COMPLETE UPDATED FILE CONTENT.
- NO markdown code fences. NO explanations.`;
                        let merged = '';
                        const messages = [{ role: 'user', content: prompt }];
                        await this.client.chat(model, messages, false, (tok) => { merged += tok; }, this.controller?.signal);
                        // Clean common wrappers
                        merged = (merged || '').trim().replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '');
                        if (!merged) {
                            throw new Error('Model returned empty content');
                        }
                        // Always preview before writing; for very large files, create a minimal range edit
                        const openPreview = async () => {
                            const uriStr = document.uri.toString();
                            let changes = [];
                            if (Buffer.byteLength(original, 'utf8') >= largeThreshold) {
                                // Compute a single minimal range diff edit
                                const edit = computeMinimalRangeEdit(document, original, merged);
                                if (!edit) {
                                    // If no difference detected, short-circuit
                                    this.panel?.webview.postMessage({ type: 'chatChunk', model: modelLabel, text: `ℹ️ No changes detected for ${filePath}.` });
                                    this.panel?.webview.postMessage({ type: 'chatDone', model: modelLabel });
                                    return;
                                }
                                changes = [{ uri: uriStr, range: edit.range, newText: edit.newText }];
                            }
                            else {
                                // Full-file replacement as a single change
                                changes = [{ uri: uriStr, newText: merged }];
                            }
                            this.panel?.webview.postMessage({ type: 'agentActivity', id: `preview-${Date.now()}`, text: `Opening preview for ${filePath}…` });
                            await vscode.commands.executeCommand('ollamaAgent.previewEdits', { changes });
                            // Inform user in the bubble
                            this.panel?.webview.postMessage({ type: 'chatChunk', model: modelLabel, text: `ℹ️ Opened a preview to apply changes to ${filePath}.` });
                            this.panel?.webview.postMessage({ type: 'chatDone', model: modelLabel });
                        };
                        if (previewAlways) {
                            await openPreview();
                        }
                        else {
                            // Fallback path: direct write (not default)
                            this.panel?.webview.postMessage({ type: 'agentActivity', id: `write-${Date.now()}`, text: `Writing changes to ${filePath}…` });
                            await editor.edit((eb) => {
                                const full = new vscode.Range(document.positionAt(0), document.positionAt(original.length));
                                eb.replace(full, merged);
                            });
                            this.panel?.webview.postMessage({ type: 'chatChunk', model: modelLabel, text: `✅ Applied snippet to ${filePath}.` });
                            this.panel?.webview.postMessage({ type: 'chatDone', model: modelLabel });
                        }
                    }
                    catch (e) {
                        const msgText = String(e?.message || e || '').toLowerCase();
                        const isEmpty = msgText.includes('empty content') || msgText.includes('no model available');
                        if (isEmpty) {
                            // Fallback: either open a diff preview or apply directly, based on config
                            try {
                                const cfg2 = vscode.workspace.getConfiguration('ollamaAgent');
                                const preview = cfg2.get('previewOnFallback', true);
                                const cleaned = String(snippet || '').replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '').trim();
                                if (preview) {
                                    const uriStr = document.uri.toString();
                                    const payload = { changes: [{ uri: uriStr, newText: cleaned }] };
                                    this.panel?.webview.postMessage({ type: 'agentActivity', id: `fallback-${Date.now()}`, text: `Model returned empty content; opening preview to apply snippet…` });
                                    await vscode.commands.executeCommand('ollamaAgent.previewEdits', payload);
                                    this.panel?.webview.postMessage({ type: 'chatChunk', model: modelLabel, text: `ℹ️ Model returned empty content. Opened a preview to apply the snippet to ${filePath}.` });
                                    this.panel?.webview.postMessage({ type: 'chatDone', model: modelLabel });
                                }
                                else {
                                    this.panel?.webview.postMessage({ type: 'agentActivity', id: `fallback-${Date.now()}`, text: `Model returned empty content; applying snippet directly…` });
                                    const applied = await this.directApplyCode(editor, cleaned);
                                    if (applied) {
                                        this.panel?.webview.postMessage({ type: 'chatChunk', model: modelLabel, text: `ℹ️ Model returned empty content. Applied the snippet directly to ${filePath}.` });
                                        this.panel?.webview.postMessage({ type: 'agentActivity', id: `saved-${Date.now()}`, text: `Saved changes` });
                                        this.panel?.webview.postMessage({ type: 'chatDone', model: modelLabel });
                                    }
                                    else {
                                        this.panel?.webview.postMessage({ type: 'chatError', model: modelLabel, message: `Fallback apply reported no changes.` });
                                    }
                                }
                            }
                            catch (inner) {
                                this.panel?.webview.postMessage({ type: 'chatError', model: modelLabel, message: `Fallback apply failed: ${String(inner?.message || inner)}` });
                            }
                        }
                        else {
                            this.panel?.webview.postMessage({ type: 'chatError', model: modelLabel, message: String(e?.message || e) });
                        }
                    }
                    break;
                }
                case 'applyEdits': {
                    const cfg = vscode.workspace.getConfiguration('ollamaAgent');
                    const effectiveMode = cfg.get('mode', 'read');
                    if (effectiveMode !== 'agent') {
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
                case 'explainSelection': {
                    await this.handleExplainCode();
                    break;
                }
                case 'fixCode': {
                    await this.handleFixCode();
                    break;
                }
                case 'optimizeCode': {
                    await this.handleOptimizeCode();
                    break;
                }
                case 'generateTests': {
                    await this.handleGenerateTests();
                    break;
                }
                case 'refactorCode': {
                    await this.handleRefactorCode();
                    break;
                }
                case 'addComments': {
                    await this.handleAddComments();
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
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
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
    // Called from command to reveal the README generator UI in the webview
    openReadmeGenerator() {
        if (!this.panel) {
            this.show(vscode.ViewColumn.Beside);
        }
        this.panel?.webview.postMessage({ type: 'openReadmeGenerator' });
    }
    async collectRepoSnapshot(maxBytes = 600000) {
        const ws = vscode.workspace.workspaceFolders?.[0];
        if (!ws) {
            return { stats: 'No workspace open.', snapshot: '' };
        }
        const include = '**/*';
        const exclude = '{**/node_modules/**,**/.git/**,**/dist/**,**/out/**,**/build/**,**/.next/**,**/*.min.*,**/*.lock,**/*.png,**/*.jpg,**/*.jpeg,**/*.gif,**/*.svg,**/*.ico,**/*.pdf,**/*.zip,**/*.jar,**/*.exe}';
        const uris = await vscode.workspace.findFiles(include, exclude, 2000);
        let usedBytes = 0;
        let filesIncluded = 0;
        let totalFiles = uris.length;
        const parts = [];
        for (const uri of uris) {
            try {
                const data = await vscode.workspace.fs.readFile(uri);
                if (data.byteLength > 300_000) {
                    continue;
                } // skip very large files
                // Heuristic binary check
                const buf = data.slice(0, Math.min(data.byteLength, 4096));
                let nonText = 0;
                for (let i = 0; i < buf.length; i++) {
                    const c = buf[i];
                    if (c === 9 || c === 10 || c === 13) {
                        continue;
                    } // tab/lf/cr
                    if (c < 32 || c > 126) {
                        nonText++;
                    }
                }
                if (nonText > 100) {
                    continue;
                }
                const text = Buffer.from(data).toString('utf8');
                const lines = text.split(/\r?\n/);
                const head = lines.slice(0, 300).join('\n');
                const entry = `FILE: ${vscode.workspace.asRelativePath(uri)} [${lines.length} lines]\n${head}`;
                const bytes = Buffer.byteLength(entry, 'utf8') + 2;
                if (usedBytes + bytes > maxBytes) {
                    break;
                }
                parts.push(entry);
                usedBytes += bytes;
                filesIncluded++;
                if (usedBytes > maxBytes * 0.98) {
                    break;
                }
            }
            catch {
                // ignore
            }
        }
        const mb = (usedBytes / (1024 * 1024)).toFixed(2);
        const stats = `Files scanned: ${totalFiles}, included: ${filesIncluded}, snapshot size: ${mb} MB (truncated)`;
        return { stats, snapshot: parts.join('\n\n') };
    }
    async runAgentConversation(model, prompt) {
        // Enhanced agent mode - works like Cursor/Copilot
        // Automatically detects file operations and applies them
        // Get current editor context
        const editor = vscode.window.activeTextEditor;
        const currentFile = editor ? vscode.workspace.asRelativePath(editor.document.uri) : null;
        // Extract file mentions from @ syntax or detect from context
        const fileMentions = prompt.match(/@([\w\-\.\/\\]+)/g);
        let mentionedFiles = fileMentions ? fileMentions.map(m => m.substring(1)) : [];
        // If no @ mentions but we have an active editor, use current file
        if (mentionedFiles.length === 0 && currentFile) {
            mentionedFiles = [currentFile];
        }
        // Detect user intent with better patterns
        const wantsToCreate = /\b(create|new|add|make|generate)\s+(a\s+)?(file|component|module|class|function)/i.test(prompt);
        const wantsToModify = /\b(change|modify|edit|update|fix|refactor|rewrite|improve|optimize)\b/i.test(prompt);
        const wantsToDelete = /\b(remove|delete|clear)\b/i.test(prompt);
        const wantsToRead = /\b(show|read|see|view|display|what|content)\b/i.test(prompt);
        // === HANDLE FILE CREATION ===
        if (wantsToCreate) {
            // Extract filename from prompt
            const filenameMatch = prompt.match(/(?:create|new|add|make|generate)\s+(?:a\s+)?(?:file|component|module|class|function)?\s*(?:called|named)?\s*[`"]?([\w\-\.\/]+)[`"]?/i);
            const newFileName = filenameMatch ? filenameMatch[1] : await vscode.window.showInputBox({
                prompt: 'Enter filename',
                placeHolder: 'e.g., components/Button.tsx'
            });
            if (!newFileName) {
                return;
            }
            this.panel?.webview.postMessage({ type: 'chatStart', model });
            this.panel?.webview.postMessage({ type: 'chatChunk', model, text: `Creating ${newFileName}...\n\n` });
            // Ask AI to generate file content
            const createPrompt = `Generate complete code for: ${prompt}

OUTPUT RULES:
- Output ONLY the code, no explanations
- NO markdown code fences
- Start directly with the code
- Make it production-ready and well-structured`;
            let content = '';
            const messages = [{ role: 'user', content: createPrompt }];
            try {
                await this.client.chat(model, messages, false, (token) => {
                    content += token;
                }, this.controller?.signal);
                // Clean the response
                content = content.trim().replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '');
                // Create the file
                await this.executeTool({
                    cmd: 'writeFile',
                    path: newFileName,
                    content
                });
                this.panel?.webview.postMessage({ type: 'chatChunk', model, text: `Successfully created ${newFileName}!\n\n` });
                this.panel?.webview.postMessage({ type: 'chatDone', model });
                // Open the new file
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (ws) {
                    const uri = vscode.Uri.joinPath(ws.uri, newFileName);
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc, { preview: false });
                }
                return;
            }
            catch (e) {
                this.panel?.webview.postMessage({ type: 'chatError', model, message: `Failed to create file: ${e}` });
                return;
            }
        }
        // === HANDLE FILE MODIFICATION ===
        if (mentionedFiles.length > 0 && wantsToModify) {
            const targetFile = mentionedFiles[0];
            // Step 1: Read the file first
            this.panel?.webview.postMessage({ type: 'chatStart', model });
            this.panel?.webview.postMessage({ type: 'agentActivity', id: `read-${Date.now()}`, text: `Reading ${targetFile}…` });
            let fileContent = '';
            try {
                const readResult = await this.executeTool({ cmd: 'readFile', path: targetFile });
                fileContent = readResult;
                this.panel?.webview.postMessage({ type: 'agentActivity', id: `readok-${Date.now()}`, text: `File read successfully` });
            }
            catch (e) {
                this.panel?.webview.postMessage({ type: 'chatError', model, message: `Failed to read ${targetFile}: ${e}` });
                return;
            }
            // Step 2: Ask AI to generate the modified version
            this.panel?.webview.postMessage({ type: 'agentActivity', id: `gen-${Date.now()}`, text: `Generating modifications…` });
            // Build a smart modification prompt
            const modificationPrompt = `You are a code editor. Modify the following file based on the user's request.

CURRENT FILE (${targetFile}):
${fileContent}

USER REQUEST: ${prompt}

INSTRUCTIONS:
- Output ONLY the complete modified file content
- NO markdown code fences (no \`\`\`)
- NO explanations or comments about what you changed
- Start directly with the code
- Preserve existing code structure and style
- Only change what's requested

MODIFIED FILE:`;
            let modifiedContent = '';
            const messages = [{ role: 'user', content: modificationPrompt }];
            try {
                await this.client.chat(model, messages, false, (token) => {
                    modifiedContent += token;
                }, this.controller?.signal);
                // Aggressively clean the response
                modifiedContent = modifiedContent.trim();
                // Remove any markdown code fences
                modifiedContent = modifiedContent.replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '');
                // Remove common AI preambles
                const preambles = [
                    /^Here'?s?\s+the\s+modified.*?:\s*/i,
                    /^Here'?s?\s+the\s+updated.*?:\s*/i,
                    /^Modified\s+file.*?:\s*/i,
                    /^Updated\s+code.*?:\s*/i,
                    /^javascript\s*\n/i,
                    /^typescript\s*\n/i,
                    /^python\s*\n/i,
                    /^I'?ve\s+.*?:\s*/i,
                    /^The\s+modified.*?:\s*/i
                ];
                for (const pattern of preambles) {
                    modifiedContent = modifiedContent.replace(pattern, '');
                }
                modifiedContent = modifiedContent.trim();
                // Step 3: Write the modified file
                this.panel?.webview.postMessage({ type: 'agentActivity', id: `write-${Date.now()}`, text: `Writing changes to ${targetFile}…` });
                await this.executeTool({
                    cmd: 'writeFile',
                    path: targetFile,
                    content: modifiedContent
                });
                this.panel?.webview.postMessage({ type: 'chatChunk', model, text: `✅ Successfully modified ${targetFile}.` });
                this.panel?.webview.postMessage({ type: 'chatDone', model });
                // Open the file to show the changes
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (ws) {
                    const uri = vscode.Uri.joinPath(ws.uri, targetFile);
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc, { preview: false });
                }
                return;
            }
            catch (e) {
                this.panel?.webview.postMessage({ type: 'chatError', model, message: `Failed to modify file: ${e}` });
                return;
            }
        }
        // === HANDLE FILE DELETION ===
        if (mentionedFiles.length > 0 && wantsToDelete) {
            const targetFile = mentionedFiles[0];
            const confirm = await vscode.window.showWarningMessage(`Delete ${targetFile}?`, { modal: true }, 'Delete');
            if (confirm === 'Delete') {
                this.panel?.webview.postMessage({ type: 'chatStart', model });
                this.panel?.webview.postMessage({ type: 'agentActivity', id: `del-${Date.now()}`, text: `Deleting ${targetFile}…` });
                try {
                    await this.executeTool({ cmd: 'deleteFile', path: targetFile });
                    this.panel?.webview.postMessage({ type: 'chatChunk', model, text: `🗑️ Successfully deleted ${targetFile}.` });
                    this.panel?.webview.postMessage({ type: 'chatDone', model });
                }
                catch (e) {
                    this.panel?.webview.postMessage({ type: 'chatError', model, message: `Failed to delete: ${e}` });
                }
            }
            return;
        }
        // === HANDLE CURRENT FILE MODIFICATION (no @ mention, but has active editor) ===
        if (wantsToModify && editor && !fileMentions) {
            const targetFile = vscode.workspace.asRelativePath(editor.document.uri);
            const fileContent = editor.document.getText();
            const selection = editor.selection;
            const hasSelection = !selection.isEmpty;
            const selectedText = hasSelection ? editor.document.getText(selection) : '';
            this.panel?.webview.postMessage({ type: 'chatStart', model });
            this.panel?.webview.postMessage({ type: 'agentActivity', id: `mod-${Date.now()}`, text: `Modifying ${targetFile}…` });
            const modificationPrompt = hasSelection
                ? `You are a code editor. Modify ONLY the selected code based on the user's request.

FULL FILE (${targetFile}):
${fileContent}

SELECTED CODE TO MODIFY:
${selectedText}

USER REQUEST: ${prompt}

INSTRUCTIONS:
- Output ONLY the modified version of the SELECTED code
- NO markdown code fences
- NO explanations
- Preserve code style and structure

MODIFIED CODE:`
                : `You are a code editor. Modify the file based on the user's request.

CURRENT FILE (${targetFile}):
${fileContent}

USER REQUEST: ${prompt}

INSTRUCTIONS:
- Output ONLY the complete modified file
- NO markdown code fences
- NO explanations
- Preserve code style

MODIFIED FILE:`;
            let modifiedContent = '';
            const messages = [{ role: 'user', content: modificationPrompt }];
            try {
                await this.client.chat(model, messages, false, (token) => {
                    modifiedContent += token;
                }, this.controller?.signal);
                // Clean response
                modifiedContent = modifiedContent.trim().replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '');
                // Apply the edit
                await editor.edit(editBuilder => {
                    if (hasSelection) {
                        editBuilder.replace(selection, modifiedContent);
                    }
                    else {
                        const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(fileContent.length));
                        editBuilder.replace(fullRange, modifiedContent);
                    }
                });
                this.panel?.webview.postMessage({ type: 'chatChunk', model, text: `✅ Successfully modified ${targetFile}.` });
                this.panel?.webview.postMessage({ type: 'chatDone', model });
                return;
            }
            catch (e) {
                this.panel?.webview.postMessage({ type: 'chatError', model, message: `Failed to modify: ${e}` });
                return;
            }
        }
        // FALLBACK: For questions without file modifications, just do regular chat (streamed)
        this.panel?.webview.postMessage({ type: 'chatStart', model });
        const messages = [{ role: 'user', content: prompt }];
        try {
            await this.client.chat(model, messages, true, (token) => {
                this.panel?.webview.postMessage({ type: 'chatChunk', model, text: token });
            }, this.controller?.signal);
            this.panel?.webview.postMessage({ type: 'chatDone', model });
        }
        catch (e) {
            if (this.isPaused || this.wasStopped) {
                // suppress abort error
            }
            else {
                this.panel?.webview.postMessage({ type: 'chatError', model, message: String(e?.message || e) });
            }
        }
    }
    stripToolBlocks(text) {
        // Remove any ```tool ... ``` fenced blocks for a clean UI stream
        return text.replace(/```tool[\s\S]*?```/g, '');
    }
    async inferDirectEditsFromPrompt(prompt) {
        try {
            const text = prompt.toLowerCase();
            // Match an explicit file path mention, default to server.js
            const fileMatch = prompt.match(/([\w\-.\/\\]*server\.js)/i);
            const target = fileMatch ? fileMatch[1] : 'server.js';
            const wantsRemove = /(remove|delete|clear)[^\n]*?(everything|all|entire|whole|content|code)/i.test(text);
            const wantsExpress = /(express)\b/i.test(text);
            if (!wantsRemove && !wantsExpress) {
                return null;
            }
            let newText = '';
            if (wantsExpress) {
                newText = `// Minimal Express app\nconst express = require('express');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/', (req, res) => {\n  res.send('OK');\n});\n\napp.listen(PORT, () => {\n  console.log('Server listening on port ' + PORT);\n});\n`;
            }
            const ws = vscode.workspace.workspaceFolders?.[0];
            const uri = ws ? vscode.Uri.joinPath(ws.uri, target.replace(/^\/+/, '')) : vscode.Uri.file(target);
            const rel = vscode.workspace.asRelativePath(uri);
            const changes = [
                { uri: rel || target, newText, create: true }
            ];
            return { summary: rel || target, changes };
        }
        catch {
            return null;
        }
    }
    matchToolBlock(text) {
        const re = /```tool\n([\s\S]*?)```/m;
        const m = text.match(re);
        if (!m) {
            return null;
        }
        const pre = text.slice(0, m.index);
        try {
            const json = JSON.parse(m[1]);
            return { pre, json };
        }
        catch {
            return null;
        }
    }
    extractEditsFromText(text) {
        const m = text.match(/```(edits|json)\n([\s\S]*?)```/i);
        if (!m) {
            return null;
        }
        try {
            const obj = JSON.parse(m[2]);
            return obj;
        }
        catch {
            return null;
        }
    }
    async synthesizeAndApplyEdits(model) {
        try {
            const instructions = `Convert the conversation below into a single JSON object with the following shape:
{"changes":[{"uri":"<path-or-uri>","newText":"<full-text>","create":true}]}
Rules:
- Return ONLY the JSON, no prose, no code fences.
- Use relative paths from the workspace root when possible (e.g., "server.js" or "src/index.ts").
- If the user asked to replace a file, use a single change with newText as the full desired file content and set create:true.
- Do not include explanations.

Conversation transcript:
USER: ${this.currentPrompt}
ASSISTANT: ${this.assistantBuffer}`;
            const gen = await this.client.generate(model, instructions, false);
            let obj = null;
            try {
                obj = JSON.parse(gen);
            }
            catch { }
            if (obj && Array.isArray(obj.changes) && obj.changes.length > 0) {
                await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', obj);
                return;
            }
        }
        catch { }
    }
    async executeTool(spec) {
        try {
            if (!spec || typeof spec !== 'object') {
                return 'Invalid tool payload';
            }
            const cmd = String(spec.cmd || '').toLowerCase();
            if (cmd === 'listfiles') {
                const glob = spec.glob && typeof spec.glob === 'string' ? spec.glob : '**/*';
                const maxResults = typeof spec.maxResults === 'number' ? spec.maxResults : 500;
                const uris = await vscode.workspace.findFiles(glob, '**/node_modules/**', maxResults);
                const rel = uris.map((u) => vscode.workspace.asRelativePath(u));
                return `FILES(${rel.length}${rel.length >= maxResults ? '+' : ''}):\n` + rel.join('\n');
            }
            if (cmd === 'readfile') {
                const path = String(spec.path || spec.uri || '');
                if (!path) {
                    return 'readFile: missing path';
                }
                const wsFolder = vscode.workspace.workspaceFolders?.[0];
                if (!wsFolder) {
                    return 'No workspace folder';
                }
                let uri = vscode.Uri.joinPath(wsFolder.uri, path.replace(/^\//, ''));
                try {
                    uri = vscode.Uri.parse(path);
                }
                catch { }
                const data = await vscode.workspace.fs.readFile(uri);
                const text = Buffer.from(data).toString('utf8');
                const lines = text.split(/\r?\n/);
                const start = Math.max(0, Number(spec.startLine || 1) - 1);
                const end = Math.min(lines.length, Number(spec.endLine || start + 200));
                const slice = lines.slice(start, end).join('\n');
                const more = end < lines.length ? `\n... (truncated at line ${end}/${lines.length})` : '';
                return `FILE ${vscode.workspace.asRelativePath(uri)} [${start + 1}-${end}/${lines.length}]\n` + slice + more;
            }
            if (cmd === 'search') {
                const query = String(spec.query || '');
                const glob = spec.glob && typeof spec.glob === 'string' ? spec.glob : '**/*';
                const maxResults = typeof spec.maxResults === 'number' ? spec.maxResults : 500;
                if (!query) {
                    return 'search: missing query';
                }
                const files = await vscode.workspace.findFiles(glob, '**/node_modules/**', maxResults);
                const out = [];
                // Support regex if query looks like a regex pattern
                let re;
                try {
                    re = new RegExp(query, 'i');
                }
                catch {
                    // Fallback to escaped literal
                    re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                }
                for (const uri of files) {
                    const data = await vscode.workspace.fs.readFile(uri);
                    const text = Buffer.from(data).toString('utf8');
                    const lines = text.split(/\r?\n/);
                    lines.forEach((line, idx) => {
                        if (re.test(line)) {
                            out.push(`${vscode.workspace.asRelativePath(uri)}:${idx + 1}: ${line.trim()}`);
                        }
                    });
                    if (out.length > maxResults) {
                        break;
                    }
                }
                return `SEARCH_RESULTS(${out.length}${out.length >= maxResults ? '+' : ''}):\n` + out.slice(0, maxResults).join('\n');
            }
            if (cmd === 'projectindex') {
                const detail = !!spec.detail;
                const mod = await import('./indexer.js');
                return mod.ProjectIndexer.summary(detail);
            }
            if (cmd === 'createfile') {
                const path = String(spec.path || spec.uri || '');
                if (!path) {
                    return 'createFile: missing path';
                }
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (!ws) {
                    return 'No workspace folder';
                }
                const uri = vscode.Uri.joinPath(ws.uri, path.replace(/^\/+/, ''));
                await vscode.workspace.fs.writeFile(uri, Buffer.from(''));
                return `CREATED ${vscode.workspace.asRelativePath(uri)}`;
            }
            if (cmd === 'writefile') {
                const path = String(spec.path || spec.uri || '');
                const content = String(spec.content ?? '');
                if (!path) {
                    return 'writeFile: missing path';
                }
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (!ws) {
                    return 'No workspace folder';
                }
                const uri = vscode.Uri.joinPath(ws.uri, path.replace(/^\/+/, ''));
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                return `WROTE ${vscode.workspace.asRelativePath(uri)} (${content.length} bytes)`;
            }
            if (cmd === 'deletefile') {
                const path = String(spec.path || spec.uri || '');
                if (!path) {
                    return 'deleteFile: missing path';
                }
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (!ws) {
                    return 'No workspace folder';
                }
                const uri = vscode.Uri.joinPath(ws.uri, path.replace(/^\/+/, ''));
                await vscode.workspace.fs.delete(uri, { useTrash: true });
                return `DELETED ${vscode.workspace.asRelativePath(uri)}`;
            }
            if (cmd === 'renamefile') {
                const path = String(spec.path || spec.uri || '');
                const newPath = String(spec.newPath || spec.to || '');
                if (!path || !newPath) {
                    return 'renameFile: missing path/newPath';
                }
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (!ws) {
                    return 'No workspace folder';
                }
                const from = vscode.Uri.joinPath(ws.uri, path.replace(/^\/+/, ''));
                const to = vscode.Uri.joinPath(ws.uri, newPath.replace(/^\/+/, ''));
                await vscode.workspace.fs.rename(from, to, { overwrite: true });
                return `RENAMED ${vscode.workspace.asRelativePath(from)} -> ${vscode.workspace.asRelativePath(to)}`;
            }
            if (cmd === 'makedir' || cmd === 'mkdir') {
                const path = String(spec.path || '');
                if (!path) {
                    return 'makeDir: missing path';
                }
                const ws = vscode.workspace.workspaceFolders?.[0];
                if (!ws) {
                    return 'No workspace folder';
                }
                const uri = vscode.Uri.joinPath(ws.uri, path.replace(/^\/+/, ''));
                await vscode.workspace.fs.createDirectory(uri);
                return `MKDIR ${vscode.workspace.asRelativePath(uri)}`;
            }
            if (cmd === 'runtask') {
                const command = String(spec.command || spec.cmdline || '');
                if (!command) {
                    return 'runTask: missing command';
                }
                const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                if (!cwd) {
                    return 'No workspace folder';
                }
                const { exec } = await import('node:child_process');
                const { promisify } = await import('node:util');
                const pexec = promisify(exec);
                try {
                    const { stdout, stderr } = await pexec(command, { cwd, timeout: 30000, maxBuffer: 1024 * 1024 * 5 });
                    const out = (stdout || stderr || '').toString();
                    return `RUN(${command}):\n` + out.slice(0, 8000);
                }
                catch (e) {
                    const out = String(e?.stdout || e?.stderr || e?.message || e);
                    return `RUN_ERROR(${command}):\n` + out.slice(0, 8000);
                }
            }
            return `Unknown tool cmd: ${cmd}`;
        }
        catch (e) {
            return `Tool error: ${String(e?.message || e)}`;
        }
    }
    // Direct code insertion - Simple and fast like Cursor
    async directInsertCode(editor, newCode) {
        const selection = editor.selection;
        vscode.window.showInformationMessage(`🤖 Inserting code...`);
        try {
            // Simple insert at cursor or after selection
            await editor.edit((editBuilder) => {
                if (!selection.isEmpty) {
                    // Insert after selection
                    editBuilder.insert(selection.end, '\n' + newCode);
                }
                else {
                    // Insert at cursor
                    editBuilder.insert(selection.active, newCode);
                }
            });
            vscode.window.showInformationMessage(`✅ Code inserted successfully!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to insert code: ${error.message}`);
        }
    }
    // Direct code application - Simple and fast like Cursor
    async directApplyCode(editor, newCode) {
        const document = editor.document;
        const selection = editor.selection;
        console.log('directApplyCode: selection empty?', selection.isEmpty, 'newCode length:', newCode.length);
        try {
            // Ensure editor is visible
            await vscode.window.showTextDocument(document, { preview: false, preserveFocus: false });
            // Heuristic: choose strategy (replace selection | replace whole file | insert)
            const fileText = document.getText();
            const trimmedSnippet = newCode.replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '').trim();
            const language = document.languageId || '';
            const looksLikeFullFile = () => {
                const s = trimmedSnippet;
                const longEnough = s.length > Math.max(400, Math.floor(fileText.length * 0.5));
                const hasMainMarkers = /(module\.exports|export\s+(default|const|function|class)|import\s|^\s*"use strict";|^\s*'use strict';)/m.test(s);
                const hasExpressBoot = /(require\(['"]express['"]\)|from\s+"express"|const\s+app\s*=\s*express\(|app\.listen\()/m.test(s);
                const duplicateHeader = /(const\s+express\s*=|^\s*import\s+express)/m.test(s) && /(const\s+app\s*=\s*express\(|app\.listen\()/m.test(s);
                return longEnough || hasMainMarkers || hasExpressBoot || duplicateHeader;
            };
            const shouldReplaceWholeFile = selection.isEmpty && looksLikeFullFile();
            const ok = await editor.edit((editBuilder) => {
                if (!selection.isEmpty) {
                    // Replace selected code
                    editBuilder.replace(selection, trimmedSnippet);
                }
                else if (shouldReplaceWholeFile) {
                    // Replace the whole document
                    const full = new vscode.Range(document.positionAt(0), document.positionAt(fileText.length));
                    editBuilder.replace(full, trimmedSnippet + (trimmedSnippet.endsWith("\n") ? '' : '\n'));
                }
                else {
                    // Insert at cursor, with surrounding newlines for cleanliness
                    const insertAt = selection.active;
                    const needsLead = insertAt.character !== 0 ? '\n' : '';
                    editBuilder.insert(insertAt, needsLead + trimmedSnippet + '\n');
                }
            });
            if (!ok) {
                vscode.window.showErrorMessage(`Failed to apply code: no changes were made by editor.edit()`);
                return false;
            }
            // Optionally reveal where we edited
            const pos = editor.selection.isEmpty ? editor.selection.active : editor.selection.start;
            try {
                editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            }
            catch { }
            // Save file to persist changes
            try {
                await document.save();
            }
            catch { }
            vscode.window.showInformationMessage(`✅ Code applied successfully!`);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply code: ${error.message}`);
            return false;
        }
    }
    // AI Code Action Handlers (Cursor/Copilot style features)
    // These now prefill the chat and let the user send, ensuring proper context
    async handleExplainCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to explain code');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to explain or cursor will explain the whole file');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Explain this ${language} code from ${fileName}:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        // Show the panel and prefill
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
    async handleFixCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to fix code');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
        const mode = cfg.get('mode', 'read');
        if (mode !== 'agent') {
            vscode.window.showInformationMessage('Switch to Agent mode to fix code (changes files)');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to fix');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Fix any bugs, errors, or issues in this ${language} code from ${fileName}:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
    async handleOptimizeCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to optimize code');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
        const mode = cfg.get('mode', 'read');
        if (mode !== 'agent') {
            vscode.window.showInformationMessage('Switch to Agent mode to optimize code');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to optimize');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Optimize this ${language} code for better performance:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
    async handleGenerateTests() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to generate tests');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to generate tests for');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Generate comprehensive unit tests for this ${language} code from ${fileName}:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
    async handleRefactorCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to refactor code');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
        const mode = cfg.get('mode', 'read');
        if (mode !== 'agent') {
            vscode.window.showInformationMessage('Switch to Agent mode to refactor code');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to refactor');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Refactor this ${language} code to improve readability and maintainability:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
    async handleAddComments() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to add comments');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('ollamaAgent');
        const mode = cfg.get('mode', 'read');
        if (mode !== 'agent') {
            vscode.window.showInformationMessage('Switch to Agent mode to add comments');
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection.isEmpty ? undefined : selection);
        if (!text.trim()) {
            vscode.window.showInformationMessage('Select code to add comments to');
            return;
        }
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);
        const language = editor.document.languageId;
        const prompt = `Add comprehensive comments and documentation to this ${language} code:\n\n\`\`\`${language}\n${text}\n\`\`\``;
        this.show(vscode.ViewColumn.Beside);
        this.prefill(prompt);
    }
}
exports.OllamaChatPanel = OllamaChatPanel;
// Compute a minimal single-range edit between two strings.
// Returns a range (line/character, 0-based) relative to the ORIGINAL document
// and the replacement text for that range. If texts are identical, returns null.
function computeMinimalRangeEdit(document, original, updated) {
    if (original === updated) {
        return null;
    }
    const origLen = original.length;
    const updLen = updated.length;
    let i = 0;
    const maxPrefix = Math.min(origLen, updLen);
    while (i < maxPrefix && original.charCodeAt(i) === updated.charCodeAt(i)) {
        i++;
    }
    let suffix = 0;
    while (suffix < (origLen - i) &&
        suffix < (updLen - i) &&
        original.charCodeAt(origLen - 1 - suffix) === updated.charCodeAt(updLen - 1 - suffix)) {
        suffix++;
    }
    const startOffset = i;
    const endOffset = origLen - suffix;
    const newText = updated.slice(i, updLen - suffix);
    const startPos = document.positionAt(startOffset);
    const endPos = document.positionAt(endOffset);
    return {
        range: {
            start: { line: startPos.line, character: startPos.character },
            end: { line: endPos.line, character: endPos.character },
        },
        newText,
    };
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=chatPanel.js.map