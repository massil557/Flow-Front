// src/components/FloatingReportButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Send, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FloatingReportButton = ({ isOpen, onOpen, onCancel, status, progress, onRetry }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState({ y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('floatingReportPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ y: e.clientY - position.y });
    dragRef.current = { startY: e.clientY, startPosY: position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newY = e.clientY - dragStart.y;
    const maxY = window.innerHeight - 100;
    const clampedY = Math.max(20, Math.min(newY, maxY));
    setPosition({ y: clampedY });
    localStorage.setItem('floatingReportPosition', JSON.stringify({ y: clampedY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Loader2 size={18} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={18} className="text-emerald-500" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return <FileText size={18} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'bg-blue-500';
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-[#17203f]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return t('floating_report.sending');
      case 'success':
        return t('floating_report.sent');
      case 'error':
        return t('floating_report.error');
      default:
        return t('floating_report.ready');
    }
  };

  return (
    <>
      {/* Floating draggable button */}
      <div
        className="fixed right-0 z-50 cursor-grab active:cursor-grabbing"
        style={{ top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="relative">
          {/* Main button */}
          <button
            onClick={onOpen}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-l-xl shadow-lg transition-all duration-200
              ${getStatusColor()} text-white hover:opacity-90
            `}
          >
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </button>

          {/* Progress bar for sending */}
          {status === 'sending' && progress > 0 && (
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full transition-all duration-300"
                 style={{ width: `${progress}%` }} />
          )}
        </div>
      </div>

      {/* Modal for report options (replaces the old modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#17203f]/10 dark:bg-white/10 flex items-center justify-center">
                    <Send size={16} className="text-[#17203f] dark:text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#17203f] dark:text-white">{t('floating_report.send_report')}</h2>
                </div>
                <button
                  onClick={onCancel}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {t('floating_report.choose_period_recipient')}
              </p>

              <div className="space-y-4">
                {/* Period selection (same as before) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('floating_report.period')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {['daily', 'weekly', 'monthly', 'custom'].map((p) => (
                      <button
                        key={p}
                        onClick={() => {}}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          false ? 'bg-[#17203f] text-white' : 'bg-white dark:bg-[#334155] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p === 'daily' ? t('floating_report.daily') : p === 'weekly' ? t('floating_report.weekly') : p === 'monthly' ? t('floating_report.monthly') : t('floating_report.custom')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom date range (conditional) */}
                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('floating_report.recipient_email')}
                  </label>
                  <input
                    type="email"
                    placeholder={t('floating_report.email_placeholder')}
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] text-sm outline-none focus:border-[#17203f] dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('floating_report.cancel')}
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 px-4 py-2 bg-[#17203f] text-white rounded-xl hover:bg-[#1e2a55] transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {t('floating_report.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingReportButton;