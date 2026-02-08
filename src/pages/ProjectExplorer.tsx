import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEntry, flattenFiles, getImportedByFromList, countFolders } from '../types/explorer';
import { parseImports, resolveAllImports, readDirectoryRecursive, buildTreeFromFileList } from '../utils/fileParser';
import { DEMO_PROJECT } from '../data/demoProject';
import FolderTree from '../components/explorer/FolderTree';
import SingleFileGraph from '../components/explorer/SingleFileGraph';
import GlobalGraph from '../components/explorer/GlobalGraph';

const AUTO_REFRESH_INTERVAL = 30_000; // 30 saniye

export default function ProjectExplorer() {
  const navigate = useNavigate();
  const [project, setProject] = useState<FileEntry>(DEMO_PROJECT);
  const [allFiles, setAllFiles] = useState<FileEntry[]>(() => flattenFiles(DEMO_PROJECT));
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [viewMode, setViewMode] = useState<'file' | 'global'>('file');
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('Demo Project');

  // Directory handle for refresh
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setAllFiles(flattenFiles(project));
  }, [project]);

  // Refresh function - re-reads the stored dirHandle
  const refreshProject = useCallback(async (silent = false) => {
    const handle = dirHandleRef.current;
    if (!handle) return;

    if (!silent) setRefreshing(true);

    try {
      const tree = await readDirectoryRecursive(handle, handle.name);
      const resolved = resolveAllImports(tree);
      setProject(resolved);
      setLastRefreshed(new Date());

      // Keep selected file if it still exists
      if (selectedFile) {
        const newFiles = flattenFiles(resolved);
        const stillExists = newFiles.find(f => f.path === selectedFile.path);
        if (stillExists) {
          setSelectedFile(stillExists);
        } else {
          setSelectedFile(null);
        }
      }
    } catch (err: any) {
      console.error('Refresh error:', err);
    }

    if (!silent) setRefreshing(false);
  }, [selectedFile]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !dirHandleRef.current) return;

    const interval = setInterval(() => {
      refreshProject(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshProject]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenFolder = async () => {
    setErrorMsg(null);

    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        dirHandleRef.current = dirHandle;
        setLoading(true);
        setSelectedFile(null);

        const tree = await readDirectoryRecursive(dirHandle, dirHandle.name);
        const resolved = resolveAllImports(tree);

        setProject(resolved);
        setProjectName(dirHandle.name);
        setLastRefreshed(new Date());
        setLoading(false);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Folder read error:', err);
          setErrorMsg('Klasör okunamadı: ' + err.message);
        }
        setLoading(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFallbackFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setSelectedFile(null);
    setErrorMsg(null);
    dirHandleRef.current = null;

    try {
      const root = await buildTreeFromFileList(files, parseImports);
      const resolved = resolveAllImports(root);
      setProject(resolved);
      setProjectName(root.name);
    } catch (err: any) {
      console.error('File read error:', err);
      setErrorMsg('Dosyalar okunamadı: ' + err.message);
    }

    setLoading(false);
    e.target.value = '';
  };

  const hasLiveHandle = dirHandleRef.current !== null;

  const breadcrumb = selectedFile ? selectedFile.path.split('/') : [projectName];
  const importedBy = selectedFile ? getImportedByFromList(selectedFile.path, allFiles) : [];
  const imports = selectedFile
    ? (selectedFile.imports || []).map(p => allFiles.find(f => f.path === p)).filter(Boolean) as FileEntry[]
    : [];

  const totalImportEdges = allFiles.reduce((sum, f) => sum + (f.imports || []).filter(imp => allFiles.some(af => af.path === imp)).length, 0);

  return (
    <div className="h-screen bg-theme-bg text-theme-text flex overflow-hidden">

      {/* Left Panel - Folder Tree */}
      <div className="w-[240px] border-r border-theme-border flex flex-col flex-shrink-0">
        {/* Top: Back + Title */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-theme-border">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 bg-purple-primary rounded-lg flex items-center justify-center hover:bg-purple-primary/80 transition-colors text-xs font-bold flex-shrink-0"
          >
            VC
          </button>
          <span className="text-sm font-semibold truncate">{projectName}</span>
        </div>

        {/* Open Folder Button */}
        <div className="px-3 py-3 border-b border-theme-border">
          <button
            onClick={handleOpenFolder}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-primary/30 to-cyan-primary/30 border border-purple-primary/50 rounded-lg text-sm font-medium hover:from-purple-primary/40 hover:to-cyan-primary/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Okunuyor...
              </>
            ) : (
              <>
                📂 Klasör Aç
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            {...{ webkitdirectory: '', directory: '' } as any}
            multiple
            onChange={handleFallbackFiles}
          />
          {errorMsg && (
            <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
          )}

          {/* Refresh controls - only when a live folder handle exists */}
          {hasLiveHandle && (
            <div className="mt-2 space-y-2">
              <button
                onClick={() => refreshProject(false)}
                disabled={refreshing}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-theme-surface border border-theme-border rounded-lg text-xs text-theme-text-muted hover:border-purple-primary/40 hover:text-theme-text transition-all disabled:opacity-50"
              >
                <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                {refreshing ? 'Yenileniyor...' : 'Yenile'}
              </button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-1.5 text-[10px] transition-colors ${
                    autoRefresh ? 'text-green-400' : 'text-theme-text-faint'
                  }`}
                >
                  <div className={`w-6 h-3 rounded-full flex items-center transition-all ${
                    autoRefresh ? 'bg-green-400/30 justify-end' : 'bg-theme-border justify-start'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-0.5 transition-colors ${
                      autoRefresh ? 'bg-green-400' : 'bg-theme-text-muted'
                    }`} />
                  </div>
                  Otomatik
                </button>
                {lastRefreshed && (
                  <span className="text-[10px] text-theme-text-faint">
                    {lastRefreshed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="px-3 py-2 border-b border-theme-border flex gap-1">
          <button
            onClick={() => setViewMode('file')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
              viewMode === 'file' ? 'bg-purple-primary/20 text-purple-primary border border-purple-primary/40' : 'text-theme-text-muted hover:text-theme-text-secondary'
            }`}
          >
            Tekli Dosya
          </button>
          <button
            onClick={() => setViewMode('global')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
              viewMode === 'global' ? 'bg-cyan-primary/20 text-cyan-primary border border-cyan-primary/40' : 'text-theme-text-muted hover:text-theme-text-secondary'
            }`}
          >
            Tüm Proje
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2 px-1">
          <FolderTree node={project} depth={0} selectedFile={selectedFile?.path || null} onSelect={(f) => { setSelectedFile(f); setViewMode('file'); }} />
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-t border-theme-border text-[10px] text-theme-text-faint uppercase tracking-wider">
          {allFiles.length} files &middot; {countFolders(project)} folders &middot; {totalImportEdges} imports
        </div>
      </div>

      {/* Center - Graph */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className="h-14 flex items-center gap-2 px-6 border-b border-theme-border flex-shrink-0">
          <span className="text-purple-primary text-sm font-mono font-bold">
            {viewMode === 'global' ? 'FULL PROJECT GRAPH' : 'EXPLORER'}
          </span>
          {viewMode === 'file' && breadcrumb.map((part, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-mono">
              <span className="text-theme-text-faint">/</span>
              <span className={i === breadcrumb.length - 1 ? 'text-white font-semibold' : 'text-theme-text-muted'}>{part}</span>
            </span>
          ))}
          {viewMode === 'global' && (
            <span className="text-xs text-theme-text-muted font-mono ml-2">
              {allFiles.length} dosya &middot; {totalImportEdges} import ilişkisi
            </span>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {viewMode === 'file' ? (
            <SingleFileGraph file={selectedFile} allFiles={allFiles} />
          ) : (
            <GlobalGraph allFiles={allFiles} onSelectFile={(f) => { setSelectedFile(f); setViewMode('file'); }} />
          )}

          {/* Legend */}
          <div className="absolute bottom-20 left-6 flex items-center gap-5 text-[10px] text-theme-text-muted font-mono uppercase tracking-wider">
            {viewMode === 'file' ? (
              <>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-primary" /> Seçili Dosya</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-purple-primary bg-theme-surface" /> Bunu Import Eden</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-cyan-primary bg-theme-surface" /> Bunun Import Ettiği</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-primary" /> Hem import eden hem edilen</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-cyan-primary bg-theme-surface-alt" /> Import ediyor</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-purple-primary bg-theme-surface-alt" /> Import ediliyor</div>
                <div className="text-theme-text-faint ml-2">Bir node'a tıklayarak detayına gidin</div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-14 flex items-center gap-3 px-6 border-t border-theme-border flex-shrink-0">
          <span className="text-[10px] text-theme-text-faint font-mono uppercase tracking-wider">
            {viewMode === 'file'
              ? selectedFile ? `${imports.length} imports · ${importedBy.length} dependents` : 'No file selected'
              : `${allFiles.length} files · ${totalImportEdges} dependency edges`
            }
          </span>
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="w-[300px] border-l border-theme-border flex flex-col overflow-y-auto flex-shrink-0">
        {selectedFile ? (
          <>
            <div className="px-5 py-5 border-b border-theme-border">
              <h3 className="text-purple-primary text-xs font-bold uppercase tracking-widest mb-4">File Info</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-primary/20 border border-purple-primary/40 flex items-center justify-center">📄</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{selectedFile.name}</div>
                  <div className="text-[10px] text-theme-text-muted font-mono truncate">{selectedFile.path}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-theme-surface rounded-lg px-3 py-2 border border-theme-border">
                  <div className="text-[10px] text-theme-text-muted uppercase tracking-wider">Lines</div>
                  <div className="font-semibold">{selectedFile.lines}</div>
                </div>
                <div className="bg-theme-surface rounded-lg px-3 py-2 border border-theme-border">
                  <div className="text-[10px] text-theme-text-muted uppercase tracking-wider">Exports</div>
                  <div className="font-semibold">{(selectedFile.exports || []).length}</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-theme-border">
              <h3 className="text-purple-primary text-xs font-bold uppercase tracking-widest mb-3">Exports</h3>
              {(selectedFile.exports || []).length === 0 ? (
                <p className="text-xs text-theme-text-faint">No exports</p>
              ) : (
                <div className="space-y-1.5">
                  {(selectedFile.exports || []).map((exp) => (
                    <div key={exp} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 text-xs">export</span>
                      <span className="text-theme-text-secondary font-mono">{exp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-b border-theme-border">
              <h3 className="text-cyan-primary text-xs font-bold uppercase tracking-widest mb-3">Imports ({imports.length})</h3>
              {imports.length === 0 ? (
                <p className="text-xs text-theme-text-faint">No imports</p>
              ) : (
                <div className="space-y-2">
                  {imports.map((imp) => (
                    <button key={imp.path} onClick={() => setSelectedFile(imp)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-left hover:border-cyan-primary/50 transition-all">
                      <span className="text-xs">📄</span>
                      <div className="min-w-0">
                        <div className="text-sm text-theme-text-secondary truncate">{imp.name}</div>
                        <div className="text-[10px] text-theme-text-faint font-mono truncate">{(imp.exports || []).map(e => `{ ${e} }`).join(', ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4">
              <h3 className="text-purple-primary text-xs font-bold uppercase tracking-widest mb-3">Imported By ({importedBy.length})</h3>
              {importedBy.length === 0 ? (
                <p className="text-xs text-theme-text-faint">No files import this</p>
              ) : (
                <div className="space-y-2">
                  {importedBy.map((dep) => (
                    <button key={dep.path} onClick={() => setSelectedFile(dep)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-theme-surface border border-theme-border rounded-lg text-left hover:border-purple-primary/50 transition-all">
                      <span className="text-xs">📄</span>
                      <div className="min-w-0">
                        <div className="text-sm text-theme-text-secondary truncate">{dep.name}</div>
                        <div className="text-[10px] text-theme-text-faint font-mono truncate">{dep.path}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📂</div>
              <p className="text-sm text-theme-text-muted mb-4">Soldaki dosya ağacından<br />bir dosya seçin</p>
              <p className="text-xs text-theme-text-faint">veya</p>
              <button onClick={handleOpenFolder} className="mt-2 text-sm text-purple-primary hover:underline">
                Kendi projenizi açın
              </button>
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-t border-theme-border mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-theme-surface border border-theme-border-alt flex items-center justify-center text-sm">🎤</div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-green-400 uppercase">Voice Ready</div>
              <div className="text-[10px] text-theme-text-faint">Listening for "Open file..."</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
