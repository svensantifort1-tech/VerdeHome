/**
 * app.js
 * Fyxo V3: Dynamic Routing, Product Detail Pages, and Brand Storytelling.
 */

// ==========================================
// 1. STATE & TOAST MANAGEMENT
// ==========================================
const EventBus = {
  events: {},
  emit(event, data) { if (this.events[event]) this.events[event].forEach(cb => cb(data)); },
  on(event, cb) { (this.events[event] = this.events[event] || []).push(cb); }
};

const CartState = {
  items: JSON.parse(localStorage.getItem('verde_cart')) || [],
  add(product) {
    this.items.push(product);
    this.save();
    EventBus.emit('cart:updated', this.items);
    showToast(`Toegevoegd: ${product.name}`);
  },
  remove(index) {
    this.items.splice(index, 1);
    this.save();
    EventBus.emit('cart:updated', this.items);
  },
  save() { localStorage.setItem('verde_cart', JSON.stringify(this.items)); },
  getTotal() { return this.items.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')), 0); }
};

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-gray-900 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300';
  toast.innerHTML = `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="font-medium text-sm">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 2. ENRICHED PRODUCT DATABASE
// ==========================================
const ProductDB = [
  { id: 'vh-01', name: 'De Eiken Fauteuil', price: '€ 899', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80', badge: 'Bestseller', rating: 4.9, reviews: 128, desc: 'Vervaardigd uit massief Europees eikenhout met een ergonomische zitting. Deze fauteuil combineert minimalistisch design met ultiem comfort. Behandeld met natuurlijke, gifvrije olie.' },
  { id: 'vh-02', name: 'Minimalistische Eettafel', price: '€ 1.249', img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80', stockInfo: 'Nog 2 op voorraad', rating: 4.8, reviews: 45, desc: 'Het hart van je eetkamer. Een zwevend blad-design ondersteund door een robuust stalen frame. Geleverd in 100% recyclebare verpakking.' },
  { id: 'vh-03', name: 'Sfeervolle Vloerlamp', price: '€ 349', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', rating: 4.7, reviews: 89, desc: 'Zacht, diffuus licht ontmoet strak industrieel design. Inclusief energiezuinige smart-LED lamp met een levensduur van 50.000 uur.' },
  { id: 'vh-04', name: 'Linnen Dekbedovertrek', price: '€ 189', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', badge: 'Nieuw', rating: 5.0, reviews: 210, desc: '100% biologisch Europees linnen. Ademend in de zomer, isolerend in de winter. Hoe vaker je het wast, hoe zachter het wordt.' },
  { id: 'vh-05', name: 'Handgemaakt Keramiek', price: '€ 85', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80', rating: 4.9, reviews: 56, desc: 'Elk stuk is uniek. Lokaal gedraaid en geglazuurd in ons atelier. Vaatwasserbestendig en ontworpen voor dagelijks gebruik.' },
  { id: 'vh-06', name: 'Wollen Vloerkleed', price: '€ 450', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80', stockInfo: 'Beperkte Oplage', rating: 4.6, reviews: 34, desc: 'Handgeweven door ambachtslieden met 100% ongeverfde schapenwol. Vuilafstotend van nature en een warme toevoeging aan elk interieur.' }
];

// ==========================================
// 3. GLOBAL COMPONENTS (Navbar & Cart)
// ==========================================
class VerdeNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header id="main-nav" class="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-transform duration-300">
        <div class="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <a href="#home" class="text-2xl font-bold tracking-tighter text-gray-900">Verde<span class="text-green-600">Home</span></a>
          <nav class="hidden md:flex gap-8">
            <a href="#home" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#collectie" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Collectie</a>
            <a href="#over" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Over Ons</a>
            <a href="#impact" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Onze Impact</a>
          </nav>
          <button id="cart-toggle" class="relative p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span id="cart-badge" class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-0 transition-transform duration-300">0</span>
          </button>
        </div>
      </header>
      <div class="h-20"></div>
    `;
    this.initSmartScroll();
    this.querySelector('#cart-toggle').addEventListener('click', () => EventBus.emit('drawer:toggle'));
    EventBus.on('cart:updated', (items) => {
      const badge = this.querySelector('#cart-badge');
      badge.innerText = items.length;
      badge.style.transform = items.length > 0 ? 'scale(1)' : 'scale(0)';
    });
    EventBus.emit('cart:updated', CartState.items);
  }
  initSmartScroll() {
    let lastScroll = 0;
    const nav = this.querySelector('#main-nav');
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) { nav.classList.remove('-translate-y-full'); return; }
      if (currentScroll > lastScroll && currentScroll > 80) nav.classList.add('-translate-y-full');
      else nav.classList.remove('-translate-y-full');
      lastScroll = currentScroll;
    }, { passive: true });
  }
}
customElements.define('verde-navbar', VerdeNavbar);

