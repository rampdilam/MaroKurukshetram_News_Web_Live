import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { verifyCode } from '../api/auth';
import { ArrowLeft, Shield, Loader2, RotateCcw } from 'lucide-react';

interface VerifyOTPProps {
  email: string;
  onBack: () => void;
  onSuccess: (email: string, code: string) => void;
  onResend: () => void;
}

const VerifyOTP: React.FC<VerifyOTPProps> = ({ email, onBack, onSuccess, onResend }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const newOtp = pastedData.split('').concat(Array(5 - pastedData.length).fill(''));
    setOtp(newOtp);
    setError('');
    
    // Focus the last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 4);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      setError(t('auth.invalidOTP'));
      return;
    }

    setLoading(true);

    try {
      const response = await verifyCode(email, otpCode);
      console.log('OTP verification successful:', response);
      onSuccess(email, otpCode);
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        type: error?.type
      });
      
      let errorMessage = t('auth.invalidOTPCode');
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

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      await onResend();
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      setError(error?.response?.data?.message || t('auth.resendFailed'));
    } finally {
      setResendLoading(false);
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
            {t('auth.verifyOTPTitle')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('auth.verifyOTPDescription', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700 text-center block">
                {t('auth.enterOTP')}
              </Label>
              
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={loading || otp.join('').length !== 5}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.verifying')}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('auth.verifyOTP')}
                  </>
                )}
              </Button>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('auth.back')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleResend}
                  disabled={loading || resendLoading || resendCooldown > 0}
                >
                  {resendLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  {resendCooldown > 0 ? `${t('auth.resendIn')} ${resendCooldown}s` : t('auth.resendOTP')}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;
