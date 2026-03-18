export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', ...props }) {
  const base = 'font-bold rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl',
  };
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-lg shadow-amber-900/30',
    secondary: 'bg-stone-700 hover:bg-stone-600 text-stone-100 border border-stone-600',
    ghost: 'bg-transparent hover:bg-stone-800 text-stone-300 border border-stone-700',
    danger: 'bg-red-700 hover:bg-red-600 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    myth: 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
