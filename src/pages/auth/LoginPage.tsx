import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

// Generate mock OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1 — credentials submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockOtp = generateOTP();
      setGeneratedOtp(mockOtp);
      setOtpSent(true);
      setStep(2);
      // Show OTP in console for demo
      console.log('Your OTP is:', mockOtp);
      alert(`Demo OTP: ${mockOtp}\n(In a real app this would be sent to your email)`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — OTP submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const enteredOtp = otp.join('');

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password, role);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    const mockOtp = generateOTP();
    setGeneratedOtp(mockOtp);
    setOtp(['', '', '', '', '', '']);
    alert(`New Demo OTP: ${mockOtp}`);
  };

  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className={`flex items-center gap-2`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>
            <span className={`text-sm font-medium ${step === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              Credentials
            </span>
          </div>
          <div className={`h-px w-8 ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>
            <span className={`text-sm font-medium ${step === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              Verification
            </span>
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
          {step === 1 ? 'Sign in to Business Nexus' : 'Verify your identity'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1
            ? 'Connect with investors and entrepreneurs'
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* STEP 1 — Credentials */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'entrepreneur'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('entrepreneur')}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'investor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('investor')}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<LogIn size={18} />}>
                Continue
              </Button>
            </form>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>

              {/* OTP Icon */}
              <div className="flex flex-col items-center py-2">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                  <Shield size={32} className="text-indigo-600" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit verification code
                </p>
              </div>

              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { otpRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition ${
                      digit
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                    } focus:border-indigo-500`}
                  />
                ))}
              </div>

              {/* Email reminder */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Code sent to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<Shield size={18} />}
              >
                Verify & Sign In
              </Button>

              {/* Resend + Back */}
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Demo accounts — only show on step 1 */}
          {step === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => fillDemoCredentials('entrepreneur')}
                  leftIcon={<Building2 size={16} />}
                >
                  Entrepreneur
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fillDemoCredentials('investor')}
                  leftIcon={<CircleDollarSign size={16} />}
                >
                  Investor
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};