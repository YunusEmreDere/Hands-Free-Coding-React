import { useEffect, useRef } from 'react';
import { FileEntry } from '../../types/explorer';

interface GlobalGraphProps {
  allFiles: FileEntry[];
  onSelectFile: (f: FileEntry) => void;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const MAX_PAN = 400;

export default function GlobalGraph({ allFiles, onSelectFile }: GlobalGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build positions using a simple layered layout
    const positions = new Map<string, { x: number; y: number }>();

    // Group files by folder
    const folders = new Map<string, FileEntry[]>();
    allFiles.forEach(f => {
      const dir = f.path.substring(0, f.path.lastIndexOf('/')) || 'root';
      if (!folders.has(dir)) folders.set(dir, []);
      folders.get(dir)!.push(f);
    });

    const folderKeys = Array.from(folders.keys()).sort();
    const totalFolders = folderKeys.length;

    folderKeys.forEach((folder, fi) => {
      const files = folders.get(folder)!;
      const row = (fi + 0.5) / totalFolders;
      files.forEach((file, fileIdx) => {
        const col = (fileIdx + 1) / (files.length + 1);
        positions.set(file.path, {
          x: 0.1 + col * 0.8,
          y: 0.08 + row * 0.84,
        });
      });
    });

    // Edges
    const edges: { from: string; to: string }[] = [];
    allFiles.forEach(file => {
      (file.imports || []).forEach(imp => {
        if (allFiles.some(f => f.path === imp)) {
          edges.push({ from: file.path, to: imp });
        }
      });
    });

    // Pan & Zoom state
    let panX = 0, panY = 0, zoom = 1;
    let isDragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;
    let hasDragged = false;

    const clampPan = () => {
      const limit = MAX_PAN + (zoom - 1) * 200;
      panX = Math.max(-limit, Math.min(limit, panX));
      panY = Math.max(-limit, Math.min(limit, panY));
    };

    let animationId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const draw = () => {
      timeRef.current += 0.005;
      const t = timeRef.current;
      const dpr = window.devicePixelRatio;

      // Reset transform and clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w(), h());

      // Apply pan/zoom (zoom from center)
      ctx.translate(w() / 2 + panX, h() / 2 + panY);
      ctx.scale(zoom, zoom);
      ctx.translate(-w() / 2, -h() / 2);

      // Draw edges
      edges.forEach(({ from, to }) => {
        const a = positions.get(from), b = positions.get(to);
        if (!a || !b) return;
        const ax = a.x * w(), ay = a.y * h(), bx = b.x * w(), by = b.y * h();
        const mx = (ax + bx) / 2 + Math.sin(t + ax * 0.1) * 10;
        const my = (ay + by) / 2;

        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(mx, my, bx, by);
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

        // Particle
        const p = (t * 0.2 + ax * 0.005) % 1;
        const px = (1 - p) ** 2 * ax + 2 * (1 - p) * p * mx + p ** 2 * bx;
        const py = (1 - p) ** 2 * ay + 2 * (1 - p) * p * my + p ** 2 * by;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.6)'; ctx.fill();
      });

      // Draw folder group labels
      folderKeys.forEach((folder, fi) => {
        const row = (fi + 0.5) / totalFolders;
        const y = 0.08 + row * 0.84;
        ctx.font = '10px monospace'; ctx.fillStyle = '#2d2d3d'; ctx.textAlign = 'left';
        ctx.fillText(folder, 12, y * h() - 18);
      });

      // Draw nodes
      allFiles.forEach(file => {
        const pos = positions.get(file.path);
        if (!pos) return;
        const nx = pos.x * w(), ny = pos.y * h();
        const hasImports = (file.imports || []).length > 0;
        const isImported = allFiles.some(f => f.imports?.includes(file.path));
        const r = 16;

        // Glow for files with connections
        if (hasImports || isImported) {
          const glow = ctx.createRadialGradient(nx, ny, r, nx, ny, r * 2.5);
          glow.addColorStop(0, 'rgba(124, 58, 237, 0.12)'); glow.addColorStop(1, 'rgba(124, 58, 237, 0)');
          ctx.beginPath(); ctx.arc(nx, ny, r * 2.5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        }

        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = hasImports && isImported ? '#7c3aed' : hasImports ? '#1e1e3a' : isImported ? '#1e1e3a' : '#15151e';
        ctx.fill();
        ctx.strokeStyle = hasImports ? '#06b6d4' : isImported ? '#7c3aed' : '#2d2d3d';
        ctx.lineWidth = 1.5; ctx.stroke();

        ctx.font = '10px monospace'; ctx.fillStyle = '#9ca3af'; ctx.textAlign = 'center';
        ctx.fillText(file.name.length > 18 ? file.name.substring(0, 15) + '...' : file.name, nx, ny + r + 14);
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    // Mouse drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
      panX = panStartX + dx;
      panY = panStartY + dy;
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

    // Click handling (only if not dragged)
    const handleClick = (e: MouseEvent) => {
      if (hasDragged) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      for (const file of allFiles) {
        const pos = positions.get(file.path);
        if (!pos) continue;
        // Convert world position to screen position
        const worldX = pos.x * w();
        const worldY = pos.y * h();
        const nodeScreenX = (worldX - w() / 2) * zoom + w() / 2 + panX;
        const nodeScreenY = (worldY - h() / 2) * zoom + h() / 2 + panY;
        const dist = Math.sqrt((screenX - nodeScreenX) ** 2 + (screenY - nodeScreenY) ** 2);
        if (dist < 20) {
          onSelectFile(file);
          return;
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
    };
  }, [allFiles, onSelectFile]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab" />;
}
