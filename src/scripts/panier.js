// Panier de demande de devis — stocké en localStorage, sans backend
const KEY = 'woof-devis-panier';

export function lire() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function ecrire(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('panier:change'));
}

export function ajouter({ slug, name, ref, image }) {
  const items = lire();
  const existant = items.find((i) => i.slug === slug);
  if (existant) existant.qty = Math.min(99, existant.qty + 1);
  else items.push({ slug, name, ref, image, qty: 1 });
  ecrire(items);
}

export function changerQty(slug, qty) {
  const items = lire();
  const item = items.find((i) => i.slug === slug);
  if (!item) return;
  item.qty = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
  ecrire(items);
}

export function retirer(slug) {
  ecrire(lire().filter((i) => i.slug !== slug));
}

export function vider() {
  ecrire([]);
}

function majBadge() {
  const n = lire().length;
  document.querySelectorAll('[data-panier-badge]').forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle('hidden', n === 0);
  });
}

document.addEventListener('panier:change', majBadge);
window.addEventListener('storage', majBadge);
majBadge();

// Délégation : tout bouton [data-add-devis] ajoute son produit au panier
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-devis]');
  if (!btn) return;
  e.preventDefault();
  ajouter({ slug: btn.dataset.slug, name: btn.dataset.name, ref: btn.dataset.ref, image: btn.dataset.image });
  const label = btn.querySelector('[data-add-label]') || btn;
  if (!label.dataset.avant) label.dataset.avant = label.textContent;
  label.textContent = 'Ajouté ✓';
  setTimeout(() => { label.textContent = label.dataset.avant; }, 1500);
});
