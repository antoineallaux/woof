import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  repli: ReactNode
  children: ReactNode
}
interface State {
  casse: boolean
}

/** Garde-fou de rendu : isole une branche qui casse (GLB absent, WebGL indisponible) derrière un repli. */
export class Limite extends Component<Props, State> {
  state: State = { casse: false }

  static getDerivedStateFromError(): State {
    return { casse: true }
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    console.warn('Configurateur : rendu interrompu, repli affiché.', erreur, info.componentStack)
  }

  render() {
    return this.state.casse ? this.props.repli : this.props.children
  }
}
