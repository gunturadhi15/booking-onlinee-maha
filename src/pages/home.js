/**
 * Home Page
 */
import { SERVICES, PACKAGES, COMPANY, formatCurrency, getPackagesByService } from '../data.js';
import { t, translateDuration } from '../i18n.js';

export function renderHome() {
  // Get one popular package per service for preview
  const previewServices = SERVICES.filter(s => s.status === 'active').map(service => {
    const packages = getPackagesByService(service.service_id);
    const popular = packages.find(p => p.popular) || packages[0];
    return { ...service, popularPackage: popular };
  });

  return `
    <!-- HERO -->
    <section class="hero" id="hero-section">
      <div class="hero__bg">
        <img src="/src/assets/hero-bg.jpg" alt="Bali spiritual journey" 
             onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #2A1E12 0%, #5C4228 40%, #3D2C1A 100%)';" />
      </div>
      <div class="hero__overlay"></div>
      <div class="hero__particles" id="hero-particles"></div>
      
      <div class="hero__content">

        <h1 class="hero__title">
          ${t('hero_title_1')} <span>${t('hero_title_highlight')}</span><br/>${t('hero_title_2')}
        </h1>
        <p class="hero__subtitle">
          ${t('hero_subtitle')}
        </p>
        <div class="hero__actions">
          <a href="#/layanan" class="btn btn--primary btn--lg" data-page="services">
            ${t('hero_btn_services')}
          </a>
          <a href="#/booking" class="btn btn--ghost btn--lg" data-page="booking">
            ${t('hero_btn_booking')}
          </a>
        </div>
      </div>
      
      <div class="hero__scroll">
        <span>${t('hero_scroll')}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>

    <!-- SERVICES PREVIEW -->
    <section class="section services-preview" id="services-section">
      <div class="container">
        <div class="section__header fade-in">
          <span class="overline">${t('services_overline')}</span>
          <h2 class="heading-2">${t('services_heading')}</h2>
          <div class="divider-gold"></div>
          <p class="subtitle">
            ${t('services_subtitle')}
          </p>
        </div>
        
        <div class="services__grid stagger">
          ${previewServices.map(service => {
            const srvKey = service.service_id.toLowerCase();
            const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;
            const srvDesc = t(`data_${srvKey}_desc`) !== `data_${srvKey}_desc` ? t(`data_${srvKey}_desc`) : service.description;
            return `
            <a href="#/layanan/${service.slug}" class="service-card" data-service="${service.service_id}">
              <div class="service-card__img">
                <img src="/src/assets/${service.slug}.jpg" alt="${srvName}"
                     onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #D4A000, #8C6900)';" />
                <span class="service-card__badge badge badge--teal">${service.category}</span>
              </div>
              <div class="service-card__body">
                <p class="service-card__category">${service.category}</p>
                <h3 class="service-card__title">${srvName}</h3>
                <p class="service-card__desc">${srvDesc}</p>
                <div class="service-card__meta">
                  <span class="service-card__price">
                    ${service.popularPackage ? formatCurrency(service.popularPackage.price) : ''}
                    <small>${t('services_per_package')}</small>
                  </span>
                  <span class="service-card__duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    ${service.popularPackage ? translateDuration(service.popularPackage.duration) : ''}
                  </span>
                </div>
              </div>
            </a>
          `}).join('')}
        </div>

        <div style="text-align: center; margin-top: var(--space-10);" class="fade-in">
          <a href="#/layanan" class="btn btn--secondary btn--lg" data-page="services">
            ${t('services_view_all')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats-bar" id="stats-section">
      <div class="container">
        <div class="stats__grid stagger">
          <div class="stat">
            <div class="stat__number" data-count="2500">0</div>
            <div class="stat__label">${t('stat_customers')}</div>
          </div>
          <div class="stat">
            <div class="stat__number" data-count="150">0</div>
            <div class="stat__label">${t('stat_tours')}</div>
          </div>
          <div class="stat">
            <div class="stat__number" data-count="50">0</div>
            <div class="stat__label">${t('stat_retreats')}</div>
          </div>
          <div class="stat">
            <div class="stat__number" data-count="98">0</div>
            <div class="stat__label">${t('stat_satisfaction')}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT PREVIEW -->
    <section class="section about-preview" id="about-section">
      <div class="container">
        <div class="about-preview__grid">
          <div class="about-preview__img fade-in-left">
            <img src="/src/assets/about-preview.jpg" alt="Sacred Journey Bali team"
                 onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #B89F7A, #5C4228)'; this.parentElement.style.aspectRatio='4/5';" />
          </div>
          <div class="about-preview__content fade-in-right">
            <span class="overline">${t('about_overline')}</span>
            <h2 class="heading-2">${t('about_heading')}</h2>
            <div class="divider-gold" style="margin: var(--space-4) 0;"></div>
            <p class="subtitle">
              ${t('data_company_desc')}
            </p>
            <div class="about-values">
              ${COMPANY.values.map((v, i) => `
                <div class="about-value">
                  <div class="about-value__icon">${v.icon}</div>
                  <div class="about-value__text">
                    <h4>${t(`data_company_val${i + 1}_title`)}</h4>
                    <p>${t(`data_company_val${i + 1}_desc`)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <a href="#/tentang-kami" class="btn btn--secondary" data-page="about">
              ${t('about_more')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section" id="cta-section">
      <div class="cta-section__bg">
        <img src="/src/assets/cta-bg.jpg" alt="Bali temple"
             onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #2A1E12, #5C4228)';" />
      </div>
      <div class="cta-section__overlay"></div>
      <div class="container">
        <div class="cta-section__content fade-in">
          <h2 class="heading-2">${t('cta_heading')}</h2>
          <div class="divider-gold"></div>
          <p class="subtitle">
            ${t('cta_subtitle')}
          </p>
          <a href="#/booking" class="btn btn--primary btn--lg" data-page="booking">
            ${t('hero_btn_booking')}
          </a>
        </div>
      </div>
    </section>
  `;
}

// Initialize hero particles
export function initHomeEffects() {
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero__particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      particle.style.width = `${2 + Math.random() * 4}px`;
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
  }

  // Counter animation
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('id-ID') + (el.parentElement.querySelector('.stat__label')?.textContent.includes('%') ? '%' : '+');
  }, 30);
}
