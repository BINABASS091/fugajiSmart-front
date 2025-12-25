import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Loader2,
  UserPlus
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Signup() {
  const navigate = useNavigate();
  const { signUp, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const { access_token } = tokenResponse;
        const { data, error } = await authApi.googleLogin(access_token);
        if (error) throw new Error(error);
        if (data) {
          await refreshUser();
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        setError(err.message || 'Google login failed');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed');
      setLoading(false);
    }
  });

  const handleGoogle = () => {
    setError('');
    loginWithGoogle();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phoneNumber
        }
      );

      if (error) {
        throw error;
      }

      // Redirect is handled by AuthContext/App.tsx mostly, 
      // but we can explicitly navigate if needed or show success message.
      // Since signUp in AuthContext usually logs the user in, 
      // the App.tsx RootRedirect or protected routes should take over.
      // But let's force navigation to be safe.
      navigate('/farmer');

    } catch (err: any) {
      console.error('Registration error:', err);
      // Construct a user-friendly error message
      let errorMsg = 'Failed to create account. Please try again.';

      if (err.message) {
        errorMsg = err.message;
      }

      // Handle Django/DRF field errors if they come through as objects in the message
      // (This depends on how api.ts formats the error). 
      // Assuming api.ts returns a string string or simple Error object.

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="p-8">

          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img
                src="https://res.cloudinary.com/diyy8h0d9/image/upload/v1759477181/WhatsApp_Image_2025-09-10_at_10.41.48_AM_klrrtu.jpg"
                alt="FugajiPro Logo"
                className="w-40 h-auto mx-auto rounded-xl object-contain shadow-md"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Join FugajiPro
            </h1>
            <p className="text-gray-600">Start managing your poultry farm professionally</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">First Name</Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    required
                    className="pl-10 h-11"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Last Name</Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    required
                    className="pl-10 h-11"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  className="pl-10 h-11"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  className="pl-10 h-11"
                  placeholder="+254 700 000 000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="pl-10 h-11"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="pl-10 h-11"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-700\">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </Card>
    </div>
  );
}
