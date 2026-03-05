/**
 * @file user Profile Settings Form
 * @module features/account/components/AccountSettingsForm
 * 
 * facilitates the management of core user profile attributes (name, phone, address, birthday).
 * implements client-side regex sanitization and provides feedback for membership-blocking deficiencies.
 * synchronizes with `userService` to ensure persistent profile updates.
 */

"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, updateUserProfile, type User } from "@/services/user.service";
import { toast } from "sonner";

/** 
 * specialized form for user identity and contact preferences. 
 * enforces strict validation rules for name and phone format to maintain data integrity across loyalty tiers.
 */
export default function AccountSettingsForm() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        address: "",
        birthday: "",
    });

    // Fetch user data on mount
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data);
            setFormData({
                fullName: data.fullName || "",
                phoneNumber: data.phoneNumber || "",
                address: data.address || "",
                birthday: data.birthday || "",
            });
        } catch (error) {
            console.error("Failed to load user profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Sanitization: Remove excessive internal whitespace and trim
        const cleanName = formData.fullName.trim().replace(/\s+/g, ' ');
        // Phone: replace multiple spaces with single, and allow only digits, +, -, and spaces for the final clean string
        const cleanPhone = formData.phoneNumber.trim().replace(/\s+/g, ' ');

        const nameRegex = /^[\p{L}\s]+$/u;
        // Backend Regex: ^\+?[0-9\-\s\(\)]{6,29}[0-9]$
        const phoneRegex = /^\+?[0-9\-\s\(\)]{6,29}[0-9]$/;

        // Validation
        if (!cleanName) {
            toast.error("Full Name is required");
            return;
        }

        if (!nameRegex.test(cleanName)) {
            toast.warning("Name must not contain numbers or special symbols");
            return;
        }

        if (!cleanPhone) {
            toast.error("Phone Number is required");
            return;
        }

        if (cleanPhone.length < 7) {
            toast.warning("Phone number is too short (minimum 7 characters)");
            return;
        }

        if (cleanPhone.length > 30) {
            toast.warning("Phone number is too long (maximum 30 characters)");
            return;
        }

        if (!phoneRegex.test(cleanPhone)) {
            toast.warning("Invalid phone format. Only numbers, +, -, and brackets () are allowed.");
            return;
        }

        setSaving(true);
        try {
            const updatedUser = await updateUserProfile({
                fullName: cleanName,
                phoneNumber: cleanPhone,
                address: formData.address.trim() || undefined,
                birthday: formData.birthday || undefined,
            });

            setUser(updatedUser);
            toast.success("Profile updated successfully! 🎉");
        } catch (error) {
            console.error("Failed to update profile", error);
            // Surface backend error message if available
            const message = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                birthday: user.birthday || "",
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-stone-200 p-8">
                <div className="text-center text-stone-400">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm">
            {/* Header */}
            <div className="border-b border-stone-200 p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-serif font-bold text-stone-800">Account Settings</h2>
                <p className="text-xs md:text-sm text-stone-500 mt-1">
                    Manage your personal information
                </p>
            </div>

            {/* Profile Status Badge */}
            {user && (
                <div className="p-5 md:p-6 border-b border-stone-200 bg-stone-50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-sm font-medium text-stone-700">
                            Profile Status:
                        </div>
                        {user.isInfoComplete ? (
                            // Only show "Ready for upgrades" if user is still REGULAR (not upgraded yet)
                            user.membership?.level === "REGULAR" ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-xs md:text-sm font-medium rounded w-fit">
                                    <span>✅</span>
                                    <span>Complete - Ready for upgrades</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs md:text-sm font-medium rounded w-fit">
                                    <span>Completed</span>
                                </div>
                            )
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs md:text-sm font-medium rounded w-fit">
                                <span>⚠️</span>
                                <span>Incomplete - Action Required</span>
                            </div>
                        )}
                    </div>
                    {!user.isInfoComplete && (
                        <p className="text-[10px] md:text-xs text-stone-600 mt-2">
                            Complete your profile with Full Name and Phone Number to unlock membership upgrade eligibility.
                        </p>
                    )}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 md:p-6">
                <div className="space-y-5 md:space-y-6 max-w-2xl">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Your legal full name</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="+852 9123 4567"
                            className="w-full px-4 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Contact number for order updates</p>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Address <span className="text-stone-400">(Optional)</span>
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Flat 12A, Tower 1, Happy Valley, Hong Kong"
                            rows={3}
                            className="w-full px-4 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Shipping or billing address</p>
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Birthday <span className="text-stone-400">(Optional)</span>
                        </label>
                        <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">For birthday rewards</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto px-8 py-2.5 bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={saving}
                            className="w-full sm:w-auto px-8 py-2.5 border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-50 disabled:opacity-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </form>

            {/* Info Notice */}
            {/* Info Notice */}
            {user && !user.isInfoComplete && (
                <div className="p-6 border-t border-stone-200 bg-stone-50">
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">
                        ⚠️ Membership Upgrade Notice
                    </h4>
                    <p className="text-xs text-stone-600">
                        To qualify for membership upgrades (Bronze, Silver, Gold), you must complete your profile by filling in your <strong>Full Name</strong> and <strong>Phone Number</strong>.
                        Even if you meet the spending requirements, upgrades will be blocked until your profile is complete.
                    </p>
                </div>
            )}
        </div>
    );
}
