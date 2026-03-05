/**
 * @file persistent site-wide Footer
 * @module components/common/Footer
 * 
 * renders the global footer with brand messaging, navigational links, and social integrations.
 * uses a semi-transparent brand-themed background to fit the Gelato Pique aesthetic.
 */

"use client";

import Link from "next/link";
import {
  RiInstagramLine,
  RiFacebookCircleFill,
  RiTwitterXLine,
  RiVisaLine,
  RiMastercardLine,
  RiPaypalLine
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * global footer component.
 * handles dynamic year calculation and responsive layout for multi-column navigation.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary/50 border-t border-brand-primary/20 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 px-4 md:px-0">

          {/* brand information and social connectivity. */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="block">
              <span className="font-serif text-2xl font-bold tracking-widest text-brand-text">
                GELATO PIQUE
              </span>
            </Link>
            <p className="text-brand-text/80 leading-relaxed text-sm max-w-sm">
              Grown-up dessert for your room wear. We offer a &quot;fashionable room wear&quot; to your relaxing time at home.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="https://instagram.com" icon={<RiInstagramLine size={20} />} label="Instagram" />
              <SocialLink href="https://facebook.com" icon={<RiFacebookCircleFill size={20} />} label="Facebook" />
              <SocialLink href="https://twitter.com" icon={<RiTwitterXLine size={18} />} label="X (Twitter)" />
            </div>
          </div>

          {/* prioritized shop navigation categories. */}
          <div className="lg:col-span-7 lg:pl-12">
            <FooterColumn title="Shop Navigation">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                <FooterLink href="/collections/new">New Arrivals</FooterLink>
                <FooterLink href="/collections/women">Women</FooterLink>
                <FooterLink href="/collections/men">Men</FooterLink>
                <FooterLink href="/collections/pet">Pet</FooterLink>
                <FooterLink href="/collections/home">Home</FooterLink>
                <FooterLink href="/membership/info">Membership</FooterLink>
              </div>
            </FooterColumn>
          </div>

        </div>

        {/* copyright and payment provider logos. */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-brand-primary/20 text-xs text-brand-text/50">
          <p>© {currentYear} Gelato Pique Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 opacity-70">
            <RiVisaLine size={24} />
            <RiMastercardLine size={24} />
            <RiPaypalLine size={24} />
            <span className="border border-brand-text/20 text-brand-text/70 rounded px-1.5 py-0.5 text-[10px] font-bold">AMEX</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/** internal helper for organizing vertical link lists. */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-serif font-bold text-brand-text">{title}</h4>
      <nav className="flex flex-col gap-2.5">
        {children}
      </nav>
    </div>
  );
}

/** styled link wrapper for footer navigation. handles semantic span fallback for missing hrefs. */
function FooterLink({ href, children, className }: { href?: string; children: React.ReactNode; className?: string }) {
  if (!href) {
    return (
      <span
        className={cn(
          "text-sm text-brand-text/70 transition-colors hover:text-brand-text cursor-default",
          className
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-brand-text/70 transition-colors hover:text-brand-text hover:underline hover:underline-offset-4",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** circular social media link icon with hover elevation. */
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-brand-text transition-all hover:bg-brand-primary hover:text-brand-text hover:scale-110"
    >
      {icon}
    </a>
  );
}