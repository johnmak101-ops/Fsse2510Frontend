/**
 * @file primary product Detail view (Client)
 * @module features/product/components/ProductDetailsClient
 * 
 * orchestrates the complex interaction logic for the product detail page.
 * manages variant selections (color/size), real-time stock synchronization, and wishlist integrations.
 * features automated quantity clamping based on per-variant inventory levels.
 */

"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RiHeartLine, RiHeartFill } from "@remixicon/react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { useStockCheck } from "@/hooks/useStockCheck";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProductImageGallery from "./ProductImageGallery";
import ProductPriceDisplay from "./ProductPriceDisplay";
import ProductVariantSelector from "./ProductVariantSelector";

/** properties for the ProductDetailsClient component. */
interface ProductDetailsClientProps {
  /** The initial product data from SSR hydration. */
  product: Product;
}

/**
 * immersive product detail component.
 * coordinates multi-faceted product state including images, pricing, and variants.
 */
export default function ProductDetailsClient({ product: initialProduct }: ProductDetailsClientProps) {
  const { data: activeProduct, isFetching } = useStockCheck(initialProduct.slug);
  const [hasSynced, setHasSynced] = useState(false);

  if (!hasSynced && activeProduct && !isFetching) {
    setHasSynced(true);
  }

  const product = activeProduct ?? initialProduct;
  const isSyncing = isFetching && !hasSynced;

  const router = useRouter();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } =
    useWishlistStore();

  const inventories = product.inventories ?? [];
  const availableColors = Array.from(new Set(inventories.map((inv) => inv.color)));

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const first = inventories.find(
      (inv) => inv.color === (availableColors[0] ?? "") && inv.stock > 0
    );
    return first?.size ?? inventories.find((inv) => inv.color === (availableColors[0] ?? ""))?.size ?? "";
  });
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = inventories.find(
    (inv) => inv.color === selectedColor && inv.size === selectedSize
  );
  const cartItem = cartItems.find((item) => item.sku === selectedVariant?.sku);
  const quantityInCart = cartItem?.cartQuantity ?? 0;
  const remainingStock = selectedVariant
    ? Math.max(0, selectedVariant.stock - quantityInCart)
    : 0;

  const isInWishlist = wishlistItems.some((item) => item.pid === product.pid);

  // Clamp quantity when variant stock changes
  if (quantity > remainingStock && remainingStock > 0) {
    setQuantity(remainingStock);
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const firstAvailableSize =
      inventories.find((inv) => inv.color === color && inv.stock > 0)?.size ??
      inventories.find((inv) => inv.color === color)?.size ??
      "";
    setSelectedSize(firstAvailableSize);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please login to add items to your cart");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!selectedVariant) { toast.error("Please select a variant"); return; }
    if (quantity > remainingStock) {
      toast.error(`Only ${remainingStock} items available for this variant.`);
      return;
    }
    try {
      await addItem({
        pid: product.pid,
        slug: product.slug,
        sku: selectedVariant.sku,
        name: product.name,
        imageUrl: selectedVariant.imageUrl ?? product.imageUrl ?? "",
        price: product.price,
        originalPrice: product.originalPrice,
        discountAmount: product.discountAmount,
        discountPercentage: product.discountPercentage,
        promotionBadgeTexts: product.promotionBadgeTexts,
        cartQuantity: quantity,
        stock: selectedVariant.stock,
        selectedSize: selectedVariant.size,
        selectedColor: selectedVariant.color,
        category: product.category,
        collection: product.collection,
        tags: product.tags,
      });
      toast.success("Added to cart", {
        className: "font-sans text-xs font-bold uppercase tracking-wider",
      });
    } catch {
      // handled inside addItem
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.info("Please login to manage your wishlist");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.pid);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product.pid);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  if (!product) return null;

  return (
    <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-20">
      {/* ── LEFT: Image Gallery ── */}
      <ProductImageGallery
        product={product}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        isSyncing={isSyncing}
      />

      {/* ── RIGHT: Product Info ── */}
      <div className="lg:col-span-5 flex flex-col pt-4">
        {/* Category + Name */}
        <div className="mb-6">
          <p className="text-[14px] font-bold tracking-[0.3em] text-stone-400 uppercase mb-2">
            {product.category}
          </p>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price + Badge */}
          <ProductPriceDisplay product={product} isSyncing={isSyncing} />
        </div>

        {/* Variant Selector + Quantity */}
        <ProductVariantSelector
          inventories={inventories}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          quantity={quantity}
          remainingStock={remainingStock}
          onColorChange={handleColorChange}
          onSizeChange={setSelectedSize}
          onQuantityChange={setQuantity}
          selectedVariantSku={selectedVariant?.sku}
        />

        {/* ── CTA Buttons ── */}
        <div className="flex gap-3 mb-8 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || remainingStock <= 0}
            className="flex-1 bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-[0.98] disabled:bg-stone-200"
          >
            {selectedVariant && remainingStock > 0 ? "Add to Shopping Bag" : "Out of Stock"}
          </button>
          <button
            onClick={handleToggleWishlist}
            className="p-5 border border-stone-200 hover:bg-stone-50 transition-colors group"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? (
              <RiHeartFill size={20} className="text-red-500 scale-110 transition-transform duration-200" />
            ) : (
              <RiHeartLine size={20} className="text-stone-600 group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* ── Accordion: Description + Details + Tags ── */}
        <Accordion type="single" collapsible className="w-full" defaultValue="description">
          {product.description && (
            <AccordionItem value="description" className="border-t border-stone-100 last:border-b">
              <AccordionTrigger className="text-[11px] font-bold uppercase tracking-widest py-5">
                Description
              </AccordionTrigger>
              <AccordionContent className="text-xs text-stone-500 leading-relaxed font-sans whitespace-pre-line">
                {product.description}
              </AccordionContent>
            </AccordionItem>
          )}

          {product.details &&
            Object.entries(product.details)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <AccordionItem key={key} value={key} className="border-t border-stone-100 last:border-b">
                  <AccordionTrigger className="text-[11px] font-bold uppercase tracking-widest py-5">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-stone-500 leading-relaxed font-sans whitespace-pre-line">
                    {String(value)}
                  </AccordionContent>
                </AccordionItem>
              ))}

          {product.tags && product.tags.length > 0 && (
            <AccordionItem value="tags" className="border-t border-stone-100 last:border-b">
              <AccordionTrigger className="text-[11px] font-bold uppercase tracking-widest py-5">
                Tags
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pb-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-stone-200 text-stone-500 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </section>
  );
}
