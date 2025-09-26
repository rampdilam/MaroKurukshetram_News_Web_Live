import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { forgotPassword, verifyCode, resetPassword } from '../api/auth';

const ForgotPasswordTest: React.FC = () => {
  const [email, setEmail] = useState('anji@gmail.com');
  const [code, setCode] = useState('41676');
  const [newPassword, setNewPassword] = useState('Anji@1234');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testForgotPassword = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing forgot password API...');
      const response = await forgotPassword(email);
      console.log('Forgot password response:', response);
      setResult({ step: 'forgot', data: response });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(`Forgot Password Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerifyCode = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing verify code API...');
      const response = await verifyCode(email, code);
      console.log('Verify code response:', response);
      setResult({ step: 'verify', data: response });
    } catch (err: any) {
      console.error('Verify code error:', err);
      setError(`Verify Code Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testResetPassword = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing reset password API...');
      const response = await resetPassword(email, code, newPassword);
      console.log('Reset password response:', response);
      setResult({ step: 'reset', data: response });
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(`Reset Password Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCompleteFlow = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing complete forgot password flow...');
      
      // Step 1: Forgot Password
      console.log('Step 1: Forgot Password');
      const forgotResponse = await forgotPassword(email);
      console.log('Forgot password response:', forgotResponse);
      
      // Step 2: Verify Code
      console.log('Step 2: Verify Code');
      const verifyResponse = await verifyCode(email, code);
      console.log('Verify code response:', verifyResponse);
      
      // Step 3: Reset Password
      console.log('Step 3: Reset Password');
      const resetResponse = await resetPassword(email, code, newPassword);
      console.log('Reset password response:', resetResponse);
      
      setResult({ 
        step: 'complete', 
        data: { 
          forgot: forgotResponse, 
          verify: verifyResponse, 
          reset: resetResponse 
        } 
      });
    } catch (err: any) {
      console.error('Complete flow error:', err);
      setError(`Complete Flow Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forgot Password API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 5-digit code"
                maxLength={5}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                type="password"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testForgotPassword} 
              disabled={loading}
              variant="outline"
            >
              Test Forgot Password
            </Button>
            <Button 
              onClick={testVerifyCode} 
              disabled={loading}
              variant="outline"
            >
              Test Verify Code
            </Button>
            <Button 
              onClick={testResetPassword} 
              disabled={loading}
              variant="outline"
            >
              Test Reset Password
            </Button>
            <Button 
              onClick={testCompleteFlow} 
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              Test Complete Flow
            </Button>
          </div>

          {loading && (
            <Alert>
              <AlertDescription>Testing API calls... Check console for details.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    {result.step === 'forgot' && 'Forgot Password Success!'}
                    {result.step === 'verify' && 'Verify Code Success!'}
                    {result.step === 'reset' && 'Reset Password Success!'}
                    {result.step === 'complete' && 'Complete Flow Success!'}
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordTest;













