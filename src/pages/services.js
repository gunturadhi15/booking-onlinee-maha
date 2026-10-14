/**
 * Services Listing & Detail Pages
 */
import { SERVICES, PACKAGES, formatCurrency, getPackagesByService, getCategories } from '../data.js';
import { t, translateDuration } from '../i18n.js';

export function renderServices() {
  const categories = getCategories();

  return `
    <section class="page-hero">
      <div class="container">
        <span class="overline">${t('svc_page_overline')}</span>
        <h1 class="heading-1">${t('svc_page_heading')}</h1>
        <div class="divider-gold"></div>
        <p class="subtitle">${t('svc_page_subtitle')}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <!-- Search & Filter -->
        <div class="search-bar fade-in" id="search-filter">
          <input type="text" class="search-bar__input" placeholder="${t('svc_search_placeholder')}" 
                 id="search-input" aria-label="Search" />
          <div class="filter-tags" id="filter-tags">
            <button class="filter-tag active" data-filter="all">${t('svc_filter_all')}</button>
            ${categories.map(cat => `
              <button class="filter-tag" data-filter="${cat}">${cat}</button>
            `).join('')}
          </div>
        </div>

        <!-- Services Grid -->
        <div class="services__grid stagger" id="services-grid">
          ${SERVICES.filter(s => s.status === 'active').map(service => {
            const packages = getPackagesByService(service.service_id);
            const popular = packages.find(p => p.popular) || packages[0];
            const srvKey = service.service_id.toLowerCase();
            const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;
            const srvDesc = t(`data_${srvKey}_desc`) !== `data_${srvKey}_desc` ? t(`data_${srvKey}_desc`) : service.description;
            return `
              <div class="service-card" 
                 data-service="${service.service_id}" data-category="${service.category}"
                 data-name="${service.service_name.toLowerCase()}">
                <a href="#/layanan/${service.slug}" class="service-card__img" style="display: block;">
                  <img src="/src/assets/${service.slug}.jpg" alt="${srvName}"
                       onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #D4A000, #8C6900)';" />
                  <span class="service-card__badge badge badge--teal">${service.category}</span>
                </a>
                <div class="service-card__body">
                  <p class="service-card__category">${service.category}</p>
                  <h3 class="service-card__title">
                    <a href="#/layanan/${service.slug}" style="color: inherit; text-decoration: none;">${srvName}</a>
                  </h3>
                  <p class="service-card__desc">${srvDesc}</p>
                  <div class="service-card__meta">
                    <span class="service-card__price">
                      ${popular ? formatCurrency(popular.price) : ''}<small>${t('services_per_package')}</small>
                    </span>
                    <span class="service-card__duration">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      ${packages.length} ${t('svc_packages_count')}
                    </span>
                  </div>
                  <div class="service-card__actions" style="display: flex; gap: var(--space-3); margin-top: var(--space-5);">
                    <a href="#/layanan/${service.slug}" class="btn btn--secondary btn--sm" style="flex: 1; text-align: center;">
                      Detail
                    </a>
                    <a href="#/booking?service=${service.service_id}" class="btn btn--primary btn--sm" style="flex: 1; text-align: center;" data-page="booking">
                      ${t('nav_booking_cta')}
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

export function initServicesFilter() {
  const searchInput = document.getElementById('search-input');
  const filterTags = document.querySelectorAll('.filter-tag');
  const grid = document.getElementById('services-grid');

  if (!grid) return;

  let activeFilter = 'all';

  function filterServices() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const cards = grid.querySelectorAll('.service-card');
    
    cards.forEach(card => {
      const name = card.dataset.name || '';
      const category = card.dataset.category || '';
      const matchSearch = name.includes(searchTerm) || category.toLowerCase().includes(searchTerm);
      const matchFilter = activeFilter === 'all' || category === activeFilter;
      
      card.style.display = matchSearch && matchFilter ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterServices);
  }

  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeFilter = tag.dataset.filter;
      filterServices();
    });
  });
}

