import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from '@/api/apiClient';

const ROLE_ID = "4f8617f0-a33e-4cc8-9971-704277715354" as const;

interface SignupProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onError: (error: string) => void;
  onClearError?: () => void;
}

const Signup = ({ onSuccess, onSwitchToLogin, onError, onClearError }: SignupProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName", 
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        onError(t("auth.fillAllFields") || "Please fill all fields");
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      onError(t("auth.invalidEmail") || "Please enter a valid email address");
      return false;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      onError(t("auth.invalidPhone") || "Please enter a valid 10-digit phone number");
      return false;
    }

    // Password length validation
    if (formData.password.length < 6) {
      onError(t("auth.passwordTooShort") || "Password must be at least 6 characters long");
      return false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      onError(t("auth.passwordMismatch") || "Passwords do not match");
      return false;
    }

    // Password strength validation (optional but recommended)
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordStrengthRegex.test(formData.password)) {
      onError(
        t("auth.weakPassword") || 
        "Password should contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const { confirmPassword, ...payload } = formData;

      const response = await apiClient.post(`/auth/register`, {
        ...payload,
        roleId: ROLE_ID,
      });

      console.log("Signup successful:", response.data);
      onSuccess();
      
      // Reset form after successful signup
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

    } catch (err: any) {
      console.error("Signup error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      // Handle 409 Conflict - User already exists
      if (err?.response?.status === 409) {
        const details = err?.response?.data?.details || err?.details;
        if (details && typeof details === 'string') {
          try {
            const parsedDetails = JSON.parse(details);
            errorMessage = parsedDetails.message || "User already exists with this email or phone number.";
          } catch {
            errorMessage = "User already exists with this email or phone number.";
          }
        } else {
          errorMessage = "User already exists with this email or phone number.";
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.type === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err?.type === 'SERVER_ERROR') {
        errorMessage = "Server error. Please try again later.";
      } else if (err?.type === 'CORS_ERROR') {
        errorMessage = "Connection error. Please refresh the page and try again.";
      }
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (onClearError) {
      onClearError();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/3b336ab1-e951-42a8-b0c4-758eed877e6a.png"
            alt="App Logo"
            className="h-18 w-32"
          />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder={t("auth.firstName") || "First Name"}
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full"
              autoComplete="given-name"
            />

            <Input
              placeholder={t("auth.lastName") || "Last Name"}
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full"
              autoComplete="family-name"
            />
          </div>

        <Input
          type="email"
          placeholder={t("auth.email") || "Email"}
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full"
          autoComplete="email"
        />

        <Input
          type="tel"
          placeholder={t("auth.phone") || "Phone"}
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              handleInputChange("phone", value);
            }
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full"
          maxLength={10}
          autoComplete="tel"
        />

        <Input
          type="password"
          placeholder={t("auth.password") || "Password"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full"
          autoComplete="new-password"
        />

        <Input
          type="password"
          placeholder={t("auth.confirmPassword") || "Confirm Password"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full"
          autoComplete="new-password"
        />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t("common.loading") || "Loading..."}
              </span>
            ) : (
              t("auth.signup") || "Sign Up"
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("auth.alreadyHaveAccount") || "Already have an account?"}{" "}
            <button
              type="button"
              className="text-red-600 underline hover:text-red-700 transition-colors"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              {t("auth.login") || "Login"}
            </button>
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("auth.termsAgreement") || "By signing up, you agree to our"}{" "}
            <button 
              type="button" 
              className="text-red-600 underline hover:text-red-700 transition-colors"
              disabled={loading}
            >
              {t("auth.termsOfService") || "Terms of Service"}
            </button>{" "}
            {t("common.and") || "and"}{" "}
            <button 
              type="button" 
              className="text-red-600 underline hover:text-red-700 transition-colors"
              disabled={loading}
            >
              {t("auth.privacyPolicy") || "Privacy Policy"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;