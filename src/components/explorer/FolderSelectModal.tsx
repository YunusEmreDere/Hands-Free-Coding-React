import { useState } from 'react';
import { FileEntry } from '../../types/explorer';

const API_BASE = 'http://127.0.0.1:8000';

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectLoad: (tree: FileEntry, name: string, path: string) => void;
}

export default function FolderSelectModal({ isOpen, onClose, onProjectLoad }: FolderSelectModalProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [manualPath, setManualPath] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    setError(null);
    setBrowsing(true);

    try {
      const res = await fetch(`${API_BASE}/select-folder`);
      if (!res.ok) throw new Error('Sunucudan hata geldi');

      const data = await res.json();

      if (!data.path) {
        setBrowsing(false);
        return;
      }

      setSelectedPath(data.path);
      setSelectedName(data.name || data.path.split('/').pop() || 'project');
    } catch (err: any) {
      setError('Klasor secilemedi. Backend acik mi?');
      console.error('select-folder error:', err);
    }

    setBrowsing(false);
  };

  const handleManualSubmit = () => {
    const trimmed = manualPath.trim();
    if (!trimmed) return;

    setSelectedPath(trimmed);
    setSelectedName(trimmed.split('/').pop() || trimmed.split('\\').pop() || 'project');
    setError(null);
  };

  const handleConnect = async () => {
    if (!selectedPath) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/read-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath }),
      });

      if (!res.ok) throw new Error('Klasor okunamadi');

      const tree: FileEntry = await res.json();
      onProjectLoad(tree, selectedName, selectedPath);

      setSelectedPath(null);
      setSelectedName('');
      setManualPath('');
    } catch (err: any) {
      setError('Proje okunamadi: ' + (err.message || 'Bilinmeyen hata'));
      console.error('read-folder error:', err);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setSelectedPath(null);
    setSelectedName('');
    setManualPath('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-theme-panel border border-theme-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <h2 className="text-lg font-bold text-theme-text">Proje Bagla</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!selectedPath ? (
            <div className="space-y-5">
              {/* Browse button */}
              <button
                onClick={handleBrowse}
                disabled={browsing}
                className="w-full py-10 border-2 border-dashed border-theme-border-alt rounded-xl flex flex-col items-center gap-3 hover:border-purple-primary/60 hover:bg-purple-primary/5 transition-all disabled:opacity-50 group"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {browsing ? '⏳' : '📂'}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-theme-text mb-1">
                    {browsing ? 'Klasor seciliyor...' : 'Bilgisayardan Gozat'}
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    Proje klasorunuzu secmek icin tiklayin
                  </div>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-theme-border" />
                <span className="text-xs text-theme-text-faint">veya</span>
                <div className="flex-1 h-px bg-theme-border" />
              </div>

              {/* Manual path input */}
              <div>
                <label className="text-xs text-theme-text-muted block mb-2">Dosya yolunu yazin</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                    placeholder="/home/user/my-project"
                    className="flex-1 bg-theme-bg border border-theme-border rounded-lg px-3 py-2.5 text-sm text-theme-text placeholder-theme-text-faint focus:outline-none focus:border-purple-primary/50 transition-colors font-mono"
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualPath.trim()}
                    className="px-4 py-2.5 bg-purple-primary/20 border border-purple-primary/40 rounded-lg text-sm text-purple-primary font-medium hover:bg-purple-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Sec
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Selected state */
            <div className="space-y-4">
              {/* Path display */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-lg">✓</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-green-400">{selectedName}</div>
                    <div className="text-xs text-green-400/70 font-mono truncate">{selectedPath}</div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-theme-text-muted hover:text-theme-text transition-colors px-2 py-1 rounded hover:bg-theme-surface"
                  >
                    Degistir
                  </button>
                </div>
              </div>

              {/* Connect button */}
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-primary to-cyan-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Proje okunuyor...
                  </>
                ) : (
                  'Projeye Baglan'
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