export function renderServiceDetail(params) {
  const slug = params.slug;
  const service = SERVICES.find(s => s.slug === slug);
  
  if (!service) {
    return `
      <section class="section" style="text-align: center; padding-top: calc(var(--navbar-height) + var(--space-16));">
        <div class="container">
          <h1 class="heading-2">${t('svc_not_found_title')}</h1>
          <p class="subtitle" style="margin: var(--space-4) auto var(--space-8);">${t('svc_not_found_desc')}</p>
          <a href="#/layanan" class="btn btn--primary">${t('svc_back_catalog')}</a>
        </div>
      </section>
    `;
  }

  const packages = getPackagesByService(service.service_id);
  const srvKey = service.service_id.toLowerCase();
  const srvName = t(`data_${srvKey}_name`) !== `data_${srvKey}_name` ? t(`data_${srvKey}_name`) : service.service_name;
  const srvDesc = t(`data_${srvKey}_desc`) !== `data_${srvKey}_desc` ? t(`data_${srvKey}_desc`) : service.description;

  return `
    <section class="service-detail">
      <div class="container">
        <!-- Hero -->
        <div class="service-detail__hero fade-in">
          <img src="/src/assets/${service.slug}.jpg" alt="${srvName}"
               onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #5C4228, #2A1E12)';" />
          <div class="service-detail__hero-overlay"></div>
          <div class="service-detail__hero-text">
            <span class="badge badge--teal" style="margin-bottom: var(--space-3);">${service.category}</span>
            <h1 class="heading-1" style="color: white; font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));">${srvName}</h1>
          </div>
        </div>

        <!-- Content -->
        <div class="service-detail__grid">
          <div class="fade-in-left">
            <h2 class="heading-3" style="margin-bottom: var(--space-4);">${t('svc_about_service')}</h2>
            <p style="color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--space-8);">
              ${srvDesc}
            </p>

            <h2 class="heading-3" style="margin-bottom: var(--space-6);">${t('svc_choose_package')}</h2>
            
            <div style="display: flex; flex-direction: column; gap: var(--space-6);" class="stagger">
              ${packages.map(pkg => `
                <div class="package-card ${pkg.popular ? 'popular' : ''}" data-package="${pkg.package_id}">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4);">
                    <div>
                      <h3 class="package-card__name">${pkg.package_name}</h3>
                      <p class="package-card__duration">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        ${translateDuration(pkg.duration)}
                      </p>
                    </div>
                    <div class="package-card__price">
                      ${formatCurrency(pkg.price)}
                      <small>${t('svc_per_person')}</small>
                    </div>
                  </div>
                  
                  <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">
                    ${pkg.description}
                  </p>

                  <div class="package-card__benefits">
                    ${pkg.benefits.map(b => `
                      <div class="package-card__benefit">${b}</div>
                    `).join('')}
                  </div>

                  <a href="#/booking?service=${service.service_id}&package=${pkg.package_id}" 
                     class="btn btn--primary btn--lg" style="width: 100%;" data-page="booking">
                    ${t('svc_book_package')}
                  </a>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Sidebar -->
          <div class="fade-in-right">
            <div class="booking-summary">
              <h3 class="booking-summary__title">${t('svc_booking_info')}</h3>
              
              <div style="margin-bottom: var(--space-5);">
                <div class="booking-summary__row">
                  <span class="label">${t('svc_hours')}</span>
                  <span class="value">09:00 - 17:00</span>
                </div>
                <div class="booking-summary__row">
                  <span class="label">${t('svc_location')}</span>
                  <span class="value">Ubud, Bali</span>
                </div>
                <div class="booking-summary__row">
                  <span class="label">${t('svc_payment')}</span>
                  <span class="value">Online</span>
                </div>
              </div>

              <div style="background: var(--gold-50); padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-5);">
                <p style="font-size: var(--text-sm); color: var(--earth-600);">
                  <strong>💡 Tips:</strong> ${t('svc_tip')}
                </p>
              </div>

              <a href="#/booking?service=${service.service_id}" class="btn btn--primary btn--lg" style="width: 100%;" data-page="booking">
                ${t('svc_book_service')}
              </a>
              
              <a href="https://wa.me/6281234567890?text=Halo, saya tertarik dengan ${srvName}" 
                 target="_blank" class="btn btn--secondary btn--lg" 
                 style="width: 100%; margin-top: var(--space-3);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                ${t('svc_ask_wa')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
