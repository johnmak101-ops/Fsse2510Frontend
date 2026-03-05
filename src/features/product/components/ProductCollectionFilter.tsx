/**
 * @file navigational catalog Filter
 * @module features/product/components/ProductCollectionFilter
 * 
 * provides advanced filtering and sorting capabilities for product collections.
 * utilizes `nuqs` for synchronized URL-based state management, enabling shareable filtered URLs.
 * implements custom price range validation with floating-point precision guards.
 */

"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { RiArrowRightSLine, RiArrowDownSLine } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductAttributes } from "@/services/product.service";
import { parseAsString } from "nuqs";

/** properties for the ProductCollectionFilter component. */
interface CollectionFilterProps {
  /** The human-readable title of the current collection or category. */
  categoryTitle: string;
  /** optional set of unique attributes for dynamic filter generation (future scope). */
  attributes?: ProductAttributes;
  /** toggle for showing category-specific filter buttons. */
  showCategoryFilter?: boolean;
}

/**
 * multi-dimensional product filter.
 * coordinates price ranges, categories, and sorting strategies.
 */
export default function ProductCollectionFilter({
  categoryTitle,
  showCategoryFilter = true,
}: CollectionFilterProps) {
  // --- Nuqs Hooks ---
  // Sort functionality is handled via Nuqs
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsString.withDefault("newest").withOptions({ shallow: false }));
  const [categories, setCategories] = useQueryState("categories", parseAsString.withOptions({ shallow: false }));

  const [price, setPrice] = useQueryState("price", parseAsString.withOptions({ shallow: false }));

  // Local state for custom price inputs
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [isPriceError, setIsPriceError] = React.useState(false);

  // Sync inputs with URL when price state changes
  React.useEffect(() => {
    if (price && price.includes("-")) {
      const [min, max] = price.split("-");
      setMinPrice(min);
      setMaxPrice(max === "9999" ? "" : max);
    } else if (!price) {
      setMinPrice("");
      setMaxPrice("");
    }
    setIsPriceError(false);
  }, [price]);

  const handlePriceInputChange = (val: string, setter: (v: string) => void) => {
    // Allows only numbers and up to 2 decimal places, max 5 digits before dot
    const regex = /^\d{0,5}(\.\d{0,2})?$/;
    if (regex.test(val) || val === "") {
      setter(val);
      setIsPriceError(false); // Reset error while typing
    }
  };

  const handleApplyCustomPrice = () => {
    const min = minPrice || "0";
    const max = maxPrice || "9999";

    // Strict range check
    if (parseFloat(min) > 99999.99 || parseFloat(max) > 99999.99) {
      toast.error("Price cannot exceed 99999.99");
      setIsPriceError(true);
      return;
    }

    if (parseFloat(min) > parseFloat(max)) {
      toast.error("Min price cannot be greater than Max price.");
      setIsPriceError(true);
      return;
    }

    setIsPriceError(false);
    setPrice(`${min}-${max}`);
  };

  const SORT_OPTIONS = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  const currentSort = SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0];

  const toggleCategory = (cat: string) => {
    const current = categories?.split(",").filter(Boolean) || [];
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setCategories(updated.length > 0 ? updated.join(",") : null);
  };

  return (
    <div className="w-full bg-white border-b border-stone-100">
      {/* 1. Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 gap-4 md:gap-0">
        <nav className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-stone-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <RiArrowRightSLine size={12} className="text-stone-300" />
          <span className="text-stone-900">{categoryTitle}</span>
        </nav>

        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto">
          {/* --- Filter Dropdown --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:text-black transition-colors">
                Filter <RiArrowDownSLine size={14} className="text-stone-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-4 flex flex-col gap-4">
              {/* Category Filter */}
              {showCategoryFilter && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Category</span>
                  <div className="flex flex-wrap gap-2">
                    {["Unisex", "Men", "Women", "Home", "Pet"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat.toLowerCase())}
                        className={cn(
                          "px-3 py-1 text-[10px] border border-stone-200 rounded-full transition-colors",
                          categories?.split(",").includes(cat.toLowerCase()) ? "bg-stone-900 text-white border-stone-900" : "hover:bg-stone-50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Price Range</span>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Under $80", value: "0-80" },
                    { label: "$80 - $500", value: "80-500" },
                    { label: "$500 - $1000", value: "500-1000" },
                    { label: "Over $1000", value: "1000-9999" }
                  ].map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPrice(price === p.value ? null : p.value)}
                      className={cn(
                        "text-left text-[11px] py-1 transition-colors",
                        price === p.value ? "text-black font-bold" : "text-stone-500"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Price Range Inputs */}
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block">Custom Range</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => handlePriceInputChange(e.target.value, setMinPrice)}
                      className={cn(
                        "w-full px-2 py-1.5 bg-stone-50 border rounded text-[11px] focus:outline-none focus:ring-1 transition-colors",
                        isPriceError ? "border-sale-red focus:ring-sale-red/20" : "border-stone-200 focus:ring-stone-900/10"
                      )}
                    />
                    <span className="text-stone-300">-</span>
                    <input
                      type="text"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => handlePriceInputChange(e.target.value, setMaxPrice)}
                      className={cn(
                        "w-full px-2 py-1.5 bg-stone-50 border rounded text-[11px] focus:outline-none focus:ring-1 transition-colors",
                        isPriceError ? "border-sale-red focus:ring-sale-red/20" : "border-stone-200 focus:ring-stone-900/10"
                      )}
                    />
                  </div>
                  <button
                    onClick={handleApplyCustomPrice}
                    className="w-full py-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-stone-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Reset All */}
              <button
                onClick={() => {
                  setCategories(null);
                  setPrice(null);
                }}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-colors underline"
              >
                Clear All
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- Sort Dropdown --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:text-black transition-colors">
                Sort: {currentSort.label} <RiArrowDownSLine size={14} className="text-stone-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(currentSort.value === opt.value && "bg-stone-50 font-bold")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
