import { useEffect, useRef, useCallback } from 'react';
import { FileEntry, getImportedByFromList } from '../../types/explorer';

interface GNode {
  id: string;
  label: string;
  x: number;
  y: number;
  role: 'center' | 'import' | 'importedBy';
  lines: number;
}

interface GEdge {
  from: string;
  to: string;
  label: string;
}

interface SingleFileGraphProps {
  file: FileEntry | null;
  allFiles: FileEntry[];
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const MAX_PAN = 400;

export default function SingleFileGraph({ file, allFiles }: SingleFileGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  const buildGraph = useCallback((): { nodes: GNode[]; edges: GEdge[] } => {
    if (!file) return { nodes: [], edges: [] };
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];

    nodes.push({ id: file.path, label: file.name, x: 0.5, y: 0.45, role: 'center', lines: file.lines || 0 });

    const imports = (file.imports || []).map(p => allFiles.find(f => f.path === p)).filter(Boolean) as FileEntry[];
    imports.forEach((imp, i) => {
      const count = imports.length;
      const spacing = Math.min(0.8 / Math.max(count, 1), 0.22);
      const startX = 0.5 - (count - 1) * spacing / 2;
      nodes.push({ id: imp.path, label: imp.name, x: startX + i * spacing, y: 0.78, role: 'import', lines: imp.lines || 0 });
      edges.push({ from: file.path, to: imp.path, label: (imp.exports || []).join(', ') });
    });

    const importedBy = getImportedByFromList(file.path, allFiles);
    importedBy.forEach((dep, i) => {
      const count = importedBy.length;
      const spacing = Math.min(0.8 / Math.max(count, 1), 0.22);
      const startX = 0.5 - (count - 1) * spacing / 2;
      nodes.push({ id: dep.path, label: dep.name, x: startX + i * spacing, y: 0.12, role: 'importedBy', lines: dep.lines || 0 });
      edges.push({ from: dep.path, to: file.path, label: (file.exports || []).join(', ') });
    });

    return { nodes, edges };
  }, [file, allFiles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const graph = buildGraph();

    // Read theme colors from CSS variables
    const cs = getComputedStyle(document.documentElement);
    const colorPurple = cs.getPropertyValue('--color-accent-purple').trim() || '#7c3aed';
    const colorCyan = cs.getPropertyValue('--color-accent-cyan').trim() || '#06b6d4';
    const colorSurface = cs.getPropertyValue('--color-surface').trim() || '#15151e';
    const colorText = cs.getPropertyValue('--color-text').trim() || '#fff';
    const colorTextMuted = cs.getPropertyValue('--color-text-muted').trim() || '#9ca3af';
    const colorTextFaint = cs.getPropertyValue('--color-text-faint').trim() || '#4b5563';

    // Pan & Zoom state
    let panX = 0, panY = 0, zoom = 1;
    let isDragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;

    const clampPan = () => {
      const limit = MAX_PAN + (zoom - 1) * 200;
      panX = Math.max(-limit, Math.min(limit, panX));
      panY = Math.max(-limit, Math.min(limit, panY));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;
    const getNode = (id: string) => graph.nodes.find(n => n.id === id);

    const draw = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      const dpr = window.devicePixelRatio;

      // Reset transform and clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w(), h());

      if (graph.nodes.length === 0) {
        ctx.font = '16px system-ui'; ctx.fillStyle = colorTextFaint; ctx.textAlign = 'center';
        ctx.fillText('Bir dosya seçin', w() / 2, h() / 2);
        animationId = requestAnimationFrame(draw); return;
      }

      // Apply pan/zoom (zoom from center)
      ctx.translate(w() / 2 + panX, h() / 2 + panY);
      ctx.scale(zoom, zoom);
      ctx.translate(-w() / 2, -h() / 2);

      graph.edges.forEach(({ from, to, label }) => {
        const a = getNode(from), b = getNode(to);
        if (!a || !b) return;
        const ax = a.x * w(), ay = a.y * h(), bx = b.x * w(), by = b.y * h();
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(mx + Math.sin(t + ax) * 15, my, bx, by);
        ctx.strokeStyle = colorPurple + '4d'; ctx.lineWidth = 2; ctx.stroke();
        const p = (t * 0.3 + ax * 0.01) % 1;
        const px = (1 - p) ** 2 * ax + 2 * (1 - p) * p * (mx + Math.sin(t + ax) * 15) + p ** 2 * bx;
        const py = (1 - p) ** 2 * ay + 2 * (1 - p) * p * my + p ** 2 * by;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = colorPurple; ctx.fill();
        ctx.font = '10px monospace'; ctx.fillStyle = colorPurple + '99'; ctx.textAlign = 'center';
        const lx = (ax + bx) / 2, ly = (ay + by) / 2;
        if (label) ctx.fillText(`{ ${label} }`, lx, ly - 8);
      });

      graph.nodes.forEach((node) => {
        const nx = node.x * w(), ny = node.y * h();
        const r = node.role === 'center' ? 32 : 24;
        if (node.role === 'center') {
          const glow = ctx.createRadialGradient(nx, ny, r, nx, ny, r * 3);
          glow.addColorStop(0, colorPurple + '40'); glow.addColorStop(1, colorPurple + '00');
          ctx.beginPath(); ctx.arc(nx, ny, r * 3, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = node.role === 'center' ? colorPurple : colorSurface; ctx.fill();
        ctx.strokeStyle = node.role === 'center' ? '#a78bfa' : node.role === 'import' ? colorCyan : colorPurple;
        ctx.lineWidth = 2; ctx.stroke();
        ctx.font = `${node.role === 'center' ? 18 : 14}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = colorText; ctx.fillText('📄', nx, ny); ctx.textBaseline = 'alphabetic';
        ctx.font = '12px monospace'; ctx.fillStyle = node.role === 'center' ? colorText : colorTextMuted;
        ctx.fillText(node.label, nx, ny + r + 18);
        ctx.font = '10px monospace'; ctx.fillStyle = colorTextFaint; ctx.fillText(`${node.lines} lines`, nx, ny + r + 32);
        if (node.role === 'importedBy') { ctx.font = '9px monospace'; ctx.fillStyle = colorPurple; ctx.fillText('imports ↓', nx, ny - r - 8); }
        if (node.role === 'import') { ctx.font = '9px monospace'; ctx.fillStyle = colorCyan; ctx.fillText('imported by ↑', nx, ny - r - 8); }
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      clampPan();
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    // Scroll zoom handler (zoom toward mouse position)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - w() / 2;
      const mouseY = e.clientY - rect.top - h() / 2;

      const oldZoom = zoom;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));

      // Zoom toward mouse position
      const ratio = zoom / oldZoom;
      panX = mouseX - ratio * (mouseX - panX);
      panY = mouseY - ratio * (mouseY - panY);
      clampPan();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [buildGraph]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab" />;
}
