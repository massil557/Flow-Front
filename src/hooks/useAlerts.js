import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [newAlert, setNewAlert] = useState(null); // for notifications

  useEffect(() => {
    let lastIds = new Set();

    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${origins}/api/alerts`);
        const data = res.data;
        setAlerts(data);
        const active = data.filter(a => !a.is_resolved);
        setActiveCount(active.length);

        // Check for new unresolved alerts (compared to previous fetch)
        const currentIds = new Set(active.map(a => a.id));
        const newAlerts = active.filter(a => !lastIds.has(a.id));
        if (newAlerts.length > 0) {
          // Trigger browser notification for the most recent one (or all)
          const latest = newAlerts[0];
          setNewAlert(latest);
        }
        lastIds = currentIds;
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return { activeCount, newAlert };
}