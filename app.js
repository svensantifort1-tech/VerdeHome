/**
 * app.js
 * Fyxo Performance Standard: Native Web Components, Zero-Dependency.
 */

// --- Global Event Bus for State Management ---
// Allows components to communicate without strict coupling.
const EventBus = {
  events: {},
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  },
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
};

// --- 1. The LCP Hero Component ---
class VerdeHero extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="hero-section" class="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=fit&w=1920&q=80" 
          alt="VerdeHome Premium Duurzaam Interieur" 
          width="1920" height="1080" 
          fetchpriority="high" loading="eager"
          class="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        >
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Interieur dat niet ten koste gaat van de wereld.
          </h1>
          <p class="text-lg md:text-xl text-gray-200 mb-8 font-light">
            Bliksemsnel geleverd, levenslang plezier.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button class="px-8 py-4 bg-white text-gray-900 font-semibold rounded hover:bg-gray-100 transition-colors duration-300">
              Bekijk de Collectie
            </button>
            <button class="px-8 py-4 bg-transparent border border-white text-white font-semibold rounded hover:bg-white/10 transition-colors duration-300">
              Onze Impact
            </button>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('verde-hero', VerdeHero);

// --- 2. The Conversion Grid Component ---
class VerdeGrid extends HTMLElement {
  connectedCallback() {
    const products = [
      { id: 'vh-01', name: 'De Eiken Fauteuil', price: '€ 899', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80' },
      { id: 'vh-02', name: 'Minimalistische Eettafel', price: '€ 1.249', img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80' },
      { id: 'vh-03', name: 'Sfeervolle Vloerlamp', price: '€ 349', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
    ];

    let gridHTML = `<section class="max-w-7xl mx-auto px-4 py-24"><div class="grid grid-cols-1 md:grid-cols-3 gap-8">`;
    
    products.forEach(product => {
      gridHTML += `
        <div class="group relative block overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
          <img src="${product.img}" alt="${product.name}" width="600" height="800" class="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105">
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <button data-id="${product.id}" class="quick-add-btn bg-white text-gray-900 px-8 py-3 rounded shadow-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-100">
              Snel Toevoegen
            </button>
          </div>
          <div class="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-sm font-semibold text-gray-900">${product.price}</div>
          <div class="absolute bottom-4 left-4 right-4 text-white font-medium text-lg z-10 drop-shadow-md">${product.name}</div>
        </div>
      `;
    });

    gridHTML += `</div></section>`;
    this.innerHTML = gridHTML;

    // Bind interaction events without polluting global scope
    this.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        EventBus.emit('cart:add', productId);
        e.target.innerText = 'Toegevoegd ✓';
        setTimeout(() => e.target.innerText = 'Snel Toevoegen', 2000);
      });
    });
  }
}
customElements.define('verde-grid', VerdeGrid);

// --- 3. The Trust Section (Performance Observer) ---
class VerdeTrust extends HTMLElement {
  connectedCallback() {
    this.target = parseInt(this.getAttribute('target') || '0', 10);
    this.innerHTML = `
      <section class="bg-gray-900 text-white py-24 text-center">
        <h2 class="text-sm font-bold tracking-widest uppercase text-green-400 mb-4">Onze Impact</h2>
        <p class="text-3xl md:text-5xl font-light mb-12">
          Samen hebben we al <br/>
          <span id="co2-counter" class="font-bold tabular-nums text-white">0</span> kg CO2 bespaard.
        </p>
      </section>
    `;
    this.initObserver();
  }

  initObserver() {
    // Only animate when visible to save CPU cycles (TBT optimization)
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.animateCount();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(this);
  }

  animateCount() {
    const counter = this.querySelector('#co2-counter');
    const duration = 2000;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      counter.innerText = Math.floor(easeOut * this.target).toLocaleString('nl-NL');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
customElements.define('verde-trust', VerdeTrust);

// --- 4. The Sticky Mobile Buy Bar ---
class VerdeStickyBar extends HTMLElement {
  connectedCallback() {
    const price = this.getAttribute('price');
    const product = this.getAttribute('product');

    this.innerHTML = `
      <div id="sticky-bar" class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 transform translate-y-full transition-transform duration-300 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden" aria-hidden="true">
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">${product}</span>
          <span class="text-lg font-bold text-gray-900">${price}</span>
        </div>
        <button id="mobile-buy-btn" class="bg-gray-900 text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 active:scale-95 transition-all">
          Nu Bestellen
        </button>
      </div>
    `;

    this.bindScrollLogic();
    
    // Listen to our global Event Bus
    this.querySelector('#mobile-buy-btn').addEventListener('click', () => {
      EventBus.emit('cart:add', 'vh-fauteuil-01');
    });
  }

  bindScrollLogic() {
    // Wait slightly to ensure hero is injected
    setTimeout(() => {
      const hero = document.querySelector('verde-hero');
      const bar = this.querySelector('#sticky-bar');
      if (!hero || !bar) return;

      const observer = new IntersectionObserver(([entry]) => {
        const isPastHero = !entry.isIntersecting;
        bar.classList.toggle('translate-y-full', !isPastHero);
        bar.setAttribute('aria-hidden', !isPastHero ? 'true' : 'false');
      }, { root: null, threshold: 0 });

      observer.observe(hero);
    }, 100);
  }
}
customElements.define('verde-sticky-bar', VerdeStickyBar);

// --- 5. Global Initialization ---
EventBus.on('cart:add', (productId) => {
  console.log(`[Fyxo Checkout Engine] Item added: ${productId}`);
  // In a static setup, this is where you'd trigger a Shopify Buy Button cart drawer 
  // or a Snipcart overlay without leaving the page.
});
