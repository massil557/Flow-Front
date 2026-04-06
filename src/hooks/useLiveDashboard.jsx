// src/hooks/useLiveDashboard.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

export function useLiveDashboard(activeCategory, zoneFilter, mode, quickHours, appliedRange) {
  const [sensorsMeta, setSensorsMeta] = useState([]);
  const [zones, setZones] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Fetch sensors and zones only once
      if (sensorsMeta.length === 0) {
        const [sres, zres] = await Promise.all([
          axios.get(`${origins}/api/sensors`, { signal: controller.signal }),
          axios.get(`${origins}/api/zones`, { signal: controller.signal }),
        ]);
        setSensorsMeta(sres.data);
        setZones(zres.data);
      }

      // Determine which sensors to query
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      const filteredSensors = sensorsMeta.length
        ? sensorsMeta.filter(s =>
            (s.type_grandeur === cat.type || s.code_unique.startsWith(activeCategory)) &&
            (!zoneFilter || s.zone_id === zoneFilter)
          )
        : [];

      if (filteredSensors.length === 0) {
        setHistoryData({});
        setLoading(false);
        return;
      }

      // Fetch history for each sensor
      const data = {};
      await Promise.all(filteredSensors.map(async (s) => {
        try {
          let url;
          if (mode === 'custom' && appliedRange?.start && appliedRange?.end) {
            url = `${origins}/api/history/${s.id}?start=${encodeURIComponent(appliedRange.start)}&end=${encodeURIComponent(appliedRange.end)}`;
          } else {
            url = `${origins}/api/history/${s.id}?hours=${quickHours}`;
          }
          const res = await axios.get(url, { signal: controller.signal });
          data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur }));
        } catch (err) {
          if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
            console.error(`Failed to fetch sensor ${s.code_unique}:`, err);
          }
        }
      }));
      setHistoryData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [activeCategory, zoneFilter, mode, quickHours, appliedRange, sensorsMeta.length]);

  // Initial fetch and polling
  useEffect(() => {
    fetchAllData();
    // Poll every 5 seconds only in quick mode (real‑time)
    if (mode === 'quick') {
      intervalRef.current = setInterval(fetchAllData, 300000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchAllData, mode]);

  return { sensorsMeta, zones, historyData, loading, lastUpdate, error, refetch: fetchAllData };
}