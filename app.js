/**
 * app.js
 * Fyxo Performance Standard: Native Web Components, Zero-Dependency JS.
 */

// ---------------------------------------------------------
// 1. The Hero Component
// ---------------------------------------------------------
class VerdeHero extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section id="hero-section" class="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80" 
          alt="Duurzaam Interieur" 
          width="1920" height="1080" 
          fetchpriority="high" 
          class="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        >
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Interieur dat niet ten koste gaat van de wereld.
          </h1>
          <p class="text-lg md:text-xl text-gray-200 mb-8 font-light">
            Bliksemsnel geleverd, levenslang plezier.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button class="px-8 py-4 bg-white text-gray-900 font-semibold rounded hover:bg-gray-100 transition-colors">
              Bekijk de Collectie
            </button>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('verde-hero', VerdeHero);

// ---------------------------------------------------------
// 2. The High-Performance Impact Counter
// ---------------------------------------------------------
class VerdeImpactCounter extends HTMLElement {
  connectedCallback() {
    this.target = parseInt(this.getAttribute('target') || '0', 10);
    this.innerHTML = `
      <section class="bg-gray-900 text-white py-24 text-center">
        <h2 class="text-sm font-bold tracking-widest uppercase text-green-400 mb-4">Onze Impact</h2>
        <p class="text-3xl md:text-5xl font-light mb-12">
          Samen hebben we al <br/>
          <span id="counter-val" class="font-bold tabular-nums">0</span> kg CO2 bespaard.
        </p>
      </section>
    `;
    
    this.initObserver();
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.animateCount();
        observer.disconnect(); // Fire once and detach for performance
      }
    }, { threshold: 0.5 });
    observer.observe(this);
  }

  animateCount() {
    const display = this.querySelector('#counter-val');
    const duration = 2000;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      display.innerText = Math.floor(easeOut * this.target).toLocaleString('nl-NL');
      
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
customElements.define('verde-impact-counter', VerdeImpactCounter);

// ---------------------------------------------------------
// 3. The Sticky Buy-Bar (Off-Main-Thread Animations)
// ---------------------------------------------------------
class VerdeStickyBar extends HTMLElement {
  connectedCallback() {
    const price = this.getAttribute('price');
    const product = this.getAttribute('product');

    this.innerHTML = `
      <div id="sticky-bar" class="fixed bottom-0 left-0 w-full bg-white border-t p-4 transform translate-y-full transition-transform duration-300 z-50 flex justify-between items-center md:hidden">
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">${product}</span>
          <span class="text-lg font-bold text-gray-900">${price}</span>
        </div>
        <button class="bg-gray-900 text-white px-6 py-3 rounded font-semibold hover:bg-gray-800">
          Nu Bestellen
        </button>
      </div>
    `;

    this.bindScrollLogic();
  }

  bindScrollLogic() {
    // Wait for the hero component to be injected
    setTimeout(() => {
      const hero = document.querySelector('verde-hero');
      const bar = this.querySelector('#sticky-bar');
      
      if (!hero || !bar) return;

      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
          bar.classList.remove('translate-y-full');
        } else {
          bar.classList.add('translate-y-full');
        }
      }, { root: null, threshold: 0 });

      observer.observe(hero);
    }, 100);
  }
}
customElements.define('verde-sticky-bar', VerdeStickyBar);
