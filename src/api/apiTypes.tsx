// API Response for Categories
export interface LocalMandiCategoriesResponse {
  status: number;
  message: string;
  result: {
    categories: LocalMandiCategory[];
  };
}

// Raw shape returned by /news/languages
export interface APILanguageRaw {
  id: string;
  is_active: number;
  language_name: string;
  language_code: string;
  created_at: string;
}

// App-wide normalized language type
export interface Language {
  id: string;
  languageName: string;
  code: string;
  is_active: number;
  createdAt: string;
  // Optional legacy fields still referenced in some places
  image?: string;
  icon?: string;
  wordEng?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface State {
  id: string;
  name: string;
  language_id: string;
  code: string;
  icon?: string;
  // Back-compat alias
  languageName?: string;
  // Optional fields from new API
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean | number | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface District {
  id: string;
  name: string;
  state_id: string;
  language_id: string;
  createdAt: string;
  updatedAt: string;
  is_active: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}

export interface Category {
  id: string;
  category_name: string;
  language_id: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: number;
  deleted_at: string | null;
  // Legacy fields for backward compatibility
  name?: string;
  languageName?: string;
}

export interface LocalMandiCategory {
  categoryName: any;
  id: string;
  name: string;
  language_id: string;
  icon?: string;
  color?: string;
  is_active: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMandiItem {
  id: string;
  name: string;
  minPrice: string;
  maxPrice: string;
  avgPrice: string;
  itemIcon: string | null;
  description: string;
  state_id: string;
  stateName: string;
  district_id: string;
  districtName: string;
  language_id: string;
  languageName: string;
  localMandiCategoryId: string;
  categoryName: string;
  unit: string;
  quality: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface LocalMandi {
  id: string;
  mandiName: string;
  location: string;
  state_id: string;
  district_id: string;
  categoryId: string;
  image?: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  is_active: number;
}

export interface LocalMandiResponse {
  status: number;
  message: string;
  result: {
    items: LocalMandiItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface LocalMandiCategoryResponse extends ApiResponse<LocalMandiCategory[]> {}

export interface GetLocalMandisParams {
  page: number;
  limit: number;
  categoryId: string;
  state_id: string;
  district_id: string;
}

// Comment Types
export interface CommentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

export interface Comment {
  id: string;
  content: string;
  newsId: string;
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PostCommentRequest {
  content: string;
  newsId?: string;
}

export interface NewsMedia {
  caption: string;
  id: string;
  mediaUrl: string;
  mediaType: string;
}

export interface NewsItem {
  createdAt: string;
  viewCount: any;
  id: string;
  title: string;
  excerpt?: string | null;
  publishedAt: string;
  authorId: string;
  categoryId: string;
  district_id: string;
  media: NewsMedia[];
  content?: string | null;
  shortNewsContent?: string | null;
  authorName?: string;
}

export interface NewsResponse {
  items: NewsItem[];
  totalCount?: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  createdBy: string;
  updatedBy: string;
  profilePicture?: string;
  gender?: string;
  dob?: string;
  status?: string;
  is_active?: boolean;
  avatar?: string;
  preferences?: {
    theme: string;
    notifications: boolean;
  };
}

export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: string;
  is_active: boolean;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  result: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string | null;
    dob: string | null;
    status: string;
    is_active: boolean;
    profilePicture: string | null;
    avatar: string | null;
    preferences: {
      theme: string;
      notifications: boolean;
    };
    lastLoginAt: string | null;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    roleId: string;
    isDeleted: boolean;
    deletedAt: string | null;
    role: {
      id: string;
      role: string;
      role_type: string;
      isApproved: boolean;
      createdAt: string;
    };
    token: string;
    isAdmin: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}

// apiTypes.ts

export type LanguageResponse = {
  status: number;
  message: string;
  result: APILanguageRaw[];
};

// E-Newspaper Types
export interface ENewspaper {
  id: string;
  language_id: string;
  date: string;
  pdfPath: string | null;
  pdfUrl: string;
  type: string;
  thumbnail: string | null;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  language: {
    id: string;
    languageName: string;
    icon: string;
    code: string;
    createdAt: string;
    is_active: boolean;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    dob: string;
    status: string;
    is_active: boolean;
    profilePicture: string;
    avatar: string;
    preferences: {
      theme: string;
      notifications: boolean;
    };
    lastLoginAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    roleId: string;
    isDeleted: boolean;
    deletedAt: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: string | null;
  };
}

export interface ENewspaperResponse {
  status: number;
  message: string;
  result: {
    items: ENewspaper[];
    limit: number;
    page: number;
    total: number;
  };
}

export interface GetENewspapersParams {
  page?: number;
  limit?: number;
  language_id: string;
  dateFrom: string;
  dateTo: string;
  type?: string;
}
