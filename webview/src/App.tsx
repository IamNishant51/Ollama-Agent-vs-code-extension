import React, { useEffect, useMemo, useRef, useState } from 'react';

type VSCodeAPI = { postMessage: (msg: any) => void; setState: (s: any) => void; getState: () => any };
// @ts-ignore
const vscode: VSCodeAPI = acquireVsCodeApi();

type ChatEvent =
  | { type: 'models'; models: string[] }
  | { type: 'prefill'; text: string }
  | { type: 'chatStart'; model: string }
  | { type: 'chatChunk'; model: string; text: string }
  | { type: 'chatDone'; model: string }
  | { type: 'error'; message: string }
  | { type: 'chatError'; model: string; message: string };

type Thread = {
  id: string;
  title: string;
  html: string; // snapshot of the chat area
  createdAt: number;
};

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'Ready' | 'Streaming' | 'Error'>('Ready');
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [useChat, setUseChat] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [historyOpen, setHistoryOpen] = useState<boolean>(true);
  const lastDoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    injectStyles();
    // Restore webview state (threads and current thread)
    try {
      const state = vscode.getState?.() || {};
      if (state && Array.isArray(state.threads)) {
        setThreads(state.threads);
        setCurrentId(state.currentId || (state.threads[0]?.id || ''));
        // Load the current thread HTML into the content area
        setTimeout(() => {
          const t = (state.threads || []).find((x: Thread) => x.id === (state.currentId || ''));
          if (t && contentRef.current) contentRef.current.innerHTML = t.html || '';
        }, 0);
      } else {
        // initialize with a fresh thread
        const t = createNewThread();
        setThreads([t]);
        setCurrentId(t.id);
      }
    } catch {}
    const onMessage = (ev: MessageEvent<ChatEvent>) => {
      const msg = ev.data;
      switch (msg.type) {
        case 'models':
          setModels(msg.models || []);
          if ((msg.models || []).length && !selected) {
            setSelected((msg.models || [])[0]);
          }
          break;
        case 'prefill':
          setPrompt(msg.text || '');
          break;
        case 'chatStart':
          setSending(false);
          setPending((p) => {
            const np = p + 1;
            setStatus('Streaming');
            return np;
          });
          appendAssistant(msg.model, true);
          break;
        case 'chatChunk':
          appendAssistantChunk(msg.text);
          break;
        case 'chatDone':
          setPending((p) => {
            const np = Math.max(0, p - 1);
            setStatus(np > 0 ? 'Streaming' : 'Ready');
            return np;
          });
          finalizeLastAssistant();
          saveSnapshot();
          break;
        case 'error':
        case 'chatError':
          setSending(false);
          setPending(0);
          setStatus('Error');
          appendAssistant(`Error: ${'message' in msg ? msg.message : ''}`);
          saveSnapshot();
          break;
      }
    };
    window.addEventListener('message', onMessage);
    vscode.postMessage({ type: 'requestModels' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function send() {
    const model = selected || (models[0] || '');
    if (!model || !prompt.trim()) return;
    appendUser(prompt);
    // Optimistic "sending" state until chatStart arrives
    setSending(true);
    setStatus('Streaming');
    vscode.postMessage({ type: 'startChat', models: [model], prompt, useChat });
    setPrompt('');
  }

  function appendUser(text: string) {
    const root = contentRef.current!;
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    const bubble = document.createElement('div');
    bubble.className = 'bubble user';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    root.appendChild(wrap);
    root.scrollTop = root.scrollHeight;
    // Title the thread if it's new/default
    const t = getCurrentThread();
    if (t && (t.title === 'New chat' || !t.title)) {
      const title = deriveTitle(text);
      updateThread(t.id, { title });
    }
    saveSnapshot();
  }

  let lastAssistant: HTMLDivElement | null = null;
  function appendAssistant(model?: string, loading = false) {
    const root = contentRef.current!;
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    if (model) {
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = model;
      wrap.appendChild(meta);
    }
  const bubble = document.createElement('div');
  bubble.className = 'bubble assistant' + (loading ? ' loading' : '');
  if (loading) bubble.textContent = '';
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
      try { await navigator.clipboard.writeText(bubble.textContent || ''); } catch {}
    });

    actions.appendChild(insertBtn);
    actions.appendChild(copyBtn);
    wrap.appendChild(actions);

    root.appendChild(wrap);
    root.scrollTop = root.scrollHeight;
    lastAssistant = bubble;
  }

  function appendAssistantChunk(text: string) {
    if (!lastAssistant) appendAssistant(undefined, true);
    if (lastAssistant!.classList.contains('loading')) {
      lastAssistant!.classList.remove('loading');
    }
    lastAssistant!.textContent += text;
    const root = contentRef.current!;
    root.scrollTop = root.scrollHeight;
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdownLike(text: string) {
    // Basic markdown-like rendering: code fences and inline code
    let html = escapeHtml(text);
    // Fenced code blocks ```lang?\n...\n```
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
      const l = lang ? ` class="language-${lang}"` : '';
      return `<pre class="code"><code${l}>${escapeHtml(code)}</code></pre>`;
    });
    // Inline code
    html = html.replace(/`([^`]+)`/g, (_m, c) => `<code class="inline">${escapeHtml(c)}</code>`);
    // Paragraphs
    html = html
      .split(/\n\n+/)
      .map((p) => (p.trim().startsWith('<pre') ? p : `<p>${p.replace(/\n/g, '<br/>')}</p>`))
      .join('');
    return html;
  }

  function finalizeLastAssistant() {
    if (!lastAssistant) return;
    const txt = lastAssistant.textContent || '';
    lastAssistant.innerHTML = renderMarkdownLike(txt);
    lastDoneRef.current = lastAssistant;
    // Add copy buttons for code blocks
    const blocks = lastAssistant.querySelectorAll('pre.code');
    blocks.forEach((pre) => {
      const btn = document.createElement('button');
      btn.className = 'copy-code';
      btn.textContent = 'Copy code';
      btn.addEventListener('click', async () => {
        const codeEl = pre.querySelector('code');
        const code = codeEl?.textContent || '';
        try { await navigator.clipboard.writeText(code); } catch {}
      });
      pre.appendChild(btn);
    });
  }

  function deriveTitle(text: string) {
    const words = text.trim().split(/\s+/).slice(0, 8).join(' ');
    return words || 'New chat';
  }

  function createNewThread(): Thread {
    return { id: String(Date.now()) + Math.random().toString(36).slice(2), title: 'New chat', html: '', createdAt: Date.now() };
  }

  function getCurrentThread(): Thread | undefined {
    return threads.find((t) => t.id === currentId);
  }

  function updateThread(id: string, patch: Partial<Thread>) {
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      persistState(next, currentId);
      return next;
    });
  }

  function saveSnapshot() {
    const t = getCurrentThread();
    if (!t || !contentRef.current) return;
    const html = contentRef.current.innerHTML || '';
    updateThread(t.id, { html });
  }

  function switchThread(id: string) {
    // Save current before switching
    saveSnapshot();
    setCurrentId(id);
    const t = threads.find((x) => x.id === id);
    if (t && contentRef.current) {
      contentRef.current.innerHTML = t.html || '';
    }
    persistState(threads, id);
  }

  function newChat() {
    // Save current, then create a new one and switch
    saveSnapshot();
    const t = createNewThread();
    const next = [t, ...threads];
    setThreads(next);
    setCurrentId(t.id);
    if (contentRef.current) contentRef.current.innerHTML = '';
    persistState(next, t.id);
  }

  function deleteThread(id: string) {
    const next = threads.filter((t) => t.id !== id);
    let nextId = currentId;
    if (id === currentId) {
      nextId = next[0]?.id || '';
      if (contentRef.current) contentRef.current.innerHTML = next.find((x) => x.id === nextId)?.html || '';
    }
    setThreads(next);
    setCurrentId(nextId);
    persistState(next, nextId);
  }

  function persistState(thrs: Thread[], id: string) {
    try { vscode.setState?.({ threads: thrs, currentId: id }); } catch {}
  }

  const styles = useMemo(() => ({
    container: {
      fontFamily: 'var(--vscode-font-family)',
      color: 'var(--vscode-foreground)'
    } as React.CSSProperties
  }), []);

  return (
    <div className="panel" style={styles.container}>
      {(sending || pending > 0) && <div className="progress" aria-hidden="true" />}
      <div className="toolbar">
        <button className="icon" title={historyOpen ? 'Hide history' : 'Show history'} onClick={() => setHistoryOpen((v) => !v)}>☰</button>
        <span className="title">Ollama</span>
        <div className="model">
          <span className="model-label">Model</span>
          <div className="select-wrap">
            <select
              className="select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={models.length === 0}
            >
              {models.length === 0 ? (
                <option value="">No models</option>
              ) : (
                models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <span className="tag">{status}{status === 'Streaming' ? <span className="dot-pulse" /> : null}</span>
        <span className="spacer" />
        <button className="btn secondary" onClick={newChat}>New Chat</button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={useChat} onChange={(e) => setUseChat(e.target.checked)} /> Chat API
        </label>
      </div>
      <div className={`layout ${historyOpen ? 'with-history' : ''}`}>
        <aside className="history" aria-label="Conversations">
          <div className="history-header">
            <span>History</span>
            <button className="icon" title="New chat" onClick={newChat}>＋</button>
          </div>
          <div className="history-list">
            {threads.map((t) => (
              <div key={t.id} className={`history-item ${t.id === currentId ? 'active' : ''}`}>
                <button className="history-title" onClick={() => switchThread(t.id)} title={t.title}>{t.title || 'New chat'}</button>
                <button className="icon del" title="Delete" onClick={() => deleteThread(t.id)}>✕</button>
              </div>
            ))}
            {threads.length === 0 && <div className="history-empty">No conversations yet</div>}
          </div>
        </aside>
        <main className="chat">
          <div id="content" ref={contentRef} className="content" aria-live="polite" />
          <div className="composer">
        <textarea
          className="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about your codebase..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="send" onClick={send} disabled={sending || pending > 0}>
          {sending ? <><span className="spinner" /> Sending…</> : (pending > 0 ? <><span className="spinner" /> Generating…</> : 'Send')}
        </button>
          </div>
        </main>
      </div>
    </div>
  );
}
function injectStyles() {
  const css = `
    :root { color-scheme: dark; }
    body {
      font-family: Inter, 'Segoe UI', sans-serif;
      margin: 0;
      color: #e6e6e6;
      background: #0e0e0e;
      display: flex;
      height: 100vh;
    }

    .panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      backdrop-filter: blur(12px);
      background: rgba(20, 20, 20, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(20, 20, 20, 0.75);
      position: sticky;
      top: 0;
      z-index: 3;
      backdrop-filter: blur(14px);
    }

    .toolbar .title {
      font-weight: 600;
      font-size: 15px;
      color: #ffffff;
    }

    .icon, .btn, .send {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e6e6e6;
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .icon:hover, .btn:hover, .send:hover {
      background: rgba(255,255,255,0.1);
      transform: scale(1.05);
    }

    .btn.secondary {
      background: rgba(255,255,255,0.1);
      color: #ffffff;
      font-weight: 500;
    }

    .model { display:flex; align-items:center; gap:8px; }
    .model-label { font-size: 12px; opacity:.85; }
    .select-wrap { position: relative; }
    .select {
      min-width: 200px;
      background: rgba(30,30,30,0.9);
      border: 1px solid rgba(255,255,255,0.12);
      color: #e6e6e6;
      border-radius: 999px;
      padding: 8px 34px 8px 12px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    .select-wrap::after {
      content: '\u25BC'; /* down caret */
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-size: 10px; opacity: .8; pointer-events: none;
    }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 0;
      flex: 1;
      overflow: hidden;
    }

    .layout:not(.with-history) { grid-template-columns: 0 1fr; }

    /* Sidebar */
    .history {
      overflow-y: auto;
      border-right: 1px solid rgba(255,255,255,0.08);
      background: rgba(15, 15, 15, 0.7);
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
    }

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .history-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 8px 10px;
      background: rgba(255,255,255,0.03);
      transition: all 0.25s ease;
    }

    .history-item:hover {
      background: rgba(255,255,255,0.06);
      transform: scale(1.01);
    }

    .history-item.active {
      border-color: rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.08);
    }

    .history-title {
      background: transparent;
      border: none;
      color: #e6e6e6;
      flex: 1;
      text-align: left;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Chat */
    .chat {
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: rgba(18,18,18,0.7);
      backdrop-filter: blur(14px);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Messages */
    .msg {
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: fadeIn 0.3s ease forwards;
    }

    .bubble {
      max-width: 90%;
      padding: 14px 16px;
      border-radius: 14px;
      line-height: 1.5;
      font-size: 14px;
      box-shadow: 0 0 8px rgba(255,255,255,0.05);
    }

    .assistant {
      background: linear-gradient(145deg, rgba(40,40,40,0.9), rgba(25,25,25,0.9));
      border: 1px solid rgba(255,255,255,0.08);
      align-self: flex-start;
    }

    .user {
      background: linear-gradient(145deg, #1a73e8, #1559b3);
      color: white;
      align-self: flex-end;
      border: none;
    }

    .meta {
      font-size: 11px;
      opacity: 0.7;
    }

    /* Composer */
    .composer {
      position: sticky;
      bottom: 0;
      background: rgba(20,20,20,0.85);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 10px 14px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .prompt {
      flex: 1;
      min-height: 60px;
      resize: none;
      background: rgba(255,255,255,0.05);
      color: #e6e6e6;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
    }

    .prompt:focus {
      border-color: rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.08);
    }

    .send {
      border-radius: 10px;
      font-weight: 500;
      padding: 10px 18px;
      background: linear-gradient(135deg, #1a73e8, #1559b3);
      color: white;
      border: none;
    }

    .send:hover {
      filter: brightness(1.1);
      transform: scale(1.03);
    }

    /* Effects */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
    }

    .dot-pulse {
      width: 6px; height: 6px;
      background: #1a73e8;
      border-radius: 50%;
      animation: pulse 1s infinite ease-in-out;
    }

    @keyframes pulse {
      0%,100% { opacity: .4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    /* Responsive */
    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 0 1fr;
      }
      .layout.with-history {
        grid-template-columns: min(70vw, 240px) 1fr;
      }
      .toolbar {
        flex-wrap: wrap;
        gap: 8px;
      }
      .model { width: 100%; }
      .select { min-width: 0; width: 100%; }
    }

    .progress {
      position: sticky;
      top: 0;
      height: 2px;
      background: transparent;
      overflow: hidden;
    }

    .progress::before {
      content: '';
      display: block;
      height: 100%;
      width: 30%;
      background: #1a73e8;
      animation: indet 1.2s infinite;
    }

    @keyframes indet {
      0% { margin-left: -30%; }
      50% { margin-left: 50%; }
      100% { margin-left: 100%; }
    }
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
