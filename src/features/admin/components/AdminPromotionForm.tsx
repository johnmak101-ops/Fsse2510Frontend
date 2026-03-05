/**
 * @file administrative Promotion Configuration Form
 * @module features/admin/components/AdminPromotionForm
 * 
 * complex orchestrator for defining marketing promotions and discount logic.
 * implements high-sophistication conditional validation using `zod` refinements.
 * features dynamic UI state that pivots based on `PromotionType` and target selection.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch, Resolver, FieldErrors, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    ChevronDown,
    Target,
    Tag,
    Info,
    Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PromotionType,
    promotionService,
    CreatePromotionRequest,
} from "@/services/promotion.service";
import { MembershipLevel } from "@/types/membership";
import Button from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminProductPicker from "./AdminProductPicker";
import AdminMultiSelectPicker from "./AdminMultiSelectPicker";
import { navigationService } from "@/services/navigation.service";
import { getFriendlyErrorMessage } from "@/lib/error-utils";

/** utility to normalize input values into numbers or undefined. */
const coerceToNumber = z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
}, z.number().optional());

// Schema definition
/** global promotion configuration schema with multi-tier conditional validation. */
const promotionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().nullish(),
    type: z.nativeEnum(PromotionType),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    minQuantity: coerceToNumber,
    minAmount: coerceToNumber,
    targetMemberLevel: z.string().nullish(),
    targetPids: z.array(z.number()).default([]),
    targetCategories: z.array(z.string()).default([]),
    targetCollections: z.array(z.string()).default([]),
    targetTags: z.array(z.string()).default([]),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).nullable().optional().default("PERCENTAGE"),
    discountValue: coerceToNumber,
    buyX: coerceToNumber,
    getY: coerceToNumber,
}).refine((data) => {
    // validation for chronological date order
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"]
}).refine((data) => {
    // specific validation for B2GY logic
    if (data.type === PromotionType.BUY_X_GET_Y_FREE) {
        return (data.buyX ?? 0) >= 1 && (data.getY ?? 0) >= 1;
    }
    return true;
}, {
    message: "Buy X and Get Y must be at least 1",
    path: ["buyX"]
}).refine((data) => {
    // percentage range validation
    if (data.type !== PromotionType.BUY_X_GET_Y_FREE) {
        if (data.discountType === "PERCENTAGE") {
            const val = data.discountValue;
            return val !== undefined && val > 0 && val <= 100;
        }
    }
    return true;
}, {
    message: "Percentage must be between 1 and 100",
    path: ["discountValue"]
}).refine((data) => {
    // fixed discount minimum validation
    if (data.type !== PromotionType.BUY_X_GET_Y_FREE) {
        if (data.discountType === "FIXED") {
            const val = data.discountValue;
            return val !== undefined && val > 0;
        }
    }
    return true;
}, {
    message: "Fixed discount must be greater than 0",
    path: ["discountValue"]
}).refine((data) => {
    // mandatory targeting validation for specific discount types
    if (data.type === PromotionType.SPECIFIC_PRODUCT_DISCOUNT) {
        return (data.targetPids?.length ?? 0) > 0;
    }
    if (data.type === PromotionType.SPECIFIC_CATEGORY_DISCOUNT) {
        return (data.targetCategories?.length ?? 0) > 0;
    }
    if (data.type === PromotionType.SPECIFIC_COLLECTION_DISCOUNT) {
        return (data.targetCollections?.length ?? 0) > 0;
    }
    if (data.type === PromotionType.SPECIFIC_TAG_DISCOUNT) {
        return (data.targetTags?.length ?? 0) > 0;
    }
    return true;
}, {
    message: "At least one target must be selected",
    path: ["type"]
});

/** inferred promotion form values. */
type PromotionFormValues = z.infer<typeof promotionSchema>;

/** properties for the AdminPromotionForm component. */
interface PromotionFormProps {
    /** optional ID for pre-fetching existing promotion data in edit mode. */
    promotionId?: number;
}

/** 
 * primary interface for marketing campaign creation. 
 * manages high-complexity state including cross-service option fetching (navigation) and nested ID matching.
 */
