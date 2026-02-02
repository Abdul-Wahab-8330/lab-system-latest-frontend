import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Star,
    StarOff,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    Settings,
    Filter,
    Search,
    ChevronDown,
    AlertCircle,
    TrendingUp,
    Users,
    Award
} from 'lucide-react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthProvider';
import { useRef } from 'react';
import { socket } from '@/socket';

// ===================================
// ADMIN REVIEW MANAGEMENT COMPONENT
// ===================================
export function AdminReviewManagement() {
    const { user } = useContext(AuthContext);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [stats, setStats] = useState({
        averageRating: 0,
        counts: { approved: 0, pending: 0, rejected: 0 }
    });

    // Filters
    const [filters, setFilters] = useState({
        status: 'all',
        rating: 'all',
        sort: 'newest',
        search: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Settings
    const [settings, setSettings] = useState({
        reviewsEnabled: true,
        reviewsRequireApproval: false,
        reviewsShowReviewerName: true
    });
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    useEffect(() => {
        loadReviews();
    }, [filters, currentPage, reloadTrigger]); // ✅ ADD reloadTrigger here

    useEffect(() => {
        loadSettings();
    }, []); // ✅ Move loadSettings to separate useEffect

    useEffect(() => {
        const handleReviewUpdate = () => {
            console.log('📢 Review update received');
            setReloadTrigger(prev => prev + 1); // ✅ Just trigger reload
            toast.success('Reviews updated');
        };

        const handleReviewSettingsUpdate = (data) => {
            console.log('⚙️ Review settings updated:', data);
            setSettings(data); // ✅ Keep this - it's good
            toast('Review settings updated');
        };

        socket.on('reviewStatusUpdated', handleReviewUpdate);
        socket.on('reviewDeleted', handleReviewUpdate);
        socket.on('newReviewSubmitted', handleReviewUpdate);
        socket.on('reviewSettingsUpdated', handleReviewSettingsUpdate);

        return () => {
            socket.off('reviewStatusUpdated', handleReviewUpdate);
            socket.off('reviewDeleted', handleReviewUpdate);
            socket.off('newReviewSubmitted', handleReviewUpdate);
            socket.off('reviewSettingsUpdated', handleReviewSettingsUpdate);
            socket.disconnect();
        };
    }, []); // ✅ Now safe - no external dependencies

    const loadReviews = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                sort: filters.sort
            };

            if (filters.status !== 'all') params.status = filters.status;
            if (filters.rating !== 'all') params.rating = filters.rating;
            if (filters.search) params.search = filters.search;

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/admin`, { params });

            setReviews(res.data.reviews);
            setTotalPages(res.data.totalPages);
            setStats({
                averageRating: res.data.averageRating,
                counts: res.data.counts
            });
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/admin/settings`);
            setSettings(res.data.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const updateReviewStatus = async (reviewId, status) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/reviews/admin/${reviewId}/status`,
                { status }
            );
            toast.success(`Review ${status} successfully`);
            loadReviews();
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        }
    };

    const deleteReview = async () => {
        if (!reviewToDelete) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/reviews/admin/${reviewToDelete._id}`);
            toast.success('Review deleted successfully');
            setDeleteDialogOpen(false);
            setReviewToDelete(null);
            loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/reviews/admin/settings`,
                newSettings
            );
            setSettings(newSettings);
            toast.success('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0 mb-6 ">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Review Management</CardTitle>
                                    <p className="text-blue-100 mt-1">Manage patient reviews and ratings</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setSettingsOpen(true)}
                                className="  hover:bg-white/30 border border-gray-300 hover:border-2 hover:shadow-md"
                            >
                                <Settings className="h-4 w-4 " />
                                Settings
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6  ">
                    <Card className='bg-white border border-gray-300'>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-bold text-blue-600">
                                            {stats.averageRating.toFixed(1)}
                                        </p>
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Award className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='bg-white border border-gray-300'>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.counts.approved}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='bg-white border border-gray-300'>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.counts.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='bg-white border border-gray-300'>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.counts.rejected}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6 bg-white border border-gray-300">
                    <CardContent className="px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Search</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Patient name, number..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="pl-10 border border-gray-300"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Status</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between border border-gray-300">
                                            {filters.status === 'all' ? 'All Status' : filters.status}
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full bg-white">
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, status: 'all' })}>
                                            All Status
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, status: 'approved' })}>
                                            Approved
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, status: 'pending' })}>
                                            Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, status: 'rejected' })}>
                                            Rejected
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Rating</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between border border-gray-300">
                                            {filters.rating === 'all' ? 'All Ratings' : `${filters.rating} Stars`}
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full bg-white">
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, rating: 'all' })}>
                                            All Ratings
                                        </DropdownMenuItem>
                                        {[5, 4, 3, 2, 1].map((r) => (
                                            <DropdownMenuItem key={r} onClick={() => setFilters({ ...filters, rating: r })}>
                                                {r} Stars
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Sort */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-2">Sort By</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between border border-gray-300">
                                            {filters.sort === 'newest' && 'Newest First'}
                                            {filters.sort === 'oldest' && 'Oldest First'}
                                            {filters.sort === 'highest' && 'Highest Rating'}
                                            {filters.sort === 'lowest' && 'Lowest Rating'}
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full bg-white">
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'newest' })}>
                                            Newest First
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'oldest' })}>
                                            Oldest First
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'highest' })}>
                                            Highest Rating
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'lowest' })}>
                                            Lowest Rating
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews List */}
                <Card className='bg-white border border-gray-300 shadow-sm'>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                <p className="mt-5 text-gray-600 font-medium">Loading reviews...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-5 flex items-center justify-center">
                                    <MessageSquare className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="text-gray-700 font-semibold text-lg mb-2">No reviews found</p>
                                <p className="text-gray-500 text-sm">Reviews will appear here once submitted</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 bg-white"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                                                    {review.patientName.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 text-lg">{review.patientName}</h3>
                                                    <div className="flex items-center">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <Badge
                                                        className={
                                                            review.status === 'approved'
                                                                ? 'bg-green-50 text-green-700 border border-green-200 font-medium'
                                                                : review.status === 'pending'
                                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200 font-medium'
                                                                    : 'bg-red-50 text-red-700 border border-red-200 font-medium'
                                                        }
                                                    >
                                                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <p className="text-gray-600 font-medium">
                                                        Patient #: <span className="text-gray-900">{review.patientRefNo}</span>
                                                    </p>
                                                    <span className="text-gray-300">•</span>
                                                    <p className="text-gray-500">
                                                        {new Date(review.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateReviewStatus(review._id, 'approved')}
                                                            className="bg-green-600 hover:bg-green-700 shadow-sm"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateReviewStatus(review._id, 'rejected')}
                                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1.5" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setReviewToDelete(review);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Review Text */}
                                        {review.reviewText && (
                                            <div className="ml-16 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 border border-gray-100">
                                                <p className="text-gray-700 text-sm leading-relaxed italic">
                                                    "{review.reviewText}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="shadow-sm disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600 font-medium px-3 py-1 bg-gray-50 rounded-md">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="shadow-sm disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Settings Dialog */}
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogContent className="max-w-md bg-white border border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-600" />
                                Review Settings
                            </DialogTitle>
                            <DialogDescription>
                                Configure how reviews work in your system
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Enable Reviews */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label className="font-semibold">Enable Reviews</Label>
                                    <p className="text-sm text-gray-500">
                                        Allow patients to submit reviews
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, reviewsEnabled: !settings.reviewsEnabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.reviewsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.reviewsEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <Separator />

                            {/* Require Approval */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label className="font-semibold">Require Approval</Label>
                                    <p className="text-sm text-gray-500">
                                        Reviews need approval before showing
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, reviewsRequireApproval: !settings.reviewsRequireApproval })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.reviewsRequireApproval ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.reviewsRequireApproval ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <Separator />

                            {/* Show Reviewer Name */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label className="font-semibold">Show Reviewer Name</Label>
                                    <p className="text-sm text-gray-500">
                                        Display patient name with review
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, reviewsShowReviewerName: !settings.reviewsShowReviewerName })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.reviewsShowReviewerName ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.reviewsShowReviewerName ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    updateSettings(settings);
                                    setSettingsOpen(false);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 border"
                            >
                                Save Settings
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-md bg-white border border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Delete Review
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        {reviewToDelete && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="font-semibold">{reviewToDelete.patientName}</p>
                                    {renderStars(reviewToDelete.rating)}
                                </div>
                                {reviewToDelete.reviewText && (
                                    <p className="text-sm text-gray-600">"{reviewToDelete.reviewText}"</p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={deleteReview}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// ===================================
// PUBLIC REVIEW SUBMISSION DIALOG
// ===================================
export function ReviewDialog({ open, onOpenChange, patientData, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientRefNo: patientData.refNo,
                    patientPhone: patientData.phone,
                    patientName: patientData.name,
                    rating,
                    reviewText
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Thank you for your review!');
                onOpenChange(false);
                setRating(0);
                setReviewText('');

                // Mark as reviewed in localStorage
                localStorage.setItem(`reviewed_${patientData.refNo}`, 'true');
                // ✅ Call the callback to refresh reviews immediately
                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }

            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white border border-gray-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Rate Your Experience
                    </DialogTitle>
                    <DialogDescription>
                        Help us improve our services by sharing your feedback
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div>
                        <Label className="font-semibold mb-3 block">Your Rating</Label>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-10 w-10 ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-gray-600 mt-2">
                                {rating === 5 && '⭐ Excellent!'}
                                {rating === 4 && '😊 Very Good!'}
                                {rating === 3 && '👍 Good'}
                                {rating === 2 && '😐 Fair'}
                                {rating === 1 && '😞 Needs Improvement'}
                            </p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div>
                        <Label className="font-semibold mb-2 block">
                            Your Feedback <span className="text-gray-400 font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                            placeholder="Tell us about your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="resize-none border border-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {reviewText.length}/500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ===================================
// PUBLIC REVIEWS DISPLAY WIDGET
// ===================================
export function PublicReviewsWidget() {
    const [reviews, setReviews] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        distribution: {}
    });
    const [settings, setSettings] = useState({
        enabled: true,
        showReviewerName: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, [reloadTrigger]); // ✅ ADD reloadTrigger

    const loadReviews = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/public?limit=10`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
                setStats(data.stats);
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add this INSIDE PublicReviewsWidget component
    useEffect(() => {
        const handleReviewUpdate = () => {
            console.log('📢 Review updated, reloading...');
            setReloadTrigger(prev => prev + 1); // ✅ Just trigger reload
        };

        socket.on('reviewStatusUpdated', handleReviewUpdate);
        socket.on('reviewDeleted', handleReviewUpdate);
        socket.on('reviewSettingsUpdated', handleReviewUpdate);
        socket.on('newReviewSubmitted', handleReviewUpdate);

        return () => {
            socket.off('reviewStatusUpdated', handleReviewUpdate);
            socket.off('reviewDeleted', handleReviewUpdate);
            socket.off('reviewSettingsUpdated', handleReviewUpdate);
            socket.off('newReviewSubmitted', handleReviewUpdate);
            socket.disconnect();
        };
    }, []);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (!settings.enabled || loading) {
        return null;
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Reviews</h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-6 w-6 ${star <= Math.round(stats.averageRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xl font-semibold text-gray-900">
                        {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({stats.totalReviews} reviews)</span>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start gap-3 mb-2">
                            {/* Person Icon/Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                                    {settings.showReviewerName && review.patientName
                                        ? review.patientName.charAt(0).toUpperCase()
                                        : '👤'}
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        {settings.showReviewerName && review.patientName && (
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {review.patientName}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {review.reviewText && (
                                    <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                        "{review.reviewText}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminReviewManagement;