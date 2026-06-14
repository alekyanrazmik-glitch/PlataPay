import { SERVICES } from './data.mjs';

const RATE_RUB_PER_USD = 80;
const SERVICE_FEE_RUB = 1000;

const ALIASES = {
  chatgpt: ['ChatGPT Plus', 'ChatGPT Team'],
  claude: ['Claude Pro'],
  gemini: ['Gemini Advanced'],
  'adobe-cc': ['Adobe', 'Adobe CC', 'Adobe Creative Cloud'],
  'adobe-photoshop': ['Photoshop'],
  'youtube-premium': ['YouTube', 'YouTube Premium'],
  spotify: ['Spotify', 'Spotify Premium'],
  canva: ['Canva', 'Canva Pro'],
  capcut: ['CapCut', 'CapCut Pro'],
  zoom: ['Zoom', 'Zoom Pro'],
  discord: ['Discord', 'Discord Nitro'],
  'proton-mail': ['Proton', 'Proton Mail'],
  'google-drive': ['Google Drive'],
  'ps-plus-turkey': ['PS Plus', 'PS Plus (Турция)', 'PlayStation'],
};

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/premium|pro|plus|creative cloud|cc|тариф|подписка/g, '')
    .replace(/[^a-zа-я0-9]+/gi, '');
}

function rub(value) {
  return Math.round(value * RATE_RUB_PER_USD + SERVICE_FEE_RUB);
}

function formatRub(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function minRubFromTiers(service) {
  const prices = (service.tiers || [])
    .map((tier) => String(tier).match(/\$\s*(\d+(?:[.,]\d+)?)/))
    .filter(Boolean)
    .map((match) => rub(Number(match[1].replace(',', '.'))));
  return prices.length ? Math.min(...prices) : null;
}

const priceByName = new Map();
for (const service of SERVICES) {
  const minRub = minRubFromTiers(service);
  const price = minRub ? formatRub(minRub) : 'по запросу';
  const names = [service.name, service.slug, ...(ALIASES[service.slug] || [])];
  for (const name of names) {
    priceByName.set(norm(name), price);
  }
}

function priceForName(name) {
  const key = norm(name);
  if (!key) return null;
  if (priceByName.has(key)) return priceByName.get(key);
  for (const [candidate, price] of priceByName.entries()) {
    if (candidate && (candidate === key || candidate.includes(key) || key.includes(candidate))) return price;
  }
  return null;
}

function patchCatalogServiceArray(html) {
  return html.replace(/(\{[^{}\n]*name:")([^"]+)("[^{}\n]*price:")([^"]*)(")/g, (full, before, name, middle, oldPrice, after) => {
    const nextPrice = priceForName(name);
    return nextPrice ? `${before}${name}${middle}${nextPrice}${after}` : full;
  });
}

function patchHomePopularCards(html) {
  return html.replace(/(<div class="pp-pc">[\s\S]*?<div class="pp-pc-name">)([^<]+)(<\/div>[\s\S]*?<div class="pp-pc-price"><span>от<\/span> <b>)([^<]*)(<\/b><\/div>)/g, (full, before, name, middle, oldPrice, after) => {
    const nextPrice = priceForName(name);
    return nextPrice ? `${before}${name}${middle}${nextPrice}${after}` : full;
  });
}

export function patchStaticPrices(html) {
  return patchHomePopularCards(patchCatalogServiceArray(html));
}
