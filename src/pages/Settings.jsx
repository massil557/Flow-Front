import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Globe } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#17203f] dark:text-white">{t('settings.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#17203f]/10 dark:bg-slate-700 flex items-center justify-center">
              {theme === 'dark' ? <Moon size={20} className="text-[#17203f] dark:text-white" /> : <Sun size={20} className="text-[#17203f] dark:text-white" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17203f] dark:text-white">{t('settings.appearance')}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.appearance_desc')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-[#17203f] text-white border-[#17203f]'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-[#17203f]/50'
              }`}
            >
              <Sun size={16} />
              {t('settings.theme_light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-[#17203f] text-white border-[#17203f]'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-[#17203f]/50'
              }`}
            >
              <Moon size={16} />
              {t('settings.theme_dark')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#17203f]/10 dark:bg-slate-700 flex items-center justify-center">
              <Globe size={20} className="text-[#17203f] dark:text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17203f] dark:text-white">{t('settings.language')}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.language_desc')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                language === 'fr'
                  ? 'bg-[#17203f] text-white border-[#17203f]'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-[#17203f]/50'
              }`}
            >
              {t('settings.french')}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                language === 'en'
                  ? 'bg-[#17203f] text-white border-[#17203f]'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-[#17203f]/50'
              }`}
            >
              {t('settings.english')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
