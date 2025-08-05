'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
    Search,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Users,
    Filter,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowLeft
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    isEmailVerified: boolean;
    phoneNumber: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Search input ref for keyboard shortcut
    const searchInputRef = useRef<HTMLInputElement>(null);


    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/users/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('Expected array but got:', typeof data, data);
                setUsers([]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredUsers = (users || []).filter((user: User) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phoneNumber && user.phoneNumber.includes(searchTerm));

        const matchesFilter = filterVerified === 'all' ||
            (filterVerified === 'verified' && user.isEmailVerified) ||
            (filterVerified === 'unverified' && !user.isEmailVerified);

        return matchesSearch && matchesFilter;
    });






    // Pagination calculations
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);


    // Pagination handlers
    const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };


    const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
    const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);
    const goToPreviousPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
    const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);



    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Keyboard navigation for pagination and search
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Handle Ctrl+/ for search focus
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }

            // Handle pagination shortcuts only if search input is not focused
            if (document.activeElement !== searchInputRef.current && (event.ctrlKey || event.metaKey)) {
                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        if (currentPage > 1) goToPreviousPage();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        if (currentPage < totalPages) goToNextPage();
                        break;
                    case 'Home':
                        event.preventDefault();
                        goToFirstPage();
                        break;
                    case 'End':
                        event.preventDefault();
                        goToLastPage();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, goToFirstPage, goToLastPage, goToNextPage, goToPreviousPage, totalPages]);







    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterVerified]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const exportUsers = () => {
        const csvContent = [
            ['Name', 'Email', 'Phone', 'Email Verified', 'Created At'],
            ...filteredUsers.map((user: User) => [
                user.name,
                user.email,
                user.phoneNumber || 'N/A',
                user.isEmailVerified ? 'Yes' : 'No',
                formatDate(user.createdAt)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-200 rounded"></div>
                                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Users</h3>
                            <p className="text-red-600 mb-4">
                                {error || 'Failed to load users. Please try again.'}
                            </p>
                            <Button onClick={fetchUsers} className="bg-red-600 hover:bg-red-700 cursor-pointer">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    {/* Back Button */}
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/admin/dashboard')}
                            className="flex items-center space-x-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </Button>
                    </div>

                    {/* Title and Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                                User Management
                            </h1>
                            <p className="text-slate-600">Manage and monitor all registered users</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/80 px-6 py-3 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-2xl font-bold text-slate-700">{totalUsers}</span>
                                        <p className="text-sm text-slate-500">
                                            {totalUsers === filteredUsers.length ? 'Total Users' : `of ${users.length} Users`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={exportUsers}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-16 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded border">
                                    Ctrl+/
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    <select
                                        title="Filter Options"
                                        value={filterVerified}
                                        onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
                                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="verified">Verified Only</option>
                                        <option value="unverified">Unverified Only</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-600">Show:</span>
                                    <select
                                        title="Items per page"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-sm"
                                    >
                                        <option value={8}>8</option>
                                        <option value={12}>12</option>
                                        <option value={16}>16</option>
                                        <option value={24}>24</option>
                                        <option value={48}>48</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedUsers.map((user) => (
                        <Card
                            key={user.id}
                            className="group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-out border-0 shadow-lg bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 hover:border-blue-200/50 hover:border relative overflow-hidden"
                        >
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardContent className="p-6 relative z-10">
                                {/* User Avatar and Basic Info */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="relative">
                                        <Avatar className="w-14 h-14 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-110">
                                            <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {user.isEmailVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 ring-2 ring-white">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors text-lg">
                                            {user.name}
                                        </h3>
                                        <Badge
                                            variant={user.isEmailVerified ? "default" : "secondary"}
                                            className={`text-xs font-medium ${user.isEmailVerified
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                                : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                                                }`}
                                        >
                                            {user.isEmailVerified ? "✓ Verified" : "⏳ Pending"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-sm group-hover:text-slate-700 transition-colors">
                                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                                        </div>
                                        <span className="text-slate-600 truncate flex-1" title={user.email}>
                                            {user.email}
                                        </span>
                                    </div>

                                    {user.phoneNumber && (
                                        <div className="flex items-center space-x-3 text-sm group-hover:text-slate-700 transition-colors">
                                            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                                <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-green-600" />
                                            </div>
                                            <span className="text-slate-600">{user.phoneNumber}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 text-sm group-hover:text-slate-700 transition-colors">
                                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-purple-100 transition-colors">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-600" />
                                        </div>
                                        <span className="text-slate-600">
                                            Joined {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="mt-6 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/admin/users/profile/${user.id}`)}
                                            className="w-full text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 cursor-pointer"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-slate-600">
                                        Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{' '}
                                        <span className="font-semibold text-slate-800">{Math.min(endIndex, totalUsers)}</span> of{' '}
                                        <span className="font-semibold text-slate-800">{totalUsers}</span> users
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                                        <span>Page {currentPage} of {totalPages}</span>
                                        {totalPages > 10 && (
                                            <div className="flex items-center space-x-1 ml-4">
                                                <span className="text-xs">Go to:</span>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={totalPages}
                                                    value={currentPage}
                                                    onChange={(e) => {
                                                        const page = parseInt(e.target.value);
                                                        if (page >= 1 && page <= totalPages) {
                                                            goToPage(page);
                                                        }
                                                    }}
                                                    className="w-16 h-8 text-xs text-center"
                                                />
                                            </div>
                                        )}
                                        <div className="text-xs text-slate-400 ml-4" title="Keyboard shortcuts">
                                            Ctrl+/ search, Ctrl+← → navigation
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className="p-2 cursor-pointer"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="p-2 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNumber = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + i;
                                            } else {
                                                pageNumber = currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => goToPage(pageNumber)}
                                                    className={`w-10 h-10 p-0 cursor-pointer ${currentPage === pageNumber
                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                        : "hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="p-2 cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        className="p-2 cursor-pointer"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {totalUsers === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                            <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Users className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No users found</h3>
                            <p className="text-slate-500">
                                {searchTerm || filterVerified !== 'all'
                                    ? "Try adjusting your search or filter criteria"
                                    : "No users have registered yet"
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}