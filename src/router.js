/**
 * Router - Simple SPA hash-based router
 */

export class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    this.beforeNavigate = null;
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  getPath() {
    const rawHash = window.location.hash.slice(1) || '/';
    const [path] = rawHash.split('?');
    return path || '/';
  }

  getQueryParams() {
    const rawHash = window.location.hash.slice(1) || '';
    const qIndex = rawHash.indexOf('?');
    if (qIndex === -1) return {};
    const searchParams = new URLSearchParams(rawHash.slice(qIndex + 1));
    return Object.fromEntries(searchParams.entries());
  }

  navigate(path) {
    if (this.beforeNavigate) {
      this.beforeNavigate(path);
    }
    window.location.hash = path;
  }

  async resolve() {
    const path = this.getPath();
    const queryParams = this.getQueryParams();
    let handler = this.routes[path];
    let params = { ...queryParams };

    // Check for dynamic routes
    if (!handler) {
      for (const [route, h] of Object.entries(this.routes)) {
        const routeParts = route.split('/');
        const pathParts = path.split('/');

        if (routeParts.length === pathParts.length) {
          let match = true;
          const tempParams = {};

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              tempParams[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            handler = h;
            params = { ...tempParams, ...queryParams };
            break;
          }
        }
      }
    }

    if (handler) {
      this.currentPage = path;
      const content = await handler(params);
      const container = document.getElementById('page-content');
      if (container) {
        container.innerHTML = '';
        if (typeof content === 'string') {
          container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          container.appendChild(content);
        }
      }
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
      this.updateActiveNav(path);
      this.initAnimations();
    }
  }

  updateActiveNav(path) {
    // Map paths to data-page values
    const pageMap = {
      '/': 'home',
      '/layanan': 'services',
      '/booking': 'booking',
      '/tentang-kami': 'about',
      '/hubungi-kami': 'contact',
    };

    let activePage = pageMap[path] || '';

    // For dynamic routes
    if (!activePage && path.startsWith('/layanan/')) activePage = 'services';
    if (!activePage && path.startsWith('/booking')) activePage = 'booking';
    if (!activePage && path.startsWith('/checkout')) activePage = 'booking';
    if (!activePage && path.startsWith('/invoice')) activePage = 'booking';

    document.querySelectorAll('[data-page]').forEach(el => {
      if (el.classList.contains('navbar__link') || el.classList.contains('mobile-menu__link')) {
        el.classList.toggle('active', el.dataset.page === activePage);
      }
    });
  }

  initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '60px 0px 60px 0px' });

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .stagger').forEach(el => {
      observer.observe(el);
    });
  }

  start() {
    window.addEventListener('hashchange', () => this.resolve());

    // Handle initial load
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    this.resolve();
  }
}
