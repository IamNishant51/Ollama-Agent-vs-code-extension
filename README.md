## Ollama Agent for VS Code

Chat with your locally running Ollama models (e.g., Mistral, Llama 3.1) inside VS Code. Browse installed models, multi-select to query several at once, stream responses, and apply code edits to your workspace like a lightweight local Copilot.

### Features

- Sidebar chat view with a modern dark UI
- Lists locally available Ollama models via /api/tags
- Multi-model chat or generate mode with streaming tokens
- Editor commands:
	- “Ollama Agent: Ask About Selection” — send the selected code (or whole file) as context
	- “Ollama Agent: Generate Code Here” — generate code and insert at cursor
	- “Ollama Agent: Open Chat” — open the chat sidebar
- Apply workspace edits from the chat (create/replace/insert text)

### Requirements

- Ollama running locally (default http://localhost:11434)
- A model pulled locally (for example):

```bash
ollama pull mistral
ollama pull llama3.1:8b
```

### Settings

- `ollamaAgent.host` (default: `localhost`)
- `ollamaAgent.port` (default: `11434`)
- `ollamaAgent.systemPrompt` (default: `You are a helpful coding assistant.`)

### How to run (Development)

1. Install deps
```bash
npm install
```
2. Build
```bash
npm run compile
```
3. Launch the “Run Extension” debug configuration or press F5 to open a new Extension Development Host.

### Usage

- Open the “Ollama” icon in the Activity Bar to see the chat view.
- Select one or more models, type your prompt, and Send. Responses stream live.
- Use editor context menu to ask about selected code or to generate code at the cursor.

### Notes

- This extension uses VS Code’s WebviewView to provide the chat UI and the VS Code WorkspaceEdit API to apply file changes.
- If you want the model to propose edits, instruct it to output a JSON payload matching the `ollamaAgent.applyWorkspaceEdit` schema:

```jsonc
{
	"changes": [
		{
			"uri": "file:///absolute/path/to/file.ts",
			"range": { "start": {"line": 0, "character": 0}, "end": {"line": 0, "character": 0} },
			"newText": "// inserted text\n"
		},
		{
			"uri": "file:///absolute/path/newFile.ts",
			"create": true,
			"newText": "export const x = 1;\n"
		}
	]
}
```

Then click “Apply edits” in your client UI (or send this payload from the webview to the command).
