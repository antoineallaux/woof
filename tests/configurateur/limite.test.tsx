// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Limite } from '../../src/configurateur/ui/Limite'

function Casse(): never {
  throw new Error('modèle introuvable')
}

function rendre(noeud: React.ReactNode): HTMLDivElement {
  const hote = document.createElement('div')
  document.body.appendChild(hote)
  const root = createRoot(hote)
  act(() => root.render(noeud))
  return hote
}

afterEach(() => { document.body.innerHTML = '' })

describe('Limite', () => {
  it('affiche le repli quand un enfant lève', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const erreur = vi.spyOn(console, 'error').mockImplementation(() => {})
    const hote = rendre(<Limite repli={<p>repli</p>}><Casse /></Limite>)
    expect(hote.textContent).toBe('repli')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    erreur.mockRestore()
  })

  it('laisse passer un enfant sain', () => {
    const hote = rendre(<Limite repli={<p>repli</p>}><p>contenu</p></Limite>)
    expect(hote.textContent).toBe('contenu')
  })
})
