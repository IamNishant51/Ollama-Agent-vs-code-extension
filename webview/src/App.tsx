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

export default function App() {
  const [models, setModels] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'Ready' | 'Streaming' | 'Error'>('Ready');
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [useChat, setUseChat] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastDoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    injectStyles();
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
          break;
        case 'error':
        case 'chatError':
          setSending(false);
          setPending(0);
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
        <select
          className="select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="tag">{status}{status === 'Streaming' ? <span className="dot-pulse" /> : null}</span>
        <span className="spacer" />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={useChat} onChange={(e) => setUseChat(e.target.checked)} /> Chat API
        </label>
      </div>
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
    </div>
  );
}

function injectStyles() {
  const css = `
    :root { color-scheme: dark; }
    body { font-family: var(--vscode-font-family); margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); display:flex; height:100vh; }
    .panel { display:flex; flex-direction:column; width:100%; }
    .toolbar { display:flex; gap:8px; align-items:center; padding:10px; border-bottom: 1px solid var(--vscode-panel-border); background: var(--vscode-editor-background); position:sticky; top:0; z-index:2; }
    .toolbar .title { font-weight:600; }
    .select { min-width: 220px; }
    .content { flex:1; overflow:auto; padding: 16px; display:flex; flex-direction:column; gap:14px; }
    .composer { display:flex; gap:8px; padding:8px; border-top:1px solid var(--vscode-panel-border); background: var(--vscode-editor-background); }
    .prompt { flex:1; min-height: 64px; resize: vertical; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius:6px; padding:8px; }
    .send { width:auto; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius:6px; padding:8px 12px; }
    .send:disabled { opacity:.8; }
    .bubble { max-width: 90%; padding:12px 14px; border-radius:12px; line-height:1.5; }
    .assistant { background: color-mix(in srgb, var(--vscode-editor-foreground) 10%, transparent); border: 1px solid var(--vscode-input-border); align-self:flex-start; box-shadow: 0 1px 0 rgba(0,0,0,.2); }
    .user { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); align-self:flex-end; }
    .meta { font-size: 11px; opacity: .8; margin-bottom: 4px; }
    .msg { display:flex; flex-direction:column; gap:4px; }
    .code { position: relative; background: var(--vscode-editor-background); border: 1px solid var(--vscode-input-border); border-radius:8px; padding:12px; font-family: var(--vscode-editor-font-family); overflow:auto; }
    .copy-code { position:absolute; top:8px; right:8px; font-size: 11px; padding:4px 8px; border:none; border-radius:4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor:pointer; }
    .copy-code:hover { filter: brightness(1.1); }
    code.inline { padding: 2px 4px; background: color-mix(in srgb, var(--vscode-editor-foreground) 15%, transparent); border-radius: 4px; }
    .tag { display:inline-flex; align-items:center; gap:6px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-radius: 999px; padding: 2px 8px; font-size: 11px; }
    .dot-pulse { width: 6px; height: 6px; background: var(--vscode-badge-foreground); border-radius: 50%; display:inline-block; animation: pulse 1s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.25); } }
    .spinner { width: 14px; height: 14px; border: 2px solid transparent; border-top-color: var(--vscode-button-foreground); border-radius: 50%; display:inline-block; animation: spin .8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
    .bubble.loading { position: relative; }
    .bubble.loading::after { content: ''; display:inline-block; width: 28px; height: 8px; background:
      radial-gradient(circle 2px, var(--vscode-foreground) 60%, transparent 61%) 0% 50%/8px 8px,
      radial-gradient(circle 2px, var(--vscode-foreground) 60%, transparent 61%) 50% 50%/8px 8px,
      radial-gradient(circle 2px, var(--vscode-foreground) 60%, transparent 61%) 100% 50%/8px 8px;
      animation: typing 1.2s infinite ease-in-out; opacity:.7; }
    @keyframes typing { 0% { transform: translateX(-8px); } 50% { transform: translateX(0); } 100% { transform: translateX(-8px); } }
    .progress { position: sticky; top: 0; height: 2px; background: transparent; overflow: hidden; }
    .progress::before { content: ''; display:block; height:100%; width: 30%; background: var(--vscode-progressBar-background, var(--vscode-button-background)); animation: indet 1.2s infinite; }
    @keyframes indet { 0% { margin-left: -30%; } 50% { margin-left: 50%; } 100% { margin-left: 100%; } }
    @media (max-width: 900px) { .toolbar { flex-wrap: wrap; } .select { min-width: 140px; } }
    .spacer { flex:1; }
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
