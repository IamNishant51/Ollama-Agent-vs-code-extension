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
    abortedForTool = false;
    assistantBuffer = '';
    convo = [];
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
                        const direct = await this.inferDirectEditsFromPrompt(prompt);
                        if (direct) {
                            this.panel?.webview.postMessage({ type: 'chatStart', model: m });
                            this.panel?.webview.postMessage({ type: 'chatChunk', model: m, text: `Applying requested changes to ${direct.summary}...` });
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
                        if (this.isPaused) {
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
                        if (this.isPaused) {
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
    async runAgentConversation(model, prompt) {
        // Initialize conversation with system tool instructions
        const toolInstr = `You are a coding agent inside VS Code.
You can request workspace information or perform file operations via tool calls embedded in fenced code blocks:
\`\`\`tool
{"cmd":"listFiles","glob":"**/*.{ts,tsx,js,jsx,py,go,rs,java,cs,json,md}"}
\`\`\`
or read a file:
\`\`\`tool
{"cmd":"readFile","path":"src/extension.ts","startLine":1,"endLine":200}
\`\`\`
Create or modify files:
\`\`\`tool
{"cmd":"createFile","path":"src/newFile.ts"}
\`\`\`
\`\`\`tool
{"cmd":"writeFile","path":"src/index.ts","content":"<FULL FILE CONTENT HERE>"}
\`\`\`
Rename or delete files:
\`\`\`tool
{"cmd":"renameFile","path":"src/old.ts","newPath":"src/new.ts"}
\`\`\`
\`\`\`tool
{"cmd":"deleteFile","path":"src/temp.ts"}
\`\`\`
Run small tasks (timeout 15s):
\`\`\`tool
{"cmd":"runTask","command":"npm test --silent"}
\`\`\`
Always propose file changes by outputting an \`edits\` fenced block with JSON { changes: [...] } compatible with VS Code WorkspaceEdit after you have enough context.
Keep outputs concise. Avoid printing entire files unless necessary.`;
        this.convo = [
            { role: 'system', content: toolInstr },
            { role: 'user', content: prompt }
        ];
        this.assistantBuffer = '';
        let steps = 0;
        const maxSteps = 3;
        // Track visible output minus tool blocks to keep UI clean
        let visibleSent = 0;
        while (steps < maxSteps) {
            steps++;
            this.panel?.webview.postMessage({ type: 'chatStart', model });
            this.controller?.abort();
            this.controller = new AbortController();
            this.abortedForTool = false;
            const onToken = (t) => {
                this.assistantBuffer += t;
                // Detect a completed tool block
                const m = this.matchToolBlock(this.assistantBuffer);
                if (m) {
                    this.abortedForTool = true;
                    this.controller?.abort();
                }
                // Send only the delta of assistant text with tool blocks stripped
                const visible = this.stripToolBlocks(this.assistantBuffer);
                const delta = visible.slice(visibleSent);
                if (delta) {
                    this.panel?.webview.postMessage({ type: 'chatChunk', model, text: delta });
                    visibleSent = visible.length;
                }
            };
            try {
                await this.client.chat(model, this.convo, true, onToken, this.controller.signal);
                // Completed without tool request
                this.panel?.webview.postMessage({ type: 'chatDone', model });
                if (this.assistantBuffer.trim()) {
                    // Store the full buffer (including tool blocks) for the agent, but show stripped to user
                    this.convo.push({ role: 'assistant', content: this.assistantBuffer });
                }
                // Try to extract edits from the assistant output and apply them.
                const payload = this.extractEditsFromText(this.assistantBuffer);
                if (payload && Array.isArray(payload.changes) && payload.changes.length > 0) {
                    await vscode.commands.executeCommand('ollamaAgent.applyWorkspaceEdit', payload);
                    return;
                }
                // If no edits found, try to synthesize edits from the conversation.
                await this.synthesizeAndApplyEdits(model);
                return;
            }
            catch (e) {
                if (this.abortedForTool) {
                    // Extract tool block and execute
                    const match = this.matchToolBlock(this.assistantBuffer);
                    const pre = match?.pre || '';
                    const tool = match?.json || undefined;
                    if (pre.trim()) {
                        this.convo.push({ role: 'assistant', content: pre });
                    }
                    const result = tool ? await this.executeTool(tool) : 'No tool payload';
                    this.convo.push({ role: 'user', content: `TOOL_RESULT:\n${result}` });
                    this.panel?.webview.postMessage({ type: 'chatDone', model });
                    this.assistantBuffer = '';
                    visibleSent = 0;
                    continue; // next step
                }
                if (this.isPaused) {
                    // paused by user
                    return;
                }
                this.panel?.webview.postMessage({ type: 'chatError', model, message: String(e?.message || e) });
                return;
            }
        }
        // Max steps reached
        this.panel?.webview.postMessage({ type: 'chatError', model, message: 'Agent step limit reached.' });
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
                const uris = await vscode.workspace.findFiles(glob, '**/node_modules/**', 200);
                const rel = uris.map((u) => vscode.workspace.asRelativePath(u));
                return `FILES(${rel.length}):\n` + rel.join('\n');
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
                if (!query) {
                    return 'search: missing query';
                }
                const files = await vscode.workspace.findFiles(glob, '**/node_modules/**', 200);
                const out = [];
                const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                for (const uri of files) {
                    const data = await vscode.workspace.fs.readFile(uri);
                    const text = Buffer.from(data).toString('utf8');
                    const lines = text.split(/\r?\n/);
                    lines.forEach((line, idx) => {
                        if (re.test(line)) {
                            out.push(`${vscode.workspace.asRelativePath(uri)}:${idx + 1}: ${line.trim()}`);
                        }
                    });
                    if (out.length > 300) {
                        break;
                    }
                }
                return `SEARCH_RESULTS(${out.length}):\n` + out.slice(0, 300).join('\n');
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
                    const { stdout, stderr } = await pexec(command, { cwd, timeout: 15000 });
                    const out = (stdout || stderr || '').toString();
                    return `RUN(${command})\n` + out.slice(0, 4000);
                }
                catch (e) {
                    const out = String(e?.stdout || e?.stderr || e?.message || e);
                    return `RUN_ERROR(${command})\n` + out.slice(0, 4000);
                }
            }
            return `Unknown tool cmd: ${cmd}`;
        }
        catch (e) {
            return `Tool error: ${String(e?.message || e)}`;
        }
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