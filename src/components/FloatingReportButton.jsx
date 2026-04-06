// src/components/FloatingReportButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Send, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const FloatingReportButton = ({ isOpen, onOpen, onCancel, status, progress, onRetry }) => {
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
        return 'Envoi en cours...';
      case 'success':
        return 'Rapport envoyé !';
      case 'error':
        return 'Erreur d\'envoi';
      default:
        return 'Rapport prêt';
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#17203f]/10 flex items-center justify-center">
                    <Send size={16} className="text-[#17203f]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#17203f]">Envoyer le rapport</h2>
                </div>
                <button
                  onClick={onCancel}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                Choisissez la période et le destinataire
              </p>

              <div className="space-y-4">
                {/* Period selection (same as before) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Période</label>
                  <div className="flex gap-2 flex-wrap">
                    {['daily', 'weekly', 'monthly', 'custom'].map((p) => (
                      <button
                        key={p}
                        onClick={() => {}}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          false ? 'bg-[#17203f] text-white' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {p === 'daily' ? 'Quotidien' : p === 'weekly' ? 'Hebdomadaire' : p === 'monthly' ? 'Mensuel' : 'Perso'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom date range (conditional) */}
                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Email destinataire
                  </label>
                  <input
                    type="email"
                    placeholder="ex: manager@cevital.dz"
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#17203f]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 px-4 py-2 bg-[#17203f] text-white rounded-xl hover:bg-[#1e2a55] transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Envoyer
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