'use client';

import { useState, useEffect } from 'react';
import { adminUserService, AdminUserResponseDto } from '@/services/admin-user.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const { idToken } = useAuthStore();
    const [users, setUsers] = useState<AdminUserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (idToken) {
            loadAllUsers();
        }
    }, [idToken]);

    const loadAllUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminUserService.getAllUsers(idToken || undefined);
            setUsers(data);
        } catch (err: any) {
            console.error('Failed to load users', err);
            setError(err.message || 'Failed to load users');
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            return loadAllUsers();
        }

        try {
            setSearching(true);
            setError('');
            const matchingUsers = await adminUserService.searchUsers(searchQuery, idToken || undefined);
            setUsers(matchingUsers);
            toast.success(`${matchingUsers.length} user(s) found`);
        } catch (err: any) {
            console.error('User not found', err);
            setError('User not found or error occurred.');
            setUsers([]);
            toast.error('User not found');
        } finally {
            setSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        loadAllUsers();
    };

    const handleRoleChange = async (uid: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        try {
            await adminUserService.setUserRole(uid, newRole, idToken || undefined);
            toast.success(`User role updated to ${newRole} successfully`);
            
            // Refresh the current view
            if (searchQuery.trim()) {
                await handleSearch(new Event('submit') as any);
            } else {
                await loadAllUsers();
            }
        } catch (err: any) {
             console.error('Failed to update role', err);
             toast.error(err.message || 'Failed to update user role');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 mb-4">User Management</h1>
                    <p className="text-sm text-stone-500 font-sans tracking-wide">
                        View and manage user roles across the platform.
                    </p>
                </div>
            </div>

            <div className="bg-stone-50 p-6 border border-stone-200">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by email or UID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-stone-300 focus:outline-none focus:border-stone-500 bg-white"
                        autoComplete="off"
                    />
                    <button 
                        type="submit" 
                        disabled={searching || !searchQuery.trim()}
                        className="bg-stone-900 text-white px-6 py-2 uppercase tracking-wider text-xs font-bold hover:bg-stone-800 disabled:opacity-50 transition-colors"
                    >
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                    {searchQuery && (
                        <button 
                            type="button" 
                            onClick={handleClearSearch}
                            className="bg-stone-200 text-stone-700 px-6 py-2 uppercase tracking-wider text-xs font-bold hover:bg-stone-300 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-8 border border-red-200 flex flex-col items-center gap-4 text-center">
                    <div className="max-w-md">
                        <p className="font-serif text-lg mb-2">Something went wrong</p>
                        <p className="font-sans text-sm opacity-80">{error}</p>
                    </div>
                    <button 
                        onClick={loadAllUsers}
                        className="mt-2 bg-stone-900 text-white px-6 py-2 uppercase tracking-wider text-[10px] font-bold hover:bg-stone-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : loading ? (
                <div className="p-12 text-center text-stone-500 uppercase tracking-widest text-xs flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                    Loading users...
                </div>
            ) : (
                <div className="overflow-x-auto bg-white border border-stone-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-stone-100 uppercase tracking-widest text-[10px] text-stone-500 font-bold border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4">Firebase UID</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-stone-500 uppercase tracking-widest text-xs">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.uid} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-stone-600">{user.uid}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm ${user.isAdmin ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-700'}`}>
                                                {user.isAdmin ? 'Admin' : 'Customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.isAdmin ? (
                                                <button
                                                    onClick={() => handleRoleChange(user.uid, 'CUSTOMER')}
                                                    className="text-[10px] text-stone-500 hover:text-stone-900 uppercase tracking-wider font-bold transition-colors"
                                                >
                                                    Demote to Customer
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRoleChange(user.uid, 'ADMIN')}
                                                    className="text-[10px] text-brand hover:text-brand-dark uppercase tracking-wider font-bold transition-colors"
                                                >
                                                    Promote to Admin
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
