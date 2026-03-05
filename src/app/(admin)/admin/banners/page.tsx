'use client'

import { useState, useEffect } from 'react';
import Image from "next/image";
import { adminService } from '@/services/showcase-admin.service';
import { saveShowcaseAction, deleteShowcaseAction } from '../showcase-actions';
import { auth } from '@/lib/firebase';
import { ShowcaseCollection } from '@/types/showcase';
import { getFriendlyErrorMessage } from '@/lib/error-utils';

export default function BannerAdminPage() {
    const [collections, setCollections] = useState<ShowcaseCollection[]>([]);
    const [editing, setEditing] = useState<Partial<ShowcaseCollection> | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        void fetchData();
    }, []);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const data = await adminService.getShowcaseCollections();
            // Filter: Only show items that have a bannerUrl (Banner items)
            setCollections(data.filter(i => !!i.bannerUrl));
        } catch (error) {
            console.error("Failed to load:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        setStatus({ type: 'loading', message: 'Saving...' });

        try {
            const user = auth.currentUser;
            if (!user) {
                setStatus({ type: 'error', message: 'User not authenticated' });
                return;
            }
            const token = await user.getIdToken();
            const result = await saveShowcaseAction(formData, token);

            if (result.success) {
                setStatus({ type: 'success', message: 'Saved successfully!' });
                setEditing(null);
                void fetchData();
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to save' });
            }
        } catch (error: unknown) {
            setStatus({ type: 'error', message: getFriendlyErrorMessage(error) });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this banner?")) return;
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();
            const result = await deleteShowcaseAction(id, token);
            if (result.success) {
                fetchData();
            } else {
                alert(result.error);
            }
        } catch (error: unknown) {
            alert(getFriendlyErrorMessage(error));
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-brand-text">Collection Banners</h1>
                    <p className="text-sm text-brand-text/50 mt-2">Manage header banners for Collection Pages.</p>
                </div>
                <button
                    onClick={() => setEditing({ title: '', bannerUrl: '', tag: '', orderIndex: 0, active: true })}
                    className="bg-brand-text text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                    Add New Banner
                </button>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${status.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' :
                    status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                        'bg-blue-50 text-blue-500 border border-blue-100'
                    }`}>
                    {status.message}
                </div>
            )}

            {editing && (
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-serif mb-6">{editing.id ? 'Edit' : 'Create'} Banner</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="hidden" name="id" value={editing.id || ''} />

                        {/* Hidden imageUrl - always empty for banner items */}
                        <input type="hidden" name="imageUrl" value="" />

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Title</label>
                            <input name="title" defaultValue={editing.title} className="p-3 border rounded-lg focus:ring-1 ring-brand-text outline-none" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Collection Query Name / Slug Path</label>
                            <input name="tag" defaultValue={editing.tag} placeholder="e.g. '2025 Steiff' or 'women'" className="p-3 border rounded-lg focus:ring-1 ring-brand-text outline-none" required />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Banner URL (Required)</label>
                            <input name="bannerUrl" defaultValue={editing.bannerUrl || ''} className="p-3 border rounded-lg focus:ring-1 ring-brand-text outline-none" required />
                        </div>
                        {/* 
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Order Index</label>
                            <input type="number" name="orderIndex" defaultValue={editing.orderIndex} className="p-3 border rounded-lg focus:ring-1 ring-brand-text outline-none" />
                        </div>
                         Order Index might not be critical for banners, but keeping it optional is fine.
                         Actually, usually we don't list all banners on one page like slider, so order matters less, but let's keep it simple.
                         Wait, removing Order Index from UI to simplify, as banners are looked up by Tag, not ordered list.
                        */}

                        <div className="flex items-center gap-4 pt-6">
                            <input type="checkbox" name="active" value="true" defaultChecked={editing.active} id="active-checkbox" />
                            <label htmlFor="active-checkbox" className="text-xs font-bold uppercase tracking-widest">Active Status</label>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t mt-4">
                            <button type="button" onClick={() => setEditing(null)} className="px-6 py-2 text-xs font-bold uppercase opacity-40">Cancel</button>
                            <button type="submit" className="bg-brand-text text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {collections.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4 p-6 bg-white border rounded-2xl group hover:shadow-xl transition-all">
                        <div className="w-full h-32 bg-stone-100 rounded-xl overflow-hidden relative flex-none">
                            {col.bannerUrl ? (
                                <Image
                                    src={col.bannerUrl}
                                    alt={col.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-bold uppercase tracking-widest text-center p-2">
                                    No Banner
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif text-xl">{col.title}</h3>
                                    <span className={`text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${col.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {col.active ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-text/40 mt-1 uppercase tracking-widest">Links to Tag: {col.tag}</p>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setEditing(col)} className="text-[10px] font-bold uppercase border-b border-brand-text/20 pb-1 hover:border-brand-text transition-all">Edit</button>
                                <button onClick={() => handleDelete(col.id)} className="text-[10px] font-bold uppercase text-red-400 border-b border-red-200 pb-1 hover:border-red-400 transition-all">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {collections.length === 0 && !isRefreshing && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-brand-text/20 font-serif italic">
                        No banners found. Click &quot;Add New Banner&quot; to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
