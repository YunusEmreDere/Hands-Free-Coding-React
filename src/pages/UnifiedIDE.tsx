import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEntry, flattenFiles, countFolders } from '../types/explorer';
import { DEMO_PROJECT } from '../data/demoProject';
import FolderTree from '../components/explorer/FolderTree';
import SingleFileGraph from '../components/explorer/SingleFileGraph';
import GlobalGraph from '../components/explorer/GlobalGraph';
import FolderSelectModal from '../components/explorer/FolderSelectModal';
import ChatInterface from '../components/ChatInterface';



const API_BASE = 'http://127.0.0.1:8000';
const AUTO_REFRESH_INTERVAL = 30_000;

export default function UnifiedIDE() {
  const navigate = useNavigate();

  // ── Project state ────────────────────────────────────────────────
  const [project, setProject] = useState<FileEntry>(DEMO_PROJECT);
  const [allFiles, setAllFiles] = useState<FileEntry[]>(() => flattenFiles(DEMO_PROJECT));
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [projectName, setProjectName] = useState('Demo Project');

  // ── UI state ─────────────────────────────────────────────────────
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphMode, setGraphMode] = useState<'file' | 'global'>('file');

  // ── Refresh state ────────────────────────────────────────────────
  const projectPathRef = useRef<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setAllFiles(flattenFiles(project)); }, [project]);

  // ── Project load callback (from modal) ───────────────────────────
  const handleProjectLoad = useCallback((tree: FileEntry, name: string, path: string) => {
    projectPathRef.current = path;
    setProject(tree);
    setProjectName(name);
    setSelectedFile(null);
    setLastRefreshed(new Date());
    setShowFolderModal(false);
  }, []);

  // ── Refresh ──────────────────────────────────────────────────────
  const refreshProject = useCallback(async (silent = false) => {
    const path = projectPathRef.current;
    if (!path) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/read-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const tree: FileEntry = await res.json();
      setProject(tree);
      setLastRefreshed(new Date());
      if (selectedFile) {
        const newFiles = flattenFiles(tree);
        setSelectedFile(newFiles.find(f => f.path === selectedFile.path) || null);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
    if (!silent) setRefreshing(false);
  }, [selectedFile]);

  useEffect(() => {
    if (!autoRefresh || !projectPathRef.current) return;
    const id = setInterval(() => refreshProject(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh, refreshProject]);

  const hasProject = projectPathRef.current !== null;
  const totalEdges = allFiles.reduce(
    (s, f) => s + (f.imports || []).filter(i => allFiles.some(a => a.path === i)).length, 0
  );

  return (
    <div className="h-screen bg-theme-bg text-theme-text flex flex-col overflow-hidden font-sans">

      {/* ═══════════════════════════════════════════════════════════
          TOP BAR  (h-11)
      ═══════════════════════════════════════════════════════════ */}
      <header className="h-11 flex items-center gap-3 px-4 border-b border-theme-border flex-shrink-0 bg-theme-bg/95 backdrop-blur-sm">

        {/* Logo → back to dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-7 h-7 bg-purple-primary rounded-md flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 hover:bg-purple-primary/80 transition-colors"
          title="Dashboard'a dön"
        >
          VC
        </button>

        {/* Project name */}
        <span className="text-sm font-semibold text-theme-text-secondary truncate max-w-[140px]">
          {projectName}
        </span>

        {/* Proje Bağla */}
        <button
          onClick={() => setShowFolderModal(true)}
          className="px-2.5 py-1 text-xs bg-purple-primary/15 border border-purple-primary/35 rounded text-purple-primary hover:bg-purple-primary/25 transition-all"
        >
          📂 Bağla
        </button>

        {/* Refresh (only when project loaded) */}
        {hasProject && (
          <button
            onClick={() => refreshProject(false)}
            disabled={refreshing}
            className="px-2 py-1 text-xs bg-theme-surface border border-theme-border rounded text-theme-text-muted hover:text-theme-text hover:border-purple-primary/40 transition-all disabled:opacity-40"
          >
            <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
          </button>
        )}

        {/* ── Spacer ── */}
        <div className="flex-1 min-w-0" />

        {/* Selected file breadcrumb (center) */}
        {selectedFile && (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono overflow-hidden max-w-[320px]">
            {selectedFile.path.split('/').map((seg, i, arr) => (
              <span key={i} className="flex items-center gap-1 flex-shrink-0">
                {i > 0 && <span className="text-theme-text-faint">/</span>}
                <span className={i === arr.length - 1 ? 'text-purple-primary font-semibold' : 'text-theme-text-faint'}>
                  {seg}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 min-w-0" />

        {/* Auto-refresh toggle */}
        {hasProject && (
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border transition-all ${
              autoRefresh
                ? 'border-green-500/30 bg-green-500/8 text-green-400'
                : 'border-theme-border text-theme-text-faint hover:border-theme-border-alt'
            }`}
            title={autoRefresh ? 'Otomatik yenileme açık' : 'Otomatik yenileme kapalı'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-400' : 'bg-theme-text-faint'}`} />
            {autoRefresh ? 'Canlı' : 'Manuel'}
            {lastRefreshed && autoRefresh && (
              <span className="opacity-50">
                · {lastRefreshed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>
        )}

        {/* Graph panel toggle */}
        <button
          onClick={() => setShowGraph(v => !v)}
          className={`px-2.5 py-1 text-xs rounded border transition-all ${
            showGraph
              ? 'bg-cyan-primary/15 border-cyan-primary/40 text-cyan-primary'
              : 'border-theme-border text-theme-text-faint hover:border-theme-border-alt hover:text-theme-text-muted'
          }`}
        >
          {showGraph ? '▶ Grafik' : '◀ Grafik'}
        </button>

        {/* Voice status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/25 bg-green-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider">Hazır</span>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MAIN  (flex-1, 3 sütun)
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── LEFT: File Tree (280px) ─────────────────────────── */}
        <aside className="w-[280px] border-r border-theme-border flex flex-col flex-shrink-0 bg-theme-bg">

          {/* View mode toggle */}
          <div className="flex px-2 py-1.5 gap-1 border-b border-theme-border">
            <button
              onClick={() => { setShowGraph(true); setGraphMode('file'); }}
              className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-all ${
                showGraph && graphMode === 'file'
                  ? 'bg-purple-primary/20 text-purple-primary border border-purple-primary/40'
                  : 'text-theme-text-faint hover:text-theme-text-muted'
              }`}
            >
              Tekli
            </button>
            <button
              onClick={() => { setShowGraph(true); setGraphMode('global'); }}
              className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-all ${
                showGraph && graphMode === 'global'
                  ? 'bg-cyan-primary/20 text-cyan-primary border border-cyan-primary/40'
                  : 'text-theme-text-faint hover:text-theme-text-muted'
              }`}
            >
              Tüm Proje
            </button>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto py-1.5 px-1">
            <FolderTree
              node={project}
              depth={0}
              selectedFile={selectedFile?.path || null}
              onSelect={(f) => setSelectedFile(f)}
            />
          </div>

          {/* Stats footer */}
          <div className="px-3 py-2 border-t border-theme-border flex items-center justify-between text-[10px] text-theme-text-faint font-mono">
            <span>{allFiles.length} dosya</span>
            <span>{totalEdges} import</span>
            <span>{countFolders(project)} klasör</span>
          </div>
        </aside>

        {/* ── CENTER: ChatInterface (flex-1) ──────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col bg-theme-bg overflow-hidden">
          <ChatInterface selectedFile={selectedFile} />
        </main>

        {/* ── RIGHT: Graph Panel (380px, toggleable) ──────────── */}
        {showGraph && (
          <aside className="w-[380px] border-l border-theme-border flex flex-col flex-shrink-0 bg-theme-bg">

            {/* Graph panel header */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-theme-border flex-shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setGraphMode('file')}
                  className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                    graphMode === 'file'
                      ? 'bg-purple-primary/20 text-purple-primary font-medium'
                      : 'text-theme-text-faint hover:text-theme-text-muted'
                  }`}
                >
                  Tekli Dosya
                </button>
                <button
                  onClick={() => setGraphMode('global')}
                  className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                    graphMode === 'global'
                      ? 'bg-cyan-primary/20 text-cyan-primary font-medium'
                      : 'text-theme-text-faint hover:text-theme-text-muted'
                  }`}
                >
                  Tüm Proje
                </button>
              </div>
              <button
                onClick={() => setShowGraph(false)}
                className="w-6 h-6 flex items-center justify-center text-theme-text-faint hover:text-theme-text rounded transition-all text-xs"
              >
                ✕
              </button>
            </div>

            {/* Graph canvas */}
            <div className="flex-1 min-h-0">
              {graphMode === 'file'
                ? <SingleFileGraph file={selectedFile} allFiles={allFiles} />
                : <GlobalGraph allFiles={allFiles} onSelectFile={(f) => setSelectedFile(f)} />
              }
            </div>

            {/* Graph legend */}
            <div className="px-3 py-2 border-t border-theme-border flex flex-wrap gap-3 text-[9px] text-theme-text-faint font-mono uppercase tracking-wider">
              {graphMode === 'file' ? (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-primary inline-block" />Seçili</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-purple-primary inline-block" />Import eden</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-cyan-primary inline-block" />Import edilen</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-primary inline-block" />İkisi de</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-cyan-primary inline-block" />Import ediyor</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-purple-primary inline-block" />Ediliyor</span>
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          VOICE CONTROL CENTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="h-20 bg-theme-panel border-t border-purple-primary/30 flex items-center justify-between px-8 flex-shrink-0 relative overflow-hidden shadow-[0_-10px_30px_rgba(168,85,247,0.05)]">

        {/* Sol: Dinleme Durumu */}
        <div className="flex items-center gap-4 z-10">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 bg-purple-primary/20 rounded-full animate-ping opacity-75" />
            <div className="relative bg-purple-primary w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-primary/30 border border-purple-primary/50">
              🎤
            </div>
          </div>
          <div>
            <div className="text-purple-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-primary animate-pulse" />
              VoiceCode Dinliyor
            </div>
            <div className="text-theme-text-faint text-[11px] font-mono mt-0.5">
              "App.jsx'i aç" veya "Kodu onayla" deyin...
            </div>
          </div>
        </div>

        {/* Orta: Ses Dalgaları */}
        <div className="flex-1 max-w-md mx-8 h-8 flex items-center justify-center gap-1 opacity-70 z-10">
          <div className="w-1.5 h-3 bg-cyan-primary rounded-full animate-pulse" />
          <div className="w-1.5 h-6 bg-cyan-primary rounded-full animate-pulse delay-75" />
          <div className="w-1.5 h-8 bg-cyan-primary rounded-full animate-pulse delay-100" />
          <div className="w-1.5 h-5 bg-cyan-primary rounded-full animate-pulse delay-150" />
          <div className="w-1.5 h-4 bg-purple-primary rounded-full animate-pulse delay-200" />
          <div className="w-1.5 h-7 bg-purple-primary rounded-full animate-pulse delay-75" />
          <div className="w-1.5 h-3 bg-purple-primary rounded-full animate-pulse" />
        </div>

        {/* Sağ: Sistem Durumu */}
        <div className="flex items-center gap-6 z-10">
          <div className="text-right">
            <div className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest">Environment</div>
            <div className="text-cyan-primary text-xs font-mono">Production</div>
          </div>
          <div className="h-6 w-px bg-theme-border" />
          <div className="text-right">
            <div className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest">Latency</div>
            <div className="text-green-400 text-xs font-mono">12ms</div>
          </div>
        </div>

        {/* Arka Plan Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-to-r from-transparent via-purple-primary/10 to-transparent pointer-events-none" />
      </footer>

      {/* Folder Select Modal */}
      <FolderSelectModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onProjectLoad={handleProjectLoad}
      />
    </div>
  );
}