class VerdeCartDrawer extends HTMLElement {
  // [Code remains identical to V2 for CartDrawer - Omitted here for brevity, keep your V2 VerdeCartDrawer code!]
  // *Re-insert your V2 VerdeCartDrawer class here exactly as it was*
}
// I'll provide the full V2 cart below to ensure you have a copy/pasteable block.
VerdeCartDrawer.prototype.connectedCallback = function() {
    this.innerHTML = `
      <div id="drawer-overlay" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300"></div>
      <div id="drawer-panel" class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform translate-x-full transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Winkelwagen</h2>
          <button id="close-drawer" class="text-gray-400 hover:text-gray-900 transition-colors p-2 focus:outline-none"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div id="cart-items" class="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50"></div>
        <div class="p-6 border-t border-gray-100 bg-white">
          <div class="flex justify-between font-bold text-xl mb-6 text-gray-900"><span>Totaal</span><span id="cart-total">€ 0,-</span></div>
          <button class="w-full bg-green-600 text-white py-4 rounded font-bold text-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20">Veilig Afrekenen</button>
        </div>
      </div>
    `;
    this.overlay = this.querySelector('#drawer-overlay');
    this.panel = this.querySelector('#drawer-panel');
    this.querySelector('#close-drawer').addEventListener('click', () => this.toggle(false));
    this.overlay.addEventListener('click', () => this.toggle(false));
    EventBus.on('drawer:toggle', () => this.toggle(true));
    EventBus.on('cart:updated', (items) => this.renderItems(items));
    this.renderItems(CartState.items);
};
VerdeCartDrawer.prototype.toggle = function(show) {
    this.overlay.classList.toggle('opacity-0', !show);
    this.overlay.classList.toggle('pointer-events-none', !show);
    this.panel.classList.toggle('translate-x-full', !show);
};
VerdeCartDrawer.prototype.renderItems = function(items) {
    const container = this.querySelector('#cart-items');
    if (items.length === 0) {
      container.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400"><p class="font-medium">Je winkelwagen is leeg.</p><button onclick="EventBus.emit('drawer:toggle'); window.location.hash='collectie'" class="mt-4 text-green-600 font-semibold underline underline-offset-4">Bekijk Collectie</button></div>`;
      this.querySelector('#cart-total').innerText = `€ 0,-`;
      return;
    }
    container.innerHTML = items.map((item, index) => `
      <div class="flex gap-4 items-center bg-white p-4 border border-gray-100 rounded-lg shadow-sm group">
        <img src="${item.img}" class="w-20 h-20 object-cover rounded bg-gray-100" alt="${item.name}">
        <div class="flex-grow">
          <h4 class="font-bold text-gray-900 text-sm mb-1">${item.name}</h4>
          <p class="text-gray-500 font-medium text-sm">${item.price}</p>
        </div>
        <button data-index="${index}" class="remove-btn text-gray-300 hover:text-red-500 transition-colors p-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
      </div>
    `).join('');
    container.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', (e) => CartState.remove(e.currentTarget.getAttribute('data-index'))));
    this.querySelector('#cart-total').innerText = `€ ${CartState.getTotal().toLocaleString('nl-NL')},-`;
};
customElements.define('verde-cart-drawer', VerdeCartDrawer);


// ==========================================
// 4. THE VIEWS
// ==========================================

