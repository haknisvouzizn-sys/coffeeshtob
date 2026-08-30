/**
 * Server-side content sanitizer and validator
 */

export function sanitizeString(val: unknown, maxLen = 2000): string {
  if (typeof val !== 'string') return '';
  let cleaned = val.trim();
  // Strip any <script...> or javascript: or data:text/html or event handlers
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/on\w+="[^"]*"/gi, '');
  cleaned = cleaned.replace(/on\w+='[^']*'/gi, '');
  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen);
  }
  return cleaned;
}

export function validateSafeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Only allow http://, https://, /, or mailto:/tel:
  if (/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(trimmed)) {
    return sanitizeString(trimmed, 1000);
  }
  return '';
}

export function validateImagePath(path: unknown): string {
  if (typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  // Prevent directory traversal
  if (trimmed.includes('..')) return '';
  if (/^(\/images\/|https?:\/\/|data:image\/)/i.test(trimmed)) {
    return sanitizeString(trimmed, 1000);
  }
  return sanitizeString(trimmed, 1000);
}

/**
 * Validates and sanitizes the whole SiteContent structure
 */
export function sanitizeSiteContent(raw: any): any {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Некорректный формат данных контента');
  }

  const result: any = {};

  // 1. Header
  const header = raw.header || {};
  result.header = {
    brandName: sanitizeString(header.brandName || 'Кофештаб', 100),
    brandSubtitle: sanitizeString(header.brandSubtitle || 'Романов на Волге', 100),
    socialsButtonText: sanitizeString(header.socialsButtonText || 'Соцсети', 50),
    socialsModalTitle: sanitizeString(header.socialsModalTitle || 'Соцсети', 100),
    socials: Array.isArray(header.socials)
      ? header.socials.map((s: any) => ({
          id: sanitizeString(s.id || 'link', 50),
          title: sanitizeString(s.title || '', 100),
          url: validateSafeUrl(s.url),
        }))
      : [],
    navItems: Array.isArray(header.navItems)
      ? header.navItems.map((n: any) => ({
          id: sanitizeString(n.id || '', 50),
          label: sanitizeString(n.label || '', 100),
        }))
      : [],
  };

  // 2. Hero
  const hero = raw.hero || {};
  result.hero = {
    bgImage: validateImagePath(hero.bgImage),
    locationBadge: sanitizeString(hero.locationBadge || '', 200),
    title: sanitizeString(hero.title || '', 200),
    description: sanitizeString(hero.description || '', 1000),
    primaryButtonText: sanitizeString(hero.primaryButtonText || 'Что у нас есть', 60),
    secondaryButtonText: sanitizeString(hero.secondaryButtonText || 'О штабе', 60),
  };

  // 3. About
  const about = raw.about || {};
  result.about = {
    sectionTag: sanitizeString(about.sectionTag || 'О ШТАБЕ', 50),
    title: sanitizeString(about.title || '', 200),
    image: validateImagePath(about.image),
    badgeCity: sanitizeString(about.badgeCity || 'Романов', 50),
    badgeStreet: sanitizeString(about.badgeStreet || '', 100),
    badgeSub: sanitizeString(about.badgeSub || '', 100),
    paragraphs: Array.isArray(about.paragraphs)
      ? about.paragraphs.map((p: any) => sanitizeString(p, 2000))
      : [],
    features: Array.isArray(about.features)
      ? about.features.map((f: any) => ({
          id: sanitizeString(f.id || 'feat', 50),
          icon: sanitizeString(f.icon || 'Sparkles', 50),
          title: sanitizeString(f.title || '', 100),
          description: sanitizeString(f.description || '', 500),
        }))
      : [],
  };

  // 4. Menu
  const menu = raw.menu || {};
  result.menu = {
    sectionTag: sanitizeString(menu.sectionTag || 'ЧЕМ УГОЩАЕМ', 50),
    title: sanitizeString(menu.title || 'Меню', 200),
    subtitle: sanitizeString(menu.subtitle || '', 200),
    porcelainBadge: sanitizeString(menu.porcelainBadge || '', 200),
    highlightCards: Array.isArray(menu.highlightCards)
      ? menu.highlightCards.map((c: any) => ({
          id: sanitizeString(c.id || 'card', 50),
          title: sanitizeString(c.title || '', 100),
          description: sanitizeString(c.description || '', 500),
          image: validateImagePath(c.image),
        }))
      : [],
    additionalDrinksTag: sanitizeString(menu.additionalDrinksTag || 'ДРУГИЕ НАПИТКИ', 50),
    additionalDrinksTitle: sanitizeString(menu.additionalDrinksTitle || '', 100),
    additionalDrinks: Array.isArray(menu.additionalDrinks)
      ? menu.additionalDrinks.map((d: any) => ({
          title: sanitizeString(d.title || '', 100),
          desc: sanitizeString(d.desc || '', 300),
        }))
      : [],
  };

  // 5. Events and Craft
  const events = raw.eventsAndCraft || {};
  result.eventsAndCraft = {
    sectionTag: sanitizeString(events.sectionTag || 'ЧЕМ ЖИВЕМ', 50),
    title: sanitizeString(events.title || 'Жизнь штаба', 200),
    subtitle: sanitizeString(events.subtitle || '', 200),
    cards: Array.isArray(events.cards)
      ? events.cards.map((c: any) => ({
          id: sanitizeString(c.id || 'card', 50),
          title: sanitizeString(c.title || '', 100),
          description: sanitizeString(c.description || '', 1000),
          note: sanitizeString(c.note || '', 500),
          image: validateImagePath(c.image),
          icon: sanitizeString(c.icon || 'Music', 50),
        }))
      : [],
  };

  // 6. Hours and Tourists
  const ht = raw.hoursAndTourists || {};
  const hc = ht.hoursCard || {};
  const tc = ht.touristsCard || {};
  const cb = ht.crossingBanner || {};
  result.hoursAndTourists = {
    sectionTag: sanitizeString(ht.sectionTag || 'КАК НАС НАЙТИ', 50),
    title: sanitizeString(ht.title || '', 200),
    subtitle: sanitizeString(ht.subtitle || '', 200),
    hoursCard: {
      title: sanitizeString(hc.title || 'График работы', 100),
      weekdaysLabel: sanitizeString(hc.weekdaysLabel || '', 100),
      weekdaysSchedule: sanitizeString(hc.weekdaysSchedule || '', 100),
      weekendsLabel: sanitizeString(hc.weekendsLabel || '', 100),
      weekendsSchedule: sanitizeString(hc.weekendsSchedule || '', 100),
      mainSchedule: sanitizeString(hc.mainSchedule || '', 150),
      note: sanitizeString(hc.note || '', 300),
    },
    touristsCard: {
      title: sanitizeString(tc.title || 'Гостям города', 100),
      description: sanitizeString(tc.description || '', 1000),
      buttonText: sanitizeString(tc.buttonText || '', 100),
      buttonUrl: validateSafeUrl(tc.buttonUrl),
    },
    crossingBanner: {
      title: sanitizeString(cb.title || '', 150),
      description: sanitizeString(cb.description || '', 500),
    },
  };

  // 7. Footer
  const footer = raw.footer || {};
  result.footer = {
    brandName: sanitizeString(footer.brandName || 'Кофештаб', 100),
    brandSubtitle: sanitizeString(footer.brandSubtitle || 'РОМАНОВ НА ВОЛГЕ', 100),
    description: sanitizeString(footer.description || '', 500),
    addressTitle: sanitizeString(footer.addressTitle || 'ГДЕ МЫ НАХОДИМСЯ', 100),
    address: sanitizeString(footer.address || '', 300),
    landmark: sanitizeString(footer.landmark || '', 300),
    mapsButtonText: sanitizeString(footer.mapsButtonText || 'Открыть на Яндекс.Картах', 100),
    mapsUrl: validateSafeUrl(footer.mapsUrl),
    navTitle: sanitizeString(footer.navTitle || 'НАВИГАЦИЯ', 50),
    socialsTitle: sanitizeString(footer.socialsTitle || 'МЫ НА СВЯЗИ', 50),
    telegramLabel: sanitizeString(footer.telegramLabel || 'Telegram-канал', 100),
    telegramUrl: validateSafeUrl(footer.telegramUrl),
    vkLabel: sanitizeString(footer.vkLabel || 'ВКонтакте', 100),
    vkUrl: validateSafeUrl(footer.vkUrl),
    guideLabel: sanitizeString(footer.guideLabel || 'Гид по Романову', 100),
    guideUrl: validateSafeUrl(footer.guideUrl),
    copyright: sanitizeString(footer.copyright || '', 200),
    bottomAddress: sanitizeString(footer.bottomAddress || '', 200),
  };

  return result;
}
