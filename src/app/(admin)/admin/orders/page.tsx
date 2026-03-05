"use client";

import { useEffect, useState } from "react";
import { adminOrderService } from "@/services/admin-order.service";
import { Transaction, PaymentStatus } from "@/types/transaction";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/firebase"; // Using direct auth for token
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Ensure auth is ready (AdminGuard guarantees user presence, but we need fresh token)
                const token = await auth.currentUser?.getIdToken();
                if (token) {
                    const data = await adminOrderService.getAllOrders(token);
                    setOrders(data);
                }
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <AdminLoadingState message="Loading orders..." />;
    }

    return (
        <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-serif text-stone-900 mb-8">Order Management</h1>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-stone-50 text-stone-900 border-b uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4 font-bold"># ID</th>
                            <th className="px-6 py-4 font-bold">Date time</th>
                            <th className="px-6 py-4 font-bold">Customer (UID)</th>
                            <th className="px-6 py-4 font-bold">Total</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.map(order => (
                            <tr key={order.tid} className="hover:bg-stone-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-stone-500">#{order.tid}</td>
                                <td className="px-6 py-4 text-stone-600">
                                    {format(new Date(order.datetime), "yyyy-MM-dd HH:mm")}
                                </td>
                                <td className="px-6 py-4 text-stone-600 font-mono text-xs">{order.buyerUid}</td>
                                <td className="px-6 py-4 font-medium text-stone-900">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === PaymentStatus.SUCCESS ? "bg-green-50 text-green-700 border-green-200" :
                                        order.status === PaymentStatus.PENDING ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                            order.status === PaymentStatus.ABORTED ? "bg-red-50 text-red-700 border-red-200" :
                                                "bg-gray-50 text-gray-700 border-gray-200"
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/orders/${order.tid}`}
                                        className="text-stone-900 hover:text-[#88C9C0] font-medium text-xs uppercase tracking-wide transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-stone-400 italic">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
