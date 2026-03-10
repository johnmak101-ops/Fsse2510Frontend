/**
 * @file product Administration Server Actions
 * @module app/admin/products/actions
 * 
 * manages product lifecycle mutations (CRUD) initiated by administrative users.
 * implements a multi-path revalidation strategy to ensure consistency across both public catalog and admin dashboard.
 */

"use server";

import { adminProductService, CreateProductRequestDto, UpdateProductRequestDto } from "@/services/admin-product.service";
import { Product } from "@/types/product";
import { revalidatePath } from "next/cache";

/**
 * creates a new product and purges the administrative and public product lists.
 * 
 * @param data - product creation payload.
 * @param token - Administrative authorization token.
 */
export async function createProductAction(data: CreateProductRequestDto, token?: string) {
    try {
        const result = await adminProductService.createProduct(data, token);
        revalidatePath("/admin/products");
        revalidatePath("/products");
        revalidatePath("/", "layout"); // Broad revalidation
        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("Failed to create product:", error);
        const message = error instanceof Error ? error.message : "Failed to create product";
        return { success: false, error: message };
    }
}

/**
 * updates an existing product.
 * dynamically revalidates public-facing slug paths if the update results in a slug change.
 */
export async function updateProductAction(pid: number, data: UpdateProductRequestDto, token?: string) {
    try {
        const result = await adminProductService.updateProduct(pid, data, token);

        revalidatePath(`/admin/products/${pid}`);
        revalidatePath("/admin/products");
        revalidatePath("/", "layout"); // Broad revalidation

        if (result.slug) {
            // WHY: revalidate all potential cached paths where this product might be rendered as a detail page.
            revalidatePath(`/products/${result.slug}`);
            revalidatePath(`/public/products/${result.slug}`);
        }

        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("Failed to update product:", error);
        const message = error instanceof Error ? error.message : "Failed to update product";
        return { success: false, error: message };
    }
}

/**
 * deletes a product and updates the admin listing.
 */
export async function deleteProductAction(pid: number, token?: string) {
    try {
        await adminProductService.deleteProduct(pid, token);
        revalidatePath("/admin/products");
        revalidatePath("/", "layout"); // Broad revalidation
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to delete product:", error);
        const message = error instanceof Error ? error.message : "Failed to delete product";
        return { success: false, error: message };
    }
}

/**
 * updates product-specific metadata/details independently of the core product fields.
 */
export async function updateProductMetadataAction(pid: number, details: Product["details"], token?: string) {
    try {
        const result = await adminProductService.updateProductMetadata(pid, details, token);

        revalidatePath(`/products/${result.slug}`);
        revalidatePath(`/admin/products/${pid}`);

        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("Failed to update product metadata:", error);
        const message = error instanceof Error ? error.message : "Failed to update metadata";
        return { success: false, error: message };
    }
}
