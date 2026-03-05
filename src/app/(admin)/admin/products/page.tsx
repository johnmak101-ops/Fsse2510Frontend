import { productService } from "@/services/product.service";
import Link from "next/link";
import AdminInfiniteProductTable from "@/features/admin/components/AdminInfiniteProductTable";

export default async function AdminProductsPage() {
    // Fetch initial data on server side for SSR + hydration
    const initialData = await productService.searchProducts({ limit: 50 });

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 mb-4">Product Management</h1>
                    <p className="text-sm text-stone-500 font-sans tracking-wide">
                        View and manage product metadata and custom attributes.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                    >
                        New Product
                    </Link>
                </div>
            </div>

            <AdminInfiniteProductTable initialData={initialData} />
        </div>
    );
}
