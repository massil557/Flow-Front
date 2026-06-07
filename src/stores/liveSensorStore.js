import { useSyncExternalStore, useCallback } from 'react';
import axios from 'axios';

// ── External store (lives outside React, no re-renders until value changes) ─
let values = {};
let errors = null;
const sensorListeners = new Map();
let errorListeners = new Set();
let pollingStarted = false;
let pollingTimer = null;

function subscribeSensor(sensorId, callback) {
  if (!sensorListeners.has(sensorId)) {
    sensorListeners.set(sensorId, new Set());
  }
  sensorListeners.get(sensorId).add(callback);
  return () => {
    const fns = sensorListeners.get(sensorId);
    if (fns) {
      fns.delete(callback);
      if (fns.size === 0) sensorListeners.delete(sensorId);
    }
  };
}

function getSensorSnapshot(sensorId) {
  const v = values[sensorId];
  return v !== undefined ? v : null;
}

function subscribeErrors(callback) {
  errorListeners.add(callback);
  return () => errorListeners.delete(callback);
}

function getErrorSnapshot() {
  return errors;
}

// ── Public hooks ──────────────────────────────────────────────────────────
export function useLiveSensorNumber(sensorId) {
  const subscribe = useCallback(
    (cb) => subscribeSensor(sensorId, cb),
    [sensorId]
  );
  const getSnapshot = useCallback(
    () => getSensorSnapshot(sensorId),
    [sensorId]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useLiveSensorError() {
  return useSyncExternalStore(subscribeErrors, getErrorSnapshot, getErrorSnapshot);
}

// ── Single shared polling interval ────────────────────────────────────────
export function startLivePolling(pollInterval = 2000) {
  if (pollingStarted) return;
  pollingStarted = true;

  async function fetchLive() {
    try {
      const res = await axios.get('/api/live-stream');
      const data = res.data;
      if (!data) return;

      const newValues = { ...values };
      const changed = new Set();

      Object.entries(data).forEach(([code, points]) => {
        if (!Array.isArray(points) || points.length === 0) return;
        const next = points[points.length - 1]?.v;
        if (next !== undefined && newValues[code] !== next) {
          newValues[code] = next;
          changed.add(code);
        }
      });

      if (changed.size > 0) {
        values = newValues;
        changed.forEach((code) => {
          sensorListeners.get(code)?.forEach((fn) => fn());
        });
      }

      if (errors !== null) {
        errors = null;
        errorListeners.forEach((fn) => fn());
      }
    } catch (err) {
      if (!errors) {
        errors = err;
        errorListeners.forEach((fn) => fn());
      }
    }
  }

  fetchLive();
  pollingTimer = setInterval(fetchLive, pollInterval);
}

// Hot-module reload cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (pollingTimer) clearInterval(pollingTimer);
    pollingStarted = false;
  });
}
