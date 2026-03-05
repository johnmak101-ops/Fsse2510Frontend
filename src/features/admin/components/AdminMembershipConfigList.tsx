/**
 * @file global Membership tier configuration
 * @module features/admin/components/AdminMembershipConfigList
 * 
 * manages the multi-tier membership system settings (NO_MEMBERSHIP, BRONZE, SILVER, GOLD).
 * allows live adjustment of point accumulation rates, entry thresholds, and downgrade grace periods.
 * features specialized input handling for percentage-to-decimal transformations.
 */

"use client";

import { useState, useEffect } from "react";
import { getMembershipConfigs, updateMembershipConfig } from "@/services/membership.service";
import {
    MembershipConfig,
    MembershipLevel,
    MEMBERSHIP_LEVEL_LABELS,
    MEMBERSHIP_LEVEL_ICONS,
    toPercentage,
    toDecimal,
} from "@/types/membership";
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

/** properties for a single membership configuration row. */
interface ConfigRowProps {
    /** full metadata for the specific membership tier. */
    config: MembershipConfig;
    /** refresh callback invoked after successful tier updates. */
    onUpdate: () => void;
}

/** 
 * editable row for a single membership tier. 
 * implements safe status guarding for the `NO_MEMBERSHIP` base tier which is non-editable.
 */
function ConfigRow({ config, onUpdate }: ConfigRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        minSpend: config.minSpend,
        pointRatePercent: toPercentage(config.pointRate),
        gracePeriodDays: config.gracePeriodDays,
    });

    const isNoMembership = config.level === MembershipLevel.NO_MEMBERSHIP;

    const handleSave = async () => {
        // Validate on submit
        if (isNaN(formData.minSpend) || formData.minSpend < 0) {
            alert("Please enter a valid minimum spend amount");
            return;
        }
        if (isNaN(formData.pointRatePercent) || formData.pointRatePercent < 0 || formData.pointRatePercent > 100) {
            alert("Please enter a valid point rate between 0-100%");
            return;
        }
        if (isNaN(formData.gracePeriodDays) || formData.gracePeriodDays < 0) {
            alert("Please enter a valid grace period in days");
            return;
        }

        setIsSaving(true);
        try {
            await updateMembershipConfig(config.level, {
                minSpend: formData.minSpend,
                pointRate: toDecimal(formData.pointRatePercent),
                gracePeriodDays: formData.gracePeriodDays,
            });

            alert(`${MEMBERSHIP_LEVEL_LABELS[config.level]} configuration updated successfully!`);
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            alert("Failed to update configuration");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            minSpend: config.minSpend,
            pointRatePercent: toPercentage(config.pointRate),
            gracePeriodDays: config.gracePeriodDays,
        });
        setIsEditing(false);
    };

    // Handle input changes - allow empty but don't validate until save
    const handleMinSpendChange = (value: string) => {
        const num = value === '' ? 0 : parseFloat(value);
        setFormData({ ...formData, minSpend: isNaN(num) ? 0 : num });
    };

    const handlePointRateChange = (value: string) => {
        const num = value === '' ? 0 : parseFloat(value);
        setFormData({ ...formData, pointRatePercent: isNaN(num) ? 0 : num });
    };

    const handleGracePeriodChange = (value: string) => {
        const num = value === '' ? 0 : parseInt(value);
        setFormData({ ...formData, gracePeriodDays: isNaN(num) ? 0 : num });
    };

    return (
        <div className="grid grid-cols-[120px_1fr_1fr_1fr_140px] gap-4 items-center py-4 border-b border-stone-200">
            {/* Level */}
            <div className="flex items-center gap-2">
                <span className="text-2xl">{MEMBERSHIP_LEVEL_ICONS[config.level]}</span>
                <span className="font-medium text-stone-700">
                    {MEMBERSHIP_LEVEL_LABELS[config.level]}
                </span>
            </div>

            {/* Min Spend */}
            <div>
                {isEditing && !isNoMembership ? (
                    <div className="space-y-1">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Min Spend</label>
                        <input
                            type="number"
                            step="100"
                            min="0"
                            value={formData.minSpend || ''}
                            onChange={(e) => handleMinSpendChange(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="text-xs text-stone-400 uppercase tracking-wide">Min Spend</div>
                        <div className="text-sm font-medium">${config.minSpend.toLocaleString()}</div>
                    </div>
                )}
            </div>

            {/* Point Rate */}
            <div>
                {isEditing && !isNoMembership ? (
                    <div className="space-y-1">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Point Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.pointRatePercent || ''}
                            onChange={(e) => handlePointRateChange(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="text-xs text-stone-400 uppercase tracking-wide">Point Rate</div>
                        <div className="text-sm font-medium">{toPercentage(config.pointRate)}%</div>
                    </div>
                )}
            </div>

            {/* Grace Period */}
            <div>
                {isEditing && !isNoMembership ? (
                    <div className="space-y-1">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Grace Period (days)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            max="365"
                            value={formData.gracePeriodDays || ''}
                            onChange={(e) => handleGracePeriodChange(e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="text-xs text-stone-400 uppercase tracking-wide">Grace Period</div>
                        <div className="text-sm font-medium">{config.gracePeriodDays} days</div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                {isNoMembership ? (
                    <span className="text-xs text-stone-400 italic">Not editable</span>
                ) : isEditing ? (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-stone-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3 py-1 text-sm bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-stone-50"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminMembershipConfigList() {
    const [configs, setConfigs] = useState<MembershipConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfigs = async () => {
        try {
            setError(null);
            const data = await getMembershipConfigs();
            // Sort by level order
            const sortedData = data.sort((a, b) => {
                const order = [MembershipLevel.NO_MEMBERSHIP, MembershipLevel.BRONZE, MembershipLevel.SILVER, MembershipLevel.GOLD];
                return order.indexOf(a.level) - order.indexOf(b.level);
            });
            setConfigs(sortedData);
        } catch (err) {
            setError("Failed to load membership configurations");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchConfigs();
    }, []);

    if (loading) {
        return <AdminLoadingState message="Loading configurations..." />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-stone-200 p-8">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm">
            {/* Header */}
            <div className="border-b border-stone-200 p-6">
                <h2 className="text-xl font-serif font-bold text-stone-800">Membership Level Configuration</h2>
                <p className="text-sm text-stone-500 mt-1">
                    Control point earning rates, minimum spend requirements, and grace periods for each membership tier
                </p>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-[120px_1fr_1fr_1fr_140px] gap-4 pb-2 border-b-2 border-stone-300">
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide">Level</div>
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide">Min Spend</div>
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide">Point Rate</div>
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide">Grace Period</div>
                        <div className="text-xs font-bold text-stone-600 uppercase tracking-wide text-right">Actions</div>
                    </div>

                    {/* Config Rows */}
                    {configs.map((config) => (
                        <ConfigRow key={config.level} config={config} onUpdate={fetchConfigs} />
                    ))}
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-stone-50 rounded border border-stone-200">
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">Configuration Guide</h4>
                    <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                        <li><strong>Point Rate:</strong> Percentage of spending converted to points (e.g., 5% = user earns $5 points on $100 purchase)</li>
                        <li><strong>Min Spend:</strong> Annual spending required to achieve/maintain this level</li>
                        <li><strong>Grace Period:</strong> Days allowed to meet spending requirement before downgrade</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
