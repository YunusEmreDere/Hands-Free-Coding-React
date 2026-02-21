import { useEffect, useState } from 'react';
import * as Diff from 'diff';

interface FileDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  newCode: string;
  filePath: string;
  onConfirm: () => Promise<void> | void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNo: number | null;
  newLineNo: number | null;
}

function buildDiffLines(oldCode: string, newCode: string): DiffLine[] {
  const parts = Diff.diffLines(oldCode || '', newCode);
  const lines: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  parts.forEach((part) => {
    const partLines = part.value.replace(/\n$/, '').split('\n');

    partLines.forEach((content) => {
      if (part.added) {
        lines.push({ type: 'added', content, oldLineNo: null, newLineNo: newLine++ });
      } else if (part.removed) {
        lines.push({ type: 'removed', content, oldLineNo: oldLine++, newLineNo: null });
      } else {
        lines.push({ type: 'unchanged', content, oldLineNo: oldLine++, newLineNo: newLine++ });
      }
    });
  });

  return lines;
}

export default function FileDiffModal({ isOpen, onClose, originalCode, newCode, filePath, onConfirm }: FileDiffModalProps) {
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDiffLines(buildDiffLines(originalCode, newCode));
      setSaving(false);
    }
  }, [isOpen, originalCode, newCode]);

  if (!isOpen) return null;

  const added = diffLines.filter(l => l.type === 'added').length;
  const removed = diffLines.filter(l => l.type === 'removed').length;
  const isNewFile = !originalCode;

  const handleConfirm = async () => {
    setSaving(true);
    await onConfirm();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-theme-panel w-full max-w-4xl h-[80vh] rounded-xl border border-purple-primary/30 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-bg">
          <div>
            <h3 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <span className="text-purple-primary">Degisiklik Onayi</span>
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-theme-text-muted font-mono">{filePath}</span>
              <span className="text-xs text-green-400 font-mono">+{added}</span>
              <span className="text-xs text-red-400 font-mono">-{removed}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface transition-all">
            ✕
          </button>
        </div>

        {/* INFO BANNER */}
        {isNewFile && (
          <div className="px-6 py-2 bg-green-500/10 border-b border-green-500/20 text-green-400 text-xs flex items-center gap-2">
            Yeni dosya - tum satirlar eklenecek.
          </div>
        )}

        {/* DIFF VIEW */}
        <div className="flex-1 overflow-auto bg-theme-bg font-mono text-sm leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {diffLines.map((line, i) => {
                const bgClass =
                  line.type === 'added' ? 'bg-green-500/10' :
                  line.type === 'removed' ? 'bg-red-500/10' : '';

                const textClass =
                  line.type === 'added' ? 'text-green-300' :
                  line.type === 'removed' ? 'text-red-400 line-through opacity-70' :
                  'text-theme-text-secondary';

                const borderClass =
                  line.type === 'added' ? 'border-l-2 border-green-500' :
                  line.type === 'removed' ? 'border-l-2 border-red-500' :
                  'border-l-2 border-transparent';

                const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

                return (
                  <tr key={i} className={`${bgClass} hover:brightness-125 transition-all`}>
                    {/* Old line number */}
                    <td className="w-12 text-right pr-2 text-theme-text-faint text-xs select-none py-0.5 opacity-50">
                      {line.oldLineNo ?? ''}
                    </td>
                    {/* New line number */}
                    <td className="w-12 text-right pr-2 text-theme-text-faint text-xs select-none py-0.5 opacity-50">
                      {line.newLineNo ?? ''}
                    </td>
                    {/* Prefix (+/-/space) */}
                    <td className={`w-6 text-center select-none py-0.5 ${
                      line.type === 'added' ? 'text-green-400' :
                      line.type === 'removed' ? 'text-red-400' :
                      'text-theme-text-faint'
                    }`}>
                      {prefix}
                    </td>
                    {/* Content */}
                    <td className={`${borderClass} ${textClass} px-3 py-0.5 whitespace-pre-wrap`}>
                      {line.content || '\u00A0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-theme-border bg-theme-bg flex items-center justify-between">
          <div className="text-sm text-theme-text-faint">
            {diffLines.length} satir &middot; {added} eklenen &middot; {removed} silinen
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-base text-theme-text-muted hover:text-theme-text hover:bg-theme-surface rounded-xl border border-theme-border hover:border-theme-border-alt transition-all font-medium min-w-[120px]"
            >
              Iptal Et
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="px-8 py-3 text-base bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 min-w-[200px] justify-center"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Kaydediliyor...
                </>
              ) : (
                'Degisiklikleri Uygula'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
