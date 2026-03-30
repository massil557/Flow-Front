// src/components/PlantMap/ZoneUtils.js
import { Activity, Thermometer, Gauge, Droplets, Wind, Package, Truck, Zap } from 'lucide-react';

// Zone colors (modern, professional)
export const ZONE_COLORS = {
  'Stockage': { bg: '#fef9e3', border: '#d97706', text: '#92400e' },
  'Process':  { bg: '#eef2ff', border: '#4f46e5', text: '#3730a3' },
  'Logistique': { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
  'Énergie':  { bg: '#fff7ed', border: '#f97316', text: '#9a3412' },
  'default':  { bg: '#f1f5f9', border: '#64748b', text: '#334155' }
};

// Icons for zone types
export const getZoneIcon = (code, size = 16) => {
  const c = code?.toUpperCase() || '';
  if (c.includes('SILO')) return <Package size={size} className="text-amber-600" />;
  if (c.includes('RAFF')) return <Thermometer size={size} className="text-indigo-500" />;
  if (c.includes('THERM')) return <Zap size={size} className="text-orange-500" />;
  if (c.includes('PACK')) return <Truck size={size} className="text-emerald-600" />;
  if (c.includes('TK')) return <Droplets size={size} className="text-blue-500" />;
  return <Activity size={size} className="text-slate-400" />;
};

// Collision detection (ensures new zones don't overlap)
export const checkCollision = (rect1, rect2) => {
  return !(rect2.x >= rect1.x + rect1.w ||
           rect2.x + rect2.w <= rect1.x ||
           rect2.y >= rect1.y + rect1.h ||
           rect2.y + rect2.h <= rect1.y);
};

export const hasCollision = (newZone, zones, excludeId = null) => {
  return zones.some(zone => {
    if (excludeId !== null && zone.id === excludeId) return false;
    return checkCollision(newZone, zone);
  });
};

// Real coordinates based on the Djen Djen port plan (Cevital)
export const ZONE_POSITIONS = {
  'SILO-N':    { x: 80,   y: 120, w: 110, h: 100, type: 'Stockage' },
  'SILO-S':    { x: 80,   y: 240, w: 110, h: 100, type: 'Stockage' },
  'CONV-1':    { x: 210,  y: 190, w: 70,  h: 25,  type: 'Logistique' }, // conveyor gallery
  'RAFF-SUG':  { x: 320,  y: 80,  w: 140, h: 120, type: 'Process' },
  'RAFF-OIL':  { x: 320,  y: 220, w: 140, h: 120, type: 'Process' },
  'THERM':     { x: 500,  y: 150, w: 90,  h: 90,  type: 'Énergie' },
  'PACK-S':    { x: 620,  y: 70,  w: 120, h: 100, type: 'Logistique' },
  'PACK-H':    { x: 620,  y: 190, w: 120, h: 100, type: 'Logistique' },
  'TK-FARM':   { x: 180,  y: 380, w: 180, h: 60,  type: 'Stockage' }, // tank farm
};