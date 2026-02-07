import { FileEntry, flattenFiles } from '../types/explorer';

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.svelte'];

export function parseImports(content: string): { imports: string[]; exports: string[] } {
  const importPaths: string[] = [];
  const exportNames: string[] = [];

  const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+(?:\s*,\s*\{[^}]*\})?)\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    const p = m[1];
    if (p.startsWith('.') || p.startsWith('/')) {
      importPaths.push(p);
    }
  }

  const exportDefaultRegex = /export\s+default\s+(?:function|class|const|let|var)\s+(\w+)/g;
  while ((m = exportDefaultRegex.exec(content)) !== null) {
    exportNames.push(m[1]);
  }
  const exportDefaultIdRegex = /export\s+default\s+([A-Z]\w*)\s*;/g;
  while ((m = exportDefaultIdRegex.exec(content)) !== null) {
    if (!exportNames.includes(m[1])) exportNames.push(m[1]);
  }
  const exportBracketRegex = /export\s*\{([^}]+)\}/g;
  while ((m = exportBracketRegex.exec(content)) !== null) {
    m[1].split(',').forEach(n => {
      const name = n.trim().split(/\s+as\s+/).pop()!.trim();
      if (name && !exportNames.includes(name)) exportNames.push(name);
    });
  }
  const exportNamedRegex = /export\s+(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g;
  while ((m = exportNamedRegex.exec(content)) !== null) {
    if (!exportNames.includes(m[1])) exportNames.push(m[1]);
  }

  return { imports: importPaths, exports: exportNames };
}

function resolveImportPath(fromFile: string, importPath: string, allPaths: string[]): string | null {
  const fromDir = fromFile.substring(0, fromFile.lastIndexOf('/'));
  const parts = fromDir.split('/');
  const importParts = importPath.split('/');

  for (const seg of importParts) {
    if (seg === '.') continue;
    else if (seg === '..') parts.pop();
    else parts.push(seg);
  }

  const resolved = parts.join('/');
  const candidates = [
    resolved,
    ...CODE_EXTENSIONS.map(ext => resolved + ext),
    ...CODE_EXTENSIONS.map(ext => resolved + '/index' + ext),
  ];

  return candidates.find(c => allPaths.includes(c)) || null;
}

export function resolveAllImports(project: FileEntry): FileEntry {
  const allFiles = flattenFiles(project);
  const allPaths = allFiles.map(f => f.path);

  allFiles.forEach(file => {
    if (file.imports && file.imports.length > 0) {
      file.imports = file.imports
        .map(imp => resolveImportPath(file.path, imp, allPaths))
        .filter(Boolean) as string[];
    }
  });

  return project;
}

export async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string
): Promise<FileEntry> {
  const children: FileEntry[] = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'dist' || name === 'build') continue;

    const childPath = basePath ? `${basePath}/${name}` : name;

    if (handle.kind === 'directory') {
      const subDir = await readDirectoryRecursive(handle as FileSystemDirectoryHandle, childPath);
      if (subDir.children && subDir.children.length > 0) {
        children.push(subDir);
      }
    } else {
      const ext = name.substring(name.lastIndexOf('.'));
      if (CODE_EXTENSIONS.includes(ext)) {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          const content = await file.text();
          const lines = content.split('\n').length;
          const { imports: rawImports, exports: exportNames } = parseImports(content);

          children.push({ name, path: childPath, type: 'file', lines, exports: exportNames, imports: rawImports });
        } catch {
          children.push({ name, path: childPath, type: 'file', lines: 0, exports: [], imports: [] });
        }
      }
    }
  }

  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return { name: basePath.split('/').pop() || basePath, path: basePath, type: 'folder', children };
}

export function buildTreeFromFileList(
  files: FileList,
  parseImportsFn: typeof parseImports
): Promise<FileEntry> {
  return new Promise(async (resolve, reject) => {
    try {
      const root: FileEntry = { name: '', path: '', type: 'folder', children: [] };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = (file as any).webkitRelativePath || file.name;
        const parts = relativePath.split('/');

        if (!root.name) {
          root.name = parts[0];
          root.path = parts[0];
        }

        const fileName = parts[parts.length - 1];
        const ext = fileName.substring(fileName.lastIndexOf('.'));
        if (!CODE_EXTENSIONS.includes(ext)) continue;
        if (parts.some((p: string) => p === 'node_modules' || p === 'dist' || p === 'build' || p.startsWith('.'))) continue;

        const content = await file.text();
        const lines = content.split('\n').length;
        const { imports: rawImports, exports: exportNames } = parseImportsFn(content);

        let current = root;
        for (let j = 1; j < parts.length - 1; j++) {
          const folderName = parts[j];
          const folderPath = parts.slice(0, j + 1).join('/');
          let folder = current.children?.find(c => c.name === folderName && c.type === 'folder');
          if (!folder) {
            folder = { name: folderName, path: folderPath, type: 'folder', children: [] };
            current.children!.push(folder);
          }
          current = folder;
        }

        current.children!.push({ name: fileName, path: relativePath, type: 'file', lines, exports: exportNames, imports: rawImports });
      }

      const sortChildren = (node: FileEntry) => {
        if (node.children) {
          node.children.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          node.children.forEach(sortChildren);
        }
      };
      sortChildren(root);

      resolve(root);
    } catch (err) {
      reject(err);
    }
  });
}