export default function AdminPromotionForm({ promotionId }: PromotionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<PromotionFormValues>({
        resolver: zodResolver(promotionSchema) as unknown as Resolver<PromotionFormValues>,
        defaultValues: {
            name: "",
            description: "",
            type: PromotionType.STOREWIDE_SALE,
            targetPids: [],
            targetCategories: [],
            targetCollections: [],
            targetTags: [],
            startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            endDate: format(new Date(Date.now() + 86400000 * 7), "yyyy-MM-dd'T'HH:mm"),
            discountType: "PERCENTAGE",
            discountValue: 10,
            minQuantity: 0,
            minAmount: 0,
            targetMemberLevel: "",
            buyX: undefined,
            getY: undefined,
        },
    });

    const selectedType = useWatch({ control: form.control, name: "type" });

    const [options, setOptions] = useState<{
        categories: string[];
        collections: string[];
        tags: string[];
    }>({ categories: [], collections: [], tags: [] });

    const loadOptions = useCallback(async () => {
        try {
            const data = await navigationService.getNavigationOptions();
            setOptions({
                categories: data.categories || [],
                collections: data.collections || [],
                tags: data.tags || []
            });
        } catch (error) {
            console.error("Failed to load navigation options:", error);
            toast.error("Failed to load options for target selection.");
        }
    }, []);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    const loadPromotion = useCallback(async (id: number) => {
        try {
            const data = await promotionService.getPromotionById(id);
            // Format dates for input[type="datetime-local"]
            const formattedData = {
                ...data,
                startDate: data.startDate ? format(new Date(data.startDate), "yyyy-MM-dd'T'HH:mm") : "",
                endDate: data.endDate ? format(new Date(data.endDate), "yyyy-MM-dd'T'HH:mm") : "",
                targetPids: data.targetPids || [],
                targetCategories: data.targetCategories || [],
                targetCollections: data.targetCollections || [],
                targetTags: data.targetTags || [],
            };
            form.reset(formattedData as unknown as PromotionFormValues);
        } catch (error) {
            console.error("Failed to load promotion:", error);
            toast.error("Failed to load existing promotion data.");
        }
    }, [form]);

    useEffect(() => {
        if (promotionId) {
            loadPromotion(promotionId);
        }
    }, [promotionId, loadPromotion]);


    const onSubmit = async (data: PromotionFormValues) => {
        setLoading(true);
        try {
            // Construct payload based on promotion type
            const payload: Record<string, unknown> = {
                name: data.name?.trim(),
                description: data.description?.trim(),
                type: data.type,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                minQuantity: data.minQuantity,
                minAmount: data.minAmount,
                ...(data.targetMemberLevel?.trim() ? { targetMemberLevel: data.targetMemberLevel.trim() } : {}),
            };

            // Add fields based on promotion type
            if (data.type === PromotionType.BUY_X_GET_Y_FREE) {
                payload.buyX = data.buyX;
                payload.getY = data.getY;
            } else {
                payload.discountType = data.discountType || "PERCENTAGE";
                payload.discountValue = data.discountValue;
            }

            // Target Selection
            if (data.type !== PromotionType.STOREWIDE_SALE) {
                if (data.targetPids?.length > 0) payload.targetPids = data.targetPids;
                if (data.targetCategories?.length > 0) payload.targetCategories = data.targetCategories.map(s => s.trim());
                if (data.targetCollections?.length > 0) payload.targetCollections = data.targetCollections.map(s => s.trim());
                if (data.targetTags?.length > 0) payload.targetTags = data.targetTags.map(s => s.trim());
            }

            if (promotionId) {
                await promotionService.updatePromotion(promotionId, payload);
            } else {
                await promotionService.createPromotion(payload as unknown as CreatePromotionRequest);
            }
            toast.success(promotionId ? "Promotion updated successfully" : "Promotion created successfully");
            router.push("/admin/promotions");
            router.refresh();
        } catch (error) {
            console.error("Failed to save promotion", error);
            const message = getFriendlyErrorMessage(error) || "Failed to save promotion. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const onValidationError = (errors: FieldErrors<PromotionFormValues>) => {
        console.error("Form validation errors:", errors);
        const firstError = Object.values(errors)[0] as FieldError | undefined;
        if (firstError?.message) {
            toast.error(`Validation Error: ${firstError.message}`);
        } else {
            toast.error("Please check the form for missing or invalid fields.");
        }
    };



    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="flex justify-between items-end mb-10 pb-6 border-b border-stone-100">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-stone-900 mb-2">
                        {promotionId ? "Edit Promotion" : "Create New Promotion"}
                    </h1>
                    <p className="text-stone-500 text-sm">Design and deploy your promotional campaigns.</p>
                </div>
                {!promotionId && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full border border-stone-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">Draft Mode</span>
                    </div>
                )}
            </div>

            {/* Instruction Box */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900 text-white rounded-3xl p-8 mb-12 flex gap-6 items-start shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                    <Info size={120} />
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <Info className="w-6 h-6 text-white" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-[0.2em]">Promotion Setup Guide</h4>
                    <p className="text-stone-300 text-sm leading-relaxed max-w-lg mb-4">
                        Choose simple, direct values. Our system automatically handles the complex calculations .
                    </p>
                    <div className="flex gap-6">
                        <div className="space-y-1">
                            <span className="block text-[10px] text-stone-400 uppercase font-bold tracking-widest">Percentage</span>
                            <code className="text-white font-mono text-sm bg-white/5 px-2 py-1 rounded">20 = 20% OFF</code>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-[10px] text-stone-400 uppercase font-bold tracking-widest">Fixed Amount</span>
                            <code className="text-white font-mono text-sm bg-white/5 px-2 py-1 rounded">50 = -$50.00</code>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-12">

                    {/* SECTION 1: BASIC INFORMATION */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-stone-100">
                            <div className="p-2 bg-stone-100 rounded-lg"><Layout className="w-4 h-4 text-stone-600" /></div>
                            <h2 className="text-xs uppercase font-black tracking-[0.3em] text-stone-400">Basic Configuration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Internal Campaign Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="Global Winter Sale 2026" className="h-12 border-stone-100 rounded-xl focus:border-stone-900 transition-all font-medium" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Promotion Logic Type</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-12 w-full rounded-xl border border-stone-100 bg-white px-4 py-2 text-sm text-stone-900 shadow-sm transition-all focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                                                {...field}
                                            >
                                                {Object.values(PromotionType).map((type) => (
                                                    <option key={type} value={type}>
                                                        {type.replace(/_/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Campaign Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value ?? ""} placeholder="Add internal notes about this promotion..." className="min-h-[100px] border-stone-100 rounded-xl focus:border-stone-900 transition-all" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Starts At</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} value={field.value ?? ""} className="h-12 border-stone-100 rounded-xl focus:border-stone-900 transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Ends At</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} value={field.value ?? ""} className="h-12 border-stone-100 rounded-xl focus:border-stone-900 transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* SECTION 2: TARGETING (Conditional) */}
                    <AnimatePresence mode="wait">
                        {selectedType !== PromotionType.STOREWIDE_SALE && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-8 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-stone-100">
                                    <div className="p-2 bg-stone-100 rounded-lg"><Target className="w-4 h-4 text-stone-600" /></div>
                                    <h2 className="text-xs uppercase font-black tracking-[0.3em] text-stone-400">Target Selection</h2>
                                </div>

                                <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100/50">
                                    {selectedType === PromotionType.SPECIFIC_PRODUCT_DISCOUNT && (
                                        <FormField
                                            control={form.control}
                                            name="targetPids"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Select Targeted Products</FormLabel>
                                                    <FormControl>
                                                        <AdminProductPicker
                                                            value={field.value || []}
                                                            onChange={field.onChange}
                                                            error={!!form.formState.errors.targetPids}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {selectedType === PromotionType.SPECIFIC_CATEGORY_DISCOUNT && (
                                        <FormField
                                            control={form.control}
                                            name="targetCategories"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Target Categories</FormLabel>
                                                    <FormControl>
                                                        <AdminMultiSelectPicker
                                                            options={options.categories.map(c => ({ label: c, value: c }))}
                                                            value={field.value || []}
                                                            onChange={field.onChange}
                                                            placeholder="Search categories..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {selectedType === PromotionType.SPECIFIC_COLLECTION_DISCOUNT && (
                                        <FormField
                                            control={form.control}
                                            name="targetCollections"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Target Collections</FormLabel>
                                                    <FormControl>
                                                        <AdminMultiSelectPicker
                                                            options={options.collections.map(c => ({ label: c, value: c }))}
                                                            value={field.value || []}
                                                            onChange={field.onChange}
                                                            placeholder="Search collections..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {selectedType === PromotionType.SPECIFIC_TAG_DISCOUNT && (
                                        <FormField
                                            control={form.control}
                                            name="targetTags"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Target Tags</FormLabel>
                                                    <FormControl>
                                                        <AdminMultiSelectPicker
                                                            options={options.tags.map(t => ({ label: t, value: t }))}
                                                            value={field.value || []}
                                                            onChange={field.onChange}
                                                            placeholder="Search tags..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {/* Advanced Target Selection: Bundle, Tiered, Membership, Buy X Get Y */}
                                    {(selectedType === PromotionType.BUY_X_GET_Y_FREE ||
                                        selectedType === PromotionType.BUNDLE_DISCOUNT ||
                                        selectedType === PromotionType.MEMBERSHIP_DISCOUNT) && (
                                            <div className="space-y-8">
                                                <p className="text-xs text-stone-400 leading-relaxed">
                                                    Optionally restrict which products trigger this deal. Leave all empty to apply store-wide.
                                                </p>
                                                <FormField
                                                    control={form.control}
                                                    name="targetPids"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Specific Products (optional)</FormLabel>
                                                            <FormControl>
                                                                <AdminProductPicker
                                                                    value={field.value || []}
                                                                    onChange={field.onChange}
                                                                    error={!!form.formState.errors.targetPids}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="targetCategories"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Target Categories (optional)</FormLabel>
                                                            <FormControl>
                                                                <AdminMultiSelectPicker
                                                                    options={options.categories.map(c => ({ label: c, value: c }))}
                                                                    value={field.value || []}
                                                                    onChange={field.onChange}
                                                                    placeholder="Search categories..."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="targetCollections"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-4 block">Target Collections (optional)</FormLabel>
                                                            <FormControl>
                                                                <AdminMultiSelectPicker
                                                                    options={options.collections.map(c => ({ label: c, value: c }))}
                                                                    value={field.value || []}
                                                                    onChange={field.onChange}
                                                                    placeholder="Search collections..."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* SECTION 3: REWARD DETAILS */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-stone-100">
                            <div className="p-2 bg-stone-100 rounded-lg"><Tag className="w-4 h-4 text-stone-600" /></div>
                            <h2 className="text-xs uppercase font-black tracking-[0.3em] text-stone-400">Discount & Conditions</h2>
                        </div>

                        {/* Dynamic Form Fields based on Type */}
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 space-y-8">

                            {/* CASE 1: BUY X GET Y FREE */}
                            {selectedType === PromotionType.BUY_X_GET_Y_FREE && (
                                <div className="grid grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="buyX"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Buy (Quantity)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} className="h-12 border-stone-200 bg-white rounded-xl focus:border-stone-900 transition-all font-bold text-lg" placeholder="e.g. 2" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="getY"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Get Free (Quantity)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} className="h-12 border-stone-200 bg-white rounded-xl focus:border-stone-900 transition-all font-bold text-lg" placeholder="e.g. 1" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* CASE 2: QUANTITY BASED (Bundle, Min Qty) */}
                            {(selectedType === PromotionType.BUNDLE_DISCOUNT ||
                                selectedType === PromotionType.MIN_QUANTITY_DISCOUNT) && (
                                    <FormField
                                        control={form.control}
                                        name="minQuantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                                                    Minimum Quantity Required
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} className="h-12 border-stone-200 bg-white rounded-xl focus:border-stone-900 transition-all font-bold text-lg" placeholder="e.g. 3" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                            {/* CASE 3: AMOUNT BASED (Min Amount) */}
                            {selectedType === PromotionType.MIN_AMOUNT_DISCOUNT && (
                                <FormField
                                    control={form.control}
                                    name="minAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                                                Minimum Spend Required ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value ?? ""} className="h-12 border-stone-200 bg-white rounded-xl focus:border-stone-900 transition-all font-bold text-lg" placeholder="e.g. 100.00" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* CASE 4: MEMBERSHIP BASED */}
                            {selectedType === PromotionType.MEMBERSHIP_DISCOUNT && (
                                <FormField
                                    control={form.control}
                                    name="targetMemberLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                                                Required Membership Tier
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-12 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium focus:border-stone-900 outline-none transition-all"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                >
                                                    <option value="">Select Tier...</option>
                                                    <option value={MembershipLevel.BRONZE}>Bronze</option>
                                                    <option value={MembershipLevel.SILVER}>Silver</option>
                                                    <option value={MembershipLevel.GOLD}>Gold</option>
                                                    <option value={MembershipLevel.DIAMOND}>Diamond</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* STANDARD DISCOUNT INPUTS (For all except B2GY) */}
                            {selectedType !== PromotionType.BUY_X_GET_Y_FREE && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-200/50">
                                    <FormField
                                        control={form.control}
                                        name="discountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Discount Type</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-12 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 shadow-sm transition-all focus:border-stone-900 focus:outline-none appearance-none cursor-pointer font-medium"
                                                        {...field}
                                                        value={field.value ?? "PERCENTAGE"}
                                                    >
                                                        <option value="PERCENTAGE">Percentage Off (%)</option>
                                                        <option value="FIXED">Flat Amount Off ($)</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discountValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Discount Value</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type="number" step="0.01" {...field} value={field.value ?? ""} className="h-12 border-stone-200 bg-white rounded-xl pr-12 font-bold text-lg focus:border-stone-900 transition-all" placeholder="0.00" />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                                                            {form.watch("discountType") === "PERCENTAGE" ? "%" : "$"}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* DYNAMIC SUMMARY PREVIEW */}
                            <div className="bg-stone-900 rounded-xl p-6 mt-4">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2">Configuration Summary</h4>
                                <p className="text-white font-serif italic text-lg leading-relaxed">
                                    {selectedType === PromotionType.BUY_X_GET_Y_FREE
                                        ? `Customer buys ${form.watch("buyX") || "?"} items, gets ${form.watch("getY") || "?"} items free.`
                                        : (selectedType === PromotionType.BUNDLE_DISCOUNT ||
                                            selectedType === PromotionType.MIN_QUANTITY_DISCOUNT)
                                            ? `Buy ${form.watch("minQuantity") || "?"} or more items to get ${form.watch("discountValue") || "?"}${form.watch("discountType") === "PERCENTAGE" ? "%" : "$"} off.`
                                            : selectedType === PromotionType.MIN_AMOUNT_DISCOUNT
                                                ? `Spend at least $${form.watch("minAmount") || "?"} to get ${form.watch("discountValue") || "?"}${form.watch("discountType") === "PERCENTAGE" ? "%" : "$"} off.`
                                                : selectedType === PromotionType.MEMBERSHIP_DISCOUNT
                                                    ? `${form.watch("targetMemberLevel") || "VIP"} members get ${form.watch("discountValue") || "?"}${form.watch("discountType") === "PERCENTAGE" ? "%" : "$"} off.`
                                                    : `Get ${form.watch("discountValue") || "?"}${form.watch("discountType") === "PERCENTAGE" ? "%" : "$"} off.`
                                    }
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-6 pt-12 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-[11px] uppercase font-bold tracking-[0.2em] text-stone-400 hover:text-black transition-colors"
                        >
                            Dismiss Changes
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-stone-900 text-white px-10 py-4 rounded-full text-[11px] uppercase font-black tracking-[0.2em] hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <ChevronDown className="w-3 h-3 animate-spin rotate-180" />
                                    Synchronizing...
                                </span>
                            ) : (
                                "Deploy Promotion"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
