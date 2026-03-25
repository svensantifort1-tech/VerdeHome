/**
 * app.js
 * Fyxo Standard: Multi-Page Native Web Component Architecture
 */

// ==========================================
// 1. STATE & EVENT MANAGEMENT
// ==========================================
const EventBus = {
  events: {},
  emit(event, data) { if (this.events[event]) this.events[event].forEach(cb => cb(data)); },
  on(event, cb) { (this.events[event] = this.events[event] || []).push(cb); }
};

const CartState = {
  items: [],
  add(product) {
    this.items.push(product);
    EventBus.emit('cart:updated', this.items);
  },
  getTotal() {
    return this.items.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')), 0);
  }
};

const ProductDB = [
  { id: 'vh-01', name: 'De Eiken Fauteuil', price: '€ 899', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-02', name: 'Minimalistische Eettafel', price: '€ 1.249', img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-03', name: 'Sfeervolle Vloerlamp', price: '€ 349', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-04', name: 'Duurzaam Linnen Dekbed', price: '€ 189', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-05', name: 'Handgemaakt Keramiek', price: '€ 85', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-06', name: 'Geweven Wollen Kleed', price: '€ 450', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=600&q=80' }
];

// ==========================================
// 2. GLOBAL COMPONENTS (Nav & Cart)
// ==========================================
class VerdeNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <a href="#home" class="text-2xl font-bold tracking-tighter text-gray-900">Verde<span class="text-green-600">Home</span></a>
          <nav class="hidden md:flex gap-8">
            <a href="#home" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#collectie" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Collectie</a>
            <a href="#impact" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Onze Impact</a>
          </nav>
          <button id="cart-toggle" class="relative p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span id="cart-badge" class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center opacity-0 transition-opacity">0</span>
          </button>
        </div>
      </header>
    `;
    
    this.querySelector('#cart-toggle').addEventListener('click', () => EventBus.emit('drawer:toggle'));
    
    EventBus.on('cart:updated', (items) => {
      const badge = this.querySelector('#cart-badge');
      badge.innerText = items.length;
      badge.style.opacity = items.length > 0 ? '1' : '0';
    });
  }
}
customElements.define('verde-navbar', VerdeNavbar);

class VerdeCartDrawer extends HTMLElement {
  connectedCallback() {
    this.isOpen = false;
    this.innerHTML = `
      <div id="drawer-overlay" class="fixed inset-0 bg-black/50 z-50 opacity-0 pointer-events-none transition-opacity duration-300"></div>
      <div id="drawer-panel" class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold">Winkelwagen</h2>
          <button id="close-drawer" class="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
        </div>
        <div id="cart-items" class="flex-grow p-6 overflow-y-auto space-y-4">
          <p class="text-gray-500 text-center mt-10">Je winkelwagen is leeg.</p>
        </div>
        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="flex justify-between font-bold text-lg mb-4">
            <span>Totaal</span>
            <span id="cart-total">€ 0</span>
          </div>
          <button class="w-full bg-gray-900 text-white py-4 rounded font-semibold hover:bg-gray-800 transition-colors">Veilig Afrekenen</button>
        </div>
      </div>
    `;

    this.overlay = this.querySelector('#drawer-overlay');
    this.panel = this.querySelector('#drawer-panel');
    
    this.querySelector('#close-drawer').addEventListener('click', () => this.toggle(false));
    this.overlay.addEventListener('click', () => this.toggle(false));
    
    EventBus.on('drawer:toggle', () => this.toggle(true));
    EventBus.on('cart:updated', (items) => this.renderItems(items));
  }

  toggle(show) {
    this.isOpen = show;
    this.overlay.classList.toggle('opacity-0', !show);
    this.overlay.classList.toggle('pointer-events-none', !show);
    this.panel.classList.toggle('translate-x-full', !show);
  }

  renderItems(items) {
    const container = this.querySelector('#cart-items');
    if (items.length === 0) return;
    
    container.innerHTML = items.map(item => `
      <div class="flex gap-4 items-center bg-white p-3 border border-gray-100 rounded">
        <img src="${item.img}" class="w-16 h-16 object-cover rounded" alt="${item.name}">
        <div>
          <h4 class="font-semibold text-sm">${item.name}</h4>
          <p class="text-gray-500 text-sm">${item.price}</p>
        </div>
      </div>
    `).join('');
    
    this.querySelector('#cart-total').innerText = `€ ${CartState.getTotal()}`;
    this.toggle(true); // Auto-open cart on add
  }
}
customElements.define('verde-cart-drawer', VerdeCartDrawer);

// ==========================================
// 3. PAGE VIEWS (Routed Components)
// ==========================================
class ViewHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" alt="Hero" class="absolute inset-0 w-full h-full object-cover z-0 opacity-80" fetchpriority="high">
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">Interieur dat niet ten koste gaat van de wereld.</h1>
          <p class="text-xl text-gray-200 mb-8">Bliksemsnel geleverd, levenslang plezier.</p>
          <a href="#collectie" class="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded hover:bg-gray-100">Bekijk de Collectie</a>
        </div>
      </section>
      
      <section class="max-w-7xl mx-auto px-4 py-24">
        <div class="flex justify-between items-end mb-12">
          <h2 class="text-3xl font-bold text-gray-900">Uitgelicht</h2>
          <a href="#collectie" class="text-sm font-semibold text-gray-600 underline">Alles Bekijken</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" id="home-grid"></div>
      </section>
    `;
    
    // Render first 3 products
    const grid = this.querySelector('#home-grid');
    ProductDB.slice(0, 3).forEach(p => grid.appendChild(this.createCard(p)));
  }

  createCard(product) {
    const el = document.createElement('div');
    el.className = "group relative block overflow-hidden rounded-lg bg-gray-100 cursor-pointer";
    el.innerHTML = `
      <img src="${product.img}" alt="${product.name}" class="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105">
      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
        <button class="bg-white text-gray-900 px-8 py-3 rounded font-semibold hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all">Snel Toevoegen</button>
      </div>
      <div class="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-sm font-semibold">${product.price}</div>
      <div class="absolute bottom-4 left-4 text-white font-medium text-lg drop-shadow-md">${product.name}</div>
    `;
    el.querySelector('button').addEventListener('click', () => CartState.add(product));
    return el;
  }
}
customElements.define('verde-view-home', ViewHome);

