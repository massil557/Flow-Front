// src/components/NotificationToast.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Thermometer, Gauge, Droplets, Wind, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getSensorIcon = (code) => {
  const c = code.toUpperCase();
  if (c.includes('TEMP')) return <Thermometer size={18} className="text-orange-500" />;
  if (c.includes('PRES')) return <Gauge       size={18} className="text-purple-500" />;
  if (c.includes('HUMI')) return <Droplets    size={18} className="text-blue-500"   />;
  if (c.includes('CO2'))  return <Wind        size={18} className="text-green-500"  />;
  return <AlertTriangle size={18} className="text-amber-500" />;
};

export default function NotificationToast({ alert, onClose }) {
  const { t } = useTranslation();
  const navigate    = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => { setIsVisible(false); onClose(); }, 300);
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => { setIsVisible(false); onClose(); }, 300);
  };

  const handleViewAlerts = () => {
    navigate('/mainlayout/alerts');
    onClose();
  };

  const SensorIcon = getSensorIcon(alert.code);

  return (
    <div
      className={`fixed top-20 right-4 z-50 w-96 transform transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Bell size={16} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('notification.title')}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('notification.subtitle')}</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#334155] flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
              {SensorIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-800 dark:text-white">{alert.code}</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  {alert.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">{alert.msg}</p>
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-2 py-1">
                  <span className="text-xs font-bold text-amber-600">{alert.value}</span>
                  <span className="text-[10px] text-amber-500 ml-0.5">/ {alert.seuil}</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                  {t('notification.threshold_exceeded')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleViewAlerts}
              className="flex-1 text-center text-xs font-semibold text-[#17203f] dark:text-white hover:bg-[#17203f] hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              {t('notification.view_alerts')}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {t('notification.ignore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
