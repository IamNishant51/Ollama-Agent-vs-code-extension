import * as vscode from 'vscode';

type FileEntry = {
  path: string;
  size: number;
  lines: number;
  head: string; // first N lines
};

class ProjectIndexerImpl {
  private index: FileEntry[] = [];
  private stats: { files: number; lines: number; bytes: number } = { files: 0, lines: 0, bytes: 0 };
  private building = false;

  async build(maxFiles = 2000, headLines = 120): Promise<void> {
  if (this.building) { return; }
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
          const entry: FileEntry = {
            path: vscode.workspace.asRelativePath(uri),
            size: data.byteLength,
            lines: lines.length,
            head
          };
          this.index.push(entry);
          this.stats.files += 1;
          this.stats.lines += entry.lines;
          this.stats.bytes += entry.size;
        } catch { /* ignore */ }
      }
    } finally {
      this.building = false;
    }
  }

  getStats(): string {
    const mb = (this.stats.bytes / (1024 * 1024)).toFixed(2);
    return `Indexed ${this.stats.files} files, ${this.stats.lines} lines, ${mb} MB (head-only).`;
  }

  summary(detail = false): string {
  if (!this.index.length) { return 'Index is empty.'; }
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

export const ProjectIndexer = new ProjectIndexerImpl();