class ViewCollection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bg-gray-100 py-12 text-center">
        <h1 class="text-4xl font-bold text-gray-900">Onze Collectie</h1>
        <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Duurzame materialen, tijdloos design. Ontworpen om generaties lang mee te gaan.</p>
      </div>
      <section class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8" id="collection-grid"></div>
      </section>
    `;
    const grid = this.querySelector('#collection-grid');
    ProductDB.forEach(p => {
      const el = document.createElement('div');
      el.className = "group relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100";
      el.innerHTML = `
        <img src="${product.img}" alt="${product.name}" class="w-full h-[400px] object-cover">
        <div class="p-4">
          <h3 class="font-bold text-gray-900 text-lg">${product.name}</h3>
          <p class="text-gray-500">${product.price}</p>
          <button class="mt-4 w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition-colors">Toevoegen</button>
        </div>
      `;
      el.querySelector('button').addEventListener('click', () => CartState.add(p));
      grid.appendChild(el);
    });
  }
}
customElements.define('verde-view-collection', ViewCollection);

class ViewImpact extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 class="text-sm font-bold tracking-widest uppercase text-green-600 mb-4">Onze Missie</h2>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Nul Compromissen. Nul Uitstoot.</h1>
        <p class="text-lg text-gray-600 leading-relaxed mb-16">
          Bij VerdeHome geloven we dat premium design en ecologische verantwoordelijkheid hand in hand gaan. 
          Al onze meubels worden lokaal geproduceerd in Europa met FSC-gecertificeerd hout en gerecyclede materialen.
        </p>
        
        <div class="bg-gray-900 text-white p-12 rounded-2xl">
          <h3 class="text-2xl font-light mb-4">Samen hebben we al</h3>
          <div class="text-6xl font-bold text-green-400 mb-4 tabular-nums" id="co2-counter">0</div>
          <p class="text-xl">kg CO2 bespaard.</p>
        </div>
      </section>
    `;
    this.animateCounter();
  }

  animateCounter() {
    const counter = this.querySelector('#co2-counter');
    const target = 14582;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 2000, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      counter.innerText = Math.floor(easeOut * target).toLocaleString('nl-NL');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
customElements.define('verde-view-impact', ViewImpact);

// ==========================================
// 4. THE ROUTER
// ==========================================
class Router {
  constructor() {
    this.outlet = document.getElementById('router-outlet');
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute(); // Initialize on load
  }

  handleRoute() {
    const path = window.location.hash.slice(1) || 'home';
    const viewName = `verde-view-${path}`;
    
    // Utilize Document Transitions API for SPA fade routing if supported
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.outlet.innerHTML = `<${viewName}></${viewName}>`;
        window.scrollTo(0, 0);
      });
    } else {
      this.outlet.innerHTML = `<${viewName}></${viewName}>`;
      window.scrollTo(0, 0);
    }
  }
}

// Boot the application
new Router();
