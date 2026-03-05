/**
 * @file showcase Collection Administration Actions
 * @module app/admin/showcase-actions
 * 
 * handles administrative mutations for homepage showcase collections and banners.
 * synchronizes changes with the public storefront via targeted revalidation.
 */

'use server'

import { adminService } from "@/services/showcase-admin.service";
import { revalidatePath } from "next/cache";

/**
 * saves or updates a showcase collection entry.
 * maps FormData to the internal collection structure and revalidates structural pages.
 */
export async function saveShowcaseAction(formData: FormData, token: string) {
    const id = formData.get("id");
    const data = {
        id: id ? Number(id) : undefined,
        title: formData.get("title") as string,
        imageUrl: (formData.get("imageUrl") as string) || undefined,
        bannerUrl: (formData.get("bannerUrl") as string) || undefined,
        tag: formData.get("tag") as string,
        orderIndex: Number(formData.get("orderIndex") || 0),
        active: formData.get("active") === "true",
    };

    try {
        await adminService.saveShowcaseCollection(data, token);
        // WHY: revalidate the root path and administrative lists to reflect the updated structural data.
        revalidatePath("/");
        revalidatePath("/admin/slider");
        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error) {
        console.error("Failed to save showcase:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to save" };
    }
}

/**
 * removes a showcase collection entry.
 */
export async function deleteShowcaseAction(id: number, token: string) {
    try {
        await adminService.deleteShowcaseCollection(id, token);
        revalidatePath("/");
        revalidatePath("/admin/slider");
        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete showcase:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete" };
    }
}
