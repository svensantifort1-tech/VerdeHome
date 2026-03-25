/**
 * app.js
 * Fyxo V2: Neuromarketing, State Persistence, and Advanced UX.
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
  // Pull from Local Storage so cart survives page reloads
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
  
  save() {
    localStorage.setItem('verde_cart', JSON.stringify(this.items));
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')), 0);
  }
};

// ==========================================
// 2. THE TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-gray-900 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300';
  toast.innerHTML = `
    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span class="font-medium text-sm">${message}</span>
  `;
  container.appendChild(toast);
  
  // Trigger animation frame for smooth slide-in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 3. PRODUCT DATABASE (With Neuromarketing triggers)
// ==========================================
const ProductDB = [
  { id: 'vh-01', name: 'De Eiken Fauteuil', price: '€ 899', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80', badge: 'Bestseller' },
  { id: 'vh-02', name: 'Minimalistische Eettafel', price: '€ 1.249', img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80', stockInfo: 'Nog 2 op voorraad' },
  { id: 'vh-03', name: 'Sfeervolle Vloerlamp', price: '€ 349', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-04', name: 'Linnen Dekbedovertrek', price: '€ 189', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', badge: 'Nieuw' },
  { id: 'vh-05', name: 'Handgemaakt Keramiek', price: '€ 85', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80' },
  { id: 'vh-06', name: 'Wollen Vloerkleed', price: '€ 450', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=600&q=80', stockInfo: 'Beperkte Oplage' }
];

// ==========================================
// 4. GLOBAL COMPONENTS
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
            <a href="#impact" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Onze Impact</a>
          </nav>
          <button id="cart-toggle" class="relative p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span id="cart-badge" class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-0 transition-transform duration-300">0</span>
          </button>
        </div>
      </header>
      <div class="h-20"></div> `;
    
    this.initSmartScroll();

    this.querySelector('#cart-toggle').addEventListener('click', () => EventBus.emit('drawer:toggle'));
    
    EventBus.on('cart:updated', (items) => {
      const badge = this.querySelector('#cart-badge');
      badge.innerText = items.length;
      badge.style.transform = items.length > 0 ? 'scale(1)' : 'scale(0)';
    });

    // Initialize badge on load
    EventBus.emit('cart:updated', CartState.items);
  }

  initSmartScroll() {
    let lastScroll = 0;
    const nav = this.querySelector('#main-nav');
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll <= 0) { nav.classList.remove('-translate-y-full'); return; }
      if (currentScroll > lastScroll && currentScroll > 80) {
        nav.classList.add('-translate-y-full'); // Hide on scroll down
      } else {
        nav.classList.remove('-translate-y-full'); // Show on scroll up
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }
}
customElements.define('verde-navbar', VerdeNavbar);

class VerdeCartDrawer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="drawer-overlay" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300"></div>
      <div id="drawer-panel" class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform translate-x-full transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Winkelwagen</h2>
          <button id="close-drawer" class="text-gray-400 hover:text-gray-900 transition-colors p-2 focus:outline-none">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div id="cart-items" class="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50"></div>
        <div class="p-6 border-t border-gray-100 bg-white">
          <div class="flex justify-between font-bold text-xl mb-6 text-gray-900">
            <span>Totaal</span>
            <span id="cart-total">€ 0,-</span>
          </div>
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
    
    // Render initial state
    this.renderItems(CartState.items);
  }

  toggle(show) {
    this.overlay.classList.toggle('opacity-0', !show);
    this.overlay.classList.toggle('pointer-events-none', !show);
    this.panel.classList.toggle('translate-x-full', !show);
  }

  renderItems(items) {
    const container = this.querySelector('#cart-items');
    if (items.length === 0) {
      container.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-gray-400"><svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><p class="font-medium">Je winkelwagen is leeg.</p><button onclick="EventBus.emit('drawer:toggle'); window.location.hash='collectie'" class="mt-4 text-green-600 font-semibold underline underline-offset-4">Bekijk Collectie</button></div>`;
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
        <button data-index="${index}" class="remove-btn text-gray-300 hover:text-red-500 transition-colors p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `).join('');
    
    // Bind remove buttons
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => CartState.remove(e.currentTarget.getAttribute('data-index')));
    });

    this.querySelector('#cart-total').innerText = `€ ${CartState.getTotal().toLocaleString('nl-NL')},-`;
  }
}
customElements.define('verde-cart-drawer', VerdeCartDrawer);

// ==========================================
// 5. ROUTED VIEWS (With Neuromarketing)
// ==========================================
class ViewHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" alt="Hero" class="absolute inset-0 w-full h-full object-cover z-0 opacity-70 mix-blend-overlay" fetchpriority="high">
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span class="text-green-400 font-bold tracking-widest uppercase text-sm mb-4">Nieuwe Collectie 2026</span>
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">Interieur dat niet ten koste gaat van de wereld.</h1>
          <p class="text-xl text-gray-200 mb-10 font-light max-w-2xl">Bliksemsnel geleverd, levenslang plezier. Ontdek meubilair met een missie.</p>
          <a href="#collectie" class="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 font-bold rounded hover:bg-gray-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Bekijk de Collectie <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>
      </section>
      
      <section class="max-w-7xl mx-auto px-4 py-24">
        <div class="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Populaire Keuzes</h2>
          <a href="#collectie" class="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors">Alles Bekijken &rarr;</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" id="home-grid"></div>
      </section>
    `;
    
    const grid = this.querySelector('#home-grid');
    ProductDB.slice(0, 3).forEach(p => {
      grid.appendChild(createProductCard(p));
    });
  }
}
customElements.define('verde-view-home', ViewHome);

class ViewCollection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bg-gray-900 py-24 text-center px-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595514535415-eeab82cb208e?auto=format&fit=crop&w=1920&q=20')] opacity-10 object-cover"></div>
        <div class="relative z-10">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Onze Collectie</h1>
          <p class="text-gray-300 mt-4 max-w-2xl mx-auto text-lg font-light">Gemaakt in Europa. Gegarandeerd voor het leven.</p>
        </div>
      </div>
      <section class="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10" id="collection-grid"></div>
      </section>
    `;
    
    const grid = this.querySelector('#collection-grid');
    ProductDB.forEach(p => {
      grid.appendChild(createProductCard(p, false));
    });
  }
}
customElements.define('verde-view-collection', ViewCollection);

// Helper function to generate standardized Fyxo Product Cards
function createProductCard(p, isHoverStyle = true) {
  const el = document.createElement('div');
  el.className = `group relative block overflow-hidden rounded-lg bg-gray-50 border border-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`;
  
  // Neuromarketing Badges
  let badgeHTML = '';
  if (p.badge) badgeHTML = `<div class="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider z-20">${p.badge}</div>`;
  else if (p.stockInfo) badgeHTML = `<div class="absolute top-4 left-4 bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider z-20">${p.stockInfo}</div>`;

  if (isHoverStyle) {
    el.innerHTML = `
      ${badgeHTML}
      <div class="relative overflow-hidden bg-gray-200">
        <img src="${p.img}" alt="${p.name}" class="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105">
        <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 z-10">
          <button class="add-btn bg-white text-gray-900 px-8 py-3 rounded shadow-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-50 active:scale-95">Snel Toevoegen</button>
        </div>
      </div>
      <div class="p-5 flex justify-between items-start bg-white">
        <div>
          <h3 class="font-bold text-gray-900 text-lg">${p.name}</h3>
        </div>
        <span class="font-bold text-gray-900">${p.price}</span>
      </div>
    `;
  } else {
    // Standard style for the Collection page
    el.innerHTML = `
      ${badgeHTML}
      <div class="relative overflow-hidden bg-gray-200 rounded-t-lg">
        <img src="${p.img}" alt="${p.name}" class="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105">
      </div>
      <div class="p-6 flex flex-col flex-grow bg-white">
        <h3 class="font-bold text-gray-900 text-lg">${p.name}</h3>
        <p class="text-gray-500 font-medium mb-6">${p.price}</p>
        <button class="add-btn mt-auto w-full bg-white border-2 border-gray-900 text-gray-900 py-3 rounded font-bold hover:bg-gray-900 hover:text-white transition-colors active:scale-95">In Winkelwagen</button>
      </div>
    `;
  }

  el.querySelector('.add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    CartState.add(p);
  });
  return el;
}

class ViewImpact extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-32 text-center">
        <h2 class="text-sm font-bold tracking-widest uppercase text-green-600 mb-6">Onze Missie</h2>
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">Nul Compromissen.<br/>Nul Uitstoot.</h1>
        <p class="text-xl text-gray-600 leading-relaxed mb-16 font-light">
          Bij VerdeHome geloven we dat premium design en ecologische verantwoordelijkheid hand in hand gaan. 
          Al onze meubels worden lokaal geproduceerd in Europa met FSC-gecertificeerd hout en gerecyclede materialen.
        </p>
        <div class="bg-gray-900 text-white p-12 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
          <div class="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
          <div class="relative z-10">
            <h3 class="text-2xl font-light mb-6">Samen hebben we al</h3>
            <div class="text-7xl md:text-8xl font-bold text-green-400 mb-6 tabular-nums tracking-tighter" id="co2-counter">0</div>
            <p class="text-xl text-gray-300">kg CO2 bespaard in 2026.</p>
          </div>
        </div>
      </section>
    `;
    
    const counter = this.querySelector('#co2-counter');
    const target = 14582;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 2500, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      counter.innerText = Math.floor(easeOut * target).toLocaleString('nl-NL');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
customElements.define('verde-view-impact', ViewImpact);

// ==========================================
// 6. THE SPA ROUTER
// ==========================================
class Router {
  constructor() {
    this.outlet = document.getElementById('router-outlet');
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute(); 
  }

  handleRoute() {
    const path = window.location.hash.slice(1) || 'home';
    const viewName = `verde-view-${path}`;
    
    if (!customElements.get(viewName)) {
      window.location.hash = 'home';
      return;
    }

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

new Router();
