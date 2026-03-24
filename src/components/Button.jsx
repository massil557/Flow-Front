// src/components/Button.jsx
// Shared button component — sidebar color (#17203f), Poppins font
// Usage:
//   <Button>Label</Button>
//   <Button variant="outline">Label</Button>
//   <Button variant="danger">Label</Button>
//   <Button variant="ghost">Label</Button>
//   <Button size="sm">Label</Button>
//   <Button loading>Label</Button>
//   <Button icon={<PlusIcon />}>Label</Button>
//   <Button disabled>Label</Button>

import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: [
    'bg-[#17203f] text-white',
    'hover:bg-[#1e2a55] active:bg-[#111830]',
    'border border-[#17203f]',
    'shadow-sm hover:shadow-md',
    'disabled:bg-[#17203f]/40 disabled:border-[#17203f]/40',
  ].join(' '),

  outline: [
    'bg-transparent text-[#17203f]',
    'hover:bg-[#17203f] hover:text-white active:bg-[#111830]',
    'border-2 border-[#17203f]',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700 active:bg-red-800',
    'border border-red-600',
    'shadow-sm hover:shadow-md',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent text-slate-600',
    'hover:bg-slate-100 active:bg-slate-200',
    'border border-slate-200',
    'disabled:opacity-40',
  ].join(' '),

  success: [
    'bg-emerald-600 text-white',
    'hover:bg-emerald-700 active:bg-emerald-800',
    'border border-emerald-600',
    'shadow-sm hover:shadow-md',
    'disabled:opacity-40',
  ].join(' '),
};

const SIZES = {
  xs:  'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  sm:  'px-4 py-2 text-sm gap-2 rounded-xl',
  md:  'px-6 py-2.5 text-sm gap-2 rounded-xl',
  lg:  'px-8 py-3 text-base gap-2.5 rounded-2xl',
  xl:  'px-10 py-4 text-base gap-3 rounded-2xl',
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  icon     = null,
  iconRight = null,
  loading  = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type     = 'button',
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        // base
        'inline-flex items-center justify-center',
        'font-semibold font-[Poppins]',
        'transition-all duration-200',
        'cursor-pointer select-none',
        'disabled:cursor-not-allowed',
        // variant + size
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size]       || SIZES.md,
        // width
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
