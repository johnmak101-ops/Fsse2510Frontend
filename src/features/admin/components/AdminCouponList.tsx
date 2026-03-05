/**
 * @file active Coupon management board
 * @module features/admin/components/AdminCouponList
 * 
 * renders a dashboard of all valid promotional coupons with inline CRUD capabilities.
 * integrates with `adminCouponService` for data persistence and `AdminCouponForm` for modal entries.
 */

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Coupon, adminCouponService, CreateCouponRequest } from "@/services/admin-coupon.service";
import AdminCouponForm from "./AdminCouponForm";
import { Dialog } from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

/** 
 * administrative coupon control center. 
 * handles state for coupon data fetching, selection for edits, and deletion confirmations.
 */
export default function AdminCouponList() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await adminCouponService.getValidCoupons();
            setCoupons(data);
        } catch (error) {
            console.error("Failed to load coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedCoupon(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsDialogOpen(true);
    };

    const handleDelete = async (code: string) => {
        if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
            try {
                await adminCouponService.deleteCoupon(code);
                loadCoupons();
            } catch (error) {
                console.error("Failed to delete coupon", error);
                alert("Failed to delete coupon");
            }
        }
    };

    const handleFormSubmit = async (data: CreateCouponRequest) => {
        if (selectedCoupon) {
            // Update
            await adminCouponService.updateCoupon(selectedCoupon.code, {
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minSpend: data.minSpend,
                validUntil: data.validUntil
            });
        } else {
            // Create
            await adminCouponService.createCoupon(data);
        }
        setIsDialogOpen(false);
        loadCoupons();
    };

    if (loading && coupons.length === 0) {
        return <AdminLoadingState message="Loading coupons..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900">Coupons</h1>
                <Button onClick={handleCreate} className="bg-stone-900 text-white hover:bg-stone-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Coupon
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-stone-50 border-b border-stone-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-stone-600">Code</th>
                            <th className="px-6 py-4 font-semibold text-stone-600">Type</th>
                            <th className="px-6 py-4 font-semibold text-stone-600">Value</th>
                            <th className="px-6 py-4 font-semibold text-stone-600">Min Spend</th>
                            <th className="px-6 py-4 font-semibold text-stone-600">Expires</th>
                            <th className="px-6 py-4 font-semibold text-stone-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {coupons.map((coupon) => (
                            <tr key={coupon.code} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-stone-900">{coupon.code}</td>
                                <td className="px-6 py-4 text-stone-600">
                                    <span className="px-2 py-1 bg-stone-100 rounded text-xs">
                                        {coupon.discountType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-green-600">
                                    {coupon.discountType === 'PERCENTAGE'
                                        ? `${(coupon.discountValue * 100).toFixed(0)}%`
                                        : `$${coupon.discountValue}`}
                                </td>
                                <td className="px-6 py-4 text-stone-500">${coupon.minSpend}</td>
                                <td className="px-6 py-4 text-stone-500">
                                    {format(new Date(coupon.validUntil), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-900"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.code)}
                                        className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-300 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                                    No coupons found. Click &apos;Create Coupon&apos; to add one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AdminCouponForm
                    initialData={selectedCoupon}
                    onSubmit={handleFormSubmit}
                />
            </Dialog>
        </div>
    );
}
