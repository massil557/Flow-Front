// src/pages/PlantMap.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { origins } from './Managment';
import { Activity, AlertTriangle, Thermometer, Gauge, Droplets, Wind, Package, Truck, Zap } from 'lucide-react';
import { ZONE_POSITIONS } from '../components/PlantMap/ZoneUtils';

const getZoneIcon = (code) => {
  const c = code?.toUpperCase() || '';
  if (c.includes('SILO')) return <Package size={20} className="text-amber-600" />;
  if (c.includes('RAFF')) return <Thermometer size={20} className="text-indigo-500" />;
  if (c.includes('THERM')) return <Zap size={20} className="text-orange-500" />;
  if (c.includes('PACK')) return <Truck size={20} className="text-emerald-600" />;
  if (c.includes('TK')) return <Droplets size={20} className="text-blue-500" />;
  return <Activity size={20} className="text-slate-400" />;
};

const PlantMap = () => {
  const [zones, setZones] = useState([]);
  const [zoneStats, setZoneStats] = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const svgContainerRef = useRef(null);

  useEffect(() => {
    const fetchZonesAndStats = async () => {
      try {
        const zonesRes = await axios.get(`${origins}/api/zones`);
        let zonesData = zonesRes.data.map(zone => {
          const pos = ZONE_POSITIONS[zone.code_zone];
          return {
            ...zone,
            x: pos?.x ?? zone.x,
            y: pos?.y ?? zone.y,
            w: pos?.w ?? zone.w,
            h: pos?.h ?? zone.h,
            type: pos?.type ?? zone.type,
          };
        });
        setZones(zonesData);

        const statsPromises = zonesData.map(zone =>
          axios.get(`${origins}/api/zones/${zone.id}/stats`).catch(() => ({ data: null }))
        );
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        zonesData.forEach((zone, idx) => {
          if (statsResults[idx].data) {
            statsMap[zone.id] = statsResults[idx].data;
          }
        });
        setZoneStats(statsMap);
      } catch (err) {
        console.error('Erreur chargement zones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchZonesAndStats();
  }, []);

  const goToZone = (zone) => {
    navigate('/mainlayout/zone', {
      state: { id: zone.id, name: zone.nom_zone, code_zone: zone.code_zone },
    });
  };

  // Hardcoded SVG coordinates (original)
  const zonesLocations = {
    'SILO-N': { x: 440, y: 280, w: 90, h: 110 },
    'SILO-S': { x: 440, y: 400, w: 90, h: 110 },
    'CONV-1': { x: 410, y: 390, w: 30, h: 10 },
    'RAFF-SUG': { x: 580, y: 320, w: 100, h: 140 },
    'RAFF-OIL': { x: 580, y: 470, w: 100, h: 120 },
    'THERM': { x: 690, y: 350, w: 60, h: 80 },
    'PACK-S': { x: 700, y: 550, w: 120, h: 90 },
    'PACK-H': { x: 700, y: 650, w: 120, h: 90 },
    'TK-FARM': { x: 550, y: 180, w: 140, h: 80 },
  };

  const zonesWithDetails = zones.map(zone => {
    const coords = zonesLocations[zone.code_zone] || { x: 0, y: 0, w: 50, h: 50 };
    const stats = zoneStats[zone.id];
    return { ...zone, ...coords, stats };
  });

  // When a zone is hovered, compute its screen position and anchor panel near it
  const handleZoneHover = (zoneId, event) => {
    const zone = zonesWithDetails.find(z => z.id === zoneId);
    if (!zone) return;

    // Get the SVG element and the rectangle of the zone in screen coordinates
    const svgElement = svgContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    // We need to find the actual <rect> element for this zone
    // Since we're using React and SVG groups, we can use the event target to find the rect.
    // Simpler: use the event's coordinates relative to the SVG container? 
    // Better: get the bounding client rect of the zone rectangle via its coordinates.
    // We have zone.x, zone.y, zone.w, zone.h in SVG units (0-1000).
    // We need to convert SVG coordinates to screen coordinates.
    // We can get the SVG's viewBox and actual size.
    const svgRect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;

    const zoneScreenX = svgRect.left + zone.x * scaleX;
    const zoneScreenY = svgRect.top + zone.y * scaleY;
    const zoneScreenW = zone.w * scaleX;
    const zoneScreenH = zone.h * scaleY;

    // Determine where to place the panel (prefer right side, but avoid overflow)
    const panelWidth = 320; // approximate
    const panelHeight = 280;
    let left = zoneScreenX + zoneScreenW + 10;
    let top = zoneScreenY;

    // Adjust if off-screen
    if (left + panelWidth > window.innerWidth) {
      left = zoneScreenX - panelWidth - 10;
    }
    if (top + panelHeight > window.innerHeight) {
      top = window.innerHeight - panelHeight - 10;
    }
    if (top < 10) top = 10;

    setPanelPosition({ x: left, y: top });
    setActiveZone(zoneId);
  };

  const handleZoneLeave = () => {
    setActiveZone(null);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#17203f]">Carte des zones industrielles</h1>
            <p className="text-slate-500 text-sm mt-0.5">Survolez une zone pour voir ses indicateurs</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl px-4 py-2 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400">Zones actives</span>
              <p className="text-xl font-bold text-[#17203f]">{zones.length}</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400">Capteurs totaux</span>
              <p className="text-xl font-bold text-[#17203f]">
                {Object.values(zoneStats).reduce((sum, s) => sum + (s?.sensor_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* SVG Map – scrollable container */}
        <div
          ref={svgContainerRef}
          className="relative w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-auto"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          <svg viewBox="0 0 1000 800" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Background - original */}
            <g id="geographic-background">
              <rect x="0" y="0" width="400" height="800" fill="#f0f9ff" />
              <path d="M400 0 L1000 0 L1000 200 L750 200 L400 300 Z" fill="#f0f9ff" />
              <path d="M400 800 L400 300 L750 200 L1000 200" fill="none" stroke="#cbd5e1" strokeWidth="4" />
              <rect x="0" y="320" width="380" height="40" fill="#e2e8f0" stroke="#94a3b8" />
              <path d="M850 800 L850 300 L750 200" fill="none" stroke="#f1f5f9" strokeWidth="30" strokeLinecap="square" />
              <path d="M400 700 L900 700" fill="none" stroke="#f1f5f9" strokeWidth="20" />
            </g>

            {/* Zones interactives */}
            <g id="cevital-zones">
              {zonesWithDetails.map((zone) => {
                const isActive = activeZone === zone.id;
                const hasAlerts = zone.stats?.active_alerts > 0;
                return (
                  <g
                    key={zone.id}
                    onMouseEnter={(e) => handleZoneHover(zone.id, e)}
                    onMouseLeave={handleZoneLeave}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => goToZone(zone)}
                  >
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.w}
                      height={zone.h}
                      fill={isActive ? "#f8fafc" : "#ffffff"}
                      stroke={hasAlerts ? "#f59e0b" : isActive ? "#3b82f6" : "#e2e8f0"}
                      strokeWidth={hasAlerts ? 2.5 : isActive ? 2 : 1.5}
                      rx="4"
                      className="transition-all duration-200"
                    />
                    {hasAlerts && (
                      <circle
                        cx={zone.x + zone.w - 8}
                        cy={zone.y + 8}
                        r="4"
                        fill="#f59e0b"
                        className="animate-pulse"
                      />
                    )}
                    <text x={zone.x + 5} y={zone.y + 18} className="text-[9px] font-mono fill-slate-400">
                      {zone.code_zone}
                    </text>
                    {isActive && (
                      <text
                        x={zone.x + zone.w / 2}
                        y={zone.y + zone.h / 2}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-700 pointer-events-none"
                      >
                        {zone.nom_zone}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Floating info panel anchored near the hovered zone */}
        {activeZone && (
          <div
            className="fixed z-50 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ left: panelPosition.x, top: panelPosition.y }}
          >
            {(() => {
              const zone = zonesWithDetails.find(z => z.id === activeZone);
              const stats = zone?.stats;
              return (
                <div>
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#17203f]/10 flex items-center justify-center">
                          {getZoneIcon(zone?.code_zone)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{zone?.nom_zone}</h3>
                          <p className="text-[10px] font-mono text-slate-400">{zone?.code_zone}</p>
                        </div>
                      </div>
                      {stats?.active_alerts > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200">
                          <AlertTriangle size={12} className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-600">{stats.active_alerts} alerte(s)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">Capteurs</p>
                        <p className="text-xl font-bold text-[#17203f]">{stats?.sensor_count || 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">Alertes actives</p>
                        <p className={`text-xl font-bold ${stats?.active_alerts > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                          {stats?.active_alerts || 0}
                        </p>
                      </div>
                    </div>

                    {stats?.sensors && stats.sensors.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Capteurs</p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {stats.sensors.slice(0, 6).map(s => (
                            <span key={s.code} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                              {s.code}
                            </span>
                          ))}
                          {stats.sensors.length > 6 && (
                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-500">
                              +{stats.sensors.length - 6}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => goToZone(zone)}
                      className="w-full text-center text-xs font-semibold text-[#17203f] hover:text-white hover:bg-[#17203f] px-3 py-2 rounded-lg transition-all"
                    >
                      Voir les détails de la zone →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div>
            <span className="text-xs text-slate-500">Zone standard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-amber-500 rounded"></div>
            <span className="text-xs text-slate-500">Zone avec alertes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-xs text-slate-500">Zone survolée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantMap;