import apiClient from './apiClient';

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export const loginUser = async (emailOrPhone: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', { emailOrPhone, password: '***' });
    
    const response = await apiClient.post('/auth/userLogin', {
      emailOrPhone,
      password,
    });
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      type: error?.type
    });
    throw error;
  }
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  try {
    console.log('Attempting registration with:', { ...payload, password: '***' });
    
    const response = await apiClient.post('/auth/register', payload);
    
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      type: error?.type
    });
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<{ email: string }> => {
  try {
    console.log('Sending forgot password request for:', email);
    
    const response = await apiClient.post('/auth/forgot-password', { email });
    
    console.log('Forgot password response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const verifyCode = async (email: string, code: string): Promise<VerifyCodeResponse> => {
  try {
    console.log('Verifying OTP code for:', email);
    
    const response = await apiClient.post('/auth/verify-code', { email, code });
    
    console.log('Verify code response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Verify code error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<{ email: string; code: string; newPassword: string }> => {
  try {
    console.log('Resetting password for:', email);
    
    const response = await apiClient.post('/auth/reset-password', { 
      email, 
      code, 
      newPassword 
    });
    
    console.log('Reset password response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw error;
  }
};
