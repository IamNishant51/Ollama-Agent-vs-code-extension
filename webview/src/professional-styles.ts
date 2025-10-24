// Professional IDE-style CSS matching Cursor/Copilot standards
export const professionalStyles = `
  /* === CORE RESET & BASE === */
  :root {
    --color-bg-primary: #1e1e1e;
    --color-bg-secondary: #252526;
    --color-bg-tertiary: #2d2d30;
    --color-border: #3e3e42;
    --color-border-subtle: rgba(255, 255, 255, 0.08);
    --color-text-primary: #cccccc;
    --color-text-secondary: #858585;
    --color-text-muted: #6a6a6a;
    --color-accent: #007acc;
    --color-accent-hover: #1a8ad1;
    --color-success: #89d185;
    --color-error: #f48771;
    --color-warning: #cca700;
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    
    --radius-sm: 3px;
    --radius-md: 6px;
    --radius-lg: 8px;
    
    --font-size-xs: 11px;
    --font-size-sm: 12px;
    --font-size-md: 13px;
    --font-size-lg: 14px;
    
    --transition-fast: 0.1s ease;
    --transition-normal: 0.2s ease;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: var(--font-size-md);
    line-height: 1.6;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  /* === PANEL LAYOUT === */
  .panel {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: var(--color-bg-primary);
  }

  /* === HEADER === */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    min-height: 40px;
    flex-shrink: 0;
  }

  .toolbar .title {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: 0.3px;
  }

  .toolbar .spacer {
    flex: 1;
  }

  /* === BUTTONS === */
  .btn, .icon, .send {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: 6px 12px;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-primary);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
    user-select: none;
  }

  .btn:hover, .icon:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border);
  }

  .btn:active, .icon:active {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(0);
  }

  .btn.secondary {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .btn.secondary:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .icon {
    padding: 6px;
    min-width: 32px;
    min-height: 32px;
  }

  /* === MODEL SELECT === */
  .model {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .model-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .select-wrap {
    position: relative;
  }

  .select {
    appearance: none;
    padding: 6px 28px 6px 12px;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    min-width: 140px;
    transition: all var(--transition-normal);
  }

  .select:hover {
    border-color: var(--color-accent);
  }

  .select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 1px var(--color-accent);
  }

  /* === CONTENT AREA === */
  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-lg);
    scroll-behavior: smooth;
  }

  .content::-webkit-scrollbar {
    width: 12px;
  }

  .content::-webkit-scrollbar-track {
    background: transparent;
  }

  .content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    border: 3px solid var(--color-bg-primary);
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* === MAIN LAYOUT (HISTORY + CHAT) === */
  .layout {
    display: flex;
    flex: 1;
    min-height: 0; /* important for flex scroll containers */
    background: var(--color-bg-primary);
  }

  .history {
    width: 0; /* collapsed by default */
    overflow: hidden;
    border-right: 0;
    background: var(--color-bg-secondary);
    transition: width var(--transition-normal);
  }

  .layout.with-history .history {
    width: 260px;
    border-right: 1px solid var(--color-border-subtle);
    padding: var(--spacing-md);
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .history-item.active {
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
  }

  .history-title {
    flex: 1;
    text-align: left;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-title:hover {
    background: var(--color-bg-primary);
  }

  .history-empty {
    margin-top: var(--spacing-md);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* allow content to shrink */
    background: var(--color-bg-primary);
  }

  /* === TOOLBAR EXTRAS === */
  .mode-toggle {
    display: inline-flex;
    gap: var(--spacing-sm);
  }

  .mode-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .mode-btn:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border);
  }

  .mode-btn.active {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 1px var(--color-accent);
  }

  .btn.combine-active {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 1px var(--color-accent);
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: 999px;
  }

  .dot-pulse {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--color-accent);
    border-radius: 50%;
    animation: dot-blink 1s infinite ease-in-out;
  }

  @keyframes dot-blink {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  /* === MESSAGES === */
  .msg {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-lg);
  }

  .meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 var(--spacing-sm);
  }

  .bubble {
    position: relative;
    max-width: 85%;
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-md);
    line-height: 1.6;
    border-radius: var(--radius-lg);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .bubble.user {
    align-self: flex-end;
    background: var(--color-accent);
    color: white;
    margin-left: auto;
  }

  .bubble.assistant {
    align-self: flex-start;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-primary);
  }

  /* === COPY BUTTON === */
  .copy-all {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    opacity: 0;
    transition: all var(--transition-normal);
    z-index: 1;
  }

  .bubble.assistant:hover .copy-all {
    opacity: 1;
  }

  .copy-all:hover {
    background: var(--color-bg-primary);
    border-color: var(--color-text-secondary);
  }

  .copy-all .icon-check {
    display: none;
  }

  .copy-all.copied {
    color: var(--color-success);
    border-color: var(--color-success);
  }

  .copy-all.copied .icon-copy {
    display: none;
  }

  .copy-all.copied .icon-check {
    display: block;
  }

  /* === CODE BLOCKS === */
  .code-block {
    position: relative;
    margin: var(--spacing-md) 0;
    background: #1a1a1a;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .code-lang {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .copy-code-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .copy-code-btn:hover {
    color: var(--color-text-primary);
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--color-border);
  }

  .copy-code-btn.copied {
    color: var(--color-success);
  }

  .code-block pre {
    margin: 0;
    padding: var(--spacing-md);
    overflow-x: auto;
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .code-block code {
    font-family: inherit;
  }

  .inline-code {
    padding: 2px 6px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: var(--font-size-sm);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
  }

  /* === COMPOSER === */
  .composer {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .prompt {
    flex: 1;
    min-height: 40px;
    max-height: 200px;
    padding: var(--spacing-md);
    font-size: var(--font-size-md);
    font-family: inherit;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    resize: vertical;
    transition: all var(--transition-normal);
  }

  .prompt:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 1px var(--color-accent);
  }

  .prompt::placeholder {
    color: var(--color-text-muted);
  }

  .send {
    min-width: 80px;
    padding: var(--spacing-md) var(--spacing-lg);
    font-weight: 600;
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .send:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* === SETTINGS PANEL (in history) === */
  .settings-section {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border-subtle);
  }

  .settings-toggle {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    cursor: pointer;
  }

  .settings-panel {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .setting-label span {
    color: var(--color-text-secondary);
  }

  .setting-label input, .readme-form select, .readme-notes {
    padding: 8px 10px;
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: var(--font-size-sm);
  }

  /* === README GENERATOR PANEL === */
  .readme-form {
    margin: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .readme-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
  }

  .close-btn {
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-primary);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    cursor: pointer;
  }

  .readme-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .readme-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .readme-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: var(--spacing-sm) 0;
    color: var(--color-text-secondary);
  }

  .readme-notes {
    width: 100%;
    min-height: 80px;
    resize: vertical;
  }

  .readme-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }

  /* === TYPING INDICATOR === */
  .ai-typing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: var(--spacing-sm) 0;
  }

  .ai-typing-indicator span {
    width: 6px;
    height: 6px;
    background: var(--color-text-secondary);
    border-radius: 50%;
    animation: typing-pulse 0.8s ease-in-out infinite;
  }

  .ai-typing-indicator span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .ai-typing-indicator span:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes typing-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  /* === SPINNER === */
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* === PROGRESS BAR === */
  .progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-accent);
    animation: progress-slide 1s ease-in-out infinite;
    z-index: 9999;
  }

  @keyframes progress-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* === EMPTY STATE === */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
  }

  .empty-state-icon {
    width: 48px;
    height: 48px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
  }

  .empty-state p {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    max-width: 400px;
  }

  /* === MARKDOWN STYLING === */
  .bubble.assistant p {
    margin: var(--spacing-sm) 0;
  }

  .bubble.assistant p:first-child {
    margin-top: 0;
  }

  .bubble.assistant p:last-child {
    margin-bottom: 0;
  }

  .bubble.assistant h1,
  .bubble.assistant h2,
  .bubble.assistant h3 {
    margin: var(--spacing-lg) 0 var(--spacing-md);
    font-weight: 600;
    line-height: 1.3;
  }

  .bubble.assistant h1 {
    font-size: 20px;
  }

  .bubble.assistant h2 {
    font-size: 18px;
  }

  .bubble.assistant h3 {
    font-size: 16px;
  }

  .bubble.assistant ul,
  .bubble.assistant ol {
    margin: var(--spacing-md) 0;
    padding-left: var(--spacing-xl);
  }

  .bubble.assistant li {
    margin: var(--spacing-xs) 0;
  }

  .bubble.assistant a {
    color: var(--color-accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color var(--transition-fast);
  }

  .bubble.assistant a:hover {
    border-bottom-color: var(--color-accent);
  }

  .bubble.assistant strong {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .bubble.assistant em {
    font-style: italic;
    color: var(--color-text-secondary);
  }

  /* === RESPONSIVE === */
  @media (max-width: 768px) {
    .toolbar {
      flex-wrap: wrap;
      padding: var(--spacing-sm);
    }

    .bubble {
      max-width: 95%;
    }

    .composer {
      padding: var(--spacing-md);
    }

    .btn-text {
      display: none;
    }
  }

  /* === ACCESSIBILITY === */
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }

  /* === LOADING STATE === */
  .bubble.loading {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
  }
`;
