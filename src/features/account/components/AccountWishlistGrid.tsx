"use client";

import { useEffect, useState } from "react";
import { wishlistService } from "@/services/wishlist.service";
import { WishlistItem } from "@/types/wishlist";
import Image from "next/image";
import Link from "next/link";
import { RiCloseLine, RiHeartFill } from "@remixicon/react";

export default function AccountWishlistGrid() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = () => {
        wishlistService.getWishlist()
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (pid: number) => {
        try {
            await wishlistService.removeWishlistItem(pid);
            setItems(prev => prev.filter(i => i.pid !== pid));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-400 text-xs tracking-widest animate-pulse">LOADING WISHLIST...</div>;

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <RiHeartFill size={48} className="text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 font-serif">Your wishlist is empty</p>
                <Link href="/collections/all" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text underline underline-offset-4 hover:text-brand-primary">
                    Browse Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <div key={item.pid} className="group relative flex flex-col gap-3">
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-stone-100">
                        <Link href={`/product/${item.slug || item.pid}`}>
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </Link>

                        {/* Remove Button */}
                        <button
                            onClick={() => handleRemove(item.pid)}
                            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-400 hover:text-sale-red transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <RiCloseLine size={16} />
                        </button>

                        {/* Stock Status Badge */}
                        {item.stockStatus !== "In Stock" && (
                            <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">
                                {item.stockStatus}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center">
                        <Link href={`/product/${item.slug || item.pid}`}>
                            <h3 className="text-xs font-bold text-brand-text truncate hover:text-brand-primary transition-colors">
                                {item.name}
                            </h3>
                        </Link>
                        <div className="text-sm font-serif text-stone-500 mt-1">
                            ${item.price.toFixed(2)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
