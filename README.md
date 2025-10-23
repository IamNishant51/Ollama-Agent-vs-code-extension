# 🦙 Ollama Agent - Local AI Coding Assistant

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/IamNishant51/Ollama-Agent-vs-code-extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.105.0+-blue.svg)](https://code.visualstudio.com/)

Transform your locally-running Ollama models into an intelligent coding agent with capabilities similar to GitHub Copilot or Cursor—all running **100% locally** with **complete privacy**. No cloud, no subscriptions, no data leaks.

## ✨ Features

### 🤖 **Intelligent Agent Mode**
- **Autonomous Task Execution**: Agent can read files, search codebases, create/edit files, and run tasks
- **Multi-Step Reasoning**: Up to 8-step problem-solving with context awareness
- **Smart Tool Usage**: Automatically explores your project structure and applies changes
- **Read & Agent Modes**: Choose between safe read-only or full agent capabilities

### 💬 **Interactive Chat Interface**
- **Modern WebView UI**: Clean, responsive chat interface with streaming responses
- **Multi-Model Support**: Chat with multiple Ollama models simultaneously
- **Context-Aware**: Automatically includes selected code, open files, and project structure
- **Conversation History**: Keep track of all interactions within sessions

### 📝 **Code Generation & Editing**
- **Inline Code Generation**: Generate code directly at cursor position
- **Smart Refactoring**: Simplify, optimize, or add types to selected code
- **Function Extraction**: Automatically extract functions with AI assistance
- **Code Translation**: Convert code between languages

### 📚 **Documentation & Analysis**
- **README Generator**: Dedicated mode to generate comprehensive project documentation
- **Docstring Completion**: AI-generated documentation for functions and classes
- **Code Explanation**: Understand complex code with AI explanations on hover
- **PR Summaries**: Generate pull request descriptions and review comments

### 🧪 **Testing & Quality**
- **Unit Test Generation**: Create comprehensive test suites automatically
- **Problem Analysis**: AI-powered debugging and error resolution
- **Code Review**: Get suggestions for improvements and best practices

### 🛠️ **Developer Tools**
- **Project Indexer**: Fast semantic search across your entire codebase
- **Commit Message Generation**: Smart git commit messages from staged changes
- **Shell Command Explanation**: Understand complex terminal commands
- **File Creation with AI**: Generate boilerplate files with context

### 🎨 **Customization**
- **Configurable Settings**: Host, port, system prompts, and behavior modes
- **Keyboard Shortcuts**: Quick access to all commands
- **Context Menu Integration**: Right-click access in editor
- **Status Bar Integration**: Quick model switching and status updates

## 📦 Installation

### Prerequisites

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Pull Models**: Choose your preferred models
   ```bash
   ollama pull llama3.1:8b
   ollama pull mistral
   ollama pull codellama
   ollama pull deepseek-coder
   ```
3. **Start Ollama**: Ensure it's running on `localhost:11434`
   ```bash
   ollama serve
   ```

### Install Extension

**From VS Code Marketplace** (Coming Soon):
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Ollama Agent"
4. Click Install

**From VSIX** (Manual):
1. Download the `.vsix` file from [GitHub Releases](https://github.com/IamNishant51/Ollama-Agent-vs-code-extension/releases)
2. Open VS Code
3. Run command: `Extensions: Install from VSIX...`
4. Select the downloaded file

## 🚀 Quick Start

### 1. Open Chat Panel
- Click the Ollama icon in the Activity Bar (left sidebar)
- Or run command: `Ollama Agent: Open Chat`
- Or use keyboard shortcut: `Ctrl+Shift+P` → "Ollama Agent"

### 2. Select Agent Mode
- **Read Mode** (Safe): AI can only read and suggest changes
- **Agent Mode** (Powerful): AI can automatically create/edit files

### 3. Start Chatting
- Type your question or request
- Select one or more models to query
- Get streaming responses in real-time

### 4. Use Context Menu Commands
- Select code → Right-click → Ollama Agent options
- Ask about selection, generate code, refactor, explain, and more

## ⚙️ Configuration

### Settings

Access via `File > Preferences > Settings` → Search "Ollama Agent"

| Setting | Default | Description |
|---------|---------|-------------|
| `ollamaAgent.host` | `localhost` | Ollama server host |
| `ollamaAgent.port` | `11434` | Ollama server port |
| `ollamaAgent.systemPrompt` | `You are a helpful coding assistant.` | Default system prompt |
| `ollamaAgent.provider` | `ollama` | AI provider (ollama/openai/anthropic) |
| `ollamaAgent.mode` | `read` | Interaction mode (read/agent) |
| `ollamaAgent.enableInlineCompletions` | `false` | Experimental: inline completions |
| `ollamaAgent.enableExplainOnHover` | `false` | Experimental: hover explanations |
| `ollamaAgent.enableDocstringCompletion` | `false` | Experimental: docstring suggestions |

### Example Configuration

```json
{
  "ollamaAgent.host": "localhost",
  "ollamaAgent.port": 11434,
  "ollamaAgent.mode": "agent",
  "ollamaAgent.systemPrompt": "You are an expert TypeScript developer focused on clean code and best practices."
}
```

## 📖 Usage Examples

### Generate a Function
1. Place cursor where you want the function
2. Run: `Ollama Agent: Generate Code Here`
3. Describe what you want: "Create a function to validate email addresses"
4. Review and insert the generated code

### Refactor Code
1. Select the code to refactor
2. Right-click → `Ollama Agent: Brush – Simplify`
3. AI will suggest cleaner, more readable code
4. Review changes in diff view and apply

### Create Unit Tests
1. Select a function or class
2. Run: `Ollama Agent: Generate Unit Tests`
3. AI generates comprehensive test suite
4. Tests appear in new file or clipboard

### Generate README
1. Run: `Ollama Agent: README Generator`
2. Choose style (Technical/Product/Library)
3. Choose placement (GitHub/Marketplace/Website)
4. Add custom notes
5. Enable deep scan for comprehensive analysis
6. AI generates complete README with all sections

### Debug with AI
1. Click on a problem in Problems panel
2. Run: `Ollama Agent: Fix This Problem`
3. AI analyzes error and suggests fixes
4. Apply fix with one click

## 🎯 Command Reference

### Chat & Interaction
- `Ollama Agent: Open Chat` - Open main chat panel
- `Ollama Agent: README Generator` - Generate project documentation
- `Ollama Agent: Ask About Selection` - Query AI about selected code

### Code Generation
- `Ollama Agent: Generate Code Here` - Insert AI-generated code
- `Ollama Agent: Generate Unit Tests` - Create test suite
- `Ollama Agent: Generate Commit Message` - Smart git messages
- `Ollama Agent: Generate README` - Auto-generate documentation

### Code Editing
- `Ollama Agent: Edit Selection by Instruction` - Guided refactoring
- `Ollama Agent: Brush – Simplify` - Simplify code
- `Ollama Agent: Brush – Add Types` - Add TypeScript types
- `Ollama Agent: Brush – Optimize` - Performance optimization
- `Ollama Agent: Extract Function` - Extract selected code

### Analysis & Explanation
- `Ollama Agent: Explain Selection` - Understand code
- `Ollama Agent: Analyze Problems` - Debug assistance
- `Ollama Agent: Explain Command` - Shell command help
- `Ollama Agent: Show Index Stats` - View codebase stats

### Project Management
- `Ollama Agent: PR Summary` - Generate PR descriptions
- `Ollama Agent: PR Review Comments` - AI code review
- `Ollama Agent: Rebuild Project Index` - Refresh semantic search
- `Ollama Agent: Add File (AI)` - Generate boilerplate files

### Translation
- `Ollama Agent: Translate Selection` - Convert between languages

## 🔧 Troubleshooting

### Ollama Not Connecting
**Problem**: "Failed to connect to Ollama"

**Solutions**:
1. Verify Ollama is running: `ollama serve`
2. Check settings: host=`localhost`, port=`11434`
3. Test connection: `curl http://localhost:11434/api/tags`
4. Restart VS Code

### No Models Available
**Problem**: "No models found"

**Solutions**:
1. Pull a model: `ollama pull llama3.1`
2. List models: `ollama list`
3. Refresh extension: Run `Developer: Reload Window`

### Slow Response Times
**Problem**: AI responses are very slow

**Solutions**:
1. Use smaller models (e.g., `llama3.1:8b` instead of `70b`)
2. Reduce context: Disable deep scan in README generator
3. Close other resource-intensive applications
4. Consider using GPU acceleration with Ollama

### Agent Mode Not Working
**Problem**: Agent mode doesn't apply changes

**Solutions**:
1. Check mode setting: `ollamaAgent.mode` = `agent`
2. Verify file permissions (read/write access)
3. Check workspace trust: File → Trust Workspace
4. Review error messages in Output panel

### Extension Not Loading
**Problem**: Extension doesn't activate

**Solutions**:
1. Check VS Code version (minimum 1.105.0)
2. View logs: Output → Ollama Agent
3. Disable conflicting extensions
4. Reinstall extension

## 🛠️ Development

### Setup
```bash
# Clone repository
git clone https://github.com/IamNishant51/Ollama-Agent-vs-code-extension.git
cd Ollama-Agent-vs-code-extension

# Install dependencies
npm install

# Build webview
npm run build:webview

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch
```

### Testing
```bash
# Run linter
npm run lint

# Run tests
npm test
```

### Debug
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test features in new window
4. View logs in Debug Console

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- Add support for more AI providers
- Improve agent reasoning capabilities
- Add more code generation templates
- Enhance UI/UX with additional themes
- Write comprehensive tests
- Improve documentation
- Report bugs and suggest features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) for providing the local LLM runtime
- [VS Code](https://code.visualstudio.com/) for the excellent extension API
- The open-source community for inspiration and support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/IamNishant51/Ollama-Agent-vs-code-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/IamNishant51/Ollama-Agent-vs-code-extension/discussions)
- **Email**: [Create an issue](https://github.com/IamNishant51/Ollama-Agent-vs-code-extension/issues/new) for support

## 🗺️ Roadmap

- [ ] Multi-file editing in single operation
- [ ] Voice input support
- [ ] Custom prompt templates
- [ ] Extension marketplace for agent tools
- [ ] Collaborative coding sessions
- [ ] Code review workflows
- [ ] Integration with popular dev tools
- [ ] Mobile companion app

## ⭐ Star History

If you find this extension useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by [Nishant Unavane](https://github.com/IamNishant51)**

**Powered by [Ollama](https://ollama.ai) • Privacy-First • Open Source**
