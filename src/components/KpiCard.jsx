// src/components/KpiCard.jsx
import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const KpiCard = ({ 
  title, 
  value, 
  unit, 
  trendData, 
  trendValue, 
  isOverThreshold, 
  onClick,
  isLoading 
}) => {
  const { t } = useTranslation();
  const trendColor = trendValue > 0 ? 'text-emerald-600' : trendValue < 0 ? 'text-red-500' : 'text-slate-400';
  const TrendIcon = trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : null;

  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
        isOverThreshold ? 'border-red-200 bg-red-50/30' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tabular-nums ${isOverThreshold ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
              {value}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{unit}</span>
          </div>
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-0.5 rounded-full bg-slate-50 dark:bg-[#334155] px-1.5 py-0.5 text-xs font-medium ${trendColor}`}>
            {TrendIcon && <TrendIcon size={12} />}
            <span>{Math.abs(trendValue).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Sparkline Chart Area */}
      <div className="mt-3 h-12 w-full">
        {trendData && <SparklineChart data={trendData} color={isOverThreshold ? '#ef4444' : '#3b82f6'} />}
      </div>

      {isOverThreshold && (
        <div className="absolute -top-1 -right-1">
          <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {t('kpi.alert')}
          </span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;