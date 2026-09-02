import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:bg-surface',
}
const SIZES: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm' }

export function Bouton({ variant = 'primary', size = 'md', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type="button" {...props}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-11 ${VARIANTS[variant]} ${SIZES[size]} ${className}`} />
  )
}
