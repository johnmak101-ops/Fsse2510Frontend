/**
 * @file user Address Entry and validation form
 * @module features/account/components/AccountAddressForm
 * 
 * provides a structured interface for adding or modifying shipping addresses.
 * implements custom regex-based validation for localized (Hong Kong focused) contact data.
 * leverages `sonner` for transactional feedback on validation failures.
 */

"use client";

import React, { FormEvent, useState } from "react";
import { CreateShippingAddressRequest, ShippingAddress } from "@/services/address.service";
import { toast } from "sonner";

/** properties for the AddressForm component. */
interface AddressFormProps {
    /** existing address data for pre-population in edit mode. */
    address?: ShippingAddress;
    /** callback function triggered on valid form submission. */
    onSave: (data: CreateShippingAddressRequest) => Promise<void>;
    /** callback to dismiss the form without saving changes. */
    onCancel: () => void;
    /** state-driven flag to manage submission loading visuals. */
    isSaving: boolean;
}

/** 
 * specialized form for shipping address management. 
 * handles field-level state and provides immediate visual validation feedback.
 */
export default function AccountAddressForm({ address, onSave, onCancel, isSaving }: AddressFormProps) {
    const [formData, setFormData] = useState<CreateShippingAddressRequest>({
        recipientName: address?.recipientName || "",
        phoneNumber: address?.phoneNumber || "",
        addressLine1: address?.addressLine1 || "",
        addressLine2: address?.addressLine2 || "",
        city: address?.city || "",
        stateProvince: address?.stateProvince || "",
        postalCode: address?.postalCode || "",
        isDefault: address?.isDefault || false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        const nameRegex = /^[\p{L}\s]+$/u;
        if (!formData.recipientName.trim()) {
            newErrors.recipientName = "Recipient name is required";
        } else if (formData.recipientName.trim().length < 2) {
            newErrors.recipientName = "Name must be at least 2 characters";
        } else if (!nameRegex.test(formData.recipientName)) {
            newErrors.recipientName = "Name must only contain letters and spaces";
        }

        const phoneRegex = /^\+?[0-9\-\s()]{6,28}[0-9]$/;
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (formData.phoneNumber.trim().length < 8) {
            newErrors.phoneNumber = "Phone number must be at least 8 characters";
        } else if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Invalid format (e.g. +852 9123 4567)";
        }

        if (!formData.addressLine1.trim()) {
            newErrors.addressLine1 = "Address Line 1 is required";
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Incomplete Details", {
                description: "Please refine the highlighted fields to proceed."
            });
            return;
        }

        try {
            await onSave(formData);
        } catch (error: unknown) {
            console.error("Save address failed", error);
            const axiosError = error as { response?: { data?: { errors?: Array<{ field: string; defaultMessage: string }> } }; message?: string };

            if (axiosError.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                axiosError.response.data.errors.forEach((err) => {
                    backendErrors[err.field] = err.defaultMessage;
                });
                setErrors(prev => ({ ...prev, ...backendErrors }));
            }
            toast.error("Process Failed", {
                description: axiosError.message || "Please check your information and try again."
            });
        }
    };

    const inputClasses = (fieldName: string) => `
        w-full px-4 py-2 border rounded focus:ring-0 transition-colors text-sm
        ${errors[fieldName]
            ? "border-red-500 bg-red-50/30 focus:border-red-600"
            : "border-stone-200 focus:border-brand-text"}
    `;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Recipient Name *
                    </label>
                    <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => {
                            setFormData({ ...formData, recipientName: e.target.value });
                            if (errors.recipientName) setErrors({ ...errors, recipientName: "" });
                        }}
                        className={inputClasses("recipientName")}
                        placeholder="John Doe"
                    />
                    {errors.recipientName && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.recipientName}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                            setFormData({ ...formData, phoneNumber: e.target.value });
                            if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
                        }}
                        className={inputClasses("phoneNumber")}
                        placeholder="+852 9123 4567"
                    />
                    {errors.phoneNumber && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phoneNumber}</p>}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Address Line 1 *
                </label>
                <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => {
                        setFormData({ ...formData, addressLine1: e.target.value });
                        if (errors.addressLine1) setErrors({ ...errors, addressLine1: "" });
                    }}
                    className={inputClasses("addressLine1")}
                    placeholder="Unit 12A, Tower 1"
                />
                {errors.addressLine1 && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.addressLine1}</p>}
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Address Line 2 (Optional)
                </label>
                <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className={inputClasses("addressLine2")}
                    placeholder="Happy Valley Gardens"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        City *
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => {
                            setFormData({ ...formData, city: e.target.value });
                            if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        className={inputClasses("city")}
                        placeholder="Hong Kong"
                    />
                    {errors.city && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        State / Province
                    </label>
                    <input
                        type="text"
                        value={formData.stateProvince}
                        onChange={(e) => setFormData({ ...formData, stateProvince: e.target.value })}
                        className={inputClasses("stateProvince")}
                        placeholder="HKSAR"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Postal Code
                    </label>
                    <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className={inputClasses("postalCode")}
                        placeholder="000000"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 py-2">
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-stone-300 text-stone-800 focus:ring-stone-400"
                />
                <label htmlFor="isDefault" className="text-sm text-stone-600 font-medium">
                    Set as default shipping address
                </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-stone-800 transition-all shadow-sm disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : address ? "Update Address" : "Add Address"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3 border border-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-stone-50 transition-all text-center"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
