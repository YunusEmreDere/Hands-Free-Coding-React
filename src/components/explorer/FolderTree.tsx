import { useState } from 'react';
import { FileEntry } from '../../types/explorer';

interface FolderTreeProps {
  node: FileEntry;
  depth: number;
  selectedFile: string | null;
  onSelect: (f: FileEntry) => void;
}

export default function FolderTree({ node, depth, selectedFile, onSelect }: FolderTreeProps) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === 'folder';
  const isSelected = node.path === selectedFile;

  return (
    <div>
      <button
        onClick={() => isFolder ? setOpen(!open) : onSelect(node)}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm transition-all hover:bg-theme-border ${
          isSelected ? 'bg-purple-primary/20 text-theme-text' : 'text-theme-text-muted'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <span className="text-xs text-theme-text-muted w-4">{open ? '▼' : '▶'}</span>
        ) : (
          <span className="w-4" />
        )}
        <span>{isFolder ? '📁' : '📄'}</span>
        <span className={`break-all leading-snug ${isSelected ? 'font-semibold' : ''}`}>{node.name}</span>
        {!isFolder && node.lines != null && (
          <span className="ml-auto text-[10px] text-theme-text-faint flex-shrink-0">{node.lines}L</span>
        )}
      </button>
      {isFolder && open && node.children?.map((child) => (
        <FolderTree key={child.path} node={child} depth={depth + 1} selectedFile={selectedFile} onSelect={onSelect} />
      ))}
    </div>
  );
}
