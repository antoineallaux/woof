export interface ItemPanier { slug: string; name: string; ref: string; image: string; qty: number }
export function lire(): ItemPanier[]
export function ajouter(item: Omit<ItemPanier, 'qty'>): void
export function changerQty(slug: string, qty: number | string): void
export function retirer(slug: string): void
export function vider(): void
