/**
 * @file comprehensive Product management Form
 * @module features/admin/components/AdminProductForm
 * 
 * implements a high-complexity form for full product lifecycle management.
 * leverages `react-hook-form` with `zod` validation for strict data integrity.
 * features `useFieldArray` for dynamic management of multi-variant inventories and image galleries.
 */

"use client";

import { useForm, useFieldArray, FieldErrors, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types/product";
import { useState } from "react";
import { toast } from "sonner";
import { RiSave3Line, RiAddLine, RiDeleteBinLine, RiArrowLeftSLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/app/(admin)/admin/products/actions";
import Link from "next/link";
import { auth } from "@/lib/firebase";

/** schema for individual inventory variant records. */
const inventorySchema = z.object({
    id: z.number().nullish(), // Added ID for updates
    sku: z.string().min(1, "SKU is required"),
    stock: z.coerce.number().min(0, "Stock must be >= 0"),
    size: z.string().nullish(),
    color: z.string().nullish(),
    stockReserved: z.coerce.number().nullish(),
    weight: z.coerce.number().nullish(),
});

/** schema for supplemental product images. */
const imageSchema = z.object({
    id: z.number().nullish(),
    url: z.string().min(1, "URL is required"),
    tag: z.string().nullish(),
});

/** global product configuration schema. */
const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    price: z.coerce.number().min(0.01, "Price must be > 0"),
    description: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
    category: z.string().optional(),
    collection: z.string().optional(),
    productType: z.string().optional(),
    vendor: z.string().optional(),
    isNew: z.boolean().default(false),
    isSale: z.boolean().default(false),
    story: z.string().optional(),
    productIntro: z.string().optional(),
    fabricInfo: z.string().optional(),
    designStyling: z.string().optional(),
    colorDisclaimer: z.string().optional(),
    tags: z.string().optional(),
    inventories: z.array(inventorySchema).optional(),
    images: z.array(imageSchema).optional(),
});

/** inferred type for product form state. */
type ProductFormValues = z.infer<typeof productSchema>;

/** properties for the AdminProductForm component. */
interface ProductFormProps {
    /** existing product data for pre-population in edit mode. */
    product?: Product;
    /** boolean flag to toggle between creation and update logic. */
    isEditMode?: boolean;
}

/** 
 * primary data entry interface for the product catalog. 
 * handles complex nested state and visual previews for uploaded media.
 */
