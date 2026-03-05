/**
 * @file searchable product selection Picker
 * @module features/admin/components/AdminProductPicker
 * 
 * provides a specialized search-and-tag interface for linking products to promotions or showcases.
 * features debounced API lookups and immediate exact-match resolution for numeric product IDs.
 * stores selected products in local state to ensure visual persistence of chips across searches.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { productService } from "@/services/product.service";
import Image from "next/image";
import { Product } from "@/types/product";
import { Loader2, X, Search, Check } from "lucide-react";

/** properties for the AdminProductPicker component. */
interface ProductPickerProps {
    /** currently selected product IDs. */
    value: number[];
    /** callback returning updated ID array. */
    onChange: (value: number[]) => void;
    /** boolean flag to trigger error boundary styling. */
    error?: boolean;
}

/** 
 * dynamic product lookup component. 
 * optimizes administrative workflows by allowing quick association of inventory items via search query.
 */
export default function AdminProductPicker({ value, onChange, error }: ProductPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial load: Fetch details for initial IDs if any
    useEffect(() => {
        const fetchInitial = async () => {
            if (value.length > 0 && selectedProducts.length === 0) {
                // Fetch products one by one (Optimization: Should ideally have a bulk fetch endpoint, but loop is okay for small edits)
                try {
                    const fetched = await Promise.all(
                        value.map(async (id) => {
                            try {
                                return await productService.getProductById(id);
                            } catch {
                                return null;
                            }
                        })
                    );
                    setSelectedProducts(fetched.filter((p): p is Product => p !== null));
                } catch (e) {
                    console.error("Failed to load initial products", e);
                }
            }
        };
        fetchInitial();
    }, [value, selectedProducts.length]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                // If query is a number, try fetching by ID directly or include it in search
                const isNumeric = /^\d+$/.test(query);

                const searchRes = await productService.searchProducts({
                    searchText: query,
                    limit: 5 // Limit suggestions
                });

                let foundProducts = searchRes.content;

                // Simple "Exact ID match" prepend if numeric
                if (isNumeric) {
                    try {
                        const pid = parseInt(query);
                        const directProduct = await productService.getProductById(pid);
                        // Prevent dupes if search already returned it
                        if (directProduct && !foundProducts.find(p => p.pid === directProduct.pid)) {
                            foundProducts = [directProduct, ...foundProducts];
                        }
                    } catch {
                        // ID not found, ignore
                    }
                }

                setResults(foundProducts);
                setIsOpen(true);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (product: Product) => {
        if (!value.includes(product.pid)) {
            const newValue = [...value, product.pid];
            onChange(newValue);
            setSelectedProducts([...selectedProducts, product]);
        }
        setQuery("");
        setIsOpen(false);
    };

    const handleRemove = (pid: number) => {
        const newValue = value.filter(id => id !== pid);
        onChange(newValue);
        setSelectedProducts(selectedProducts.filter(p => p.pid !== pid));
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search product name or ID..."
                    className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 pl-9 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                    ${error ? "border-red-500 focus-visible:ring-red-500" : "border-stone-200 focus-visible:ring-stone-900"}
                    `}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {results.map((product) => (
                        <div
                            key={product.pid}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors
                            ${value.includes(product.pid) ? 'bg-stone-50' : ''}`}
                            onClick={() => handleSelect(product)}
                        >
                            <div className="h-10 w-10 shrink-0 bg-stone-100 rounded overflow-hidden">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-stone-900 truncate">{product.name}</div>
                                <div className="text-xs text-stone-500">ID: {product.pid}</div>
                            </div>
                            {value.includes(product.pid) && (
                                <Check className="h-4 w-4 text-stone-900" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Chips */}
            {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                        <div
                            key={product.pid}
                            className="flex items-center gap-2 bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full text-sm border border-stone-200"
                        >
                            <span className="font-medium text-xs text-stone-500">#{product.pid}</span>
                            <span className="truncate max-w-[150px]">{product.name}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(product.pid)}
                                className="hover:bg-stone-200 rounded-full p-0.5 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
