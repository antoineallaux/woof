import { useEffect } from 'react'
import { useStore } from '../store'

export function Toast() {
  const erreur = useStore((s) => s.erreur)
  const setErreur = useStore((s) => s.setErreur)
  useEffect(() => {
    if (!erreur) return
    const t = setTimeout(() => setErreur(null), 3500)
    return () => clearTimeout(t)
  }, [erreur, setErreur])
  if (!erreur) return null
  return (
    <div role="alert" className="absolute left-1/2 -translate-x-1/2 top-3 max-w-md rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold px-4 py-2.5 shadow-md">
      {erreur}
    </div>
  )
}
