"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    RiAddLine,
    RiEditLine,
    RiDeleteBinLine,
    RiArrowRightSLine,
    RiRefreshLine
} from "@remixicon/react";
import { NavigationItem, navigationService } from "@/services/navigation.service";
import { cn } from "@/lib/utils";
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

export default function AdminNavigationPage() {
    const [items, setItems] = useState<NavigationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNavigation = async () => {
        setIsLoading(true);
        try {
            const data = await navigationService.getPublicNavigation();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch navigation", error);
            alert("Failed to load navigation items.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNavigation();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this specific item? (Children will also be deleted)")) return;
        try {
            await navigationService.deleteItem(id);
            fetchNavigation(); // Refresh
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete item.");
        }
    };

    const handleInit = async () => {
        if (!confirm("This will populate default hardcoded menu items only if the table is empty. Continue?")) return;
        try {
            await navigationService.initData();
            fetchNavigation();
        } catch (error) {
            console.error("Init failed", error);
            alert("Failed to initialize data.");
        }
    };

    if (isLoading) {
        return <AdminLoadingState message="Loading navigation..." />;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Navigation Management</h1>
                    <p className="text-stone-500 text-sm mt-1">Manage top-level tabs and dropdown items.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleInit}
                        className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <RiRefreshLine size={16} />
                        Init Defaults
                    </button>
                    <Link
                        href="/admin/navigation/create"
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-900/90 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <RiAddLine size={16} />
                        New Item
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm">Sort</th>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm">Label</th>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm">Type</th>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm">Action</th>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-stone-600 text-sm text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-stone-400">
                                    No navigation items found. Click &apos;Init Defaults&apos; or &apos;New Item&apos;.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <NavigationRow key={item.id} item={item} level={0} onDelete={handleDelete} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function NavigationRow({ item, level, onDelete }: { item: NavigationItem, level: number, onDelete: (id: number) => void }) {
    const isRoot = level === 0;

    return (
        <>
            <tr className={cn("hover:bg-stone-50/50 transition-colors group", level > 0 && "bg-stone-50/30")}>
                <td className="px-6 py-3 text-stone-400 text-xs font-mono">{item.sort_order}</td>
                <td className="px-6 py-3">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                        {isRoot ? (
                            <RiArrowRightSLine size={16} className="text-stone-400" />
                        ) : (
                            <div className="w-4 h-4 rounded-bl-lg border-l border-b border-stone-300 -mt-2 -ml-2" />
                        )}
                        <span className={cn("font-medium", isRoot ? "text-stone-800" : "text-stone-600")}>
                            {item.label}
                        </span>
                        {item.is_new && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">NEW</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-3">
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-medium border",
                        item.type === "TAB" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                        {item.type}
                    </span>
                </td>
                <td className="px-6 py-3 text-sm text-stone-600">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{item.action_type}</span>
                        <span className="truncate max-w-[200px]" title={item.action_value}>{item.action_value}</span>
                    </div>
                </td>
                <td className="px-6 py-3">
                    {item.is_active ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 block" title="Active" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-300 block" title="Inactive" />
                    )}
                </td>
                <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            href={`/admin/navigation/edit/${item.id}`}
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-900/10 rounded-md transition-colors"
                            title="Edit"
                        >
                            <RiEditLine size={18} />
                        </Link>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                        >
                            <RiDeleteBinLine size={18} />
                        </button>
                    </div>
                </td>
            </tr>
            {item.children && item.children.map(child => (
                <NavigationRow key={child.id} item={child} level={level + 1} onDelete={onDelete} />
            ))}
        </>
    );
}