export default function AdminProductForm({ product, isEditMode }: ProductFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default Values
    const defaultValues: Partial<ProductFormValues> = {
        name: product?.name || "",
        slug: product?.slug || "",
        price: product?.price || 0,
        description: product?.description || "",
        imageUrl: product?.imageUrl || "",
        status: (product?.status === "PUBLIC" ? "ACTIVE" : (product?.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "DRAFT"),

        category: (product?.category || "").toUpperCase(),
        collection: product?.collection || "",
        productType: product?.productType || "",
        vendor: product?.details?.vendor || "",
        isNew: product?.isNew || false,
        isSale: product?.isSale || false,
        story: product?.details?.story || "",
        productIntro: product?.details?.productIntro || "",
        fabricInfo: product?.details?.fabricInfo || "",
        designStyling: product?.details?.designStyling || "",
        colorDisclaimer: product?.details?.colorDisclaimer || "",
        tags: product?.tags?.join(", ") || "",
        inventories: product?.inventories?.map(inv => ({
            id: inv.id, // Include ID to prevent duplicate SKU error on update
            sku: inv.sku,
            stock: inv.stock,
            size: inv.size,
            color: inv.color,
            stockReserved: inv.stockReserved,
            weight: inv.weight
        })) || [],
        images: product?.images?.map(img => ({
            id: img.id, // Include ID for images too
            url: img.url,
            tag: img.tag || ""
        })) || []
    };

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "inventories",
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: "images",
    });

    // Auto-generate slug from name if creating new
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setValue("name", title);
        if (!isEditMode && !form.getValues("slug")) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            form.setValue("slug", slug);
        }
    };



    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            // Get valid token from Firebase
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                toast.error("You must be logged in to save products.");
                setIsSubmitting(false);
                return;
            }

            // Convert tags string to array if needed
            const tagsList = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

            const payload = {
                ...data,
                tags: tagsList,
                inventories: data.inventories?.map(inv => ({
                    ...inv,
                    size: inv.size || undefined,
                    color: inv.color || undefined,
                    stockReserved: inv.stockReserved || undefined,
                    weight: inv.weight || undefined
                })),
                images: data.images?.map(img => ({
                    ...img,
                    tag: img.tag || undefined // Convert null/empty to undefined
                })),
            };

            let result;
            if (isEditMode && product) {
                result = await updateProductAction(product.pid, payload, token);
            } else {
                result = await createProductAction(payload, token);
            }

            if (result.success) {
                toast.success(isEditMode ? "Product updated!" : "Product created!");
                if (!isEditMode) {
                    router.push(`/admin/products/${result.data?.pid}`); // Go to edit page
                } else {
                    router.refresh();
                }
            } else {
                toast.error(result.error || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Error helper
    const getError = (path: keyof ProductFormValues) => form.formState.errors[path]?.message;

    const onInvalid = (errors: FieldErrors<ProductFormValues>) => {
        console.error("Validation Errors:", errors);
        const firstKey = Object.keys(errors)[0] as keyof ProductFormValues;
        const fieldError = errors[firstKey];
        const msg =
            (fieldError && "message" in fieldError ? fieldError.message : undefined) ??
            "Please check form requirements (red text)";
        toast.error(`Cannot Save: ${msg} (${firstKey as string})`);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10 pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between sticky top-20 z-40 bg-white/80 backdrop-blur-md py-4 -my-4 px-4 -mx-4 border-b border-stone-100">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="text-stone-400 hover:text-stone-900 transition-colors">
                        <RiArrowLeftSLine size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-serif text-stone-900">
                            {isEditMode ? `Edit Product #${product?.pid}` : "New Product"}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400">
                            {isEditMode ? "Update existing catalog item" : "Add a new item to catalog"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEditMode && product && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete this product?")) {
                                    setIsSubmitting(true);
                                    const res = await import("@/app/(admin)/admin/products/actions").then(m => m.deleteProductAction(product.pid));
                                    if (res.success) {
                                        toast.success("Product deleted");
                                        router.push("/admin/products");
                                    } else {
                                        toast.error(res.error);
                                        setIsSubmitting(false);
                                    }
                                }
                            }}
                            className="p-2 text-stone-400 hover:text-sale-red transition-colors"
                        >
                            <RiDeleteBinLine size={20} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-900/10"
                    >
                        {isSubmitting ? "Saving..." : <><RiSave3Line size={16} /> Save Product</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section: Basic Info */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-100 pb-4 mb-6">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Product Name</label>
                                <input
                                    {...form.register("name")}
                                    onChange={handleNameChange} // Override onChange to handle slug gen
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 text-sm font-medium transition-all"
                                    placeholder="e.g. Gelato Pique Striped Hoodie"
                                />
                                {getError("name") && <p className="text-sale-red text-[10px] font-bold">{getError("name")}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Price (USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...form.register("price")}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 text-sm font-medium transition-all"
                                    />
                                    {getError("price") && <p className="text-sale-red text-[10px] font-bold">{getError("price")}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Slug (URL Path)</label>
                                    <input
                                        {...form.register("slug")}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 text-sm font-mono text-stone-600 transition-all"
                                    />
                                    {getError("slug") && <p className="text-sale-red text-[10px] font-bold">{getError("slug")}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Description</label>
                                <textarea
                                    {...form.register("description")}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 text-sm transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Inventory */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900">
                                Inventory & Variants
                            </h3>
                            <button
                                type="button"
                                onClick={() => append({ sku: "", stock: 0, size: "F", color: "MWHT" })}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-900 hover:text-stone-900/80 transition-colors"
                            >
                                <RiAddLine size={16} /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.length === 0 && (
                                <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                    <p className="text-stone-400 text-sm">No inventory records added.</p>
                                </div>
                            )}

                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-stone-50 rounded-xl border border-stone-100 relative group">
                                    <div className="col-span-4 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">SKU</label>
                                        <input
                                            {...form.register(`inventories.${index}.sku`)}
                                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                                            placeholder="SKU-001"
                                        />
                                        {form.formState.errors.inventories?.[index]?.sku && (
                                            <p className="text-sale-red text-[9px]">{form.formState.errors.inventories[index]?.sku?.message}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">Size</label>
                                        <input
                                            {...form.register(`inventories.${index}.size`)}
                                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                                            placeholder="F"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">Color</label>
                                        <input
                                            {...form.register(`inventories.${index}.color`)}
                                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                                            placeholder="PNK"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">Stock</label>
                                        <input
                                            type="number"
                                            {...form.register(`inventories.${index}.stock`)}
                                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end h-full pt-4">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-stone-400 hover:text-sale-red transition-colors"
                                        >
                                            <RiDeleteBinLine size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section: Detailed Metadata */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-100 pb-4 mb-6">
                            Detailed Content
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Story</label>
                                <textarea {...form.register("story")} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Product Intro</label>
                                <textarea {...form.register("productIntro")} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Fabric Info</label>
                                <textarea {...form.register("fabricInfo")} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Design & Styling</label>
                                <textarea {...form.register("designStyling")} rows={3} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Settings */}
                <div className="space-y-8">
                    {/* Visibility */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Status</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 has-[:checked]:bg-stone-50 has-[:checked]:border-stone-900 cursor-pointer transition-all">
                                <input type="radio" value="ACTIVE" {...form.register("status")} className="accent-stone-900" />
                                <span className="text-sm font-medium text-stone-700">Active</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 has-[:checked]:bg-stone-50 has-[:checked]:border-stone-900 cursor-pointer transition-all">
                                <input type="radio" value="DRAFT" {...form.register("status")} className="accent-stone-900" />
                                <span className="text-sm font-medium text-stone-700">Draft</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 has-[:checked]:bg-stone-50 has-[:checked]:border-stone-900 cursor-pointer transition-all">
                                <input type="radio" value="ARCHIVED" {...form.register("status")} className="accent-stone-900" />
                                <span className="text-sm font-medium text-stone-700">Archived</span>
                            </label>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Organization</h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Vendor</label>
                            <input {...form.register("vendor")} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Product Type</label>
                            <input {...form.register("productType")} placeholder="e.g. Hoodie" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Collection</label>
                            <input {...form.register("collection")} placeholder="e.g. Winter 2026" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Category</label>
                            <select {...form.register("category")} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm">
                                <option value="">Select...</option>
                                <option value="WOMEN">WOMEN</option>
                                <option value="MEN">MEN</option>
                                <option value="UNISEX">UNISEX</option>
                                <option value="BABY">BABY</option>
                                <option value="HOME">HOME</option>
                            </select>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Main Media</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Main Image URL</label>
                            <input {...form.register("imageUrl")} placeholder="https://..." className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono break-all" />
                        </div>
                        {/* Preview */}
                        {form.watch("imageUrl") && (
                            <div className="mt-4 aspect-square rounded-xl bg-stone-100 overflow-hidden border border-stone-100 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={form.watch("imageUrl") || ""} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Image Gallery */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Gallery</h3>
                            <button
                                type="button"
                                onClick={() => appendImage({ url: "", tag: "" })}
                                className="text-[10px] font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1"
                            >
                                <RiAddLine size={14} /> Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {imageFields.map((field, index) => (
                                <div key={field.id} className="p-3 bg-stone-50 rounded-lg border border-stone-100 space-y-2 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 text-stone-400 hover:text-sale-red"
                                    >
                                        <RiDeleteBinLine size={14} />
                                    </button>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">Image URL</label>
                                        <input
                                            {...form.register(`images.${index}.url`)}
                                            className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs font-mono"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-stone-400">Tag (e.g. Front, Back)</label>
                                        <input
                                            {...form.register(`images.${index}.tag`)}
                                            className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs"
                                            placeholder="Optional tag"
                                        />
                                    </div>
                                    {/* Tiny Preview */}
                                    {form.watch(`images.${index}.url`) && (
                                        <div className="h-20 w-20 rounded overflow-hidden bg-stone-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                                            <img src={form.watch(`images.${index}.url`) || ""} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {imageFields.length === 0 && (
                                <p className="text-xs text-stone-400 italic text-center py-4">No additional images</p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Tags</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Comma Separated (Discount Logic)</label>
                            <textarea
                                {...form.register("tags")}
                                placeholder="SUMMER_SALE, NEW_SEASON"
                                rows={2}
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                            />
                            <p className="text-[10px] text-stone-400">Used for applying automated discounts or categorization.</p>
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">Flags</h3>
                        <label className="flex items-center justify-between p-2 cursor-pointer">
                            <span className="text-sm text-stone-600">Mark as New Arrival</span>
                            <input type="checkbox" {...form.register("isNew")} className="w-4 h-4 accent-stone-900" />
                        </label>
                        <label className="flex items-center justify-between p-2 cursor-pointer">
                            <span className="text-sm text-stone-600">Mark as On Sale</span>
                            <input type="checkbox" {...form.register("isSale")} className="w-4 h-4 accent-sale-red" />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}
