"use client";

import { useEffect, useState, use } from "react";
import { adminOrderService } from "@/services/admin-order.service";
import { Transaction, PaymentStatus } from "@/types/transaction";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ tid: string }> }) {
    const { tid } = use(params);
    const [order, setOrder] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (token && tid) {
                    const data = await adminOrderService.getOrderById(tid, token);
                    setOrder(data);
                }
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [tid]);

    if (loading) {
        return <AdminLoadingState message="Loading details..." />;
    }

    if (!order) {
        return (
            <div className="container mx-auto px-6 py-12 text-center text-stone-500">
                Order not found.
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl pb-20">
            <div className="mb-6">
                <Link href="/admin/orders" className="text-stone-500 hover:text-stone-900 text-sm flex items-center gap-1 transition-colors">
                    ← Back to Orders
                </Link>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-serif text-stone-900 mb-2">Order #{order.tid}</h1>
                        <div className="text-stone-500 text-sm">
                            {format(new Date(order.datetime), "MMMM d, yyyy 'at' HH:mm")}
                        </div>
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${order.status === PaymentStatus.SUCCESS ? "bg-green-50 text-green-700 border-green-200" :
                            order.status === PaymentStatus.PENDING ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                order.status === PaymentStatus.ABORTED ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-gray-50 text-gray-700 border-gray-200"
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Customer Info</h3>
                        <div className="bg-stone-50 p-4 rounded-lg">
                            <div className="text-xs text-stone-400 uppercase">User ID</div>
                            <div className="font-mono text-sm break-all">{order.buyerUid}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Payment Summary</h3>
                        <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-500">Subtotal</span>
                                <span className="font-medium">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-500">Points Used</span>
                                <span className="text-stone-900">{order.usedPoints}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-stone-200">
                                <span className="font-bold text-stone-900">Total Paid</span>
                                <span className="font-bold text-stone-900">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1">
                                <span className="text-green-600">Points Earned</span>
                                <span className="text-green-600">+{order.earnedPoints.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-6">Items ({order.items.length})</h3>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.tpid} className="flex items-center gap-4 bg-stone-50 p-4 rounded-lg border border-transparent hover:border-stone-200 transition-colors">
                                <div className="w-16 h-16 bg-white rounded border overflow-hidden flex-shrink-0 relative">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-stone-900 truncate">{item.name}</h4>
                                    <div className="text-xs text-stone-500 mt-1 flex gap-2">
                                        <span className="font-mono bg-white px-1 rounded border">SKU: {item.sku}</span>
                                        <span>{item.color} / {item.size}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-medium">${item.price.toFixed(2)}</div>
                                    <div className="text-xs text-stone-500">Qty: {item.quantity}</div>
                                    <div className="text-sm font-bold mt-1">${item.subtotal.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
