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
  | { type: 'config'; mode: 'read' | 'agent' | 'combine'; host?: string; port?: number; apiKey?: string }
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
  const [selected2, setSelected2] = useState<string>(''); // Second model for combine mode
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
  const [mode, setMode] = useState<'read' | 'agent' | 'combine'>('read');
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
    const onMessage = (ev: MessageEvent<ChatEvent | any>) => {
      const msg = ev.data;
      switch (msg.type) {
        case 'models':
          setModels(msg.models || []);
          if ((msg.models || []).length && !selected) {
            setSelected((msg.models || [])[0]);
          }
          if ((msg.models || []).length > 1 && !selected2) {
            setSelected2((msg.models || [])[1]);
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
          if ((msg as any).type === 'switchThread' && (msg as any).id) {
            switchThread((msg as any).id);
          }
          if ((msg as any).type === 'deleteThread' && (msg as any).id) {
            deleteThread((msg as any).id);
          }
          if ((msg as any).type === 'newThread') {
            newChat();
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
    const model2 = mode === 'combine' ? (selected2 || (models[1] || '')) : '';
    if (!model || !prompt.trim()) return;
    if (mode === 'combine' && !model2) {
      appendAssistant('Error: Combine mode requires two different models to be selected.');
      return;
    }
    
    // Extract @ file mentions from prompt
    const mentions = prompt.match(/@([\w\-\.\/]+)/g) || [];
    const files = mentions.map(m => m.slice(1)); // Remove @ symbol
    
    appendUser(prompt);
    
    setSending(true);
    setStatus('Streaming');
    
    if (mode === 'combine') {
      vscode.postMessage({ type: 'startChat', models: [model, model2], prompt, useChat, attachedFiles: files, mode: 'combine' });
    } else {
      vscode.postMessage({ type: 'startChat', models: [model], prompt, useChat, attachedFiles: files, mode });
    }
    setPrompt('');
    setAttachedFiles([]);
  }

  function stop() {
    try {
      vscode.postMessage({ type: 'stop' });
    } catch {}
    // Update local state optimistically
    setSending(false);
    setPaused(false);
    setStatus('Ready');
    setPending(0);
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

  function toggleMode(newMode?: 'read' | 'agent' | 'combine') {
    const targetMode = newMode || (mode === 'read' ? 'agent' : mode === 'agent' ? 'combine' : 'read');
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
  if (loading) {
    bubble.innerHTML = '<div class="ai-typing-indicator"><span></span><span></span><span></span></div>';
  } else {
    bubble.textContent = '';
  }
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
      lastAssistant!.innerHTML = ''; // Clear typing indicator
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
    try { vscode.postMessage({ type: 'threadsUpdate', threads: thrs, currentId: id }); } catch {}
  }

  useEffect(() => {
    
    persistState(threads, currentId, historyOpen);
    
  }, [historyOpen]);

  // After initial state is established, publish once so left panel can render
  useEffect(() => {
    try { vscode.postMessage({ type: 'threadsUpdate', threads, currentId }); } catch {}
  }, [currentId]);

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
        <span className="title">Ollama</span>
        <div className="model">
          <span className="model-label">Model {mode === 'combine' ? '1' : ''}</span>
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
        {mode === 'combine' && (
          <div className="model">
            <span className="model-label">Model 2</span>
            <div className="select-wrap">
              <select
                className="select"
                value={selected2}
                onChange={(e) => setSelected2(e.target.value)}
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
        )}
        <span className="tag">{paused ? 'Paused' : status}{(!paused && status === 'Streaming') ? <span className="dot-pulse" /> : null}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => setShowReadme((v) => !v)}>
          📄 README
        </button>
        {(sending || pending > 0) && (
          <button className="btn" onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
        )}
        <button 
          className={`btn ${mode === 'combine' ? 'combine-active' : ''}`}
          onClick={() => toggleMode('combine')}
          title="Combine two AI models for better responses"
        >
          <span className="btn-icon">🔀</span>
          <span className="btn-text">Combine Mode</span>
        </button>
        <button className="btn secondary" onClick={newChat}>
          <span className="btn-icon">＋</span>
          <span className="btn-text">New Chat</span>
        </button>
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'read' ? 'active' : ''}`} onClick={() => toggleMode('read')}>
            <span className="btn-icon">📖</span>
            <span className="btn-text">Read</span>
          </button>
          <button className={`mode-btn ${mode === 'agent' ? 'active' : ''}`} onClick={() => toggleMode('agent')}>
            <span className="btn-icon">🤖</span>
            <span className="btn-text">Agent</span>
          </button>
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
            <div className="readme-form">
              <div className="readme-header">
                <h3>📄 Generate README</h3>
                <button className="close-btn" onClick={() => setShowReadme(false)} title="Close">✕</button>
              </div>
              <div className="readme-options">
                <label className="readme-field">
                  <span className="field-label">📝 Style</span>
                  <select value={readmeStyle} onChange={(e) => setReadmeStyle(e.target.value)}>
                    <option>General</option>
                    <option>Technical (Functionality/API)</option>
                    <option>Product/Showcase</option>
                    <option>Library/Package</option>
                    <option>CLI Tool</option>
                    <option>Backend Service</option>
                  </select>
                </label>
                <label className="readme-field">
                  <span className="field-label">🎯 Placement</span>
                  <select value={readmePlacement} onChange={(e) => setReadmePlacement(e.target.value)}>
                    <option>GitHub</option>
                    <option>VS Code Marketplace</option>
                    <option>Internal Wiki</option>
                    <option>Website</option>
                  </select>
                </label>
                <label className="readme-checkbox">
                  <input type="checkbox" checked={readmeDeep} onChange={(e) => setReadmeDeep(e.target.checked)} />
                  <span>🔍 Deep scan codebase (slower but more detailed)</span>
                </label>
              </div>
              <textarea
                className="readme-notes"
                placeholder="✨ Additional notes: highlight key features, target audience, add badges, mention license, special instructions..."
                value={readmeNotes}
                onChange={(e) => setReadmeNotes(e.target.value)}
              />
              <div className="readme-actions">
                <button className="send" onClick={submitReadme}>
                  <span>✨ Generate README</span>
                </button>
                <button className="btn" onClick={() => setShowReadme(false)}>Cancel</button>
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
          <button
            className="send"
            onClick={() => (pending > 0 ? stop() : send())}
            disabled={sending && pending === 0}
          >
            {pending > 0 ? <span style={{ color: '#ff6b6b', fontWeight: 700 }}>Stop</span>
              : (sending ? <><span className="spinner" /> Sending…</> : 'Send')}
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
      color: var(--vscode-editor-foreground, #e6e6e6);
      background: var(--vscode-editor-background, #1e1e1e);
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
      background: var(--vscode-sideBar-background, rgba(30, 30, 30, 0.95));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.05));
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.08));
      background: var(--vscode-titleBar-activeBackground, rgba(30, 30, 30, 0.95));
      position: sticky;
      top: 0;
      z-index: 3;
      backdrop-filter: blur(14px);
      flex-wrap: wrap;
      min-height: 48px;
    }

    .toolbar .title {
      font-weight: 600;
      font-size: 15px;
      color: var(--vscode-titleBar-activeForeground, #ffffff);
      margin-right: auto;
    }
    
    .toolbar .spacer {
      flex: 1;
      min-width: 20px;
    }

    .icon, .btn, .send {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--vscode-button-secondaryForeground, #e6e6e6);
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .icon:hover, .btn:hover, .send:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 8px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn.secondary {
      background: linear-gradient(135deg, 
        rgba(14, 99, 156, 0.9) 0%, 
        rgba(14, 99, 156, 0.8) 100%);
      color: var(--vscode-button-foreground, #ffffff);
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 4px 16px rgba(14, 99, 156, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn.secondary:hover {
      background: linear-gradient(135deg, 
        rgba(14, 99, 156, 1) 0%, 
        rgba(14, 99, 156, 0.9) 100%);
      box-shadow: 
        0 8px 24px rgba(14, 99, 156, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .btn.combine-active {
      background: linear-gradient(135deg, 
        rgba(255, 107, 107, 0.9) 0%,
        rgba(238, 90, 111, 0.85) 50%,
        rgba(255, 107, 107, 0.9) 100%);
      color: white;
      font-weight: 700;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        0 8px 32px rgba(255, 107, 107, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      animation: pulse-combine 2s ease-in-out infinite;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .btn.combine-active:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 12px 40px rgba(255, 107, 107, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    }

    @keyframes pulse-combine {
      0%, 100% {
        box-shadow: 
          0 8px 32px rgba(255, 107, 107, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }
      50% {
        box-shadow: 
          0 12px 48px rgba(255, 107, 107, 0.7),
          0 0 30px rgba(255, 107, 107, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }
    }

    /* Responsive button text/icons */
    .btn-text {
      display: inline;
    }
    
    .btn-icon {
      display: none;
    }

    /* Keep Combine button always prominent */
    .btn.combine-active .btn-text {
      display: inline !important;
    }

    @media (max-width: 1200px) {
      .toolbar {
        gap: 8px;
        padding: 10px 12px;
      }
      .model {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
        padding: 4px 8px;
      }
      .select {
        min-width: 180px;
        padding: 10px 38px 10px 44px;
        font-size: 13px;
      }
    }

    @media (max-width: 900px) {
      .btn-text:not(.combine-active .btn-text) {
        display: none;
      }
      .btn-icon {
        display: inline;
      }
      .mode-btn {
        padding: 6px 10px;
      }
      .select {
        min-width: 160px;
        padding: 10px 36px 10px 42px;
        font-size: 12px;
      }
      .model-label {
        font-size: 11px;
      }
      /* Combine button stays visible with icon and text */
      .btn.combine-active {
        padding: 8px 12px;
      }
    }

    .model { 
      display:flex; 
      align-items:center; 
      gap:10px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .model-label { 
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground, #e6e6e6);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    .select-wrap { 
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .select-wrap::before {
      content: '🤖';
      position: absolute;
      left: 16px;
      font-size: 18px;
      pointer-events: none;
      z-index: 2;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    .select {
      min-width: 220px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0.08) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      color: var(--vscode-input-foreground, #ffffff);
      border-radius: 16px;
      padding: 12px 42px 12px 48px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-size: 14px;
      font-weight: 600;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      letter-spacing: 0.5px;
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      position: relative;
      overflow: hidden;
    }
    .select::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.1), 
        transparent);
      transition: left 0.5s ease;
    }
    .select:hover::before {
      left: 100%;
    }
    .select:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.15) 0%, 
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.12) 100%);
      border-color: rgba(100, 150, 255, 0.4);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
        0 0 20px rgba(100, 150, 255, 0.15);
    }
    .select:focus {
      outline: none;
      border-color: rgba(100, 150, 255, 0.8);
      background: linear-gradient(135deg, 
        rgba(100, 150, 255, 0.15) 0%, 
        rgba(100, 150, 255, 0.08) 50%,
        rgba(100, 150, 255, 0.12) 100%);
      box-shadow: 
        0 16px 48px rgba(0, 0, 0, 0.25),
        0 0 0 4px rgba(100, 150, 255, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      transform: translateY(-2px) scale(1.02);
    }
    .select:active {
      transform: translateY(0) scale(1);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .select option {
      background: rgba(30, 30, 30, 0.98);
      color: var(--vscode-dropdown-foreground, #ffffff);
      padding: 12px 16px;
      font-weight: 600;
      backdrop-filter: blur(20px);
    }
    .select-wrap::after {
      content: '▼';
      position: absolute; 
      right: 16px;
      top: 50%; 
      transform: translateY(-50%);
      font-size: 10px;
      opacity: .6;
      pointer-events: none;
      color: var(--vscode-foreground, #e6e6e6);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
    .select:hover + .select-wrap::after,
    .select:focus + .select-wrap::after {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
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
      border-right: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      background: var(--vscode-sideBar-background, rgba(30, 30, 30, 0.95));
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
    }

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
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
      border: 1px solid var(--vscode-list-inactiveSelectionBackground, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 8px 10px;
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.03));
      transition: all 0.25s ease;
    }

    .history-item:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.06));
      transform: scale(1.01);
    }

    .history-item.active {
      border-color: var(--vscode-list-activeSelectionBackground, rgba(14, 99, 156, 0.5));
      background: var(--vscode-list-activeSelectionBackground, rgba(14, 99, 156, 0.3));
    }

    .history-title {
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #e6e6e6);
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
      background: var(--vscode-editor-background, rgba(30,30,30,0.95));
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
      background: var(--vscode-editor-background, rgba(30,30,30,0.95));
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      padding: 10px 14px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .prompt {
      flex: 1;
      min-height: 60px;
      resize: none;
      background: var(--vscode-input-background, rgba(255,255,255,0.05));
      color: var(--vscode-input-foreground, #e6e6e6);
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
    }

    .prompt:focus {
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
      background: var(--vscode-input-background, rgba(255,255,255,0.08));
    }

    .send {
      border-radius: 10px;
      font-weight: 500;
      padding: 10px 18px;
      background: var(--vscode-button-background, linear-gradient(135deg, #1a73e8, #1559b3));
      color: var(--vscode-button-foreground, white);
      border: none;
    }

    .send:hover {
      background: var(--vscode-button-hoverBackground, linear-gradient(135deg, #1a73e8, #1559b3));
      filter: brightness(1.1);
      transform: scale(1.03);
    }

    /* README Generator Form */
    .readme-form {
      padding: 20px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      background: var(--vscode-editor-background, rgba(30,30,30,0.98));
      border-radius: 12px;
      margin: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .readme-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .readme-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-foreground, #ffffff);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #cccccc);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.1));
      color: var(--vscode-errorForeground, #f48771);
    }

    .readme-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    .readme-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground, #cccccc);
      opacity: 0.9;
    }

    .readme-field select {
      background: var(--vscode-dropdown-background, rgba(60,60,60,0.95));
      border: 1px solid var(--vscode-dropdown-border, rgba(255,255,255,0.12));
      color: var(--vscode-dropdown-foreground, #e6e6e6);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .readme-field select:hover {
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 0.8));
    }

    .readme-field select:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
    }

    .readme-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      grid-column: 1 / -1;
      padding: 8px;
      border-radius: 6px;
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.03));
    }

    .readme-checkbox input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .readme-checkbox span {
      font-size: 13px;
      color: var(--vscode-foreground, #cccccc);
    }

    .readme-notes {
      width: 100%;
      min-height: 80px;
      resize: vertical;
      background: var(--vscode-input-background, rgba(255,255,255,0.05));
      color: var(--vscode-input-foreground, #e6e6e6);
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.08));
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-family: inherit;
      margin-bottom: 12px;
    }

    .readme-notes:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
    }

    .readme-notes::placeholder {
      color: var(--vscode-input-placeholderForeground, rgba(255,255,255,0.5));
    }

    .readme-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
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
      background: var(--vscode-input-background, rgba(255,255,255,0.04));
      border-radius: 8px;
      padding: 4px;
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    }

    .mode-btn {
      padding: 6px 14px;
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #b3b3b3);
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .mode-btn:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.06));
      color: var(--vscode-foreground, #e6e6e6);
    }

    .mode-btn.active {
      background: var(--vscode-button-background, linear-gradient(135deg, #1a73e8, #1559b3));
      color: var(--vscode-button-foreground, white);
      box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }

    /* AI Response Loading Animation */
    @keyframes typing {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .ai-typing-indicator {
      display: inline-flex;
      gap: 4px;
      padding: 14px 16px;
      align-items: center;
    }

    .ai-typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-textLink-foreground, #4db8ff);
      animation: typing 1.4s infinite;
    }

    .ai-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .ai-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
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
