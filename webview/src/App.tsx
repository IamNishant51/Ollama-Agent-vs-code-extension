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
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-graphql';
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

// Reduce noisy console logging in production
const DEBUG = false;

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
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [selected2, setSelected2] = useState<string>(''); // Second model for combine mode
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'Ready' | 'Streaming' | 'Error' | 'Stopped'>('Ready');
  const [paused, setPaused] = useState(false);
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [useChat, setUseChat] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const historyOpenRef = useRef(historyOpen);
  useEffect(() => { historyOpenRef.current = historyOpen; }, [historyOpen]);
  const lastDoneRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'read' | 'agent' | 'combine'>('read');
  const modeRef = useRef<'read' | 'agent' | 'combine'>(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const [showReadme, setShowReadme] = useState(false);
  const [readmeStyle, setReadmeStyle] = useState('General');
  const [readmePlacement, setReadmePlacement] = useState('GitHub');
  const [readmeNotes, setReadmeNotes] = useState('');
  const [readmeDeep, setReadmeDeep] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; extension: string }>>([]);
  const [apiKey, setApiKey] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(11434);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoHideHistory, setAutoHideHistory] = useState(true);
  const [compactTables, setCompactTables] = useState(false);
  const [stripedTables, setStripedTables] = useState(true);
  const [activities, setActivities] = useState<Array<{ id: string; text: string; status: 'running' | 'done' | 'error' }>>([]);
  // Distinct Apply animation overlay
  const [applying, setApplying] = useState(false);
  const applyTimerRef = useRef<number | null>(null);

  function showApplyOverlay(duration = 8000) {
    try { setApplying(true); } catch {}
    if (applyTimerRef.current) {
      try { window.clearTimeout(applyTimerRef.current); } catch {}
    }
    // duration <= 0 means keep overlay until explicitly hidden by a "done" event
    if (duration > 0) {
      // Use window.setTimeout for DOM timer id type
      applyTimerRef.current = window.setTimeout(() => {
        try { setApplying(false); } catch {}
        applyTimerRef.current = null;
      }, duration) as unknown as number;
    }
  }
  function hideApplyOverlay() {
    if (applyTimerRef.current) {
      try { window.clearTimeout(applyTimerRef.current); } catch {}
      applyTimerRef.current = null;
    }
    try { setApplying(false); } catch {}
  }

  // Activity lifecycle helpers
  function startActivity(id: string, text: string, opts?: { autoDoneAfter?: number; autoRemoveAfter?: number }) {
    setActivities((prev) => [{ id, text, status: 'running' }, ...prev.filter((a) => a.id !== id)]);
    if (opts?.autoDoneAfter && opts.autoDoneAfter > 0) {
      setTimeout(() => {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'done' } : a)));
        if (opts?.autoRemoveAfter && opts.autoRemoveAfter > 0) {
          setTimeout(() => setActivities((prev) => prev.filter((a) => a.id !== id)), opts.autoRemoveAfter);
        }
      }, opts.autoDoneAfter);
    }
  }
  function completeActivity(id: string, removeDelay = 1500) {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'done' } : a)));
    if (removeDelay > 0) setTimeout(() => setActivities((prev) => prev.filter((a) => a.id !== id)), removeDelay);
  }
  function errorActivity(id: string, removeDelay = 2500) {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'error' } : a)));
    if (removeDelay > 0) setTimeout(() => setActivities((prev) => prev.filter((a) => a.id !== id)), removeDelay);
  }

  useEffect(() => {
    injectStyles();
    
    // Request models immediately for faster detection
    vscode.postMessage({ type: 'requestModels' });
    vscode.postMessage({ type: 'requestConfig' });
    // Request persisted threads/settings from extension (globalState), so history survives restarts
    try { vscode.postMessage({ type: 'requestThreads' }); } catch {}
    
    try {
      const state = vscode.getState?.() || {};
      if (state && Array.isArray(state.threads)) {
        setThreads(state.threads);
        setCurrentId(state.currentId || (state.threads[0]?.id || ''));
        if (typeof state.historyOpen === 'boolean') {
          setHistoryOpen(state.historyOpen);
        }
        if (typeof state.autoHideHistory === 'boolean') {
          setAutoHideHistory(state.autoHideHistory);
        }
        if (typeof state.compactTables === 'boolean') setCompactTables(state.compactTables);
        if (typeof state.stripedTables === 'boolean') setStripedTables(state.stripedTables);
        
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
      if (DEBUG) console.log('📩 Webview received message:', msg.type, msg);
      
      switch (msg.type) {
        case 'threadsState': {
          const incoming = msg as any;
          const thrs: Thread[] = Array.isArray(incoming.threads) ? incoming.threads : [];
          const curId: string = incoming.currentId || thrs[0]?.id || '';
          const histOpen: boolean = typeof incoming.historyOpen === 'boolean' ? incoming.historyOpen : historyOpenRef.current;
          const autoHide: boolean = typeof incoming.autoHideHistory === 'boolean' ? incoming.autoHideHistory : autoHideHistory;
          const compact: boolean = typeof incoming.compactTables === 'boolean' ? incoming.compactTables : compactTables;
          const striped: boolean = typeof incoming.stripedTables === 'boolean' ? incoming.stripedTables : stripedTables;
          setThreads(thrs);
          setCurrentId(curId);
          setHistoryOpen(histOpen);
          setAutoHideHistory(autoHide);
          setCompactTables(compact);
          setStripedTables(striped);
          try {
            if (curId && contentRef.current) {
              const t = thrs.find((x) => x.id === curId);
              if (t) contentRef.current.innerHTML = t.html || '';
            }
          } catch {}
          break;
        }
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
          // Add a visible activity pill when streaming starts
          try { startActivity('gen', `Generating response… (${msg.model})`); } catch {}
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
          // Mark activity done and fade out later
          try { completeActivity('gen', 1500); } catch {}
          saveSnapshot();
          break;
        case 'agentActivity': {
          const id = String(msg.id || `act-${Date.now()}`);
          const text = String(msg.text || 'Working…');
          try { startActivity(id, text, { autoDoneAfter: 2400, autoRemoveAfter: 1400 }); } catch {}
          // Improved heuristic: show overlay on start verbs, hide on completion verbs
          const tl = text.toLowerCase();
          const startLike = /(apply|applying|merge|merging|write|writing|save|saving|update|updating)/.test(tl);
          const doneLike = /(applied|merged|wrote|written|saved|completed|complete|done|success|succeeded|reverted|canceled|cancelled)/.test(tl);
          if (startLike && !doneLike) {
            // Keep overlay visible until an explicit done-like event arrives
            showApplyOverlay(0);
          } else if (doneLike) {
            setTimeout(() => {
              hideApplyOverlay();
              // Clean up any lingering Accept/Decline controls
              try {
                const root = contentRef.current!;
                root.querySelectorAll('.apply-confirm-actions').forEach((n) => n.remove());
              } catch {}
            }, 400);
          }
          break;
        }
        case 'applyConfirm': {
          const id = String((msg as any).id || '');
          const file = String((msg as any).file || 'file');
          // Create a compact assistant bubble with Accept/Decline
          appendAssistant(undefined, false);
          appendAssistantChunk(`Review changes to ${file}.`);
          finalizeLastAssistant();
          // Render buttons under the last assistant message
          if (lastDoneRef.current) {
            // Remove any existing confirm controls before adding new ones
            try {
              const root = contentRef.current!;
              root.querySelectorAll('.apply-confirm-actions').forEach((n) => n.remove());
            } catch {}
            const actions = document.createElement('div');
            actions.className = 'apply-confirm-actions';
            actions.style.display = 'flex';
            actions.style.gap = '8px';
            actions.style.marginTop = '8px';
            const accept = document.createElement('button');
            accept.className = 'send';
            accept.textContent = 'Accept';
            accept.addEventListener('click', () => {
              try { vscode.postMessage({ type: 'applyConfirmResponse', id, action: 'accept' }); } catch {}
              // Hide controls immediately after click
              try {
                const parent = actions.parentElement;
                actions.remove();
                // Keep focus on content bottom
                const root = contentRef.current!;
                root.scrollTop = root.scrollHeight;
              } catch {}
            });
            const decline = document.createElement('button');
            decline.className = 'btn';
            decline.textContent = 'Decline';
            decline.addEventListener('click', () => {
              try { vscode.postMessage({ type: 'applyConfirmResponse', id, action: 'decline' }); } catch {}
              // Hide controls immediately after click
              try {
                const parent = actions.parentElement;
                actions.remove();
                const root = contentRef.current!;
                root.scrollTop = root.scrollHeight;
              } catch {}
            });
            actions.appendChild(accept);
            actions.appendChild(decline);
            lastDoneRef.current.parentElement?.appendChild(actions);
            // Ensure the newest controls are visible
            try {
              const root = contentRef.current!;
              root.scrollTop = root.scrollHeight;
            } catch {}
          }
          break;
        }
        case 'error':
        case 'chatError': {
          let message = 'message' in msg ? (msg as any).message || '' : '';
          if (/empty\s*content/i.test(message)) {
            message = 'Model returned empty content';
          }
          const isAborted = /aborted/i.test(String(message));
          setSending(false);
          setPending(0);
          setStatus(isAborted ? 'Ready' : 'Error');
          const errorText = isAborted ? 'This operation was aborted.' : `Error: ${message}`;
          const errorModel = 'model' in msg ? (msg as any).model : undefined;
          // Render error as message content, not as the meta model label text
          appendAssistant(errorModel || undefined, false);
          appendAssistantChunk(errorText);
          finalizeLastAssistant();
          try { errorActivity('gen'); } catch {}
          hideApplyOverlay();
          saveSnapshot();
          break;
        }
        default: {
          
          if ((msg as any).type === 'openReadmeGenerator') {
            setShowReadme(true);
          }
          if ((msg as any).type === 'filesPicked' && Array.isArray((msg as any).files)) {
            const picked: string[] = (msg as any).files;
            const filesWithExt = picked.map((name) => ({
              name,
              extension: name.split('.').pop() || ''
            }));
            setAttachedFiles((prev) => {
              const existing = new Set(prev.map((f) => f.name));
              const newFiles = filesWithExt.filter((f) => !existing.has(f.name));
              return [...prev, ...newFiles];
            });
          }
          if ((msg as any).type === 'autoAttachFile' && (msg as any).fileName) {
            // Auto-attach current file when chat opens (like Cursor)
            // This REPLACES all files with the current one (like Cursor behavior)
            const fileName: string = (msg as any).fileName;
            const fileExtension: string = (msg as any).fileExtension || fileName.split('.').pop() || '';
            console.log('Auto-attaching file (replacing previous):', fileName, 'ext:', fileExtension);
            
            // Always replace with just the current file
            setAttachedFiles([{ name: fileName, extension: fileExtension }]);
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

  // Auto-size composer textarea as user types
  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = 200; // keep in sync with CSS max-height
    el.style.height = Math.min(max, el.scrollHeight) + 'px';
  }, [prompt]);

  // Get file icon (Unicode symbols that look professional)
  function getFileIcon(extension: string): string {
    const ext = extension.toLowerCase();
    const iconMap: Record<string, string> = {
      // Programming Languages
      js: '⚡',
      jsx: '⚛',
      ts: '📘',
      tsx: '⚛',
      py: '🐍',
      java: '☕',
      cpp: '⚙',
      c: '⚙',
      cs: '#️⃣',
      go: '🔷',
      rs: '🦀',
      php: '🐘',
      rb: '💎',
      swift: '🕊',
      kt: '🅺',
      
      // Web
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      sass: '🎨',
      less: '🎨',
      
      // Data/Config
      json: '📋',
      xml: '📄',
      yaml: '⚙',
      yml: '⚙',
      toml: '⚙',
      ini: '⚙',
      
      // Markdown/Docs
      md: '📝',
      txt: '📄',
      pdf: '📕',
      
      // Others
      sh: '🖥',
      bat: '🖥',
      cmd: '🖥',
      sql: '🗄',
      env: '🔧',
    };
    
    return iconMap[ext] || '📄';
  }

  function handleFixCode() {
    vscode.postMessage({ type: 'fixCode' });
  }

  function handleOptimizeCode() {
    vscode.postMessage({ type: 'optimizeCode' });
  }

  function handleGenerateTests() {
    vscode.postMessage({ type: 'generateTests' });
  }

  function handleRefactorCode() {
    vscode.postMessage({ type: 'refactorCode' });
  }

  function handleAddComments() {
    vscode.postMessage({ type: 'addComments' });
  }

  function handleAttachFiles() {
    vscode.postMessage({ type: 'pickFiles' });
  }

  function send() {
    if (pending > 0 || status === 'Streaming') {
      // Prevent concurrent sends while an operation is in progress
      try { startActivity('busy', 'Please stop current response before sending a new one.', { autoDoneAfter: 1200, autoRemoveAfter: 600 }); } catch {}
      return;
    }
    const model = selected || (models[0] || '');
    const model2 = mode === 'combine' ? (selected2 || (models[1] || '')) : '';
    if (!model || !prompt.trim()) return;
    if (mode === 'combine' && !model2) {
      appendAssistant('Error: Combine mode requires two different models to be selected.');
      return;
    }
    
    // Extract @ file mentions from prompt
    const mentions = prompt.match(/@([\w\-\.\/]+)/g) || [];
    const mentionFiles = mentions.map(m => m.slice(1)); // Remove @ symbol
    
    // Combine attached files (as names only) with mention files
    const attachedFileNames = attachedFiles.map(f => f.name);
    const allFiles = Array.from(new Set([...attachedFileNames, ...mentionFiles]));
    
    appendUser(prompt);
    // Show files being used as an activity pill (like Copilot's "using context")
    if (allFiles.length > 0) {
      const maxShow = 3;
      const shown = allFiles.slice(0, maxShow).join(', ');
      const more = allFiles.length > maxShow ? ` +${allFiles.length - maxShow} more` : '';
      const autoDone = allFiles.length > 5 ? 2400 : 1600;
      const autoRemove = 900;
      try { startActivity('files', `Reading context: ${shown}${more}`, { autoDoneAfter: autoDone, autoRemoveAfter: autoRemove }); } catch {}
    }
    
    setSending(true);
    setStatus('Streaming');
    
    if (mode === 'combine') {
      vscode.postMessage({ type: 'startChat', models: [model, model2], prompt, useChat, attachedFiles: allFiles, mode: 'combine' });
    } else {
      vscode.postMessage({ type: 'startChat', models: [model], prompt, useChat, attachedFiles: allFiles, mode });
    }
    setPrompt('');
  }

  function stop() {
    try {
      vscode.postMessage({ type: 'stop' });
    } catch {}
    // Update local state optimistically
    setSending(false);
    setPaused(false);
    setStatus('Stopped');
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
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> You';
    wrap.appendChild(meta);
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
      meta.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M12 2v4" /><rect x="7" y="8" width="10" height="8" rx="2" /><circle cx="10" cy="12" r="1" /><circle cx="14" cy="12" r="1" /><path d="M10 15h4" /></svg> Assistant · ' + model;
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
    if (!lastAssistant) appendAssistant(undefined, applying ? false : true);
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

  function decodeHTMLEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  function renderMarkdownLike(text: string) {
    // First, extract and store code blocks before escaping HTML
    const codeBlocks: Array<{placeholder: string, html: string}> = [];
    const calloutBlocks: Array<{placeholder: string, html: string}> = [];
    const tableBlocks: Array<{placeholder: string, html: string}> = [];
    let codeBlockIndex = 0;
    let calloutIndex = 0;
    let tableIndex = 0;
    
    // Extract code blocks and replace with placeholders
    let processedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
      let language = lang || 'plaintext';
      const trimmedCode = code.trim();
      
      // Auto-detect language if not specified
      if (!lang || lang === 'plaintext') {
        language = detectLanguage(trimmedCode);
      }
      
      // Normalize language aliases
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'sh': 'bash',
        'shell': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c++': 'cpp',
        'kt': 'kotlin',
        'rs': 'rust',
        'go': 'go',
        'java': 'java',
        'php': 'php',
        'swift': 'swift',
        'dart': 'dart',
      };
      
      language = languageMap[language.toLowerCase()] || language;
      
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
      
      // Store the ORIGINAL RAW CODE (not escaped) in data attribute using base64 to avoid quote issues
      const originalCodeBase64 = btoa(unescape(encodeURIComponent(trimmedCode)));
      const codeBlockHtml = `<pre class="code-block" data-lang="${language}" data-code-base64="${originalCodeBase64}"><code class="language-${language}">${highlighted}</code></pre>`;
      
      const placeholder = `___CODEBLOCK_${codeBlockIndex}___`;
      codeBlocks.push({ placeholder, html: codeBlockHtml });
      codeBlockIndex++;
      
      return placeholder;
    });
    
    // Extract GitHub-style callouts with blockquote markers, e.g., > [!NOTE] Title\n> body
    processedText = processedText.replace(/^>\s*\[!([A-Z]+)\]\s*(.*)(?:\n((?:>.*\n?)*))?/gm, (_m, type, title, body) => {
      const t = String(type || '').toLowerCase();
      const kind = t === 'tip' ? 'tip' : t === 'warning' ? 'warning' : t === 'info' ? 'info' : t === 'success' ? 'success' : t === 'failure' ? 'failure' : 'note';
      const bodyText = (body || '')
        .split(/\n/)
        .map((l: string) => l.replace(/^>\s?/, ''))
        .join('\n');
      const safeTitle = escapeHtml(title || '');
      const safeBody = escapeHtml(bodyText).replace(/\n/g, '<br/>');
      const icon = kind === 'warning'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : kind === 'tip'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 12a10 10 0 1 1 20 0c0 3.53-1.53 5.74-4 7-1.5.86-2 2-2 3h-4c0-1-.5-2.14-2-3-2.47-1.26-4-3.47-4-7z"/></svg>'
        : kind === 'success'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
        : kind === 'failure'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      const html = `<div class="callout ${kind}"><div class="icon">${icon}</div><div class="content">${safeTitle ? `<div class=\"title\">${safeTitle}</div>` : ''}${safeBody ? `<div class=\"body\">${safeBody}</div>` : ''}</div></div>`;
      const placeholder = `___CALLOUT_${calloutIndex}___`;
      calloutBlocks.push({ placeholder, html });
      calloutIndex++;
      return placeholder;
    });

    // Extract :::callout blocks (e.g., :::note ... :::)
    processedText = processedText.replace(/^:::(note|tip|warning|info|success|failure)\s*\n([\s\S]*?)\n:::/gim, (_m, t, body) => {
      const kind = String(t || '').toLowerCase();
      const safeBody = escapeHtml(body || '').replace(/\n/g, '<br/>');
      const icon = kind === 'warning'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : kind === 'tip'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 12a10 10 0 1 1 20 0c0 3.53-1.53 5.74-4 7-1.5.86-2 2-2 3h-4c0-1-.5-2.14-2-3-2.47-1.26-4-3.47-4-7z"/></svg>'
        : kind === 'success'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
        : kind === 'failure'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      const html = `<div class="callout ${kind}"><div class="icon">${icon}</div><div class="content"><div class=\"body\">${safeBody}</div></div></div>`;
      const placeholder = `___CALLOUT_${calloutIndex}___`;
      calloutBlocks.push({ placeholder, html });
      calloutIndex++;
      return placeholder;
    });

    // Extract simple Markdown tables with alignment support
    processedText = processedText.replace(/^(\|.+\|)\n(\|[ \t:.-]+\|)\n((?:\|.*\|\n?)*)/gm, (_m, headerRow, sepRow, bodyRows) => {
      const headerCells = String(headerRow).trim().slice(1, -1).split('|').map((h: string) => h.trim());
      const sepCells = String(sepRow).trim().slice(1, -1).split('|').map((s: string) => s.trim());
      const alignments = sepCells.map((s: string) => {
        const left = s.startsWith(':');
        const right = s.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        if (left) return 'left';
        return 'left';
      });
      // Column width hints in header: e.g., "Name {120px}" or "Ratio {30%}"
      const widthHints: Record<number, string> = {};
      const headerClean = headerCells.map((h: string, i: number) => {
        const m = h.match(/\{\s*([0-9]+(?:px|%)?)\s*\}$/);
        if (m) {
          widthHints[i] = m[1];
          h = h.replace(/\{\s*[0-9]+(?:px|%)?\s*\}$/, '').trim();
        }
        return h;
      });
      const headers = headerClean.map((h: string, i: number) => `<th style=\"text-align:${alignments[i] || 'left'};${widthHints[i] ? ` width:${widthHints[i]};` : ''}\">${escapeHtml(h)}</th>`);
      const rows = String(bodyRows || '')
        .split(/\n/)
        .filter((r) => r.trim().startsWith('|'))
        .map((r) => r.trim().slice(1, -1).split('|').map((c) => escapeHtml(c.trim())));
      const tbodyRows = rows.map((cells) => {
        return `<tr>${cells.map((c, i) => `<td style=\"text-align:${alignments[i] || 'left'};${widthHints[i] ? ` width:${widthHints[i]};` : ''}\">${c}</td>`).join('')}</tr>`;
      }).join('');
  const thead = `<thead><tr>${headers.join('')}</tr></thead>`;
  const tbody = `<tbody>${tbodyRows}</tbody>`;
  const tableClass = `md-table${compactTables ? ' compact' : ''}${stripedTables ? ' striped' : ''}`;
  const html = `<table class=\"${tableClass}\">${thead}${tbody}</table>`;
      const placeholder = `___TABLE_${tableIndex}___`;
      tableBlocks.push({ placeholder, html });
      tableIndex++;
      return placeholder;
    });
    
    // Now escape HTML for the rest of the content
  let html = escapeHtml(processedText);
    
    // Handle inline code
    html = html.replace(/`([^`]+)`/g, (_m, c) => `<code class="inline-code">${escapeHtml(c)}</code>`);
    
    // Handle bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle unordered lists
    html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ul">$1</li>');
    html = html.replace(/(?:^|\n)((?:\s*<li class=\"ul\">.*<\/li>\s*)+)/g, (_m, block) => `\n<ul>\n${block}\n</ul>`);
    // Handle ordered lists (1. or 1)
    html = html.replace(/^\s*\d+[.)]?\s+(.+)$/gm, '<li class="ol">$1</li>');
    html = html.replace(/(?:^|\n)((?:\s*<li class=\"ol\">.*<\/li>\s*)+)/g, (_m, block) => `\n<ol>\n${block}\n</ol>`);
    // Cleanup list item classes
    html = html.replace(/<li class=\"ul\">/g, '<li>').replace(/<li class=\"ol\">/g, '<li>');
    
    // Handle headers
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Handle paragraphs
    html = html
      .split(/\n\n+/)
      .map((p) => {
        if (p.trim().startsWith('<pre') || p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<li') || p.trim().startsWith('___CODEBLOCK_')) {
          return p;
        }
        return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    // Convert prefix-style callouts like "Note:", "Tip:", "Warning:", "Info:", "Success:", "Failure:" paragraphs into callout blocks
    html = html.replace(/<p>(?:<strong>)?(Note|Tip|Warning|Info|Success|Failure):(?:<\/strong>)?\s*([\s\S]*?)<\/p>/gi, (_m, k, body) => {
      const kind = String(k || 'note').toLowerCase();
      const icon = kind === 'warning'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : kind === 'tip'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 12a10 10 0 1 1 20 0c0 3.53-1.53 5.74-4 7-1.5.86-2 2-2 3h-4c0-1-.5-2.14-2-3-2.47-1.26-4-3.47-4-7z"/></svg>'
        : kind === 'success'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
        : kind === 'failure'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      return `<div class="callout ${kind}"><div class="icon">${icon}</div><div class="content"><div class=\"body\">${body}</div></div></div>`;
    });
    
    // Restore code blocks, tables, and callouts
    codeBlocks.forEach(({ placeholder, html: codeBlockHtml }) => {
      html = html.replace(placeholder, codeBlockHtml);
    });
    tableBlocks.forEach(({ placeholder, html: tableHtml }) => {
      html = html.replace(placeholder, tableHtml);
    });
    calloutBlocks.forEach(({ placeholder, html: calloutHtml }) => {
      html = html.replace(placeholder, calloutHtml);
    });
      
    return html;
  }
  
  // Auto-detect programming language from code content
  function detectLanguage(code: string): string {
    const trimmed = code.trim();
    
    // TypeScript/JavaScript detection
    if (/^(import|export|const|let|var|function|class|interface|type|enum)\s/m.test(trimmed)) {
      if (/:\s*\w+(\[\])?(\s*=|\s*;|\s*\{)/m.test(trimmed) || /interface\s+\w+|type\s+\w+\s*=/m.test(trimmed)) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // React/JSX detection
    if (/<\w+[^>]*>.*<\/\w+>/s.test(trimmed) || /React\./.test(trimmed)) {
      if (/:\s*\w+(\[\])?/m.test(trimmed)) {
        return 'tsx';
      }
      return 'jsx';
    }
    
    // Python detection
    if (/^(def|class|import|from|if __name__|print\()/m.test(trimmed)) {
      return 'python';
    }
    
    // Java detection
    if (/^(public|private|protected|class|interface)\s+(class|interface|enum)/m.test(trimmed)) {
      return 'java';
    }
    
    // C/C++ detection
    if (/#include\s*[<"]|int main\(|std::/m.test(trimmed)) {
      return 'cpp';
    }
    
    // C# detection
    if (/^(using|namespace|public class|private class)/m.test(trimmed)) {
      return 'csharp';
    }
    
    // Go detection
    if (/^(package|func|import \(|type\s+\w+\s+struct)/m.test(trimmed)) {
      return 'go';
    }
    
    // Rust detection
    if (/^(fn|let mut|impl|pub fn|use\s+)/m.test(trimmed)) {
      return 'rust';
    }
    
    // PHP detection
    if (/^<\?php|<\?=/m.test(trimmed)) {
      return 'php';
    }
    
    // Ruby detection
    if (/^(def|class|module|require|attr_accessor)/m.test(trimmed)) {
      return 'ruby';
    }
    
    // CSS/SCSS detection
    if (/\{[^}]*:[^;]+;/m.test(trimmed) && /^[.#]?\w+\s*\{/m.test(trimmed)) {
      if (/\$\w+:|@import|@mixin|@include/m.test(trimmed)) {
        return 'scss';
      }
      return 'css';
    }
    
    // HTML detection
    if (/^<!DOCTYPE html>|^<html/im.test(trimmed)) {
      return 'html';
    }
    
    // JSON detection
    if (/^\{[\s\S]*\}$|^\[[\s\S]*\]$/m.test(trimmed)) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {}
    }
    
    // YAML detection
    if (/^[\w-]+:\s*[\w-]|^\s*-\s+\w+:/m.test(trimmed)) {
      return 'yaml';
    }
    
    // SQL detection
    if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/im.test(trimmed)) {
      return 'sql';
    }
    
    // Bash/Shell detection
    if (/^#!\/bin\/(bash|sh)|^(echo|cd|ls|mkdir|rm)\s+/m.test(trimmed)) {
      return 'bash';
    }
    
    return 'plaintext';
  }

  function finalizeLastAssistant() {
    if (!lastAssistant) return;
    // If this bubble was a loading one and never received chunks, clear the loader
    if (lastAssistant.classList.contains('loading')) {
      lastAssistant.classList.remove('loading');
      lastAssistant.innerHTML = '';
    }
    const txt = lastAssistant.textContent || '';
    lastAssistant.innerHTML = renderMarkdownLike(txt);
    lastDoneRef.current = lastAssistant;
    
    // Add copy buttons to code blocks
    const blocks = lastAssistant.querySelectorAll('pre.code-block');
    blocks.forEach((pre) => {
      const lang = pre.getAttribute('data-lang') || '';
      const header = document.createElement('div');
      header.className = 'code-header';
      
      const langSpan = document.createElement('span');
      langSpan.className = 'code-lang';
      langSpan.textContent = lang;
      header.appendChild(langSpan);
      
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.innerHTML = `
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="copy-text">Copy</span>
      `;
      copyBtn.addEventListener('click', async () => {
        const codeBase64 = pre.getAttribute('data-code-base64') || '';
        const code = decodeURIComponent(escape(atob(codeBase64)));
        try { 
          await navigator.clipboard.writeText(code);
          copyBtn.classList.add('copied');
          const textEl = copyBtn.querySelector('.copy-text');
          if (textEl) textEl.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            if (textEl) textEl.textContent = 'Copy';
          }, 2000);
        } catch {}
      });
      buttonGroup.appendChild(copyBtn);

      const insertBtn = document.createElement('button');
      insertBtn.className = 'insert-code-btn';
      insertBtn.textContent = 'Insert';
      insertBtn.title = 'Insert at cursor';
      insertBtn.addEventListener('click', () => {
        const codeBase64 = pre.getAttribute('data-code-base64') || '';
        const code = decodeURIComponent(escape(atob(codeBase64)));
        // Use a ref to avoid stale closures
        const currentMode = modeRef.current;
        const currentModel = selected || (models.length > 0 ? models[0] : '');
        if (DEBUG) console.log('Insert clicked - Mode:', currentMode, 'Model:', currentModel || '(none)', 'selected:', selected, 'models:', models);
  try { startActivity('insert-' + Date.now(), 'Inserting code…', { autoDoneAfter: 1800, autoRemoveAfter: 1200 }); } catch {}
        // Distinct animation overlay for Insert - keep until saved
        try { showApplyOverlay(0); } catch {}
        // Send even if no model - backend will handle it
        const payload: any = { type: 'insertText', text: code, mode: currentMode };
        if (currentModel) payload.model = currentModel;
        try { vscode.postMessage(payload); } catch {}
      });
      buttonGroup.appendChild(insertBtn);

      const applyBtn = document.createElement('button');
      applyBtn.className = 'apply-code-btn';
      applyBtn.textContent = 'Apply';
      applyBtn.title = 'Apply (replace selection)';
      applyBtn.addEventListener('click', () => {
        const codeBase64 = pre.getAttribute('data-code-base64') || '';
        const code = decodeURIComponent(escape(atob(codeBase64)));
        const currentMode = modeRef.current;
        const currentModel = selected || (models.length > 0 ? models[0] : '');
        if (DEBUG) console.log('Apply clicked - Mode:', currentMode, 'Model:', currentModel || '(none)', 'selected:', selected, 'models:', models);
  try { startActivity('apply-' + Date.now(), 'Applying code…', { autoDoneAfter: 2000, autoRemoveAfter: 1300 }); } catch {}
        // Distinct animation overlay for Apply - keep until saved
        try { showApplyOverlay(0); } catch {}
        // Send even if no model - backend will handle it
        const payload: any = { type: 'applyCode', text: code, mode: currentMode };
        if (currentModel) payload.model = currentModel;
        try { vscode.postMessage(payload); } catch {}
      });
      buttonGroup.appendChild(applyBtn);
      
      header.appendChild(buttonGroup);
      pre.insertBefore(header, pre.firstChild);

      // Fallback: if tokens didn't render (e.g., theme override or missing markup), force Prism to re-highlight
      try {
        const codeEl = pre.querySelector('code');
        const hasTokens = !!codeEl && codeEl.innerHTML.includes('class="token"');
        if (codeEl && !hasTokens) {
          const codeBase64 = pre.getAttribute('data-code-base64') || '';
          const original = decodeURIComponent(escape(atob(codeBase64)));
          // Reset to raw and ask Prism to highlight
          codeEl.textContent = original;
          const langClass = `language-${lang || 'javascript'}`;
          codeEl.className = langClass;
          if ((Prism as any).highlightElement) {
            (Prism as any).highlightElement(codeEl);
          } else if ((Prism as any).highlight) {
            const grammar = (Prism.languages as any)[lang] || (Prism.languages as any)['javascript'] || (Prism.languages as any)['markup'];
            codeEl.innerHTML = (Prism as any).highlight(original, grammar, lang || 'javascript');
          }
        }
      } catch {}
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
        apply.addEventListener('click', () => {
          const currentMode = modeRef.current;
          try { startActivity('applyedits-' + Date.now(), 'Applying edits…', { autoDoneAfter: 2200, autoRemoveAfter: 1400 }); } catch {}
          try { showApplyOverlay(); } catch {}
          vscode.postMessage({ type: 'applyEdits', payload, mode: currentMode });
        });
        actions.appendChild(review);
        actions.appendChild(apply);
        lastAssistant.parentElement?.appendChild(actions);
        if (modeRef.current === 'agent') {
          vscode.postMessage({ type: 'applyEdits', payload, mode: modeRef.current });
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
    try { vscode.setState?.({ threads: thrs, currentId: id, historyOpen: history, autoHideHistory, compactTables, stripedTables }); } catch {}
    try { vscode.postMessage({ type: 'threadsUpdate', threads: thrs, currentId: id, historyOpen: history, autoHideHistory, compactTables, stripedTables }); } catch {}
  }

  useEffect(() => {
    // Whenever display settings change, persist to both webview state and extension globalState
    persistState(threads, currentId, historyOpen);
  }, [historyOpen, autoHideHistory, compactTables, stripedTables]);

  // After initial state is established, publish once so left panel can render
  useEffect(() => {
    try { vscode.postMessage({ type: 'threadsUpdate', threads, currentId }); } catch {}
  }, [currentId]);

  // Auto-hide history on narrow panes if enabled; restore when wide again
  useEffect(() => {
    const threshold = 720;
    const wasNarrow = { current: window.innerWidth <= threshold } as { current: boolean };
    const autoCollapsed = { current: false } as { current: boolean };
    const onResize = () => {
      if (!autoHideHistory) return;
      const isNarrow = window.innerWidth <= threshold;
      if (!wasNarrow.current && isNarrow) {
        // just got narrow
        if (historyOpen) {
          autoCollapsed.current = true;
          setHistoryOpen(false);
        }
      } else if (wasNarrow.current && !isNarrow) {
        // just got wide
        if (autoCollapsed.current && !historyOpen) {
          setHistoryOpen(true);
        }
        autoCollapsed.current = false;
      }
      wasNarrow.current = isNarrow;
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [autoHideHistory, historyOpen]);

  return (
    <div className="panel">
      {(sending || pending > 0) && <div className="progress" aria-hidden="true" />}
      <div className="copilot-header">
        <div className="left">
          <span className="brand">Ollama</span>
          <span className="divider" aria-hidden="true" />
          <div className="model-select">
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
            {mode === 'combine' && (
              <div className="select-wrap" style={{ marginLeft: 8 }}>
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
            )}
          </div>
          <div className={`status ${status.toLowerCase()}`}>
            <span className={`status-dot ${paused ? 'paused' : status.toLowerCase()}`} />
            <span className="status-text">{paused ? 'Paused' : status}</span>
          </div>
        </div>
        <div className="right">
          <button className="icon-btn" title="New chat" onClick={newChat} aria-label="New chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </button>
          <button
            className={`icon-btn ${historyOpen ? 'active' : ''}`}
            title="Toggle history"
            aria-label="Toggle history"
            onClick={() => setHistoryOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="7" height="16" rx="1" />
              <rect x="14" y="4" width="7" height="16" rx="1" />
            </svg>
          </button>
          <label className="chatapi-toggle" title="Use Chat API">
            <input type="checkbox" checked={useChat} onChange={(e) => setUseChat(e.target.checked)} />
            <svg className="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Chat API</span>
          </label>
          {(sending || pending > 0) && (
            <button className="icon-btn" onClick={togglePause} title={paused ? 'Resume' : 'Pause'} aria-label="Pause or resume">
              {paused ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
            </button>
          )}
          <div className="mode-icons">
            <button
              className={`icon-btn ${mode === 'read' ? 'active' : ''}`}
              data-mode="read"
              onClick={() => toggleMode('read')}
              title="Read mode"
              aria-label="Read mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7a4 4 0 0 1 4-4h6v18H6a4 4 0 0 1-4-4Z"/>
                <path d="M22 7a4 4 0 0 0-4-4h-6v18h6a4 4 0 0 0 4-4Z"/>
              </svg>
            </button>
            <button
              className={`icon-btn agent ${mode === 'agent' ? 'active' : ''}`}
              data-mode="agent"
              onClick={() => toggleMode('agent')}
              title="Agent mode: can modify files"
              aria-label="Agent mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a4 4 0 0 1-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 0 0 5.66-5.66l-2.12 2.12-2.83-2.83 2.12-2.12z"/>
              </svg>
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={() => setShowHelp(!showHelp)}
            title="Help"
            aria-label="Help"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
      {activities.length > 0 && (
        <div className="activity-bar" role="status" aria-live="polite">
          {activities.map((a) => (
            <span key={a.id} className={`activity-pill ${a.status}`}>
              <span className={`dot ${a.status}`} />
              {a.text}
            </span>
          ))}
        </div>
      )}
      <div className={`layout ${historyOpen ? 'with-history' : ''}`}>
        <aside className="history" aria-label="Conversations">
          <div className="history-header">
            <span>History</span>
            <button className="icon" title="New chat" onClick={newChat} aria-label="New chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
            </button>
          </div>
          <div className="history-list">
            {threads.map((t) => (
              <div key={t.id} className={`history-item ${t.id === currentId ? 'active' : ''}`}>
                <button className="history-title" onClick={() => switchThread(t.id)} title={t.title}>{t.title || 'New chat'}</button>
                <button className="icon del" title="Delete" aria-label="Delete" onClick={() => deleteThread(t.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
            {threads.length === 0 && <div className="history-empty">No conversations yet</div>}
          </div>
          
          {/* Settings Section */}
          <div className="settings-section">
            <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
                  <div className="settings-display" style={{ marginTop: 12 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Display</h3>
                    <label className="readme-checkbox">
                      <input
                        type="checkbox"
                        checked={autoHideHistory}
                        onChange={(e) => setAutoHideHistory(e.target.checked)}
                      />
                      <span>Auto-hide history on narrow panes</span>
                    </label>
                    <label className="readme-checkbox">
                      <input
                        type="checkbox"
                        checked={compactTables}
                        onChange={(e) => setCompactTables(e.target.checked)}
                      />
                      <span>Compact tables</span>
                    </label>
                    <label className="readme-checkbox">
                      <input
                        type="checkbox"
                        checked={stripedTables}
                        onChange={(e) => setStripedTables(e.target.checked)}
                      />
                      <span>Striped tables</span>
                    </label>
                  </div>
                <button className="send" onClick={saveSettings} disabled={savingSettings} style={{ width: '100%', marginTop: 8 }}>
                  {savingSettings ? <><span className="spinner" /> Saving...</> : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </aside>
        <main className="chat">
          {showHelp && (
            <div className="readme-form" style={{ maxWidth: '700px', margin: '20px auto' }}>
              <div className="readme-header">
                <h3>🚀 Ollama Agent Features & Shortcuts</h3>
                <button className="close-btn" onClick={() => setShowHelp(false)} title="Close" aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                <h4 style={{ marginTop: 0, color: 'var(--color-accent)' }}>🎯 Quick Actions (Toolbar)</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li><strong>Explain:</strong> Get a clear explanation of selected code</li>
                  <li><strong>Fix:</strong> Automatically fix bugs and issues in your code</li>
                  <li><strong>Optimize:</strong> Improve performance and efficiency</li>
                  <li><strong>Tests:</strong> Generate comprehensive unit tests</li>
                  <li><strong>Refactor:</strong> Improve code structure and readability</li>
                  <li><strong>Comment:</strong> Add documentation and comments</li>
                </ul>

                <h4 style={{ color: 'var(--color-accent)' }}>🤖 Agent Mode Features</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li><strong>Create files:</strong> "create a Button.tsx component"</li>
                  <li><strong>Modify files:</strong> "fix bugs in @app.ts" or "add error handling to current file"</li>
                  <li><strong>Delete files:</strong> "delete the old config.json"</li>
                  <li><strong>@mentions:</strong> Reference specific files with @ (e.g., @src/utils.ts)</li>
                  <li><strong>Current file:</strong> Agent automatically works with your active editor</li>
                </ul>

                <h4 style={{ color: 'var(--color-accent)' }}>⌨️ Keyboard Shortcuts</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li><strong>Enter:</strong> Send message</li>
                  <li><strong>Shift + Enter:</strong> New line in message</li>
                  <li><strong>Ctrl+Alt+K</strong> (Cmd+Alt+K on macOS): Open chat</li>
                  <li><strong>Ctrl+Alt+E:</strong> Explain selection</li>
                  <li><strong>Ctrl+Alt+T:</strong> Generate tests</li>
                </ul>

                <h4 style={{ color: 'var(--color-accent)' }}>💡 Slash Commands</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li><strong>/explain:</strong> Explain selection</li>
                  <li><strong>/tests:</strong> Generate tests</li>
                  <li><strong>/fix:</strong> Fix issues</li>
                  <li><strong>/doc:</strong> Add documentation</li>
                  <li><strong>/commit:</strong> Generate commit message</li>
                </ul>

                <h4 style={{ color: 'var(--color-accent)' }}>📎 Context Files</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li><strong>@filename:</strong> Type @ followed by filename in your message</li>
                  <li><strong>📎 Button:</strong> Click the paperclip button to add files manually</li>
                  <li><strong>Auto-context:</strong> Files are automatically read and included in prompts</li>
                </ul>

                <h4 style={{ color: 'var(--color-accent)' }}>🔄 Modes</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '0' }}>
                  <li><strong>Read Mode:</strong> View-only, no file modifications</li>
                  <li><strong>Agent Mode:</strong> Full file manipulation capabilities</li>
                  <li><strong>Combine Mode:</strong> Use two AI models together for better results</li>
                </ul>
              </div>
            </div>
          )}
          {showReadme && (
            <div className="readme-form">
              <div className="readme-header">
                <h3>Generate README</h3>
                <button className="close-btn" onClick={() => setShowReadme(false)} title="Close" aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="readme-options">
                <label className="readme-field">
                  <span className="field-label">Style</span>
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
                  <span className="field-label">Placement</span>
                  <select value={readmePlacement} onChange={(e) => setReadmePlacement(e.target.value)}>
                    <option>GitHub</option>
                    <option>VS Code Marketplace</option>
                    <option>Internal Wiki</option>
                    <option>Website</option>
                  </select>
                </label>
                <label className="readme-checkbox">
                  <input type="checkbox" checked={readmeDeep} onChange={(e) => setReadmeDeep(e.target.checked)} />
                  <span>Deep scan codebase (slower but more detailed)</span>
                </label>
              </div>
              <textarea
                className="readme-notes"
                placeholder="Additional notes: highlight key features, target audience, add badges, mention license, special instructions..."
                value={readmeNotes}
                onChange={(e) => setReadmeNotes(e.target.value)}
              />
              <div className="readme-actions">
                <button className="send" onClick={submitReadme}>
                  <span>Generate README</span>
                </button>
                <button className="btn" onClick={() => setShowReadme(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div id="content" ref={contentRef} className="content" aria-live="polite" />
          {(mode === 'agent') && (
            <div style={{ 
              padding: '8px 16px', 
              background: 'var(--color-bg-secondary)', 
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--color-text-secondary)', marginRight: '8px' }}>Quick Actions:</span>
              <button 
                className="btn" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setPrompt('Create a new React component')}
              >
                + Create Component
              </button>
              <button 
                className="btn" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setPrompt('Fix bugs in current file')}
              >
                🔧 Fix Bugs
              </button>
              <button 
                className="btn" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setPrompt('Add comprehensive error handling')}
              >
                🛡️ Add Error Handling
              </button>
              <button 
                className="btn" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setPrompt('Optimize performance of current code')}
              >
                ⚡ Optimize
              </button>
              <button 
                className="btn" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setPrompt('Add TypeScript types')}
              >
                📘 Add Types
              </button>
            </div>
          )}
          
          {/* Context Files Display */}
          {attachedFiles.length > 0 && (
            <div style={{
              padding: '8px 16px',
              background: 'var(--color-bg-secondary)',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Context Files:</span>
              {attachedFiles.map((file, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}>
                  <span style={{ fontSize: '14px' }}>{getFileIcon(file.extension)}</span>
                  <span>{file.name}</span>
                  <button
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      padding: '0 4px',
                      fontSize: '14px',
                      marginLeft: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="btn"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={() => setAttachedFiles([])}
              >
                Clear All
              </button>
            </div>
          )}
          
          <div className="composer">
            <button
              className="btn"
              style={{ 
                padding: '8px',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add context file (use @filename in your message)"
              onClick={handleAttachFiles}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
        <textarea
          className="prompt"
          ref={promptRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'agent' 
              ? "Agent Mode" 
              : "Ask anything... Type @filename to attach files (e.g., @src/app.ts)"
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              if (pending > 0 || status === 'Streaming') { e.preventDefault(); return; }
              e.preventDefault();
              send();
            }
          }}
          readOnly={pending > 0 || status === 'Streaming'}
        />
          <button
            className="send"
            onClick={() => (pending > 0 ? stop() : send())}
            disabled={sending && pending === 0}
            aria-label={pending > 0 ? 'Stop' : (sending ? 'Sending' : 'Send')}
          >
            {pending > 0 ? (
              <span style={{ color: '#1a1a1a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="10" height="10" rx="2" />
                </svg>
                <span className="stop-label">Stop</span>
              </span>
            ) : (sending ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="spinner" />
                <span className="send-label">Sending…</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="send-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </span>
                <span className="send-label">Send</span>
              </span>
            ))}
          </button>
          </div>
        </main>
      </div>
      {applying && (
        <div className="apply-overlay" role="status" aria-live="polite">
          <span className="apply-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a4 4 0 0 1-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 0 0 5.66-5.66l-2.12 2.12-2.83-2.83 2.12-2.12z"/>
            </svg>
          </span>
          <span className="apply-text">Applying changes…</span>
          <span className="apply-bar" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
function injectStyles() {
  const el = document.createElement('style');
  el.textContent = professionalStyles;
  document.head.appendChild(el);
}

