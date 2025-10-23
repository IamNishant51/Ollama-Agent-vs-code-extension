"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
class OllamaClient {
    baseUrl;
    systemPrompt;
    constructor(host = 'localhost', port = 11434, systemPrompt = 'You are a helpful coding assistant.') {
        this.baseUrl = `http://${host}:${port}`;
        this.systemPrompt = systemPrompt;
    }
    async listModels() {
        const res = await fetch(`${this.baseUrl}/api/tags`);
        if (!res.ok) {
            throw new Error(`Ollama list models failed: ${res.status}`);
        }
        const data = (await res.json());
        const models = (data.models || []);
        return models.map((m) => m.name);
    }
    async generate(model, prompt, stream = true, onToken) {
        const body = { model, prompt: this.buildPrompt(prompt), stream };
        const res = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        if (!stream) {
            const json = (await res.json());
            return json.response || json.text || '';
        }
        const reader = res.body.getReader();
        let out = '';
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            // Ollama /generate streams JSON lines with { response: "...", done: false }
            for (const line of chunk.split(/\n+/)) {
                if (!line.trim()) {
                    continue;
                }
                try {
                    const obj = JSON.parse(line);
                    const piece = obj.response || '';
                    if (piece) {
                        out += piece;
                        onToken?.(piece);
                    }
                }
                catch {
                    // ignore partial lines
                }
            }
        }
        return out;
    }
    async chat(model, messages, stream = true, onToken) {
        const body = { model, messages: this.withSystem(messages), stream };
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw new Error(await res.text());
        }
        if (!stream) {
            const json = (await res.json());
            const content = json.message?.content ?? json.response ?? '';
            return content;
        }
        const reader = res.body.getReader();
        let out = '';
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split(/\n+/)) {
                if (!line.trim()) {
                    continue;
                }
                try {
                    const obj = JSON.parse(line);
                    const piece = obj.message?.content || obj.response || '';
                    if (piece) {
                        out += piece;
                        onToken?.(piece);
                    }
                }
                catch {
                    // ignore partial json lines
                }
            }
        }
        return out;
    }
    withSystem(messages) {
        if (!this.systemPrompt) {
            return messages;
        }
        const hasSystem = messages.some((m) => m.role === 'system');
        return hasSystem ? messages : [{ role: 'system', content: this.systemPrompt }, ...messages];
    }
    buildPrompt(userPrompt) {
        return `${this.systemPrompt}\n\n${userPrompt}`;
    }
}
exports.OllamaClient = OllamaClient;
//# sourceMappingURL=ollamaClient.js.map