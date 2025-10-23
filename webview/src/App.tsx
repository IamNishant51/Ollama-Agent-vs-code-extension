import React, { useEffect, useMemo, useRef, useState } from 'react';

type VSCodeAPI = { postMessage: (msg: any) => void; setState: (s: any) => void; getState: () => any };
// @ts-ignore
const vscode: VSCodeAPI = acquireVsCodeApi();

type ChatEvent =
  | { type: 'models'; models: string[] }
  | { type: 'prefill'; text: string }
  | { type: 'chatStart'; model: string }
  | { type: 'chatResume'; model: string }
  | { type: 'chatChunk'; model: string; text: string }
  | { type: 'chatDone'; model: string }
  | { type: 'error'; message: string }
  | { type: 'chatError'; model: string; message: string }
  | { type: 'config'; mode: 'read' | 'agent' };

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
  const [paused, setPaused] = useState(false);
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [useChat, setUseChat] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const lastDoneRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'read' | 'agent'>('read');
  const [showReadme, setShowReadme] = useState(false);
  const [readmeStyle, setReadmeStyle] = useState('General');
  const [readmePlacement, setReadmePlacement] = useState('GitHub');
  const [readmeNotes, setReadmeNotes] = useState('');
  const [readmeDeep, setReadmeDeep] = useState(true);

  useEffect(() => {
    injectStyles();
    // Restore webview state (threads and current thread)
    try {
      const state = vscode.getState?.() || {};
      if (state && Array.isArray(state.threads)) {
        setThreads(state.threads);
        setCurrentId(state.currentId || (state.threads[0]?.id || ''));
        if (typeof state.historyOpen === 'boolean') {
          setHistoryOpen(state.historyOpen);
        }
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
        case 'config':
          setMode(msg.mode);
          break;
        case 'chatStart':
          setSending(false);
          setPaused(false);
          setPending((p) => {
            const np = p + 1;
            setStatus('Streaming');
            return np;
          });
          appendAssistant(msg.model, true);
          break;
        case 'chatResume':
          setPaused(false);
          setStatus('Streaming');
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
          setPaused(false);
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
        default: {
          // @ts-ignore: custom events
          if ((msg as any).type === 'openReadmeGenerator') {
            setShowReadme(true);
          }
          break;
        }
      }
    };
    window.addEventListener('message', onMessage);
    vscode.postMessage({ type: 'requestModels' });
    vscode.postMessage({ type: 'requestConfig' });
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

  function submitReadme() {
    const model = selected || (models[0] || '');
    if (!model) return;
    vscode.postMessage({
      type: 'startReadme',
      model,
      style: readmeStyle,
      placement: readmePlacement,
      notes: readmeNotes,
      deep: readmeDeep
    });
    // Also add a user bubble to mark the action
    appendUser(`Generate a ${readmeStyle} README for ${readmePlacement}${readmeNotes ? ' with notes: ' + readmeNotes : ''}`);
  }

  function togglePause() {
    if (paused) {
      vscode.postMessage({ type: 'resume' });
      setPaused(false);
      setStatus('Streaming');
    } else {
      vscode.postMessage({ type: 'pause' });
      setPaused(true);
      setStatus('Ready');
    }
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

    // Copy icon on the assistant bubble
    const copyIcon = document.createElement('button');
    copyIcon.className = 'copy-all';
    copyIcon.title = 'Copy response';
    copyIcon.setAttribute('aria-label', 'Copy response');
    copyIcon.innerHTML = `
      <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    copyIcon.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(bubble.textContent || '');
        copyIcon.classList.add('copied');
        setTimeout(() => copyIcon.classList.remove('copied'), 1200);
      } catch {}
    });
    bubble.appendChild(copyIcon);

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

    // If the message contains an edits JSON block, add Review/Apply actions
    try {
      const payload = extractEditsFrom(txt);
      if (payload && Array.isArray(payload.changes) && payload.changes.length > 0) {
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '6px';
        actions.style.marginTop = '6px';
        const review = document.createElement('button');
        review.className = 'send';
        review.textContent = 'Review edits';
        review.addEventListener('click', () => vscode.postMessage({ type: 'previewEdits', payload }));
        const apply = document.createElement('button');
        apply.className = 'send';
        apply.textContent = 'Apply edits';
        apply.addEventListener('click', () => vscode.postMessage({ type: 'applyEdits', payload }));
        actions.appendChild(review);
        actions.appendChild(apply);
        lastAssistant.parentElement?.appendChild(actions);
        if (mode === 'agent') {
          vscode.postMessage({ type: 'applyEdits', payload });
        }
      }
    } catch {}
  }

  function extractEditsFrom(text: string): any | null {
    // Look for ```edits ...``` or ```json ...``` code fence containing an object with "changes"
    const fences = text.match(/```(edits|json)\n([\s\S]*?)```/i);
    if (!fences) return null;
    const raw = fences[2];
    try {
      const obj = JSON.parse(raw);
      if (obj && Array.isArray(obj.changes)) return obj;
    } catch {}
    return null;
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
      persistState(next, currentId, historyOpen);
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
    persistState(threads, id, historyOpen);
  }

  function newChat() {
    // Save current, then create a new one and switch
    saveSnapshot();
    const t = createNewThread();
    const next = [t, ...threads];
    setThreads(next);
    setCurrentId(t.id);
    if (contentRef.current) contentRef.current.innerHTML = '';
    persistState(next, t.id, historyOpen);
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
    persistState(next, nextId, historyOpen);
  }

  function persistState(thrs: Thread[], id: string, history: boolean) {
    try { vscode.setState?.({ threads: thrs, currentId: id, historyOpen: history }); } catch {}
  }

  useEffect(() => {
    // Persist when history visibility toggles
    persistState(threads, currentId, historyOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyOpen]);

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
        <span className="tag">{paused ? 'Paused' : status}{(!paused && status === 'Streaming') ? <span className="dot-pulse" /> : null}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => setShowReadme((v) => !v)}>README</button>
        {(sending || pending > 0) && (
          <button className="btn" onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
        )}
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
          {showReadme && (
            <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20,20,20,0.6)' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: .85 }}>Style</span>
                  <select value={readmeStyle} onChange={(e) => setReadmeStyle(e.target.value)}>
                    <option>General</option>
                    <option>Technical (Functionality/API)</option>
                    <option>Product/Showcase</option>
                    <option>Library/Package</option>
                    <option>CLI Tool</option>
                    <option>Backend Service</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: .85 }}>Placement</span>
                  <select value={readmePlacement} onChange={(e) => setReadmePlacement(e.target.value)}>
                    <option>GitHub</option>
                    <option>VS Code Marketplace</option>
                    <option>Internal Wiki</option>
                    <option>Website</option>
                  </select>
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={readmeDeep} onChange={(e) => setReadmeDeep(e.target.checked)} />
                  <span style={{ fontSize: 12, opacity: .85 }}>Read more of the codebase (slower)</span>
                </label>
              </div>
              <textarea
                placeholder="Additional notes: highlight features, target audience, badges, license, etc."
                value={readmeNotes}
                onChange={(e) => setReadmeNotes(e.target.value)}
                style={{ width: '100%', minHeight: 60 }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="send" onClick={submitReadme}>Generate README</button>
                <button className="btn" onClick={() => setShowReadme(false)}>Hide</button>
              </div>
            </div>
          )}
          <div id="content" ref={contentRef} className="content" aria-live="polite" />
          <div className="composer">
        <textarea
          className="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about your codebase... (Shift+Enter for newline)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
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
    html, body, #root { height: 100%; }
    body {
      font-family: Inter, 'Segoe UI', sans-serif;
      margin: 0;
      color: #e6e6e6;
      background: #0e0e0e;
      display: flex;
      height: 100vh;
      overflow: hidden; /* prevent page scroll; let content area handle it */
    }

    #root { width: 100%; display: flex; }

    .panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 100vh;
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
      min-height: 0; /* allow children to size correctly */
      height: 100%;
      background: rgba(18,18,18,0.7);
      backdrop-filter: blur(14px);
    }

    .content {
      flex: 1;
      min-height: 0;
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
      display: inline-block; /* shrink to content instead of full width */
      max-width: 90%;
      padding: 14px 16px;
      border-radius: 14px;
      line-height: 1.5;
      font-size: 14px;
      box-shadow: 0 0 8px rgba(255,255,255,0.05);
      overflow-wrap: anywhere;
    }

    .assistant {
      background: linear-gradient(145deg, rgba(40,40,40,0.9), rgba(25,25,25,0.9));
      border: 1px solid rgba(255,255,255,0.08);
      align-self: flex-start;
      position: relative;
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

    /* Tighter inner spacing in assistant/user bubbles */
    .bubble p { margin: 0 0 8px; }
    .bubble p:last-child { margin-bottom: 0; }

    pre.code { max-width: 100%; margin: 8px 0; }

    /* Composer */
    .composer {
      /* composer stays fixed at bottom of panel; content scrolls */
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

    .copy-all {
      position: absolute;
      top: 8px; right: 8px;
      width: 28px; height: 28px;
      display: inline-flex;
      align-items: center; justify-content: center;
      background: rgba(255,255,255,0.06);
      color: #e6e6e6;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      cursor: pointer;
      opacity: .85;
      transition: all .2s ease;
    }
    .copy-all:hover { background: rgba(255,255,255,0.12); opacity: 1; }
    .copy-all .icon-check { display: none; }
    .copy-all.copied { color: #45c46b; transform: scale(1.05); }
    .copy-all.copied .icon-copy { display: none; }
    .copy-all.copied .icon-check { display: inline; }

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

    /* Quick Actions removed from right panel per request */
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
