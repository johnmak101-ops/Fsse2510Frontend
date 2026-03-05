/**
 * @file administrative Coupon configuration form
 * @module features/admin/components/AdminCouponForm
 * 
 * provides a structured interface for creating or updating discount vouchers.
 * features local state management to handle intermediate string values for numeric inputs, 
 * ensuring a fluid typing experience for decimal values (Min Spend, Discount Value).
 */

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateCouponRequest, Coupon } from "@/services/admin-coupon.service";
import { Loader2 } from "lucide-react";

/** properties for the AdminCouponForm component. */
interface CouponFormProps {
    /** existing coupon data for edit mode; null or undefined triggers create mode. */
    initialData?: Coupon | null;
    /** submission callback processing the structured coupon request. */
    onSubmit: (data: CreateCouponRequest) => Promise<void>;
}

/** 
 * specialized form for coupon metadata management. 
 * enforces uppercase codes and handles numeric type casting on submission.
 */
export default function AdminCouponForm({ initialData, onSubmit }: CouponFormProps) {
    // Use a local state type to handle input strings (allowing empty strings and decimals during typing)
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "FIXED" as "FIXED" | "PERCENTAGE",
        discountValue: "" as string | number,
        minSpend: "" as string | number,
        validUntil: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code,
                description: initialData.description,
                discountType: initialData.discountType,
                discountValue: initialData.discountValue,
                minSpend: initialData.minSpend,
                validUntil: initialData.validUntil
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Convert strings back to numbers for the API request
            const submitData: CreateCouponRequest = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minSpend: Number(formData.minSpend)
            };
            await onSubmit(submitData);
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to save coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!initialData;

    return (
        <DialogContent className="sm:max-w-[425px] bg-white text-stone-900 border-none shadow-2xl rounded-2xl p-8">
            <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-stone-900 tracking-tight text-left mb-6">{isEdit ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} className="grid gap-5">
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right text-stone-600 font-medium text-sm">Code</Label>
                    <Input
                        id="code"
                        value={formData.code}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="col-span-3 uppercase border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 transition-colors"
                        disabled={isEdit}
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right text-stone-600 font-medium text-sm">Desc</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                        className="col-span-3 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 transition-colors"
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="discountType" className="text-right text-stone-600 font-medium text-sm">Type</Label>
                    <div className="col-span-3">
                        <select
                            id="discountType"
                            value={formData.discountType}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
                            className="flex h-10 w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 transition-colors"
                        >
                            <option value="FIXED">Fixed Amount ($)</option>
                            <option value="PERCENTAGE">Percentage (%)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="discountValue" className="text-right text-stone-600 font-medium text-sm">Value</Label>
                    <Input
                        id="discountValue"
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="col-span-3 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 transition-colors"
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="minSpend" className="text-right text-stone-600 font-medium text-sm">Min Spend</Label>
                    <Input
                        id="minSpend"
                        type="number"
                        step="0.01"
                        value={formData.minSpend}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, minSpend: e.target.value })}
                        className="col-span-3 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 transition-colors"
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validUntil" className="text-right text-stone-600 font-medium text-sm">Expires</Label>
                    <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="col-span-3 border-stone-200 focus-visible:ring-stone-900 focus-visible:border-stone-900 transition-colors"
                        required
                    />
                </div>

                <DialogFooter className="mt-6 sm:justify-end">
                    <Button type="submit" disabled={isLoading} className="bg-stone-900 text-white hover:bg-black rounded-full px-8 h-10 px-8 py-2 font-medium tracking-wide">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
