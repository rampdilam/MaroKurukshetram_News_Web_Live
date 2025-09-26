import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Clock,
    Share2,
    ThumbsUp,
    MessageCircle,
    Heart,
    User,
    Eye,
    MapPin,
    Tag,
    Send,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSingleNews } from "../api/apiSingleNews";
import apiClient from "../api/apiClient";
import { postComment, getComments, getCommentCount } from "../api/comments";
import { Comment, CommentsResponse } from "../api/apiTypes";
import RelatedNews from "../components/RelatedNews";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface SingleNewsData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    shortNewsContent: string;
    longNewsContent: { content: string };
    media: Array<{
        id: string;
        mediaType: string;
        mediaUrl: string;
        caption: string;
    }>;
    categoryId: string;
    categoryName: string;
    district_id: string;
    districtName: string;
    state_id: string;
    stateName: string;
    language_id: string;
    languageName: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    shareCount: number;
    createdAt: string;
    publishedAt: string | null;
    authorId: string | null;
    authorName?: string;
    editorId: string | null;
    source: string | null;
    sourceUrl: string | null;
    readTime: number | null;
}

const timeAgo = (date: Date): string => {
    const now = Date.now();
    const diff = Math.max(0, now - date.getTime());
    const min = Math.floor(diff / (60 * 1000));
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

// Convert YouTube URL into embeddable URL
const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`;
        }

        if (parsedUrl.hostname.includes("youtube.com")) {
            if (parsedUrl.pathname === "/watch") {
                return `https://www.youtube.com/embed/${parsedUrl.searchParams.get("v")}`;
            }
            if (parsedUrl.pathname.startsWith("/shorts/")) {
                return `https://www.youtube.com/embed/${parsedUrl.pathname.split("/")[2]}`;
            }
        }

        return null;
    } catch {
        return null;
    }
};

