/**
 * Sacred Journey Bali — Application Entry Point
 */
import './styles/index.css';
import { Router } from './router.js';
import { renderHome, initHomeEffects } from './pages/home.js';
import { renderServices, initServicesFilter, renderServiceDetail } from './pages/services.js';
import { renderBooking, initBooking } from './pages/booking.js';
import { renderCheckout, initCheckout } from './pages/checkout.js';
import { renderInvoice, initInvoice } from './pages/invoice.js';
import { renderAbout } from './pages/about.js';
import { renderContact, initContact } from './pages/contact.js';
import { t, getLang, setLang, getLanguages } from './i18n.js';

// Initialize SPA Router
const router = new Router();

// Route Definitions
router.addRoute('/', async () => {
  const html = renderHome();
  setTimeout(() => initHomeEffects(), 50);
  return html;
});

router.addRoute('/layanan', async () => {
  const html = renderServices();
  setTimeout(() => initServicesFilter(), 50);
  return html;
});

router.addRoute('/layanan/:slug', async (params) => {
  return renderServiceDetail(params);
});

router.addRoute('/booking', async () => {
  const html = renderBooking();
  setTimeout(() => initBooking(), 50);
  return html;
});

router.addRoute('/checkout', async () => {
  const html = renderCheckout();
  setTimeout(() => initCheckout(), 50);
  return html;
});

router.addRoute('/invoice', async () => {
  const html = renderInvoice();
  setTimeout(() => initInvoice(), 50);
  return html;
});

router.addRoute('/invoice/:id', async (params) => {
  const html = renderInvoice(params);
  setTimeout(() => initInvoice(params), 50);
  return html;
});

router.addRoute('/tentang-kami', async () => {
  return renderAbout();
});

router.addRoute('/hubungi-kami', async () => {
  const html = renderContact();
  setTimeout(() => initContact(), 50);
  return html;
});

// ==================== i18n Integration ====================

/** Populate the language dropdown & mobile language list */
function buildLanguageUI() {
  const dropdown = document.getElementById('lang-dropdown');
  const mobileList = document.getElementById('mobile-lang-list');
  const languages = getLanguages();
  const current = getLang();

  // Desktop dropdown
  if (dropdown) {
    dropdown.innerHTML = languages.map(l => `
      <button class="lang-switcher__option ${l.code === current ? 'active' : ''}" data-lang="${l.code}">
        <span class="lang-switcher__option-flag">${l.flag}</span>
        <span class="lang-switcher__option-name">${l.name}</span>
        ${l.code === current ? '<span class="lang-switcher__option-check">✓</span>' : ''}
      </button>
    `).join('');
  }

  // Mobile buttons
  if (mobileList) {
    mobileList.innerHTML = languages.map(l => `
      <button class="mobile-menu__lang-btn ${l.code === current ? 'active' : ''}" data-lang="${l.code}">
        ${l.flag} ${l.name}
      </button>
    `).join('');
  }

  // Update the current flag in the toggle button
  const flagSpan = document.getElementById('lang-current-flag');
  const currentLangObj = languages.find(l => l.code === current);
  if (flagSpan && currentLangObj) {
    flagSpan.textContent = currentLangObj.flag;
  }
}

/** Update the static navbar, footer, and chatbot text with current translations */
function updateStaticTexts() {
  // Navbar links
  const navLinks = {
    home: t('nav_home'),
    services: t('nav_services'),
    booking: t('nav_booking'),
    about: t('nav_about'),
    contact: t('nav_contact'),
  };

  // Desktop nav
  document.querySelectorAll('.navbar__link').forEach(link => {
    const page = link.dataset.page;
    if (navLinks[page]) link.textContent = navLinks[page];
  });

  // Mobile nav
  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    const page = link.dataset.page;
    if (navLinks[page]) link.textContent = navLinks[page];
  });

  // Booking CTA buttons
  const navBookingBtn = document.getElementById('nav-booking-btn');
  if (navBookingBtn) navBookingBtn.textContent = t('nav_booking_cta');

  const mobileCta = document.querySelector('.mobile-menu__cta');
  if (mobileCta) mobileCta.textContent = t('nav_booking_cta');

  // Footer
  const footerDesc = document.querySelector('.footer__desc');
  if (footerDesc) footerDesc.textContent = t('foot_desc');

  const footerTitles = document.querySelectorAll('.footer__title');
  if (footerTitles.length >= 3) {
    footerTitles[0].textContent = t('foot_nav');
    footerTitles[1].textContent = t('foot_services');
    footerTitles[2].textContent = t('foot_contact');
  }

  const footerCopyright = document.querySelector('.footer__bottom p');
  if (footerCopyright) footerCopyright.textContent = t('foot_copyright');

  // Footer nav links
  const footerNavLinks = document.querySelectorAll('.footer__links:first-of-type ul li a');
  footerNavLinks.forEach(a => {
    const page = a.dataset.page;
    if (page === 'home') a.textContent = t('nav_home');
    else if (page === 'services') a.textContent = t('nav_services');
    else if (page === 'booking') a.textContent = t('nav_booking') + ' Online';
    else if (page === 'about') a.textContent = t('nav_about');
    else if (page === 'contact') a.textContent = t('nav_contact');
  });

  // Chatbot
  const chatTitle = document.querySelector('#chatbot-window h4');
  if (chatTitle) chatTitle.textContent = t('chat_title');

  const chatStatus = document.querySelector('#chatbot-window h4 + span');
  if (chatStatus) chatStatus.textContent = t('chat_status');

  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.placeholder = t('chat_placeholder');

  const chatSend = document.getElementById('chat-send');
  if (chatSend) chatSend.textContent = t('chat_send');

  // Update welcome message (first chat bubble)
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const firstBubble = chatMessages.querySelector('div');
    if (firstBubble) firstBubble.textContent = t('chat_welcome');
  }
}

