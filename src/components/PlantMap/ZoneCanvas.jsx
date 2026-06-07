// src/components/PlantMap/ZoneCanvas.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ZONE_COLORS, ZONE_POSITIONS } from './ZoneUtils';

// Helper: draw a silo (tall cylinder with dome)
const drawSilo = (ctx, x, y, w, h, color, borderColor) => {
  const radius = w * 0.4;
  const centerX = x + w / 2;
  const topY = y + 8;
  const bodyY = y + 16;
  const bodyH = h - 24;

  // Cylinder body
  ctx.fillStyle = color;
  ctx.fillRect(centerX - radius, bodyY, radius * 2, bodyH);
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(centerX - radius, bodyY, radius * 2, bodyH);

  // Dome top
  ctx.beginPath();
  ctx.ellipse(centerX, topY, radius, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Vertical ribs
  ctx.beginPath();
  for (let i = -2; i <= 2; i++) {
    const ribX = centerX + i * radius * 0.6;
    if (ribX > x + 5 && ribX < x + w - 5) {
      ctx.moveTo(ribX, bodyY);
      ctx.lineTo(ribX, bodyY + bodyH);
      ctx.stroke();
    }
  }
};

// Helper: draw a warehouse (rectangular with roof and doors)
const drawWarehouse = (ctx, x, y, w, h, color, borderColor, isDark) => {
  // Main body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(x, y, w, h);

  // Roof (darker top)
  ctx.fillStyle = borderColor;
  ctx.fillRect(x, y, w, 8);
  // Loading doors (large rectangles)
  ctx.fillStyle = isDark ? '#1a1a2e' : '#2d2d2d';
  const doorWidth = Math.min(40, w * 0.3);
  const doorX = x + (w / 2) - (doorWidth / 2);
  ctx.fillRect(doorX, y + h - 25, doorWidth, 25);
  // Dock ramp
  ctx.fillStyle = isDark ? '#3a3a4a' : '#78716c';
  ctx.fillRect(doorX - 5, y + h - 5, doorWidth + 10, 5);
};

// Helper: draw refinery/process building (complex shape)
const drawProcessBuilding = (ctx, x, y, w, h, color, borderColor, isDark) => {
  // Main building
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(x, y, w, h);

  // Chimney (tall pipe)
  ctx.fillStyle = isDark ? '#3a3a5a' : '#475569';
  ctx.fillRect(x + w - 20, y - 15, 8, 30);
  ctx.fillRect(x + w - 18, y - 8, 4, 20);

  // Pipes on roof
  ctx.fillStyle = borderColor;
  ctx.fillRect(x + 15, y + 5, 12, 8);
  ctx.fillRect(x + 35, y + 5, 12, 8);

  // Windows — use amber in both modes, slightly dimmer in dark
  ctx.fillStyle = isDark ? '#d4a000' : '#fbbf24';
  const winW = 10, winH = 10;
  ctx.fillRect(x + w * 0.2, y + h * 0.4, winW, winH);
  ctx.fillRect(x + w * 0.5, y + h * 0.4, winW, winH);
  ctx.fillRect(x + w * 0.8 - winW, y + h * 0.4, winW, winH);
};

// Helper: draw energy building (cooling towers)
const drawEnergyBuilding = (ctx, x, y, w, h, color, borderColor, isDark) => {
  // Main building
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(x, y, w, h);

  // Two cooling towers (rounded tops)
  const towerW = 22;
  const towerH = 28;
  const towerX1 = x + w * 0.25 - towerW/2;
  const towerX2 = x + w * 0.75 - towerW/2;
  const towerY = y + 5;

  ctx.fillStyle = isDark ? '#4a4a6a' : '#9ca3af';
  ctx.fillRect(towerX1, towerY, towerW, towerH);
  ctx.fillRect(towerX2, towerY, towerW, towerH);
  ctx.fillStyle = isDark ? '#3a3a5a' : '#6b7280';
  ctx.beginPath();
  ctx.ellipse(towerX1 + towerW/2, towerY, towerW/2, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(towerX2 + towerW/2, towerY, towerW/2, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steam vents
  ctx.fillStyle = isDark ? '#a08000' : '#facc15';
  ctx.fillRect(towerX1 + towerW/2 - 2, towerY - 4, 4, 8);
  ctx.fillRect(towerX2 + towerW/2 - 2, towerY - 4, 4, 8);
};

// Main drawing function – selects the right shape based on zone type
const drawZoneBuilding = (ctx, zone, hasAlerts, isSelected, isHovered, alertCount, isDark) => {
  const type = zone.type;
  const colors = ZONE_COLORS[type] || ZONE_COLORS.default;
  let fillColor = isDark ? '#2a3a4a' : colors.bg;
  let borderColor = isDark ? '#4a5a6a' : colors.border;

  if (hasAlerts) {
    borderColor = '#f59e0b';
    fillColor = isDark ? '#2a2a1a' : '#fffbeb';
  }
  if (isSelected) {
    borderColor = '#60a5fa';
    fillColor = isDark ? '#1a2a4a' : '#eff6ff';
  }
  if (isHovered && !isSelected) {
    borderColor = isDark ? '#7a9aba' : '#94a3b8';
    fillColor = isDark ? '#3a4a5a' : '#f8fafc';
  }

  // Draw specific building shape
  if (type === 'Stockage') {
    drawSilo(ctx, zone.x, zone.y, zone.w, zone.h, fillColor, borderColor);
  } else if (type === 'Process') {
    drawProcessBuilding(ctx, zone.x, zone.y, zone.w, zone.h, fillColor, borderColor, isDark);
  } else if (type === 'Logistique') {
    drawWarehouse(ctx, zone.x, zone.y, zone.w, zone.h, fillColor, borderColor, isDark);
  } else if (type === 'Énergie') {
    drawEnergyBuilding(ctx, zone.x, zone.y, zone.w, zone.h, fillColor, borderColor, isDark);
  } else {
    // fallback rectangle
    ctx.fillStyle = fillColor;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
  }

  // Alert indicator (small dot with count)
  if (hasAlerts && alertCount > 0) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(zone.x + zone.w - 12, zone.y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(alertCount.toString(), zone.x + zone.w - 15, zone.y + 16);
  }
};

// Draw minimal grid
const drawMinimalGrid = (ctx, width, height, zoom, offset, isDark) => {
  const gridSize = 50;
  ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
  ctx.lineWidth = 0.5 / zoom;

  for (let x = offset.x % gridSize; x < width / zoom; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height / zoom);
    ctx.stroke();
  }

  for (let y = offset.y % gridSize; y < height / zoom; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width / zoom, y);
    ctx.stroke();
  }
};

// Canvas component
const ZoneCanvas = forwardRef(({
  zones,
  zoneStats,
  selectedZone,
  hoveredZone,
  drawRect,
  mode,
  viewOffset,
  zoom,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClick
}, ref) => {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current
  }));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoom, zoom);

    // Light / dark background
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);

    drawMinimalGrid(ctx, canvas.width, canvas.height, zoom, viewOffset, isDark);

    // Draw zones (using fixed positions)
    const isDark = document.documentElement.classList.contains('dark');
    zones.forEach(zone => {
      const stats = zoneStats[zone.id];
      const isSelected = selectedZone?.id === zone.id;
      const isHovered = hoveredZone?.id === zone.id;
      const hasAlerts = stats?.active_alerts > 0;
      const alertCount = stats?.active_alerts || 0;

      drawZoneBuilding(ctx, zone, hasAlerts, isSelected, isHovered, alertCount, isDark);

      // Zone name label
      ctx.font = `500 ${13 / zoom}px "Inter", system-ui, sans-serif`;
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.shadowColor = 'transparent';
      ctx.fillText(zone.nom_zone, zone.x + 12, zone.y + 28);

      // Sensor count
      if (stats?.sensor_count > 0) {
        ctx.font = `${11 / zoom}px monospace`;
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.fillText(`${stats.sensor_count} sensors`, zone.x + 12, zone.y + zone.h - 12);
      }
    });

    // Draw rectangle being created (if in add mode)
    if (drawRect && mode === 'add') {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  useEffect(() => {
    draw();
  }, [zones, zoneStats, selectedZone, hoveredZone, drawRect, mode, viewOffset, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair bg-slate-50 dark:bg-[#0f172a]"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onClick}
    />
  );
});

ZoneCanvas.displayName = 'ZoneCanvas';

export default ZoneCanvas;