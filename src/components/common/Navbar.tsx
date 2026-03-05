/**
 * @file primary site-wide Navigation Bar
 * @module components/common/Navbar
 * 
 * orchestrates the main navigational experience, including dynamic categories, cart status, and user authorization.
 * supports adaptive styling (transparent vs. solid) based on scroll position and active route.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  RiShoppingBagLine,
  RiUserLine,
  RiMenuLine,
  RiArrowDownSLine,
  RiCloseLine, RiLogoutBoxRLine, RiUserSettingsLine
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useIsClient } from "@/hooks/useIsClient";
import { navigationService, NavigationItem } from "@/services/navigation.service";

/**
 * global navigation component.
 * features responsive mobile menus, category dropdowns, and live cart item counts.
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useIsClient();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);

  // determines if the current route requires a transparent header for hero integration.
  const isTransparentPage = pathname === "/" || pathname?.startsWith("/collections");
  const isStandardNavbar = !isTransparentPage;

  const { user, logout } = useAuthStore();
  const { totalQuantity } = useCartStore();

  useEffect(() => {
    /** handles adaptive background transitions on scroll. */
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setIsScrolled(window.scrollY > 30);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fetch dynamic category structure from the navigation service.
    navigationService.getPublicNavigation()
      .then(setNavItems)
      .catch(err => console.error("Failed to fetch navigation", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** terminates the current user session and redirects to home. */
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const shadowClass = (!isStandardNavbar && !isScrolled) ? "drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]" : "";

  /** resolves dynamic menu item types into semantic application URLs. */
  const getHref = (item: NavigationItem, parent?: NavigationItem) => {
    switch (item.action_type) {
      case "FILTER_COLLECTION":
        return `/collections?name=${encodeURIComponent(item.action_value)}`;
      case "FILTER_CATEGORY":
        return `/collections/${item.action_value}`;
      case "FILTER_PRODUCT_TYPE":
        // Context-aware URL resolution: if a child of a category, scope the filter to that category.
        const baseUrl = (parent && parent.action_type === "FILTER_CATEGORY")
          ? `/collections/${parent.action_value}`
          : "/collections/all";
        return `${baseUrl}?product_type=${encodeURIComponent(item.action_value)}`;
      case "FILTER_CUSTOM":
        return `/collections?${item.action_value}`;
      case "URL":
      default:
        return item.action_value || "#";
    }
  };

  // prevents hydration mismatch during server-side rendering by deferring visual state.
  if (!mounted) return <header className="w-full h-32 bg-transparent" />;

  return (
    <>
      <header
        className={cn(
          "w-full transition-all duration-700 ease-in-out",
          "h-20 xl:h-32",
          isStandardNavbar || isScrolled
            ? "bg-white border-b border-stone-100 shadow-sm"
            : "bg-white xl:bg-transparent border-b border-stone-100 xl:border-none shadow-sm xl:shadow-none"
        )}
      >
        {/* Subtle Visibility Mask for Transparent State */}
        {!isStandardNavbar && !isScrolled && (
          <div className="absolute inset-0 bg-linear-to-b from-black/15 to-transparent pointer-events-none transition-opacity duration-700 h-[120%]" />
        )}
        <div className="container mx-auto px-6 lg:px-8 h-full relative">
          <div className="flex items-center justify-between h-full">


            <div className="flex flex-1 items-center z-10">
              <>
                <button
                  className={cn("p-2 -ml-2 xl:hidden outline-none text-brand-text")}
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <RiMenuLine size={28} />
                </button>

                <NavigationMenu.Root className="hidden xl:block">
                  <NavigationMenu.List className="flex items-center xl:gap-2 2xl:gap-6">
                    {navItems.map((item, index) => (
                      <NavigationMenu.Item key={item.id} className="relative">
                        {item.children && item.children.length > 0 ? (
                          <>
                            <NavigationMenu.Trigger className={cn(
                              "group flex items-center gap-1 font-sans text-[13px] font-bold xl:tracking-[0.1em] 2xl:tracking-[0.25em] uppercase outline-none transition-all duration-300 xl:px-2 2xl:px-4 py-2 rounded-full",
                              (isScrolled || isStandardNavbar)
                                ? "text-brand-text hover:bg-brand-primary/60"
                                : cn("text-white hover:bg-white/20", shadowClass)
                            )}>
                              {item.label}
                              {item.is_new && (
                                <span className="ml-1 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">NEW</span>
                              )}
                              <RiArrowDownSLine size={16} className="transition-transform group-data-[state=open]:rotate-180" />
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Content className={cn(
                              "absolute top-[calc(100%+1rem)] min-w-[280px] bg-white border border-stone-100 shadow-2xl py-6 animate-in fade-in slide-in-from-top-2 rounded-2xl",
                              index === 0 ? "left-0" : "left-1/2 -translate-x-1/2"
                            )}>
                              <div className="flex flex-col px-2">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={getHref(child, item)}
                                    className="block px-6 py-3 font-sans text-[11px] font-bold tracking-[0.2em] text-brand-text hover:bg-brand-primary hover:pl-10 transition-all duration-300 uppercase rounded-xl"
                                  >
                                    {child.label}
                                    {child.is_new && (
                                      <span className="ml-2 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">NEW</span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </NavigationMenu.Content>
                          </>
                        ) : (
                          <Link href={getHref(item)} className={cn(
                            "font-sans text-[13px] font-bold xl:tracking-[0.1em] 2xl:tracking-[0.25em] uppercase transition-all duration-300 relative xl:px-2 2xl:px-4 py-2 rounded-full block",
                            (isScrolled || isStandardNavbar)
                              ? "text-brand-text hover:bg-brand-primary/60"
                              : cn("text-white hover:bg-white/20", shadowClass)
                          )}>
                            {item.label}
                            {item.is_new && (
                              <span className="absolute -top-3 -right-6 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">NEW</span>
                            )}
                          </Link>
                        )}
                      </NavigationMenu.Item>
                    ))}
                  </NavigationMenu.List>
                </NavigationMenu.Root>
              </>
            </div>


            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-40">
              <Link href="/" className="block transition-all duration-700 relative w-36 h-10 xl:w-48 2xl:w-64 xl:h-16 2xl:h-20">
                <Image
                  src="/images/logo/logo.webp"
                  alt="Gelato Pique"
                  fill
                  priority
                  loading="eager"
                  // Mobile Force Dark: No inversion on mobile! Only invert on Desktop when not scrolled/standalone.
                  className={cn("object-contain transition-all duration-700", (!isScrolled && !isStandardNavbar) && "xl:brightness-0 xl:invert")}
                  sizes="(max-width: 768px) 144px, (max-width: 1280px) 256px, 300px"
                />
              </Link>
            </div>


            <div className={cn(
              "flex flex-1 justify-end items-center gap-4 md:gap-6 xl:gap-4 2xl:gap-8 z-30",
              (isScrolled || isStandardNavbar) ? "text-brand-text" : "text-brand-text xl:text-white"
            )}>
              {/* Search Drawer Removed in v2.0 */}

              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className={cn("p-1.5 flex items-center gap-2 outline-none group", shadowClass)}>
                      <RiUserLine size={22} className="group-hover:opacity-70 transition-opacity" />
                      <span className="hidden 2xl:block font-sans text-[14px] font-bold tracking-[0.25em] uppercase truncate max-w-[150px] group-hover:opacity-70 transition-opacity">
                        {user.fullName || "Account"}
                      </span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="z-100 min-w-45 bg-white/95 backdrop-blur-md border border-stone-100 shadow-2xl p-2 rounded-2xl animate-in fade-in slide-in-from-top-2"
                      sideOffset={15}
                    >
                      <DropdownMenu.Item asChild>
                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase text-brand-text hover:bg-brand-primary hover:pl-8 rounded-xl transition-all duration-300 outline-none cursor-pointer">
                          <RiUserSettingsLine size={18} className="text-stone-400" />
                          Profile
                        </Link>
                      </DropdownMenu.Item>

                      {/* Show Dashboard Link for special users (e.g., admin email) */}
                      {user.email.includes("admin") && (
                        <DropdownMenu.Item asChild>
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase text-brand-text hover:bg-brand-primary hover:pl-8 rounded-xl transition-all duration-300 outline-none cursor-pointer">
                            <RiUserSettingsLine size={18} className="text-stone-400" />
                            Dashboard
                          </Link>
                        </DropdownMenu.Item>
                      )}

                      <DropdownMenu.Separator className="h-px bg-stone-100 my-1" />
                      <DropdownMenu.Item
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase text-sale-red hover:bg-stone-50 rounded-xl transition-colors outline-none cursor-pointer"
                      >
                        <RiLogoutBoxRLine size={18} className="text-sale-red/60" />
                        Logout
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <Link href="/login" className={cn("flex items-center gap-2 p-1.5 hover:opacity-70 transition-opacity text-brand-text xl:text-inherit", shadowClass)}>
                  <RiUserLine size={22} />
                  <span className="hidden 2xl:block font-sans text-[14px] font-bold tracking-[0.25em] uppercase">
                    Account
                  </span>
                </Link>
              )}

              <Link href="/cart" className={cn("relative p-1.5 hover:opacity-70 transition-opacity text-brand-text xl:text-inherit", shadowClass)}>
                <RiShoppingBagLine size={22} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sale-red text-[9px] font-bold text-white ring-2 ring-white/10">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>


      <aside className={cn(
        "fixed inset-y-0 left-0 z-100 w-[85%] max-w-[320px] bg-white transition-transform duration-500 xl:hidden shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div className="relative w-32 h-10">
              <Image src="/images/logo/logo.webp" alt="Logo" fill className="object-contain" sizes="128px" />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-text">
              <RiCloseLine size={32} className="text-stone-400" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <div key={item.id} className="border-b border-stone-50">
                {item.children && item.children.length > 0 ? (
                  <div className="py-6 space-y-4">
                    <span className="font-sans text-[11px] font-bold tracking-[0.3em] uppercase text-stone-300 px-4">
                      {item.label}
                      {item.is_new && <span className="ml-2 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">NEW</span>}
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={getHref(child, item)}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand-text py-3 px-3 rounded-xl transition-all duration-300 hover:bg-brand-primary/20 active:bg-brand-primary/40 active:scale-[0.98]"
                        >
                          {child.label}
                          {child.is_new && <span className="ml-1 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">N</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={getHref(item)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-6 px-4 font-sans text-sm font-bold tracking-[0.2em] uppercase text-brand-text transition-all duration-300 hover:bg-brand-primary/30 hover:pl-8 active:bg-brand-primary/50"
                  >
                    {item.label}
                    {item.is_new && <span className="ml-2 text-[8px] bg-sale-red text-white px-1 py-0.5 rounded-full">NEW</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 xl:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}
