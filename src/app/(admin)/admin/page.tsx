/**
 * @file High-level Admin Dashboard
 * @module app/(admin)/admin/page
 * 
 * serves as the central hub for administrative operations.
 * provides visual navigation to core modules including Products, Navigation, and Banners.
 */

import Link from "next/link";
import {
    ShoppingBag,
    Layers,
    Image as ImageIcon,
    Navigation as NavigationIcon,
} from "lucide-react";

/** 
 * entry point for the administrative management panel. 
 * renders a grid of actionable modules mapped to specific system configuration areas.
 */
export default function AdminDashboardPage() {
    const modules = [
        {
            title: "Products",
            description: "Manage your product catalog, prices, and inventory.",
            href: "/admin/products",
            icon: ShoppingBag,
            color: "bg-blue-50 text-blue-600",
        },
        {
            title: "Navigation",
            description: "Customize the main menu and navigation structure.",
            href: "/admin/navigation",
            icon: NavigationIcon,
            color: "bg-purple-50 text-purple-600",
        },
        {
            title: "Home Slider",
            description: "Update the hero slider images on the homepage.",
            href: "/admin/slider",
            icon: ImageIcon,
            color: "bg-pink-50 text-pink-600",
        },
        {
            title: "Collection Banners",
            description: "Set specific banners for different collections.",
            href: "/admin/banners",
            icon: Layers,
            color: "bg-amber-50 text-amber-600",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-brand-text mb-2">Dashboard</h1>
                <p className="text-brand-text/60">Welcome to the Gelato Pique Admin Panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        className="group block p-6 rounded-xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-stone-900/20"
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${module.color} transition-transform group-hover:scale-110 duration-300`}>
                            <module.icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-medium text-brand-text mb-2 group-hover:text-stone-900 transition-colors">
                            {module.title}
                        </h2>
                        <p className="text-sm text-stone-500 line-clamp-2">
                            {module.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
