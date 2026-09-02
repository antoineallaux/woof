import { useStore } from '../store'
import { Equipement } from './Equipement'

export function Equipements() {
  const equipements = useStore((s) => s.config.equipements)
  return <>{equipements.map((e) => <Equipement key={e.uid} eq={e} />)}</>
}
