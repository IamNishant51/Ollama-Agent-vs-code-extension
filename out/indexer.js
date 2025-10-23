"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectIndexer = void 0;
const vscode = __importStar(require("vscode"));
class ProjectIndexerImpl {
    index = [];
    stats = { files: 0, lines: 0, bytes: 0 };
    building = false;
    async build(maxFiles = 2000, headLines = 120) {
        if (this.building) {
            return;
        }
        this.building = true;
        try {
            this.index = [];
            this.stats = { files: 0, lines: 0, bytes: 0 };
            const include = '**/*';
            const exclude = '{**/node_modules/**,**/.git/**,**/dist/**,**/out/**,**/build/**,**/.next/**,**/*.min.*}';
            const uris = await vscode.workspace.findFiles(include, exclude, maxFiles);
            for (const uri of uris) {
                try {
                    const data = await vscode.workspace.fs.readFile(uri);
                    const text = Buffer.from(data).toString('utf8');
                    const lines = text.split(/\r?\n/);
                    const head = lines.slice(0, headLines).join('\n');
                    const entry = {
                        path: vscode.workspace.asRelativePath(uri),
                        size: data.byteLength,
                        lines: lines.length,
                        head
                    };
                    this.index.push(entry);
                    this.stats.files += 1;
                    this.stats.lines += entry.lines;
                    this.stats.bytes += entry.size;
                }
                catch { /* ignore */ }
            }
        }
        finally {
            this.building = false;
        }
    }
    getStats() {
        const mb = (this.stats.bytes / (1024 * 1024)).toFixed(2);
        return `Indexed ${this.stats.files} files, ${this.stats.lines} lines, ${mb} MB (head-only).`;
    }
    summary(detail = false) {
        if (!this.index.length) {
            return 'Index is empty.';
        }
        const top = this.index.slice(0, 50);
        const head = this.getStats();
        if (!detail) {
            const sample = top.map(e => `${e.path} (${e.lines} lines)`);
            return `${head}\nSample files:\n` + sample.join('\n');
        }
        const details = top.map(e => `FILE: ${e.path} [${e.lines} lines]\n${e.head}`);
        return `${head}\n\n${details.join('\n\n')}`;
    }
}
exports.ProjectIndexer = new ProjectIndexerImpl();
//# sourceMappingURL=indexer.js.map