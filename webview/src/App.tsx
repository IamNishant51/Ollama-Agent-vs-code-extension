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
  const [status, setStatus] = useState<'Ready' | 'Streaming' | 'Error' | 'Stopped'>('Ready');
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
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; extension: string }>>([]);
  const [apiKey, setApiKey] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(11434);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
      console.log('📩 Webview received message:', msg.type, msg);
      
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

  // AI Code Action Handlers (Cursor/Copilot style)
  function handleExplainCode() {
    vscode.postMessage({ type: 'explainSelection' });
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

  function decodeHTMLEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  function renderMarkdownLike(text: string) {
    // First, extract and store code blocks before escaping HTML
    const codeBlocks: Array<{placeholder: string, html: string}> = [];
    let codeBlockIndex = 0;
    
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
    
    // Now escape HTML for the rest of the content
    let html = escapeHtml(processedText);
    
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
        if (p.trim().startsWith('<pre') || p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<li') || p.trim().startsWith('___CODEBLOCK_')) {
          return p;
        }
        return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');
    
    // Restore code blocks
    codeBlocks.forEach(({ placeholder, html: codeBlockHtml }) => {
      html = html.replace(placeholder, codeBlockHtml);
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
        const modeBtn = document.querySelector('.mode-toggle .mode-btn.active') as HTMLElement;
        const currentMode = modeBtn?.dataset?.mode || 'read';
        const currentModel = selected || (models.length > 0 ? models[0] : 'auto');
        console.log('Insert clicked - Mode:', currentMode, 'Model:', currentModel, 'selected:', selected, 'models:', models);
        // Send even if no model - backend will handle it
        try { vscode.postMessage({ type: 'insertText', text: code, mode: currentMode, model: currentModel }); } catch {}
      });
      buttonGroup.appendChild(insertBtn);

      const applyBtn = document.createElement('button');
      applyBtn.className = 'apply-code-btn';
      applyBtn.textContent = 'Apply';
      applyBtn.title = 'Apply (replace selection)';
      applyBtn.addEventListener('click', () => {
        const codeBase64 = pre.getAttribute('data-code-base64') || '';
        const code = decodeURIComponent(escape(atob(codeBase64)));
        const modeBtn = document.querySelector('.mode-toggle .mode-btn.active') as HTMLElement;
        const currentMode = modeBtn?.dataset?.mode || 'read';
        const currentModel = selected || (models.length > 0 ? models[0] : 'auto');
        console.log('Apply clicked - Mode:', currentMode, 'Model:', currentModel, 'selected:', selected, 'models:', models);
        // Send even if no model - backend will handle it
        try { vscode.postMessage({ type: 'applyCode', text: code, mode: currentMode, model: currentModel }); } catch {}
      });
      buttonGroup.appendChild(applyBtn);
      
      header.appendChild(buttonGroup);
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
        apply.addEventListener('click', () => {
          const currentMode = (document.querySelector('.mode-toggle .mode-btn.active') as HTMLElement)?.dataset?.mode || 'read';
          vscode.postMessage({ type: 'applyEdits', payload, mode: currentMode });
        });
        actions.appendChild(review);
        actions.appendChild(apply);
        lastAssistant.parentElement?.appendChild(actions);
        const currentMode = (document.querySelector('.mode-toggle .mode-btn.active') as HTMLElement)?.dataset?.mode || 'read';
        if (currentMode === 'agent') {
          vscode.postMessage({ type: 'applyEdits', payload, mode: currentMode });
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
        <span className={`tag ${status === 'Stopped' ? 'stopped' : ''}`}>
          {paused ? 'Paused' : status}
          {(!paused && status === 'Streaming') ? <span className="dot-pulse" /> : null}
        </span>
        <span className="spacer" />
        
        {/* AI Code Actions - Cursor/Copilot style */}
        <button className="btn" onClick={handleExplainCode} title="Explain selected code">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <span className="btn-text">Explain</span>
        </button>
        
        <button className="btn" onClick={handleFixCode} title="Fix issues in code">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M12 18v-6"/>
              <path d="m9 15 3 3 3-3"/>
            </svg>
          </span>
          <span className="btn-text">Fix</span>
        </button>
        
        <button className="btn" onClick={handleOptimizeCode} title="Optimize code performance">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </span>
          <span className="btn-text">Optimize</span>
        </button>
        
        <button className="btn" onClick={handleGenerateTests} title="Generate unit tests">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
          <span className="btn-text">Tests</span>
        </button>
        
        <button className="btn" onClick={handleRefactorCode} title="Refactor code">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20v-6M6 20V10M18 20V4"/>
              <circle cx="12" cy="8" r="2"/>
              <circle cx="6" cy="4" r="2"/>
              <circle cx="18" cy="20" r="2"/>
            </svg>
          </span>
          <span className="btn-text">Refactor</span>
        </button>
        
        <button className="btn" onClick={handleAddComments} title="Add comments">
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span className="btn-text">Comment</span>
        </button>
        
        <button className="btn" onClick={() => setShowReadme((v) => !v)}>
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M4 4v15.5"/>
              <path d="M8 4h12v13H6.5A2.5 2.5 0 0 0 4 19.5"/>
            </svg>
          </span>
          <span className="btn-text">README</span>
        </button>
        {(sending || pending > 0) && (
          <button className="btn" onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
        )}
        <button 
          className={`btn ${mode === 'combine' ? 'combine-active' : ''}`}
          onClick={() => toggleMode('combine')}
          title="Combine two AI models for better responses"
        >
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5"/>
              <path d="M8 21H3v-5"/>
              <path d="M21 3 14.5 9.5"/>
              <path d="M3 21 9.5 14.5"/>
            </svg>
          </span>
          <span className="btn-text">Combine Mode</span>
        </button>
        <button className="btn secondary" onClick={newChat}>
          <span className="btn-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </span>
          <span className="btn-text">New Chat</span>
        </button>
        <div className="mode-toggle">
          <button className={`mode-btn ${mode === 'read' ? 'active' : ''}`} data-mode="read" onClick={() => toggleMode('read')}>
            <span className="btn-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7a4 4 0 0 1 4-4h6v18H6a4 4 0 0 1-4-4Z"/>
                <path d="M22 7a4 4 0 0 0-4-4h-6v18h6a4 4 0 0 0 4-4Z"/>
              </svg>
            </span>
            <span className="btn-text">Read</span>
          </button>
          <button className={`mode-btn ${mode === 'agent' ? 'active' : ''}`} data-mode="agent" onClick={() => toggleMode('agent')}>
            <span className="btn-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <path d="M8 15h0"/>
                <path d="M16 15h0"/>
              </svg>
            </span>
            <span className="btn-text">Agent</span>
          </button>
        </div>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={useChat} onChange={(e) => setUseChat(e.target.checked)} /> Chat API
        </label>
        <button 
          className="btn" 
          onClick={() => setShowHelp(!showHelp)}
          title="Show keyboard shortcuts and help"
          style={{ padding: '6px 12px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
        {mode === 'agent' && (
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', opacity: 0.7, fontSize: '11px', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Agent Mode: Can modify files</span>
          </div>
        )}
      </div>
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
          {showHelp && (
            <div className="readme-form" style={{ maxWidth: '700px', margin: '20px auto' }}>
              <div className="readme-header">
                <h3>🚀 Cursor/Copilot Features & Shortcuts</h3>
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
          {mode === 'agent' && (
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
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === 'agent' 
              ? "Agent Mode" 
              : "Ask anything... Type @filename to attach files (e.g., @src/app.ts)"
          }
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

