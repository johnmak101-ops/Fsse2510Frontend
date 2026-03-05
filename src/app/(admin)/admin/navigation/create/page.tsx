"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    RiArrowLeftLine,
    RiSaveLine
} from "@remixicon/react";
import {
    navigationService,
    NavigationItem,
    NavigationOptions
} from "@/services/navigation.service";

export default function CreateNavigationItemPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Data Sources
    const [existingItems, setExistingItems] = useState<NavigationItem[]>([]);
    const [options, setOptions] = useState<NavigationOptions>({ collections: [], categories: [], tags: [], productTypes: [] });

    // Form State
    const [formData, setFormData] = useState({
        label: "",
        type: "TAB", // TAB, DROPDOWN_ITEM
        action_type: "URL", // URL, FILTER_COLLECTION, FILTER_CATEGORY, FILTER_CUSTOM
        action_value: "",
        parent_id: "" as string | number, // Form select uses string, convert to number or null on submit
        sort_order: 10,
        is_new: false,
        is_active: true
    });

    useEffect(() => {
        // Fetch Options & Potential Parents
        Promise.all([
            navigationService.getPublicNavigation(),
            navigationService.getNavigationOptions()
        ]).then(([navData, optsData]) => {
            setExistingItems(navData);
            setOptions(optsData);
        }).catch(err => console.error(err));
    }, []);

    // Filter parents: Can only be items of type 'TAB' or items that can have children (Current Logic: Only Root Tabs have Dropdowns)
    // Assuming 2-Level structure: Roots can be parents. Children cannot be parents.
    const parentOptions = existingItems.filter(i => i.type === "TAB");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await navigationService.createItem({
                ...formData,
                parent_id: formData.parent_id ? Number(formData.parent_id) : null,
                action_value: formData.action_value.trim()
            });
            router.push("/admin/navigation");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to create item.");
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/navigation"
                    className="inline-flex items-center text-sm text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <RiArrowLeftLine size={16} className="mr-1" />
                    Back to List
                </Link>
                <h1 className="text-2xl font-bold text-stone-800">Create New Menu Item</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-6">

                {/* 1. Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Label</label>
                        <input
                            required
                            type="text"
                            value={formData.label}
                            onChange={e => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                            placeholder="e.g. SUMMER SALE"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                        >
                            <option value="TAB">Top-Level Tab</option>
                            <option value="DROPDOWN_ITEM">Dropdown Item</option>
                        </select>
                    </div>
                </div>

                {/* 2. Parent Selection (Only if Dropdown Item) */}
                {formData.type === "DROPDOWN_ITEM" && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Parent Tab</label>
                        <select
                            required
                            value={formData.parent_id}
                            onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                        >
                            <option value="">Select a Parent...</option>
                            {parentOptions.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="border-t border-stone-100 my-4" />

                {/* 3. Action / Link */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Action Type</label>
                        <select
                            value={formData.action_type}
                            onChange={e => setFormData({ ...formData, action_type: e.target.value, action_value: "" })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                        >
                            <option value="URL">Custom URL</option>
                            <option value="FILTER_COLLECTION">Filter by Collection</option>
                            <option value="FILTER_CATEGORY">Filter by Category</option>
                            <option value="FILTER_PRODUCT_TYPE">Filter by Product Type</option>
                            <option value="FILTER_CUSTOM">Filter by Product Tag</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">
                            {formData.action_type === "URL" ? "Target URL" :
                                formData.action_type === "FILTER_COLLECTION" ? "Select Collection" :
                                    formData.action_type === "FILTER_CATEGORY" ? "Select Category" :
                                        formData.action_type === "FILTER_PRODUCT_TYPE" ? "Select Product Type" :
                                            "Product Tag / Query"}
                        </label>

                        {/* Dynamic Input based on Action Type */}
                        {formData.action_type === "FILTER_COLLECTION" ? (
                            <select
                                required
                                value={formData.action_value}
                                onChange={e => setFormData({ ...formData, action_value: e.target.value })}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                            >
                                <option value="">Select Collection...</option>
                                {options.collections.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        ) : formData.action_type === "FILTER_CATEGORY" ? (
                            <select
                                required
                                value={formData.action_value}
                                onChange={e => setFormData({ ...formData, action_value: e.target.value })}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                            >
                                <option value="">Select Category...</option>
                                {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        ) : formData.action_type === "FILTER_PRODUCT_TYPE" ? (
                            <select
                                required
                                value={formData.action_value}
                                onChange={e => setFormData({ ...formData, action_value: e.target.value })}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                            >
                                <option value="">Select Product Type...</option>
                                {options.productTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        ) : formData.action_type === "FILTER_CUSTOM" ? (
                            <div className="space-y-1">
                                <select
                                    value={formData.action_value}
                                    onChange={e => setFormData({ ...formData, action_value: `tag=${e.target.value}` })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 mb-2"
                                >
                                    <option value="">Select Existing Tag (Optional)</option>
                                    {options.tags.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input
                                    type="text"
                                    value={formData.action_value}
                                    onChange={e => setFormData({ ...formData, action_value: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono text-sm"
                                    placeholder="e.g. tag=BestSeller"
                                />
                                <p className="text-xs text-stone-500">Query String Format (e.g., tag=Value)</p>
                            </div>
                        ) : (
                            <input
                                required
                                type="text"
                                value={formData.action_value}
                                onChange={e => setFormData({ ...formData, action_value: e.target.value })}
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                                placeholder="/collections/example"
                            />
                        )}
                    </div>
                </div>

                <div className="border-t border-stone-100 my-4" />

                {/* 4. Meta & Status */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Sort Order</label>
                        <input
                            type="number"
                            value={formData.sort_order}
                            onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900"
                        />
                    </div>
                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_new}
                                onChange={e => setFormData({ ...formData, is_new: e.target.checked })}
                                className="w-4 h-4 text-stone-900 rounded focus:ring-stone-900"
                            />
                            <span className="text-sm font-medium text-stone-700">Is New Badge?</span>
                        </label>
                    </div>
                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 text-stone-900 rounded focus:ring-stone-900"
                            />
                            <span className="text-sm font-medium text-stone-700">Is Active?</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-900/90 transition-colors font-medium flex items-center gap-2"
                    >
                        {submitting ? "Saving..." : <><RiSaveLine size={18} /> Create Item</>}
                    </button>
                </div>

            </form >
        </div >
    );
}
