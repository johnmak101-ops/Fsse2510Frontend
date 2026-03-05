import { productService } from "@/services/product.service";
import AdminProductForm from "@/features/admin/components/AdminProductForm";
import { notFound } from "next/navigation";

interface AdminProductEditPageProps {
    params: Promise<{ pid: string }>;
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
    const { pid } = await params;
    const pidNum = parseInt(pid);

    if (isNaN(pidNum)) return notFound();

    let product;
    try {
        product = await productService.getProductById(pidNum);
    } catch (error) {
        console.error(error);
        return notFound();
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <AdminProductForm product={product} isEditMode={true} />
        </div>
    );
}