const NewsPage = () => {
    const { newsId } = useParams<{ newsId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [newsData, setNewsData] = useState<SingleNewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false); // UI state for like button (like Facebook/Instagram)
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(0); // PUBLIC: Like count visible to everyone (like Facebook/Instagram)
    const [liking, setLiking] = useState(false);
    const [userLiked, setUserLiked] = useState(false); // PRIVATE: User's like status - only visible to logged-in user
    
    // Comment count state (similar to likes)
    const [commentCount, setCommentCount] = useState(0);
    
    // Debug comment count changes
    useEffect(() => {
        console.log('🔄 Comment count changed:', commentCount);
    }, [commentCount]);
    
    // Comment state
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsPagination, setCommentsPagination] = useState({
        page: 1,
        perPage: 5, // Show only 5 comments initially (like likes system)
        total: 0,
        totalPages: 0
    });

    // Fetch likes data using GET endpoint
    // This works exactly like Facebook/Instagram: public like count, private user status
    const fetchLikes = async (newsId: string) => {
        try {
            console.log('=== FETCHING LIKES (GET) ===');
            console.log('News ID:', newsId);
            console.log('API Endpoint: GET /news/' + newsId + '/likes');
            
            const response = await apiClient.get(`/news/${newsId}/likes`);
            console.log('Fetch Likes API Response:', response.data);
            
            const data = response.data as any;
            console.log('Response structure:', data);
            
            // Handle your specific API response format
            if (data?.status === 1 && data?.result?.success) {
                // Try different possible response structures
                let totalLikes, isLikedByUser;
                
                if (data?.result?.data) {
                    // Structure: { status: 1, result: { success: true, data: { totalLikes, isLikedByUser } } }
                    totalLikes = data.result.data.totalLikes;
                    isLikedByUser = data.result.data.isLikedByUser;
                    console.log('Using data.result.data structure for fetch');
                } else if (data?.result) {
                    // Structure: { status: 1, result: { totalLikes, isLikedByUser } }
                    totalLikes = data.result.totalLikes;
                    isLikedByUser = data.result.isLikedByUser;
                    console.log('Using data.result structure for fetch');
                } else {
                    // Fallback: use defaults
                    totalLikes = 0;
                    isLikedByUser = false;
                    console.log('Using defaults for fetch');
                }
                
                console.log('API data received:', { totalLikes, isLikedByUser });
                
                // Public like count - visible to everyone
                setLikeCount(totalLikes || 0);
                
                // Private user like status - only for logged-in user
                const token = localStorage.getItem('token');
                if (token) {
                    setUserLiked(isLikedByUser || false);
                    setIsLiked(isLikedByUser || false); // For UI state
                } else {
                    setUserLiked(false);
                    setIsLiked(false);
                }
                
                console.log('✅ Likes loaded successfully - Public Count:', totalLikes || 0, 'User liked (private):', isLikedByUser || false);
            } else {
                console.log('❌ Invalid API response structure, using defaults');
                console.log('Expected format: { status: 1, result: { success: true, data: { totalLikes, isLikedByUser } } }');
                console.log('Actual response:', data);
                setLikeCount(0);
                setIsLiked(false);
                setUserLiked(false);
            }
        } catch (error) {
            console.error("❌ Error fetching likes:", error);
            console.log('Setting default values due to error');
            setLikeCount(0);
            setIsLiked(false);
        }
    };

    // Monitor state changes for debugging
    useEffect(() => {
        console.log('🔄 State changed - isLiked:', isLiked, 'likeCount:', likeCount, 'userLiked:', userLiked);
    }, [isLiked, likeCount, userLiked]);

    // Fetch comment count using GET endpoint (similar to likes)
    const fetchCommentCount = async (newsId: string) => {
        try {
            console.log('=== FETCHING COMMENT COUNT (GET) ===');
            console.log('News ID:', newsId);
            console.log('API Endpoint: GET /news/' + newsId + '/comments/count');
            
            const count = await getCommentCount(newsId);
            console.log('Comment count received:', count);
            
            setCommentCount(count);
        } catch (error) {
            console.error('Error fetching comment count:', error);
            setCommentCount(0);
        }
    };

    // Fetch comments for the news article (like likes system)
    const fetchComments = async (newsId: string, page: number = 1) => {
        try {
            setCommentsLoading(true);
            setCommentsError(null);
            
            console.log('=== FETCHING COMMENTS ===');
            console.log('News ID:', newsId);
            console.log('Page:', page);
            console.log('Per Page:', commentsPagination.perPage);
            
            const response = await getComments(newsId, page, commentsPagination.perPage);
            console.log('Comments response:', response);
            
            // If it's the first page, replace comments; otherwise append
            if (page === 1) {
                setComments(response.comments || []);
            } else {
                setComments(prev => [...prev, ...(response.comments || [])]);
            }
            
            setCommentsPagination({
                page: response.page,
                perPage: response.perPage,
                total: response.total,
                totalPages: response.totalPages
            });
            
            // Update comment count from the response (fallback if count API fails)
            if (response.total > 0) {
                setCommentCount(response.total);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            setCommentsError("Failed to load comments");
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Post a new comment
    const handlePostComment = async () => {
        if (!newsId || !newComment.trim() || postingComment) return;

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please log in to post comments.",
                variant: "destructive",
            });
            return;
        }

        try {
            setPostingComment(true);
            
            const commentData = {
                content: newComment.trim()
            };
            
            console.log('Sending comment data:', commentData);
            console.log('News ID:', newsId);
            
            const newCommentData = await postComment(newsId, commentData);
            
            // Add the new comment to the beginning of the list
            setComments(prev => [newCommentData, ...prev]);
            setNewComment("");
            
            // Update comment count immediately (increment by 1)
            setCommentCount(prev => prev + 1);
            
            // Also fetch updated comment count from API to ensure accuracy
            await fetchCommentCount(newsId);
            
            toast({
                title: "Comment Posted!",
                description: "Your comment has been posted successfully.",
            });
        } catch (error: any) {
            console.error("Error posting comment:", error);
            console.error("Error response data:", error?.response?.data);
            console.error("Error status:", error?.response?.status);
            
            let errorMessage = "Failed to post comment. Please try again.";
            if (error?.response?.status === 401) {
                errorMessage = "Please log in to post comments.";
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else if (error?.response?.status === 403) {
                errorMessage = "You don't have permission to post comments.";
            } else if (error?.response?.status === 422) {
                errorMessage = "Invalid comment data. Please check your input and try again.";
                console.error("422 Error details:", error?.response?.data);
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setPostingComment(false);
        }
    };

    // Load more comments (pagination) - like likes system
    const loadMoreComments = async () => {
        if (commentsPagination.page < commentsPagination.totalPages && !commentsLoading) {
            console.log('=== LOADING MORE COMMENTS ===');
            console.log('Current page:', commentsPagination.page);
            console.log('Total pages:', commentsPagination.totalPages);
            
            await fetchComments(newsId!, commentsPagination.page + 1);
        }
    };

    // Utility function to format time ago
    const timeAgo = (date: Date): string => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
        return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    };

    useEffect(() => {
        const fetchNews = async () => {
            if (!newsId) {
                setError("No news ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                window.scrollTo(0, 0);

                const data = await getSingleNews(newsId);
                setNewsData(data);
                setIsSaved(false);

                // Fetch current likes data from API
                await fetchLikes(newsId);
                
                // Fetch comment count from API (similar to likes)
                console.log('=== FETCHING COMMENT COUNT ON PAGE LOAD ===');
                await fetchCommentCount(newsId);
                
                // Fetch comments for the news article
                console.log('=== FETCHING COMMENTS ON PAGE LOAD ===');
                await fetchComments(newsId);
            } catch (err) {
                setError("Failed to load news article");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [newsId]);

    const handleShare = async () => {
        if (!newsData) return;
        const shareData = {
            title: newsData.title,
            text: newsData.excerpt || newsData.title,
            url: window.location.href,
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch {
                fallbackShare();
            }
        } else {
            fallbackShare();
        }
    };

    const fallbackShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
                alert("Link copied to clipboard!");
            } catch {
                alert("Unable to copy link");
            }
            document.body.removeChild(textArea);
        }
    };

    const handleLike = async () => {
        if (!newsId || liking) return;

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please log in to like articles.",
                variant: "destructive",
            });
            return;
        }

        console.log('=== LIKE BUTTON CLICKED ===');
        console.log('Current state before:', { isLiked, likeCount });
        console.log('JWT Token present:', !!token);

        // Store original state for potential rollback
        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;
        const originalUserLiked = userLiked;

        try {
            setLiking(true);
            
            // Calculate new state
            const newIsLiked = !isLiked;
            const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
            
            console.log('Calculating new state:', { newIsLiked, newLikeCount });
            console.log('Action:', newIsLiked ? 'ADDING LIKE' : 'REMOVING LIKE (DISLIKE)');
            
            // Update frontend immediately for better UX
            setIsLiked(newIsLiked);
            setUserLiked(newIsLiked);
            setLikeCount(newLikeCount);
            console.log('Frontend updated immediately:', { isLiked: newIsLiked, userLiked: newIsLiked, likeCount: newLikeCount });

            // Send to your API with proper format
            try {
                let response;
                
                if (newIsLiked) {
                    // User wants to LIKE - use POST to toggle like
                    const requestData = {
                        newsId: newsId,
                        totalLikes: newLikeCount,
                        isLikedByUser: newIsLiked
                    };
                    
                    console.log('Sending to API:', requestData);
                    console.log('API Endpoint: POST /news/' + newsId + '/likes');
                    console.log('Operation: TOGGLE LIKE');
                    
                    response = await apiClient.post(`/news/${newsId}/likes`, requestData);
                } else {
                    // User wants to UNLIKE - use DELETE to remove like
                    console.log('API Endpoint: DELETE /news/' + newsId + '/likes');
                    console.log('Operation: REMOVE LIKE');
                    
                    response = await apiClient.delete(`/news/${newsId}/likes`);
                }
                
                console.log('API Response:', response.data);

                // Process your specific API response structure
                if (response.data) {
                    const data = response.data as any;
                    console.log('Response structure:', data);
                    console.log('Full result object:', data?.result);
                    
                    // Check for your exact API response format
                    if (data?.status === 1 && data?.result?.success) {
                        // Try different possible response structures
                        let totalLikes, isLikedByUser;
                        
                        if (data?.result?.data) {
                            // Structure: { status: 1, result: { success: true, data: { totalLikes, isLikedByUser } } }
                            totalLikes = data.result.data.totalLikes;
                            isLikedByUser = data.result.data.isLikedByUser;
                            console.log('Using data.result.data structure');
                        } else if (data?.result) {
                            // Structure: { status: 1, result: { totalLikes, isLikedByUser } }
                            totalLikes = data.result.totalLikes;
                            isLikedByUser = data.result.isLikedByUser;
                            console.log('Using data.result structure');
                        } else {
                            // Fallback: use optimistic update
                            totalLikes = newLikeCount;
                            isLikedByUser = newIsLiked;
                            console.log('Using optimistic update as fallback');
                        }
                        
                        console.log('Parsed values:', { totalLikes, isLikedByUser });
                        
                        // Update with API data (API is source of truth)
                        setLikeCount(totalLikes || newLikeCount);
                        setIsLiked(isLikedByUser !== undefined ? isLikedByUser : newIsLiked);
                        setUserLiked(isLikedByUser !== undefined ? isLikedByUser : newIsLiked);
                        console.log('Updated with API data - Final count:', totalLikes || newLikeCount, 'User liked:', isLikedByUser !== undefined ? isLikedByUser : newIsLiked);
                        
                        // Show success feedback
                        const finalCount = totalLikes || newLikeCount;
                        const finalLiked = isLikedByUser !== undefined ? isLikedByUser : newIsLiked;
                        const action = finalLiked ? "liked" : "unliked";
                        toast({
                            title: finalLiked ? "👍 Liked!" : "👎 Disliked",
                            description: finalLiked 
                                ? `You liked this article! (${finalCount} total likes)` 
                                : `You disliked this article! (${finalCount} total likes)`,
                        });
                    } else {
                        console.log('API response format not recognized, keeping frontend count');
                        // Keep the optimistic update if API response is invalid
                        console.log('Keeping optimistic update - Count:', newLikeCount, 'User liked:', newIsLiked);
                        
                        // Show success feedback with optimistic data
                        const action = newIsLiked ? "liked" : "unliked";
                        toast({
                            title: newIsLiked ? "👍 Liked!" : "👎 Disliked",
                            description: newIsLiked 
                                ? `You liked this article! (${newLikeCount} total likes)` 
                                : `You disliked this article! (${newLikeCount} total likes)`,
                        });
                    }
                } else {
                    console.log('No API response, keeping frontend count');
                }
            } catch (apiError: any) {
                console.error('API call failed:', apiError);
                console.log('Reverting to original state due to API error');
                
                // Revert to original state on API failure
                setIsLiked(originalIsLiked);
                setUserLiked(originalUserLiked);
                setLikeCount(originalLikeCount);
                
                // Handle specific error types
                let errorMessage = "Failed to update like. Please try again.";
                if (apiError?.response?.status === 401) {
                    errorMessage = "Please log in to like articles.";
                    // Clear invalid token
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } else if (apiError?.response?.status === 403) {
                    errorMessage = "You don't have permission to like articles.";
                } else if (apiError?.type === 'NETWORK_ERROR') {
                    errorMessage = "Network error. Please check your connection.";
                }
                
                // Show user feedback
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }

            console.log('=== LIKE ACTION COMPLETED ===');
        } catch (error) {
            console.error("Unexpected error:", error);
            // Revert to original state on unexpected error
            setIsLiked(originalIsLiked);
            setUserLiked(originalUserLiked);
            setLikeCount(originalLikeCount);
        } finally {
            setLiking(false);
        }
    };

    // Remove like specifically using DELETE endpoint
    const removeLike = async (newsId: string) => {
        try {
            console.log('=== REMOVING LIKE (DELETE) ===');
            console.log('News ID:', newsId);
            console.log('API Endpoint: DELETE /news/' + newsId + '/likes');
            
            const response = await apiClient.delete(`/news/${newsId}/likes`);
            console.log('Remove Like API Response:', response.data);
            
            const data = response.data as any;
            
            if (data?.status === 1 && data?.result?.success) {
                // Refresh likes data after successful removal
                await fetchLikes(newsId);
                
                toast({
                    title: "Success",
                    description: "Like removed successfully!",
                });
            } else {
                console.log('Invalid response structure for remove like');
                toast({
                    title: "Error",
                    description: "Failed to remove like. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error removing like:", error);
            toast({
                title: "Error",
                description: "Failed to remove like. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
                        <p className="text-gray-600 text-base sm:text-lg">Loading news article...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !newsData) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 px-4">
                    <div className="text-center max-w-md">
                        <div className="text-5xl sm:text-6xl mb-6">😞</div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-8">{error || "News article not found"}</p>
                        <Button onClick={() => navigate("/")} className="bg-red-500 hover:bg-red-600">
                            Go Home
                        </Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const youtubeEmbedUrl = newsData.sourceUrl ? getYouTubeEmbedUrl(newsData.sourceUrl) : null;

    const content = newsData.longNewsContent?.content || newsData.shortNewsContent || "";
    const previewContent = content.split(" ").slice(0, 70).join(" ") + "...";
    const remainingContent = content.split(" ").slice(40).join(" ");

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow px-4 sm:px-6 lg:px-16 py-6">
                <div className="max-w-5xl mx-auto">
                    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-10">
                            {/* Title */}
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                                {newsData.title}
                            </h1>

                            {/* Excerpt */}
                            {newsData.excerpt && (
                                <div className="bg-gray-50 border-l-4 border-red-500 p-3 sm:p-4 mb-6 rounded-r-lg">
                                    <p className="text-base sm:text-lg text-gray-700 italic">
                                        {newsData.excerpt}
                                    </p>
                                </div>
                            )}

                            {/* YouTube */}
                            {youtubeEmbedUrl && (
                                <div className="mb-6 sm:mb-8">
                                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                                        <iframe
                                            src={youtubeEmbedUrl}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-56 sm:h-72 md:h-96"
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{timeAgo(new Date(newsData.publishedAt || newsData.createdAt))}</span>
                                </div>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium">
                                        {newsData.categoryName}
                                    </span>
                                </div>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                        {newsData.districtName}, {newsData.stateName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 ml-auto">
                                    <Eye className="h-4 w-4" />
                                    <span>{newsData.viewCount?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="text-gray-800 leading-relaxed mb-6 text-sm sm:text-base" style={{ textAlign: "justify" }}>
                                {previewContent}
                            </div>

                            {/* Main Image */}
                            {newsData.media?.[0]?.mediaUrl && (
                                <div className="relative h-48 sm:h-64 md:h-80 lg:h-[500px] bg-gray-200 overflow-hidden mb-6 rounded-lg">
                                    <img
                                        src={newsData.media[0].mediaUrl}
                                        alt={newsData.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {newsData.media[0].caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 sm:p-3">
                                            <p className="text-xs sm:text-sm">{newsData.media[0].caption}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Remaining Content */}
                            <div className="text-gray-800 leading-relaxed mb-8 text-sm sm:text-base" style={{ textAlign: "justify" }}>
                                {remainingContent}
                            </div>

                            {/* Extra Images */}
                            {newsData.media && newsData.media.length > 1 && (
                                <div className="mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold mb-4">More Images</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {newsData.media.slice(1).map((media, index) => (
                                            <div key={media.id} className="relative rounded-lg overflow-hidden">
                                                <img
                                                    src={media.mediaUrl}
                                                    alt={media.caption || `Additional image ${index + 1}`}
                                                    className="w-full h-40 sm:h-56 md:h-64 object-cover"
                                                />
                                                {media.caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                                                        <p className="text-xs sm:text-sm">{media.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            console.log('👍 Like button clicked! Current state:', { isLiked, likeCount, userLiked });
                                            handleLike();
                                        }}
                                        disabled={liking || !localStorage.getItem('token')}
                                        title={!localStorage.getItem('token') ? "Please log in to like articles" : (isLiked ? "Click to dislike this article" : "Click to like this article")}
                                        className={`transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
                                            isLiked 
                                                ? "bg-blue-100 text-blue-700 border border-blue-300 font-semibold" 
                                                : "hover:bg-gray-50"
                                        } ${liking ? "opacity-50 cursor-not-allowed" : ""} ${!localStorage.getItem('token') ? "opacity-60" : ""}`}
                                    >
                                        <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? "fill-current text-blue-600" : ""} ${liking ? "animate-pulse" : ""}`} />
                                        {liking ? "..." : likeCount.toLocaleString()}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setShowComments(!showComments)}
                                        className="hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        {commentCount.toLocaleString()}
                                    </Button>
                                    {/* <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSave}
                                        className={`hover:bg-pink-50 hover:text-pink-600 ${isSaved ? "bg-pink-50 text-pink-600" : ""}`}
                                    >
                                        <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                                    </Button> */}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleShare}
                                    className="w-full sm:w-auto hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Article
                                </Button>
                            </div>
                        </div>
                    </article>

                    {/* Comments Section */}
                    {showComments && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2" />
                                    Comments ({commentCount} total)
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Showing {comments.length} of {commentCount} comments
                                </p>
                            </div>

                            {/* Comment Input */}
                            <div className="mb-6">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Textarea
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="min-h-[80px] resize-none"
                                            disabled={postingComment}
                                        />
                                    </div>
                                    <Button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || postingComment}
                                        className="self-end"
                                    >
                                        {postingComment ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading comments...</span>
                                </div>
                            ) : commentsError ? (
                                <div className="text-center py-8 text-red-600">
                                    <p>{commentsError}</p>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => fetchComments(newsId!)}
                                        className="mt-2"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            ) : (comments || []).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No comments yet. Be the first to comment!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(comments || []).map((comment) => (
                                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {comment.user?.profilePicture ? (
                                                        <img
                                                            src={comment.user.profilePicture}
                                                            alt={`${comment.user?.firstName || 'User'} ${comment.user?.lastName || ''}`}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 text-sm">
                                                            {comment.user?.firstName || 'User'} {comment.user?.lastName || ''}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {timeAgo(new Date(comment.createdAt))}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 text-sm leading-relaxed">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Load More Button */}
                                    {commentsPagination.page < commentsPagination.totalPages && (
                                        <div className="text-center pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={loadMoreComments}
                                                disabled={commentsLoading}
                                                className="w-full sm:w-auto"
                                            >
                                                {commentsLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : null}
                                                Load More Comments ({commentCount - comments.length} remaining)
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Related News */}
                    {newsData.categoryId && newsData.language_id && newsData.district_id && (
                        <RelatedNews
                            categoryId={newsData.categoryId}
                            language_id={newsData.language_id}
                            state_id={newsData.state_id}
                            district_id={newsData.district_id}
                            currentNewsId={newsData.id}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NewsPage;