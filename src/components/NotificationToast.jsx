// src/components/NotificationToast.jsx
import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Thermometer, Gauge, Droplets, Wind, X } from 'lucide-react';

const getSensorIcon = (code) => {
  const c = code.toUpperCase();
  if (c.includes('TEMP')) return <Thermometer size={18} className="text-orange-500" />;
  if (c.includes('PRES')) return <Gauge size={18} className="text-purple-500" />;
  if (c.includes('HUMI')) return <Droplets size={18} className="text-blue-500" />;
  if (c.includes('CO2')) return <Wind size={18} className="text-green-500" />;
  return <AlertTriangle size={18} className="text-amber-500" />;
};

export default function NotificationToast({ alert, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const SensorIcon = getSensorIcon(alert.code);

  return (
    <div
      className={`fixed top-20 right-4 z-50 w-96 transform transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Bell size={16} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Alerte</h4>
                <p className="text-[10px] text-slate-400 font-medium">Nouvelle alerte détectée</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsLeaving(true);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 300);
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
              {SensorIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-800">{alert.code}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                  {alert.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {alert.msg}
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 rounded-lg px-2 py-1">
                  <span className="text-xs font-bold text-amber-600">{alert.value}</span>
                  <span className="text-[10px] text-amber-500 ml-0.5">/ {alert.seuil}</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                  Seuil dépassé
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                window.location.href = '/mainlayout/alerts';
                onClose();
              }}
              className="flex-1 text-center text-xs font-semibold text-[#17203f] hover:bg-[#17203f] hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              Voir les alertes
            </button>
            <button
              onClick={() => {
                setIsLeaving(true);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 300);
              }}
              className="flex-1 text-center text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
            >
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}