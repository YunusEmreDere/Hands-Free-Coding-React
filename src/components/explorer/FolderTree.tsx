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
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-left text-sm transition-all hover:bg-[#1a1a2e] ${
          isSelected ? 'bg-[#7c3aed]/20 text-white' : 'text-gray-400'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <span className="text-xs text-gray-500 w-4">{open ? '▼' : '▶'}</span>
        ) : (
          <span className="w-4" />
        )}
        <span>{isFolder ? '📁' : '📄'}</span>
        <span className={`truncate ${isSelected ? 'font-semibold' : ''}`}>{node.name}</span>
        {!isFolder && node.lines != null && (
          <span className="ml-auto text-[10px] text-gray-600 flex-shrink-0">{node.lines}L</span>
        )}
      </button>
      {isFolder && open && node.children?.map((child) => (
        <FolderTree key={child.path} node={child} depth={depth + 1} selectedFile={selectedFile} onSelect={onSelect} />
      ))}
    </div>
  );
}
