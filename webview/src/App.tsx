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
  | { type: 'config'; mode: 'read' | 'agent'; host?: string; port?: number; apiKey?: string }
  | { type: 'configSaved' };

type Thread = {
  id: string;
  title: string;
  html: string; 
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
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(11434);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    injectStyles();
    
    try {
      const state = vscode.getState?.() || {};
      if (state && Array.isArray(state.threads)) {
        setThreads(state.threads);
        setCurrentId(state.currentId || (state.threads[0]?.id || ''));
        if (typeof state.historyOpen === 'boolean') {
          setHistoryOpen(state.historyOpen);
        }
        
        setTimeout(() => {
          const t = (state.threads || []).find((x: Thread) => x.id === (state.currentId || ''));
          if (t && contentRef.current) contentRef.current.innerHTML = t.html || '';
        }, 0);
      } else {
        
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
          if (msg.host) setHost(msg.host);
          if (msg.port) setPort(msg.port);
          if (msg.apiKey) setApiKey(msg.apiKey);
          break;
        case 'configSaved':
          setSavingSettings(false);
          // Optionally show a success message or notification
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
    
    // Extract @ file mentions from prompt
    const mentions = prompt.match(/@([\w\-\.\/]+)/g) || [];
    const files = mentions.map(m => m.slice(1)); // Remove @ symbol
    
    appendUser(prompt);
    
    setSending(true);
    setStatus('Streaming');
    vscode.postMessage({ type: 'startChat', models: [model], prompt, useChat, attachedFiles: files });
    setPrompt('');
    setAttachedFiles([]);
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
    
    appendUser(`Generate a ${readmeStyle} README for ${readmePlacement}${readmeNotes ? ' with notes: ' + readmeNotes : ''}`);
  }

  function saveSettings() {
    setSavingSettings(true);
    vscode.postMessage({
      type: 'updateConfig',
      config: { host, port, apiKey }
    });
    setTimeout(() => {
      setSavingSettings(false);
      setShowSettings(false);
    }, 800);
  }

  function toggleMode(newMode?: 'read' | 'agent') {
    const targetMode = newMode || (mode === 'read' ? 'agent' : 'read');
    setMode(targetMode);
    vscode.postMessage({
      type: 'updateConfig',
      config: { mode: targetMode }
    });
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
    // Escape HTML
    let html = escapeHtml(text);
    
    // Handle code blocks with syntax highlighting classes
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
      const language = lang || 'plaintext';
      const highlighted = escapeHtml(code);
      return `<pre class="code-block" data-lang="${language}"><code class="language-${language}">${highlighted}</code></pre>`;
    });
    
    // Handle inline code
    html = html.replace(/`([^`]+)`/g, (_m, c) => `<code class="inline-code">${escapeHtml(c)}</code>`);
    
    // Handle bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle lists
    html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Handle headers
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Handle paragraphs
    html = html
      .split(/\n\n+/)
      .map((p) => {
        if (p.trim().startsWith('<pre') || p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<li')) {
          return p;
        }
        return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');
      
    return html;
  }

  function finalizeLastAssistant() {
    if (!lastAssistant) return;
    const txt = lastAssistant.textContent || '';
    lastAssistant.innerHTML = renderMarkdownLike(txt);
    lastDoneRef.current = lastAssistant;
    
    // Add copy buttons to code blocks
    const blocks = lastAssistant.querySelectorAll('pre.code-block');
    blocks.forEach((pre) => {
      const lang = pre.getAttribute('data-lang') || '';
      const header = document.createElement('div');
      header.className = 'code-header';
      header.innerHTML = `<span class="code-lang">${lang}</span>`;
      
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.innerHTML = `
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="copy-text">Copy</span>
      `;
      btn.addEventListener('click', async () => {
        const codeEl = pre.querySelector('code');
        const code = codeEl?.textContent || '';
        try { 
          await navigator.clipboard.writeText(code);
          btn.classList.add('copied');
          const textEl = btn.querySelector('.copy-text');
          if (textEl) textEl.textContent = 'Copied!';
          setTimeout(() => {
            btn.classList.remove('copied');
            if (textEl) textEl.textContent = 'Copy';
          }, 2000);
        } catch {}
      });
      header.appendChild(btn);
      pre.insertBefore(header, pre.firstChild);
    });

    // Re-add the copy-all button
    const existingCopy = lastAssistant.querySelector('.copy-all');
    if (!existingCopy) {
      const copyIcon = document.createElement('button');
      copyIcon.className = 'copy-all';
      copyIcon.title = 'Copy response';
      copyIcon.innerHTML = `
        <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      copyIcon.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(txt);
          copyIcon.classList.add('copied');
          setTimeout(() => copyIcon.classList.remove('copied'), 1200);
        } catch {}
      });
      lastAssistant.appendChild(copyIcon);
    }

    // Handle edits
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
    
    saveSnapshot();
    setCurrentId(id);
    const t = threads.find((x) => x.id === id);
    if (t && contentRef.current) {
      contentRef.current.innerHTML = t.html || '';
    }
    persistState(threads, id, historyOpen);
  }

  function newChat() {
    
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
    
    persistState(threads, currentId, historyOpen);
    
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
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'read' ? 'active' : ''}`} onClick={() => toggleMode('read')}>Read</button>
          <button className={`mode-btn ${mode === 'agent' ? 'active' : ''}`} onClick={() => toggleMode('agent')}>Agent</button>
        </div>
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
          
          {/* Settings Section */}
          <div className="settings-section">
            <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.66-9l-3 5.2m-3.46 0l-3-5.2m-1.29 8.66l5.2-3m0-3.46l-5.2-3m14.49 1.29l-5.2 3m0 3.46l5.2 3"/>
              </svg>
              Settings
            </button>
            {showSettings && (
              <div className="settings-panel">
                <h3 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Connection Settings</h3>
                <label className="setting-label">
                  <span>Host</span>
                  <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost" />
                </label>
                <label className="setting-label">
                  <span>Port</span>
                  <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} placeholder="11434" />
                </label>
                <label className="setting-label">
                  <span>API Key (Optional)</span>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Optional API Key" />
                </label>
                <button className="send" onClick={saveSettings} disabled={savingSettings} style={{ width: '100%', marginTop: 8 }}>
                  {savingSettings ? <><span className="spinner" /> Saving...</> : 'Save Settings'}
                </button>
              </div>
            )}
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
          placeholder="Ask anything... Type @filename to attach files (e.g., @src/app.ts)"
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
      overflow: hidden; 
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
      content: '\u25BC'; 
      position: absolute; 
      right: 10px;
      top: 50%; 
      transform: translateY(-50%);
      font-size: 10px; 
      opacity: .8; 
      pointer-events: none;
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
      min-height: 0; 
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
      display: inline-block; 
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

    
    .bubble p { margin: 0 0 8px; }
    .bubble p:last-child { margin-bottom: 0; }

    pre.code { max-width: 100%; margin: 8px 0; }

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

    /* Settings Panel */
    .settings-section {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .settings-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 10px 12px;
      color: #e6e6e6;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .settings-toggle:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.15);
    }

    .settings-toggle svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }

    .settings-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      margin-top: 8px;
    }

    .settings-panel.show {
      max-height: 400px;
    }

    .setting-label {
      display: block;
      color: #b3b3b3;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 4px;
      margin-top: 12px;
    }

    .settings-panel input {
      width: 100%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #e6e6e6;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .settings-panel input:focus {
      outline: none;
      background: rgba(255,255,255,0.08);
      border-color: #1a73e8;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    }

    .settings-panel button {
      width: 100%;
      margin-top: 16px;
      padding: 10px;
      background: linear-gradient(135deg, #1a73e8, #1559b3);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .settings-panel button:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .settings-panel button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Composer Actions & Mode Toggle */
    .composer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }

    .mode-toggle {
      display: flex;
      gap: 6px;
      background: rgba(255,255,255,0.04);
      border-radius: 8px;
      padding: 4px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .mode-btn {
      padding: 6px 14px;
      background: transparent;
      border: none;
      color: #b3b3b3;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .mode-btn:hover {
      background: rgba(255,255,255,0.06);
      color: #e6e6e6;
    }

    .mode-btn.active {
      background: linear-gradient(135deg, #1a73e8, #1559b3);
      color: white;
      box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }

    /* Enhanced Code Blocks */
    .code-block {
      position: relative;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      margin: 12px 0;
      overflow: hidden;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .code-lang {
      font-size: 11px;
      font-weight: 600;
      color: #b3b3b3;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .copy-code-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 5px;
      color: #e6e6e6;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-code-btn:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.2);
    }

    .copy-code-btn.copied {
      background: rgba(69, 196, 107, 0.15);
      border-color: rgba(69, 196, 107, 0.3);
      color: #45c46b;
    }

    .copy-code-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .code-block pre {
      margin: 0;
      padding: 14px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
      color: #e6e6e6;
    }

    .code-block code {
      display: block;
      font-family: inherit;
      white-space: pre;
    }

    /* Inline Code */
    .inline-code {
      display: inline;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #f0f0f0;
    }

    /* Syntax Highlighting */
    .language-javascript .keyword, .language-typescript .keyword, .language-js .keyword, .language-ts .keyword {
      color: #c586c0;
    }

    .language-javascript .string, .language-typescript .string, .language-js .string, .language-ts .string {
      color: #ce9178;
    }

    .language-javascript .function, .language-typescript .function, .language-js .function, .language-ts .function {
      color: #dcdcaa;
    }

    .language-javascript .comment, .language-typescript .comment, .language-js .comment, .language-ts .comment {
      color: #6a9955;
      font-style: italic;
    }

    .language-python .keyword {
      color: #569cd6;
    }

    .language-python .string {
      color: #ce9178;
    }

    .language-python .function {
      color: #dcdcaa;
    }

    .language-python .comment {
      color: #6a9955;
      font-style: italic;
    }

    .language-html .tag, .language-xml .tag {
      color: #569cd6;
    }

    .language-html .attr-name, .language-xml .attr-name {
      color: #9cdcfe;
    }

    .language-html .attr-value, .language-xml .attr-value {
      color: #ce9178;
    }

    .language-css .property {
      color: #9cdcfe;
    }

    .language-css .value {
      color: #ce9178;
    }

    .language-css .selector {
      color: #d7ba7d;
    }

    .language-json .property {
      color: #9cdcfe;
    }

    .language-json .string {
      color: #ce9178;
    }

    .language-json .number {
      color: #b5cea8;
    }

    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #1a73e8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Improved Bubble Styling - Remove Card Appearance */
    .bubble.assistant {
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
      margin: 16px 0;
    }

    .bubble.assistant p {
      margin: 8px 0;
      line-height: 1.6;
      color: #e6e6e6;
    }

    .bubble.assistant h1,
    .bubble.assistant h2,
    .bubble.assistant h3,
    .bubble.assistant h4 {
      margin: 16px 0 8px 0;
      font-weight: 600;
      color: #f0f0f0;
      line-height: 1.4;
    }

    .bubble.assistant h1 {
      font-size: 1.8em;
      border-bottom: 2px solid rgba(255,255,255,0.1);
      padding-bottom: 8px;
    }

    .bubble.assistant h2 {
      font-size: 1.5em;
    }

    .bubble.assistant h3 {
      font-size: 1.3em;
    }

    .bubble.assistant ul,
    .bubble.assistant ol {
      margin: 8px 0;
      padding-left: 24px;
      line-height: 1.8;
    }

    .bubble.assistant li {
      margin: 4px 0;
      color: #e6e6e6;
    }

    .bubble.assistant strong {
      font-weight: 600;
      color: #f0f0f0;
    }

    .bubble.assistant em {
      font-style: italic;
      color: #d0d0d0;
    }

    .bubble.assistant blockquote {
      margin: 12px 0;
      padding: 8px 16px;
      border-left: 4px solid rgba(26, 115, 232, 0.5);
      background: rgba(26, 115, 232, 0.05);
      color: #d0d0d0;
      font-style: italic;
    }

    .bubble.assistant a {
      color: #1a73e8;
      text-decoration: none;
      border-bottom: 1px solid rgba(26, 115, 232, 0.3);
      transition: all 0.2s ease;
    }

    .bubble.assistant a:hover {
      border-bottom-color: #1a73e8;
    }
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
