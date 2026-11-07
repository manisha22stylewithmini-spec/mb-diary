/*
 * Fonts load on demand. A visitor only downloads the one font their page uses, instead of
 * all five families up front. (Inter, the editor's UI font, is linked from index.html.)
 */
const FAMILIES: Record<string, string> = {
  inter: 'Inter:wght@400;500;600;700;800',
  poppins: 'Poppins:wght@400;500;600;700',
  grotesk: 'Space+Grotesk:wght@400;500;700',
  playfair: 'Playfair+Display:wght@500;700',
  fredoka: 'Fredoka:wght@400;500;600',
};

const loaded = new Set<string>(['inter']);

export function loadFont(id: string) {
  const family = FAMILIES[id];
  if (!family || loaded.has(id) || typeof document === 'undefined') return;
  loaded.add(id);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.appendChild(link);
}

export function loadAllFonts() {
  Object.keys(FAMILIES).forEach(loadFont);
}
