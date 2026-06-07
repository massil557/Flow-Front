export default function EmailSilenceToggle({ silenced, loading, onToggle, label }) {
  const disabled = loading;

  const clickHandler = disabled ? undefined : onToggle;

  const keyHandler = disabled
    ? undefined
    : (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      };

  return (
    <div className={`flex items-center gap-3 shrink-0 ${disabled ? 'opacity-50' : ''}`}>
      <div
        role="switch"
        aria-checked={silenced}
        tabIndex={disabled ? -1 : 0}
        onClick={clickHandler}
        onKeyDown={keyHandler}
        className={`
          relative inline-block w-11 h-6 rounded-full shrink-0
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${silenced ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-600'}
        `}
      >
        <div
          className={`
            absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md
            transition-transform duration-200
            ${silenced ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
      <span
        onClick={clickHandler}
        className={`
          select-none text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap leading-none
          ${disabled ? '' : 'cursor-pointer'}
        `}
      >
        {label}
      </span>
    </div>
  );
}
