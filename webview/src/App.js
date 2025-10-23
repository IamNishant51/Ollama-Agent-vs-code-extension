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
exports.default = App;
const react_1 = __importStar(require("react"));
// @ts-ignore
const vscode = acquireVsCodeApi();
function App() {
    const [models, setModels] = (0, react_1.useState)([]);
    const [selected, setSelected] = (0, react_1.useState)([]);
    const [prompt, setPrompt] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('Ready');
    const [useChat, setUseChat] = (0, react_1.useState)(true);
    const contentRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const onMessage = (ev) => {
            const msg = ev.data;
            switch (msg.type) {
                case 'models':
                    setModels(msg.models || []);
                    break;
                case 'prefill':
                    setPrompt(msg.text || '');
                    break;
                case 'chatStart':
                    setStatus('Streaming');
                    appendAssistant(msg.model);
                    break;
                case 'chatChunk':
                    appendAssistantChunk(msg.text);
                    break;
                case 'chatDone':
                    setStatus('Ready');
                    break;
                case 'error':
                case 'chatError':
                    setStatus('Error');
                    appendAssistant(`Error: ${'message' in msg ? msg.message : ''}`);
                    break;
            }
        };
        window.addEventListener('message', onMessage);
        vscode.postMessage({ type: 'requestModels' });
        return () => window.removeEventListener('message', onMessage);
    }, []);
    function send() {
        if (!selected.length || !prompt.trim())
            return;
        appendUser(prompt);
        vscode.postMessage({ type: 'startChat', models: selected, prompt, useChat });
        setPrompt('');
    }
    function appendUser(text) {
        const root = contentRef.current;
        const wrap = document.createElement('div');
        wrap.className = 'msg';
        const bubble = document.createElement('div');
        bubble.className = 'bubble user';
        bubble.textContent = text;
        wrap.appendChild(bubble);
        root.appendChild(wrap);
        root.scrollTop = root.scrollHeight;
    }
    let lastAssistant = null;
    function appendAssistant(model) {
        const root = contentRef.current;
        const wrap = document.createElement('div');
        wrap.className = 'msg';
        if (model) {
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = model;
            wrap.appendChild(meta);
        }
        const bubble = document.createElement('div');
        bubble.className = 'bubble assistant';
        wrap.appendChild(bubble);
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';
        actions.style.marginTop = '4px';
        const insertBtn = document.createElement('button');
        insertBtn.textContent = 'Insert at Cursor';
        insertBtn.className = 'send';
        insertBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'insertText', text: bubble.textContent || '' });
        });
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.className = 'send';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(bubble.textContent || '');
            }
            catch { }
        });
        actions.appendChild(insertBtn);
        actions.appendChild(copyBtn);
        wrap.appendChild(actions);
        root.appendChild(wrap);
        root.scrollTop = root.scrollHeight;
        lastAssistant = bubble;
    }
    function appendAssistantChunk(text) {
        if (!lastAssistant)
            appendAssistant();
        lastAssistant.textContent += text;
        const root = contentRef.current;
        root.scrollTop = root.scrollHeight;
    }
    const styles = (0, react_1.useMemo)(() => ({
        container: {
            fontFamily: 'var(--vscode-font-family)',
            color: 'var(--vscode-foreground)'
        }
    }), []);
    return (<div className="panel" style={styles.container}>
      <div className="toolbar">
        <span className="title">Ollama</span>
        <select className="select" multiple size={1} value={selected} onChange={(e) => {
            const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
            setSelected(opts);
        }}>
          {models.map((m) => (<option key={m} value={m}>
              {m}
            </option>))}
        </select>
        <span className="tag">{status}</span>
        <span className="spacer"/>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={useChat} onChange={(e) => setUseChat(e.target.checked)}/> Chat API
        </label>
      </div>
      <div id="content" ref={contentRef} className="content" aria-live="polite"/>
      <div className="composer">
        <textarea className="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything about your codebase..." onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                send();
            }
        }}/>
        <button className="send" onClick={send}>
          Send
        </button>
      </div>
    </div>);
}
//# sourceMappingURL=App.js.map