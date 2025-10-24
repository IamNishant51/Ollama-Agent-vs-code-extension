import React, { useEffect, useMemo, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import { professionalStyles } from './professional-styles';

// Professional SVG Icons (Lucide-style)
const Icons = {
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
  stop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  bot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.66-13.66l-4.24 4.24m0 6l4.24 4.24M23 12h-6m-6 0H1m18.66 5.66l-4.24-4.24m0-6l4.24-4.24"></path></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
  file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',
};

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
    
    // Request models immediately for faster detection
    vscode.postMessage({ type: 'requestModels' });
    vscode.postMessage({ type: 'requestConfig' });
    
    try {
      const state = vscode.getState?.() || {};
      if (state && Array.isArray(state.threads)) {
        setThreads(state.threads);
        setCurrentId(state.currentId || (state.threads[0]?.id || ''));
        if (typeof state.historyOpen === 'boolean') {
          setHistoryOpen(state.historyOpen);
        }
        
        // Load thread content immediately without delay
        const t = (state.threads || []).find((x: Thread) => x.id === (state.currentId || ''));
        if (t && contentRef.current) contentRef.current.innerHTML = t.html || '';
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
        case 'chatError': {
          const message = 'message' in msg ? (msg as any).message || '' : '';
          const isAborted = /aborted/i.test(String(message));
          setSending(false);
          setPending(0);
          setStatus(isAborted ? 'Ready' : 'Error');
          if (isAborted) {
            appendAssistant('This operation was aborted.');
          } else {
            appendAssistant(`Error: ${message}`);
          }
          saveSnapshot();
          break;
        }
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

    // Only add the copy button when not loading to avoid overlap with the typing indicator
    if (!loading) {
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
    }

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
    
    // Handle code blocks with syntax highlighting
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
      const language = lang || 'plaintext';
      const trimmedCode = code.trim();
      
      // Apply Prism syntax highlighting if language is supported
      let highlighted = escapeHtml(trimmedCode);
      if ((Prism.languages as any)[language]) {
        try {
          highlighted = Prism.highlight(trimmedCode, (Prism.languages as any)[language], language);
        } catch (e) {
          // Fallback to escaped code if highlighting fails
          highlighted = escapeHtml(trimmedCode);
        }
      }
      
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

  return (
    <div className="panel">
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
            {pending > 0 ? (
              <span style={{ color: '#1a1a1a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="3" width="10" height="10" rx="2" />
                </svg>
                Stop
              </span>
            ) : (sending ? <><span className="spinner" /> Sending…</> : 'Send')}
          </button>
          </div>
        </main>
      </div>
    </div>
  );
}
function injectStyles() {
  const el = document.createElement('style');
  el.textContent = professionalStyles;
  document.head.appendChild(el);
}

