export interface SocialLink {
  id: string;
  title: string;
  url: string;
}

export interface NavItem {
  id: string;
  label: string;
}

export interface HeaderContent {
  brandName: string;
  brandSubtitle: string;
  socialsButtonText: string;
  socialsModalTitle: string;
  socials: SocialLink[];
  navItems: NavItem[];
}

export interface HeroContent {
  bgImage: string;
  locationBadge: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  sectionTag: string;
  title: string;
  image: string;
  badgeCity: string;
  badgeStreet: string;
  badgeSub: string;
  paragraphs: string[];
  features: FeatureItem[];
}

export interface HighlightCard {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface AdditionalDrink {
  title: string;
  desc: string;
}

export interface MenuContent {
  sectionTag: string;
  title: string;
  subtitle: string;
  porcelainBadge: string;
  highlightCards: HighlightCard[];
  additionalDrinksTag: string;
  additionalDrinksTitle: string;
  additionalDrinks: AdditionalDrink[];
}

export interface EventOrCraftCard {
  id: string;
  title: string;
  description: string;
  note?: string;
  image: string;
  icon?: string;
}

export interface EventsAndCraftContent {
  sectionTag: string;
  title: string;
  subtitle: string;
  cards: EventOrCraftCard[];
}

export interface HoursCardContent {
  title: string;
  weekdaysLabel?: string;
  weekdaysSchedule: string;
  weekendsLabel?: string;
  weekendsSchedule: string;
  mainSchedule?: string;
  note: string;
}

export interface TouristsCardContent {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface CrossingBannerContent {
  title: string;
  description: string;
}

export interface HoursAndTouristsContent {
  sectionTag: string;
  title: string;
  subtitle: string;
  hoursCard: HoursCardContent;
  touristsCard: TouristsCardContent;
  crossingBanner: CrossingBannerContent;
}

export interface FooterContent {
  brandName: string;
  brandSubtitle: string;
  description: string;
  addressTitle: string;
  address: string;
  landmark: string;
  mapsButtonText?: string;
  mapsUrl?: string;
  navTitle: string;
  socialsTitle: string;
  telegramLabel?: string;
  telegramUrl: string;
  vkLabel?: string;
  vkUrl: string;
  guideLabel?: string;
  guideUrl: string;
  copyright: string;
  bottomAddress?: string;
}

export interface SiteContent {
  header: HeaderContent;
  hero: HeroContent;
  about: AboutContent;
  menu: MenuContent;
  eventsAndCraft: EventsAndCraftContent;
  hoursAndTourists: HoursAndTouristsContent;
  footer: FooterContent;
}