// Helper function to generate cards that route to the PDP instead of just adding to cart
function createProductCard(p) {
  const el = document.createElement('a');
  el.href = `#product/${p.id}`; // Native Routing
  el.className = `group block relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`;
  
  let badgeHTML = '';
  if (p.badge) badgeHTML = `<div class="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider z-20">${p.badge}</div>`;
  else if (p.stockInfo) badgeHTML = `<div class="absolute top-4 left-4 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider z-20">${p.stockInfo}</div>`;

  el.innerHTML = `
    ${badgeHTML}
    <div class="relative overflow-hidden bg-gray-200">
      <img src="${p.img}" alt="${p.name}" class="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105">
      <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <div class="p-6 flex flex-col flex-grow bg-white">
      <h3 class="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">${p.name}</h3>
      <p class="text-gray-500 font-medium mt-1">${p.price}</p>
    </div>
  `;
  return el;
}

// 4.1 Home
class ViewHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" alt="Hero" class="absolute inset-0 w-full h-full object-cover z-0 opacity-70 mix-blend-overlay">
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span class="text-green-400 font-bold tracking-widest uppercase text-sm mb-4">Nieuwe Collectie 2026</span>
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">Interieur dat niet ten koste gaat van de wereld.</h1>
          <a href="#collectie" class="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 font-bold rounded hover:bg-gray-100 transition-colors shadow-lg mt-8">
            Bekijk de Collectie <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>
      </section>
      <section class="max-w-7xl mx-auto px-4 py-24">
        <div class="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Populaire Keuzes</h2>
          <a href="#collectie" class="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4">Alles Bekijken &rarr;</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" id="home-grid"></div>
      </section>
    `;
    const grid = this.querySelector('#home-grid');
    ProductDB.slice(0, 3).forEach(p => grid.appendChild(createProductCard(p)));
  }
}
customElements.define('verde-view-home', ViewHome);

// 4.2 Collection
class ViewCollection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bg-gray-900 py-24 text-center px-4 relative overflow-hidden">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight relative z-10">Onze Collectie</h1>
        <p class="text-gray-300 mt-4 max-w-2xl mx-auto text-lg font-light relative z-10">Gemaakt in Europa. Gegarandeerd voor het leven.</p>
      </div>
      <section class="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10" id="collection-grid"></div>
      </section>
    `;
    const grid = this.querySelector('#collection-grid');
    ProductDB.forEach(p => grid.appendChild(createProductCard(p)));
  }
}
customElements.define('verde-view-collection', ViewCollection);

// 4.3 DYNAMIC PRODUCT DETAIL PAGE (PDP)
class ViewProduct extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute('data-id');
    const p = ProductDB.find(prod => prod.id === id);
    
    if (!p) {
      this.innerHTML = `<div class="py-32 text-center"><h1 class="text-2xl font-bold">Product niet gevonden.</h1><a href="#collectie" class="text-green-600 underline mt-4 block">Terug naar collectie</a></div>`;
      return;
    }

    this.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div class="mb-8">
          <a href="#collectie" class="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2">
            &larr; Terug naar collectie
          </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          <div class="relative rounded-xl overflow-hidden bg-gray-100">
            <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover aspect-square">
          </div>

          <div class="flex flex-col justify-center">
            ${p.badge ? `<span class="inline-block bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 w-max">${p.badge}</span>` : ''}
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">${p.name}</h1>
            
            <div class="flex items-center gap-2 mb-6">
              <div class="flex text-yellow-400">
                ${'<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'.repeat(5)}
              </div>
              <span class="text-sm text-gray-500 font-medium">${p.rating} (${p.reviews} reviews)</span>
            </div>

            <p class="text-3xl font-light text-gray-900 mb-8">${p.price}</p>
            <p class="text-gray-600 leading-relaxed mb-10 text-lg">${p.desc}</p>

            <button id="pdp-add-btn" class="w-full bg-green-600 text-white py-5 rounded-lg font-bold text-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20 mb-6">
              In Winkelwagen
            </button>

            <div class="grid grid-cols-2 gap-4 border-t border-gray-200 pt-8 mt-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                <span class="text-sm font-semibold text-gray-900">Snelle Levering</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
                <span class="text-sm font-semibold text-gray-900">Levenslange Garantie</span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg></div>
                <span class="text-sm font-semibold text-gray-900">Gratis Retour</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.querySelector('#pdp-add-btn').addEventListener('click', () => CartState.add(p));
  }
}
customElements.define('verde-view-product', ViewProduct);

