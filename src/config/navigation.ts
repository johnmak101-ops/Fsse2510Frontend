/**
 * Gelato Pique Revamp v2.0 - Navigation Configuration
 * Purpose: Centralized navigation data for Header, Mobile Drawer, and Footer.
 */

export interface NavCategory {
  label: string;
  slug: string; // Using slug for URL is safer (Defensive)
}

export interface NavItem {
  label: string;
  href?: string;
  categories?: NavCategory[];
  isNew?: boolean;
  isDynamic?: boolean;
}


export const NAV_ITEMS: NavItem[] = [
  {
    label: "WOMEN",
    href: "/collections/women"
  },
  {
    label: "MEN",
    href: "/collections/men"
  },
  {
    label: "UNISEX",
    href: "/collections/unisex"
  },
  {
    label: "PET",
    href: "/collections/pet"
  },
  {
    label: "HOME",
    href: "/collections/home"
  },
  {
    label: "COLLECTIONS",
    isDynamic: true
  }
];

/**
 * Defensive Helper: Get all Slugs for Static Site Generation (SSG)
 */
export const getAllNavigationSlugs = () => {
  const slugs: string[] = [];
  NAV_ITEMS.forEach(item => {
    if (item.href) slugs.push(item.href);
    item.categories?.forEach(cat => slugs.push(cat.slug));
  });
  return slugs;
};