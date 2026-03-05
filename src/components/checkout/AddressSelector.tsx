/**
 * @file user Address Management System
 * @module components/checkout/AddressSelector
 * 
 * handles CRUD operations and primary selection for shipping addresses within the checkout flow.
 * features lazy-loading, predictive selection for defaults, and inline addition forms.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { getAllAddresses, createAddress, type ShippingAddress, type CreateShippingAddressRequest } from "@/services/address.service";
import { Loader2, Plus, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AccountAddressForm from "@/features/account/components/AccountAddressForm";
import Link from "next/link";
import { toast } from "sonner";

/** properties for the AddressSelector component. */
interface AddressSelectorProps {
    /** callback triggered when an address is selected or created. */
    onSelect: (addressId: number) => void;
    /** The identity of the currently selected address. */
    selectedId: number | null;
}

/**
 * multi-address selection interface.
 * automatically selects the default address on initial load if no selection exists.
 */
export default function AddressSelector({ onSelect, selectedId }: AddressSelectorProps) {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const hasFetched = useRef(false);

    /** fetches current user addresses and performs auto-selection logic. */
    const fetchAddresses = async (selectNewId?: number) => {
        try {
            const data = await getAllAddresses();
            setAddresses(data);
            if (selectNewId) {
                onSelect(selectNewId);
            } else if (data.length > 0 && !selectedId) {
                const defaultAddr = data.find(a => a.isDefault) || data[0];
                if (defaultAddr) onSelect(defaultAddr.id);
            }
        } catch (error) {
            console.error("Failed to load addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchAddresses();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** handles creation of new addresses and provides immediate feedback. */
    const handleSaveNewAddress = async (data: CreateShippingAddressRequest) => {
        setIsSaving(true);
        try {
            const newAddress = await createAddress(data);
            toast.success("Shipping Address Added", {
                description: `${newAddress.recipientName} - ${newAddress.addressLine1}`,
            });
            setIsAdding(false);
            await fetchAddresses(newAddress.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add address";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading your addresses...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-300" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
                        Shipping Address
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="text-[10px] font-bold uppercase tracking-widest text-black hover:opacity-70 transition-colors flex items-center gap-1"
                    >
                        {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {isAdding ? "Cancel" : "Add New"}
                    </button>
                    <Link
                        href="/account?section=addresses"
                        className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-colors"
                    >
                        Manage
                    </Link>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-stone-100 pb-8"
                    >
                        <div className="p-6 bg-stone-50 border border-stone-200">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-stone-800">New Shipping Address</h4>
                            <AccountAddressForm
                                onSave={handleSaveNewAddress}
                                onCancel={() => setIsAdding(false)}
                                isSaving={isSaving}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {addresses.length === 0 && !isAdding ? (
                <div className="p-8 border border-stone-100 bg-stone-50 text-center">
                    <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-4">No shipping addresses found</p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-block px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
                    >
                        Add your first address
                    </button>
                </div>
            ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <motion.button
                            key={address.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(address.id)}
                            className={`text-left p-5 border transition-all relative ${selectedId === address.id
                                ? "border-black bg-stone-50 shadow-sm"
                                : "border-stone-100 hover:border-stone-200"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-black">
                                    {address.recipientName}
                                </span>
                                {address.isDefault && (
                                    <span className="text-[8px] font-bold uppercase tracking-tighter text-stone-400 border border-stone-200 px-1.5 py-0.5">
                                        Default
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1 text-[10px] text-stone-500 font-medium leading-relaxed">
                                <p className="truncate">{address.addressLine1}</p>
                                {address.addressLine2 && <p className="truncate">{address.addressLine2}</p>}
                                <p className="uppercase tracking-wide">
                                    {address.city}{address.stateProvince ? `, ${address.stateProvince}` : ""} {address.postalCode}
                                </p>
                                <p className="text-stone-400 tabular-nums pt-1">{address.phoneNumber}</p>
                            </div>

                            {selectedId === address.id && (
                                <motion.div
                                    layoutId="active-address"
                                    className="absolute inset-0 border-2 border-black pointer-events-none"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
