/**
 * @file user Address management Section
 * @module features/account/components/AccountAddressSection
 * 
 * high-level orchestrator for the user's shipping address profile.
 * manages the transition between list viewing and individual address editing states.
 * coordinates with `addressService` for persistent CRUD operations and state synchronization.
 */

"use client";

import { useState, useEffect } from "react";
import {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    type ShippingAddress,
    type CreateShippingAddressRequest
} from "@/services/address.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AccountAddressForm from "./AccountAddressForm";

/** 
 * stateful container for user shipping information. 
 * leverages `framer-motion` for smooth layout transitions during interactive CRUD operations.
 */
export default function AccountAddressSection() {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<ShippingAddress | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await getAllAddresses();
            setAddresses(data);
        } catch (error) {
            console.error("Failed to load addresses", error);
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: CreateShippingAddressRequest) => {
        setIsSaving(true);
        try {
            if (editingAddress) {
                const updated = await updateAddress(editingAddress.id, formData);
                setAddresses(prev => prev.map(a => a.id === updated.id ? updated : (formData.isDefault ? { ...a, isDefault: false } : a)));
                toast.success("Address updated successfully");
            } else {
                const created = await createAddress(formData);
                setAddresses(prev => formData.isDefault ? [created, ...prev.map(a => ({ ...a, isDefault: false }))] : [...prev, created]);
                toast.success("Address added successfully");
            }
            setShowForm(false);
            setEditingAddress(undefined);
            // Re-fetch to be safe with default unsetting logic in backend
            fetchAddresses();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save address");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await deleteAddress(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
            toast.success("Address deleted");
        } catch {
            toast.error("Failed to delete address");
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultAddress(id);
            setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
            toast.success("Default address updated");
        } catch {
            toast.error("Failed to set default address");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-serif text-xl md:text-2xl text-brand-text">My Shipping Addresses</h2>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingAddress(undefined);
                            setShowForm(true);
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-stone-800 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-700 transition-colors"
                    >
                        Add New Address
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-stone-50 rounded-lg border border-stone-200 border-dashed"
                    >
                        <h3 className="font-serif text-lg text-brand-text mb-6">
                            {editingAddress ? "Edit Address" : "New Shipping Address"}
                        </h3>
                        <AccountAddressForm
                            address={editingAddress}
                            onSave={handleSave}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingAddress(undefined);
                            }}
                            isSaving={isSaving}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {addresses.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-stone-50 rounded-lg border border-stone-100 border-dashed">
                                <p className="text-stone-400 font-serif italic">No shipping addresses found.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-text hover:underline"
                                >
                                    Add your first address
                                </button>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <motion.div
                                    layout
                                    key={address.id}
                                    className={`p-6 rounded-lg border shadow-sm transition-all flex flex-col justify-between ${address.isDefault ? "border-brand-text border-2 bg-stone-50" : "border-stone-200 bg-white"
                                        }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-bold text-stone-800 tracking-tight">{address.recipientName}</span>
                                            {address.isDefault && (
                                                <span className="px-2 py-0.5 bg-brand-text text-white text-[9px] font-bold uppercase tracking-tighter rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-stone-500 leading-relaxed mb-4">
                                            <p>{address.addressLine1}</p>
                                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                                            <p>{address.city}, {address.stateProvince} {address.postalCode}</p>
                                            <p className="mt-2 text-stone-400 italic">{address.phoneNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-stone-100 mt-auto">
                                        <button
                                            onClick={() => {
                                                setEditingAddress(address);
                                                setShowForm(true);
                                            }}
                                            className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-brand-text transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-brand-text hover:underline transition-all ml-auto"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