/** Handle language change */
function switchLanguage(langCode) {
  setLang(langCode);
  buildLanguageUI();
  updateStaticTexts();

  // Re-render current page immediately
  router.resolve();

  // Close dropdown
  const switcher = document.getElementById('lang-switcher');
  if (switcher) switcher.classList.remove('open');

  // Close mobile menu
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle) navToggle.classList.remove('active');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

/** Initialize language switcher event listeners */
function initLanguageSwitcher() {
  const switcher = document.getElementById('lang-switcher');
  const toggle = document.getElementById('lang-toggle');

  // Toggle dropdown
  if (toggle && switcher) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (switcher && !switcher.contains(e.target)) {
      switcher.classList.remove('open');
    }
  });

  // Desktop dropdown language selection
  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (btn) switchLanguage(btn.dataset.lang);
    });
  }

  // Mobile language buttons
  const mobileList = document.getElementById('mobile-lang-list');
  if (mobileList) {
    mobileList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (btn) switchLanguage(btn.dataset.lang);
    });
  }
}

// Setup Global UI Features (Navbar, Chatbot, Mobile Menu)
function setupGlobalUI() {
  // Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Sticky Navbar Blur Effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }
  });

  // Chatbot Widget
  const chatbotFab = document.getElementById('chatbot-fab');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (chatbotFab && chatbotWindow) {
    chatbotFab.addEventListener('click', () => {
      const isHidden = chatbotWindow.style.display === 'none' || !chatbotWindow.style.display;
      chatbotWindow.style.display = isHidden ? 'block' : 'none';
      if (isHidden && chatInput) chatInput.focus();
    });

    if (chatbotClose) {
      chatbotClose.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
      });
    }

    const sendMsg = () => {
      const text = chatInput?.value.trim();
      if (!text || !chatMessages) return;

      // Add user message
      const userBubble = document.createElement('div');
      userBubble.style.cssText = 'background: var(--gold-600); color: white; padding: 8px 12px; border-radius: 12px; border-top-right-radius: 2px; align-self: flex-end; max-width: 80%;';
      userBubble.textContent = text;
      chatMessages.appendChild(userBubble);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Automated assistant reply
      setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.style.cssText = 'background: white; padding: 10px 14px; border-radius: 12px; border-top-left-radius: 2px; box-shadow: var(--shadow-sm); max-width: 85%; line-height: 1.5;';

        const lower = text.toLowerCase();
        let reply = t('chat_reply_default');

        if (lower.includes('harga') || lower.includes('biaya') || lower.includes('paket') || lower.includes('price') || lower.includes('cost') || lower.includes('价格') || lower.includes('料金') || lower.includes('цена')) {
          reply = t('chat_reply_price');
        } else if (lower.includes('jadwal') || lower.includes('booking') || lower.includes('slot') || lower.includes('schedule') || lower.includes('预订') || lower.includes('予約') || lower.includes('расписание')) {
          reply = t('chat_reply_schedule');
        } else if (lower.includes('lokasi') || lower.includes('tempat') || lower.includes('ubud') || lower.includes('location') || lower.includes('位置') || lower.includes('場所') || lower.includes('местоположение')) {
          reply = t('chat_reply_location');
        }

        botBubble.textContent = reply;
        chatMessages.appendChild(botBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 700);
    };

    if (chatSend) chatSend.addEventListener('click', sendMsg);
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMsg();
      });
    }
  }

  // Initialize i18n
  document.documentElement.lang = getLang();
  buildLanguageUI();
  updateStaticTexts();
  initLanguageSwitcher();
}

let isInitialized = false;
function initApp() {
  if (isInitialized) return;
  isInitialized = true;
  setupGlobalUI();
  router.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
