import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [newAlert, setNewAlert] = useState(null);

  useEffect(() => {
    let lastIds = new Set();

    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${origins}/api/alerts`, {
          params: { page: 1, limit: 99 }
        });
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setAlerts(items);
        const active = items.filter(a => !a.is_resolved);
        const total = res.data?.total ?? 0;
        setActiveCount(
          total > 99 ? Math.max(active.length, 100) : active.length
        );

        const currentIds = new Set(active.map(a => a.id));
        const newAlerts = active.filter(a => !lastIds.has(a.id));
        if (newAlerts.length > 0) {
          const latest = newAlerts[0];
          setNewAlert(latest);
        }
        lastIds = currentIds;
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return { activeCount, newAlert };
}