// 4.4 About Us (Brand Story)
class ViewAbout extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 class="text-5xl font-bold text-gray-900 mb-8 tracking-tight">Vakmanschap met een Geweten.</h1>
        <p class="text-xl text-gray-600 leading-relaxed mb-16 font-light">
          VerdeHome is opgericht met één simpele overtuiging: we hoeven niet te kiezen tussen prachtig design en de gezondheid van onze planeet. 
          Elk meubelstuk dat we ontwerpen is een aanklacht tegen de wegwerpcultuur.
        </p>
        <img src="https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=1200&q=80" class="w-full h-[400px] object-cover rounded-2xl shadow-xl mb-16" alt="Werkplaats">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="bg-gray-50 p-8 rounded-xl">
            <h3 class="font-bold text-gray-900 text-xl mb-3">100% Lokaal</h3>
            <p class="text-gray-600">Al onze producten worden vervaardigd in Europese ateliers om transportemissies te minimaliseren en eerlijke lonen te garanderen.</p>
          </div>
          <div class="bg-gray-50 p-8 rounded-xl">
            <h3 class="font-bold text-gray-900 text-xl mb-3">Duurzame Materialen</h3>
            <p class="text-gray-600">We gebruiken uitsluitend FSC-gecertificeerd hout, biologisch linnen en gifvrije natuurlijke oliën.</p>
          </div>
          <div class="bg-gray-50 p-8 rounded-xl">
            <h3 class="font-bold text-gray-900 text-xl mb-3">Radicale Transparantie</h3>
            <p class="text-gray-600">Geen verborgen marges. Je weet precies wat de materialen kosten en wat de impact is op het milieu.</p>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('verde-view-about', ViewAbout);

// 4.5 Impact
class ViewImpact extends HTMLElement {
  // [Code remains identical to V2 ViewImpact - Omitted for brevity, paste your V2 here]
}
ViewImpact.prototype.connectedCallback = function() {
    this.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-32 text-center">
        <h2 class="text-sm font-bold tracking-widest uppercase text-green-600 mb-6">Onze Missie</h2>
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">Nul Compromissen.<br/>Nul Uitstoot.</h1>
        <p class="text-xl text-gray-600 leading-relaxed mb-16 font-light">Bij VerdeHome geloven we dat premium design en ecologische verantwoordelijkheid hand in hand gaan.</p>
        <div class="bg-gray-900 text-white p-12 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-2xl font-light mb-6">Samen hebben we al</h3>
            <div class="text-7xl md:text-8xl font-bold text-green-400 mb-6 tabular-nums tracking-tighter" id="co2-counter">0</div>
            <p class="text-xl text-gray-300">kg CO2 bespaard in 2026.</p>
          </div>
        </div>
      </section>
    `;
    const counter = this.querySelector('#co2-counter');
    const target = 14582; let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 2500, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      counter.innerText = Math.floor(easeOut * target).toLocaleString('nl-NL');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};
customElements.define('verde-view-impact', ViewImpact);


// ==========================================
// 5. THE DYNAMIC SPA ROUTER
// ==========================================
class Router {
  constructor() {
    this.outlet = document.getElementById('router-outlet');
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute(); 
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    // Dynamic Routing Splitter (e.g. "product/vh-01" -> route: "product", param: "vh-01")
    const [route, param] = hash.split('/'); 
    
    const viewName = `verde-view-${route}`;
    
    if (!customElements.get(viewName)) {
      window.location.hash = 'home';
      return;
    }

    const render = () => {
      const el = document.createElement(viewName);
      if (param) el.setAttribute('data-id', param); // Pass the dynamic ID to the PDP
      this.outlet.innerHTML = '';
      this.outlet.appendChild(el);
      window.scrollTo(0, 0);
    };

    if (document.startViewTransition) {
      document.startViewTransition(render);
    } else {
      render();
    }
  }
}

new Router();
