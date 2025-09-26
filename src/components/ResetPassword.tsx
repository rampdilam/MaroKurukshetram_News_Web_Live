import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { resetPassword } from '../api/auth';
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  email: string;
  code: string;
  onBack: () => void;
  onSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email, code, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (!passwordValidation.isValid) {
      setError(t('auth.passwordRequirements'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(email, code, newPassword);
      console.log('Reset password successful:', response);
      setSuccess(t('auth.passwordResetSuccess'));
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        type: error?.type
      });
      
      let errorMessage = t('auth.passwordResetFailed');
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 400) {
        errorMessage = t('auth.invalidOTPCode');
      } else if (error?.response?.status === 404) {
        errorMessage = t('auth.otpExpired');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 md:max-h-none md:overflow-visible">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/lovable-uploads/3b336ab1-e951-42a8-b0c4-758eed877e6a.png"
              alt="App Logo"
              className="h-18 w-32"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t('auth.resetPasswordTitle')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('auth.resetPasswordDescription', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                {t('auth.newPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {newPassword && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`} />
                    {t('auth.passwordMinLength')}
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-500'}`} />
                    {t('auth.passwordUpperCase')}
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-500'}`} />
                    {t('auth.passwordLowerCase')}
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-500'}`} />
                    {t('auth.passwordNumbers')}
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}`} />
                    {t('auth.passwordSpecialChar')}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                {t('auth.confirmNewPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.confirmNewPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.resetting')}
                  </>
                ) : (
                  t('auth.resetPassword')
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.back')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
