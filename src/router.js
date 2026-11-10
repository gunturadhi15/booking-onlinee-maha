/**
 * Router - Simple SPA hash-based router
 */
import { t, getLang } from './i18n.js';

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
      const isInitial = !this.currentPage;
      this.currentPage = path;
      const content = await handler(params);
      const container = document.getElementById('page-content');
      if (container) {
        if (typeof content === 'string') {
          container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          container.innerHTML = '';
          container.appendChild(content);
        }
      }
      if (!isInitial) {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      }
      this.updateActiveNav(path);
      this.updateSEO(path, params);
      this.initAnimations();
    }
  }

  updateSEO(path, params = {}) {
    const metaDesc = document.querySelector('meta[name="description"]');
    const brand = 'Mahawellnerjourney Bali';
    const isEn = getLang() !== 'id';

    const seoMap = {
      '/': {
        title: `${t('nav_home')} — ${brand}`,
        desc: isEn 
          ? 'Official Sanctuary & Direct Wellness Booking Engine Mahawellnerjourney Bali. Sacred spiritual journeys, yoga retreats, melukat purification, and numerology readings in Ubud.'
          : 'Official Sanctuary & Direct Wellness Booking Engine Mahawellnerjourney Bali. Pesan paket spiritual tour, yoga retreat, melukat purification, dan konsultasi numerologi di Ubud.'
      },
      '/layanan': {
        title: `${t('nav_services')} — ${brand}`,
        desc: isEn
          ? 'Explore yoga retreat packages, sacred temple tours, melukat purification, and Balinese numerology with senior practitioners.'
          : 'Jelajahi paket retreat yoga, tur pura sakral, melukat purification, dan konsultasi numerologi Bali dengan panduan praktisi senior.'
      },
      '/booking': {
        title: `${t('nav_booking_cta')} — ${brand}`,
        desc: isEn
          ? 'Official Mahawellnerjourney direct reservation. Select your local Bali schedule (WITA), number of participants, and secure payment method.'
          : 'Formulir reservasi langsung Mahawellnerjourney. Pilih jadwal waktu lokal Bali (WITA), jumlah tamu, dan metode pembayaran aman.'
      },
      '/checkout': {
        title: `${t('chk_heading')} — ${brand}`,
        desc: isEn
          ? 'Review booking details and complete secure checkout for your wellness journey in Ubud Bali.'
          : 'Tinjau rincian pemesanan dan selesaikan konfirmasi reservasi aman untuk perjalanan wellness Anda di Ubud Bali.'
      },
      '/invoice': {
        title: `${t('inv_empty_title')} — ${brand}`,
        desc: isEn
          ? 'Official digital invoice and reservation details with verified booking reference.'
          : 'Rincian faktur digital dan E-Voucher resmi Mahawellnerjourney dengan nomor referensi pemesanan yang terverifikasi.'
      },
      '/tentang-kami': {
        title: `${t('nav_about')} — ${brand}`,
        desc: isEn
          ? 'Learn about our Tri Hita Karana ethos, senior local practitioners, and quiet sanctuary grounds in Desa Adat Bindu, Ubud, Bali.'
          : 'Mengenal etos Tri Hita Karana, praktisi lokal senior, dan sanctuary hening Mahawellnerjourney di Desa Adat Bindu, Ubud, Bali.'
      },
      '/hubungi-kami': {
        title: `${t('nav_contact')} — ${brand}`,
        desc: isEn
          ? 'Official contact, sanctuary location in Ubud Bali, FAQ, and 24/7 WhatsApp concierge assistance.'
          : 'Kontak resmi, lokasi sanctuary di Ubud Bali, FAQ, dan layanan bantuan WhatsApp Concierge.'
      }
    };

    let meta = seoMap[path];
    if (!meta && path.startsWith('/layanan/')) {
      const slug = path.split('/')[2];
      const titleSlug = (slug || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      meta = {
        title: `${titleSlug} — ${brand}`,
        desc: `Detail pengalaman ${titleSlug} di Mahawellnerjourney Ubud Bali. Informasi durasi, fasilitas termasuk, dan pemesanan langsung.`
      };
    }

    if (meta) {
      document.title = meta.title;
      if (metaDesc) metaDesc.setAttribute('content', meta.desc);
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
