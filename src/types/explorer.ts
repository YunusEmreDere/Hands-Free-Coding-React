export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'folder';
  lines?: number;
  exports?: string[];
  imports?: string[];
  children?: FileEntry[];
}

export function flattenFiles(node: FileEntry): FileEntry[] {
  if (node.type === 'file') return [node];
  return (node.children || []).flatMap(flattenFiles);
}

export function getImportedByFromList(filePath: string, allFiles: FileEntry[]): FileEntry[] {
  return allFiles.filter(f => f.imports?.includes(filePath));
}

export function countFolders(node: FileEntry): number {
  if (node.type === 'file') return 0;
  return 1 + (node.children || []).reduce((sum, c) => sum + countFolders(c), 0);
}
