import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

const PAGE_SIZE = 99;

export function usePaginatedAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(async (page) => {
    const res = await axios.get(`${origins}/api/alerts`, {
      params: { page, limit: PAGE_SIZE }
    });
    return res.data;
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPage(1);
        setAlerts(data.items);
        setTotal(data.total);
        setCurrentPage(1);
      } catch (e) {
        console.error('Failed to fetch alerts:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPage]);

  // Poll every 5s — refresh page 1 automatically, update total for other pages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchPage(1);
        setTotal(data.total);
        const page = currentPageRef.current;
        if (page === 1) {
          setAlerts(data.items);
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPage]);

  // Navigate to a specific page (replaces the alert list entirely)
  const goToPage = async (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setLoadingPage(true);
    try {
      const data = await fetchPage(page);
      setAlerts(data.items);
      setCurrentPage(page);
      setTotal(data.total);
    } catch (e) {
      console.error('Failed to fetch page:', e);
    } finally {
      setLoadingPage(false);
    }
  };

  const resolveAlert = async (id) => {
    await axios.patch(`${origins}/api/alerts/${id}/resolve`);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
  };

  const ignoreAlert = async (id) => {
    await axios.patch(`${origins}/api/alerts/${id}/ignore`);
    setAlerts(prev => prev.filter(a => a.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  };

  const deleteAlert = async (id) => {
    await axios.delete(`${origins}/api/alerts/${id}`);
    setAlerts(prev => prev.filter(a => a.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  };

  const displayCount = total > 99 ? '+99' : String(total);

  return {
    alerts,
    total,
    currentPage,
    totalPages,
    loading,
    loadingPage,
    hasOlder: currentPage < totalPages,
    hasNewer: currentPage > 1,
    goOlder: () => goToPage(currentPage + 1),
    goNewer: () => goToPage(currentPage - 1),
    resolveAlert,
    ignoreAlert,
    deleteAlert,
    displayCount,
  };
}
